import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const BASE_URL = process.env.API_BASE_URL || 'http://20.244.56.144/evaluation-service';


const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

let authToken = null;
let tokenExpiry = null;


const AUTH_PAYLOAD = {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
};


async function getAuthToken() {
    if (authToken && tokenExpiry && Date.now() < tokenExpiry) return authToken;
    const res = await axios.post(`${BASE_URL}/auth`, AUTH_PAYLOAD);
    authToken = res.data.access_token;
    tokenExpiry = Date.now() + ((res.data.expires_in - 300) * 1000);
    return authToken;
}


async function callApi(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const token = await getAuthToken();
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
}

// /users endpoint
app.get('/users', async (req, res) => {
    try {
        const userData = await callApi(`${BASE_URL}/users`);
        const users = Object.entries(userData.users || {}).map(([id, name]) => ({ id, name, commentCount: 0 })).slice(0, 10);

        for (const user of users) {
            try {
                const posts = (await callApi(`${BASE_URL}/users/${user.id}/posts`)).posts?.slice(0, 5) || [];
                for (const post of posts) {
                    try {
                        const comments = (await callApi(`${BASE_URL}/posts/${post.id}/comments`)).comments || [];
                        user.commentCount += comments.length;
                    } catch {}
                }
            } catch {}
        }

        const topUsers = users.sort((a, b) => b.commentCount - a.commentCount).slice(0, 5);
        res.json(topUsers);
    } catch (err) {
        console.error('/users error:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// /posts endpoint
app.get('/posts', async (req, res) => {
    try {
        const type = req.query.type || 'popular';
        if (!['popular', 'latest'].includes(type)) return res.status(400).json({ error: 'Invalid type parameter' });

        const userData = await callApi(`${BASE_URL}/users`);
        const allPosts = [];
        const users = Object.entries(userData.users || {}).slice(0, 5);

        for (const [userId, userName] of users) {
            try {
                const posts = (await callApi(`${BASE_URL}/users/${userId}/posts`)).posts?.slice(0, 5) || [];
                for (const post of posts) {
                    let commentCount = 0;
                    try {
                        const comments = (await callApi(`${BASE_URL}/posts/${post.id}/comments`)).comments || [];
                        commentCount = comments.length;
                    } catch {}
                    allPosts.push({ ...post, userId, userName, commentCount });
                }
            } catch {}
        }

        if (type === 'popular') {
            const maxComments = Math.max(...allPosts.map(p => p.commentCount));
            return res.json(allPosts.filter(p => p.commentCount === maxComments));
        }

        res.json(allPosts.sort((a, b) => b.id - a.id).slice(0, 5));
    } catch (err) {
        console.error('/posts error:', err.message);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
