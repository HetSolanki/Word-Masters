const letters = document.querySelectorAll('.letter');
let counter = 0;
let row = 0;
let flag = false;
let column = 0;
let word = '';
document.addEventListener('keydown', async function keydownHandler(e){
    if (e.key === 'Enter') {
        if (flag && counter === 4) {
            word = '';
            for (let i = column-4; i <= column; i++) {
                word += letters[i].innerText;
            }
            if (await isValid(word)) {
                console.log("Called");
                commit();
                counter = 0;
                column++;
                row++;
                flag = false;
            }
        }    
    } else if (e.key === 'Backspace') {
        if (flag) {
            counter++;
            column++;
            flag = false;
        }     
        if (counter > 0) {
            column--;
            counter--;
            console.log(counter, column);
        }    
        backspace();
    } else {
        if (isLetter(e.key) && row < 6) {
            addLetter(e.key.toUpperCase());
        }    
        
    }    
})    


const addLetter = (letter)=>{
    console.log(counter, column);
    letters[column].innerText = letter;
    if (counter < 4) {
        column++;
        counter++;
    } else {
        flag = true;
    }    
}    

const commit = async ()=>{
    const word_url = await fetch("https://words.dev-apis.com/word-of-the-day");
    const word_parsed = await word_url.json();

    let fetched_letters = word_parsed.word.toUpperCase().split('');
    let string = '';
    let green_check = '';

    for (let i = column-5, j = 0; i < column; i++, j++) {
        if (letters[i].innerText === fetched_letters[j]) {
            letters[i].classList.add('green')
            green_check += letters[i].innerText;
        } else {
            letters[i].classList.add('gray')
        }
        string += letters[i].innerText;
    }

    let check = '';
    for (let i = column-5, j = 0; i < column; i++, j++) {
        if (word_parsed.word.toUpperCase().includes(letters[i].innerText)) {
            // console.log(letters[i].innerText !== fetched_letters[j], letters[i].innerText, fetched_letters[j]);
            console.log(!check.includes(letters[i].innerText));
            if (letters[i].innerText !== fetched_letters[j] && !check.includes(letters[i].innerText) && !green_check.includes(letters[i].innerText)) {
                letters[i].classList.add('yellow');
                letters[i].classList.remove('gray');
                check += letters[i].innerText
            }
        }
    }
    if (string === word_parsed.word.toUpperCase()) {
        alert("You Win"); 
        document.removeEventListener('keydown', this, false);  
    } else if (row === 6) {
        alert(`You Lose the game: Correct Word is ${word_parsed.word}`)
    }
}

const isValid = async (word)=>{
    for (let i = column - 4; i <= column; i++) {
        letters[i].classList.remove('flash');
    }
    console.log("Word:", word);
    const validate_url = await fetch("https://words.dev-apis.com/validate-word",{
            method: "POST",
            body: JSON.stringify({
                "word": word
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
    });
    const validate_parsed = await validate_url.json();

    if (!validate_parsed.validWord) {
        for (let i = column - 4; i <= column; i++) {
            letters[i].classList.add('flash');
        }
    }
    console.log("JSON:", validate_parsed.validWord);
    return validate_parsed.validWord;
}

const backspace = ()=>{
    letters[column].innerText = '';
}

const isLetter = (letter)=>{
    const regex = /^[a-zA-Z]$/;
    return regex.test(letter);
}