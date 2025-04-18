const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL;
const AUTH_CREDENTIALS = {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
};

async function testExternalAPI() {
    console.log('Testing External API Connection...\n');
    console.log('Base URL:', BASE_URL);
    console.log('Auth Credentials:', {
        ...AUTH_CREDENTIALS,
        clientSecret: '***'
    });

    try {
        // Step 1: Test Authentication
        console.log('\n1. Testing Authentication...');
        const authResponse = await axios.post(`${BASE_URL}/auth`, AUTH_CREDENTIALS, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!authResponse.data || !authResponse.data.access_token) {
            throw new Error('Invalid authentication response');
        }

        console.log('✓ Authentication successful');
        console.log('Token type:', authResponse.data.token_type);
        console.log('Token received:', authResponse.data.access_token ? 'Yes' : 'No');
        console.log('Full auth response:', JSON.stringify(authResponse.data, null, 2));

        const authToken = authResponse.data;

        // Step 2: Test Users Endpoint
        console.log('\n2. Testing Users Endpoint...');
        console.log('Request URL:', `${BASE_URL}/users`);
        console.log('Request Headers:', {
            'Authorization': `${authToken.token_type} ${authToken.access_token}`,
            'Content-Type': 'application/json'
        });

        const usersResponse = await axios.get(`${BASE_URL}/users`, {
            headers: {
                'Authorization': `${authToken.token_type} ${authToken.access_token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✓ Users endpoint successful');
        console.log('Status:', usersResponse.status);
        console.log('Response Headers:', usersResponse.headers);
        console.log('Response Data Type:', typeof usersResponse.data);
        console.log('Has users object:', usersResponse.data && typeof usersResponse.data.users === 'object');
        console.log('Full Response:', JSON.stringify(usersResponse.data, null, 2));

        if (!usersResponse.data || !usersResponse.data.users) {
            throw new Error('Invalid users data format - missing users object');
        }

        const users = usersResponse.data.users;
        console.log('Number of users:', Object.keys(users).length);
        console.log('Sample user:', JSON.stringify({
            id: Object.keys(users)[0],
            name: users[Object.keys(users)[0]]
        }, null, 2));

        // Step 3: Test User Posts Endpoint
        const firstUserId = Object.keys(users)[0];
        if (firstUserId) {
            console.log(`\n3. Testing Posts Endpoint for User ${firstUserId}...`);
            console.log('Request URL:', `${BASE_URL}/users/${firstUserId}/posts`);
            
            const postsResponse = await axios.get(`${BASE_URL}/users/${firstUserId}/posts`, {
                headers: {
                    'Authorization': `${authToken.token_type} ${authToken.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✓ Posts endpoint successful');
            console.log('Status:', postsResponse.status);
            console.log('Response Headers:', postsResponse.headers);
            console.log('Response Data Type:', typeof postsResponse.data);
            console.log('Is Array:', Array.isArray(postsResponse.data));
            console.log('Full Response:', JSON.stringify(postsResponse.data, null, 2));

            if (!Array.isArray(postsResponse.data)) {
                throw new Error('Invalid posts data format - expected array');
            }

            console.log('Number of posts:', postsResponse.data.length);
            if (postsResponse.data.length > 0) {
                console.log('Sample post:', JSON.stringify(postsResponse.data[0], null, 2));

                // Step 4: Test Post Comments Endpoint
                const firstPost = postsResponse.data[0];
                if (firstPost && firstPost.id) {
                    console.log(`\n4. Testing Comments Endpoint for Post ${firstPost.id}...`);
                    console.log('Request URL:', `${BASE_URL}/posts/${firstPost.id}/comments`);
                    
                    const commentsResponse = await axios.get(`${BASE_URL}/posts/${firstPost.id}/comments`, {
                        headers: {
                            'Authorization': `${authToken.token_type} ${authToken.access_token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log('✓ Comments endpoint successful');
                    console.log('Status:', commentsResponse.status);
                    console.log('Response Headers:', commentsResponse.headers);
                    console.log('Response Data Type:', typeof commentsResponse.data);
                    console.log('Is Array:', Array.isArray(commentsResponse.data));
                    console.log('Full Response:', JSON.stringify(commentsResponse.data, null, 2));

                    if (!Array.isArray(commentsResponse.data)) {
                        throw new Error('Invalid comments data format - expected array');
                    }

                    console.log('Number of comments:', commentsResponse.data.length);
                    if (commentsResponse.data.length > 0) {
                        console.log('Sample comment:', JSON.stringify(commentsResponse.data[0], null, 2));
                    }
                }
            }
        }

        console.log('\n✅ All external API tests completed successfully!');

    } catch (error) {
        console.error('\n❌ Test failed!');
        console.error('Error details:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Status Text:', error.response.statusText);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
}

// Run the tests
testExternalAPI(); 