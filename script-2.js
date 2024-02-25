const letters = document.querySelectorAll('.letter');
const loading = document.querySelector('.spinny');
const ANSWER_LENGTH = 5;
let flag = false;
async function init() {
    let currentGuess = '';
    let row = 0;

    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const {word}= await res.json();
    setLoading(true);

    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
        } else {
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }
        
        letters[(row*ANSWER_LENGTH) + currentGuess.length - 1].innerText = letter;
    }

    function backspace() {
        if (currentGuess.length + (row*ANSWER_LENGTH)> (row*ANSWER_LENGTH)) {
            letters[(row*ANSWER_LENGTH) + currentGuess.length - 1].innerText = '';
            currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        }
    }

    async function commit() {
        if (currentGuess.length !== ANSWER_LENGTH) {
            return;
        }

        // TODO Validate The Word.

        const word_arr = word.split("");
        const currentPart = currentGuess.split("");
        const map = makeMap(word_arr);
        
        if (await isValid(currentGuess)) {
            for (let i = 0; i < ANSWER_LENGTH; i++) {
                if (currentPart[i] === word_arr[i]) {
                    letters[row * ANSWER_LENGTH + i].classList.add('green');
                    map[currentPart[i]]--;
                }    
            }
            
            for (let i = 0; i < ANSWER_LENGTH; i++) {
                if (currentPart[i] === word_arr[i]) {
                    // Do Nothing
                } else if (word_arr.includes(currentPart[i]) && map[currentPart[i]] > 0) {
                    letters[row * ANSWER_LENGTH + i].classList.add('yellow');
                    map[currentPart[i]]--;        
                } else {
                    letters[row * ANSWER_LENGTH + i].classList.add('gray');
                }
            }
            if (currentGuess === word) {
                alert("You Win!");
                document.querySelector('h1').classList.add('animate');
                flag = true;
            } else if (row === 5) {
                alert(`You Lose, Correct word is ${word}`);
                flag = true;
            } else {
                row++;
                currentGuess = '';
            }


        } else {
            for (let i = row*ANSWER_LENGTH; i < row*ANSWER_LENGTH + 5; i++) {
                letters[row * ANSWER_LENGTH + i].classList.remove('flash');

                setTimeout(()=>{
                    letters[row * ANSWER_LENGTH + i].classList.add('flash');
                }, 10);
            }
        }

    }

    
    document.addEventListener('keydown', async function keydownHandler(e){
        const letter = e.key;
        if (!flag) {
            if (letter === 'Enter') {
                commit();
            } else if (letter === 'Backspace') {
                backspace();
            } else if (isLetter(letter)){        
                addLetter(letter);    
            }    
        }
    })
}

async function isValid(word) {
    setLoading(false);
    flag = true;
    const validate_res = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({
            "word": word
        })
    }) 

    const {validWord} = await validate_res.json();
    setLoading(true);
    flag = false;
    return validWord;
}

function setLoading(isLoading) {
    loading.classList.toggle('hidden', isLoading);
}
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function makeMap(array) {
    const obj = {};

    for (let i = 0; i < array.length; i++) {
        if (obj[array[i]]) {
            obj[array[i]]++;
        } else {
            obj[array[i]] = 1;
        }   
    }

    return obj;
}
init();


