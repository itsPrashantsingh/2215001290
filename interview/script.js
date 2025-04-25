const text = document.getElementById('textField').innerText;
const submitBtn = document.getElementById('calBtn').onclick(calculate(text))

function countWords(text){
    
    const arr = text.split(' ');
    return arr.length;
}
function countCharacters(text){
    const characters = text.length;
    return characters;
}
function countSentences(text){
    const arr = text.split('.');
    return arr.length;

    
}

function calculate(){
    const words = countWords();
    const countSentences = countSentences();
    const countCharacters = countCharacters();
    document.getElementById('answers')
}