// script.js

let sifter;

function updateGuessGrid(word_sifter) {
    const grid = document.getElementById('guess-grid');
    grid.innerHTML = ''; // Clear previous entries

    guesses = word_sifter.guesses;
    feedbacks = word_sifter.feedbacks;
    guesses.forEach((guess, index) => {
        guess.forEach((letter, i) => {
            const square = document.createElement('div');
            square.classList.add('grid-square');
            square.textContent = letter;
            // Assign color based on feedback
            const color = feedbacks[index][i] === 'G' ? 'green' :
                          feedbacks[index][i] === 'Y' ? 'yellow' : 'gray';
            square.classList.add(color);
            grid.appendChild(square);
        });
    });
}

// Called when user clicks "Update", or presses Enter, after entering guess and feedback
// Reads the new guess and feedback from the DOM, updates the sifter state, gets the
// updated filtered list, and pushes the updated list back to the display.
// Assumes input has already been validated.
function handleUpdate (sifter) {
    const guess = document.getElementById('guess').value;
    const feedback = document.getElementById('feedback').value;

    sifter.update(guess, feedback);
    updateGuessGrid(sifter); // Update the guess grid display

    const words_list = sifter.filteredWords;
    displayWords(words_list);
}

// Update the display of filtered words and the word count, based on the current list of words
function displayWords(words) {
    const filteredWordsList = document.getElementById('filtered-words');
    const wordCountHeading = document.getElementById('word-count');

    // Update the word count in the heading
    wordCountHeading.textContent = `${words.length} Word${words.length != 1 ? "s" : ""}:`;

    filteredWordsList.innerHTML = '';
    words.forEach(word => {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        filteredWordsList.appendChild(listItem);
    });
}

function initializeApp(words) {
    sifter = new WordSifter(words);
    const filtered = sifter.filteredWords;
    displayWords(filtered);
    window.updateSifter = () => handleUpdate(sifter);
}

function resetApp() {
    const guessInput = document.getElementById('guess');
    const feedbackInput = document.getElementById('feedback');
    const grid = document.getElementById('guess-grid').innerHTML = '';

    guessInput.value = '';
    feedbackInput.value = '';
    document.getElementById('updateButton').disabled = true;

    sifter.reset();  // Call the reset method on the sifter
    displayWords(sifter.filteredWords);  // Re-display the full word list
}

function validateInputs(guess, feedback) {
    const guessArr = guess.trim().toUpperCase().split('')
    const feedbackArr = feedback.trim().toUpperCase().split('')

    const ASCII_CODE_A = 65;
    const guessAllowed = Array.from({ length: 26 }, (_, i) => String.fromCharCode(ASCII_CODE_A + i));
    guessAllowed.push('.'); // Wildcard
    const feedbackAllowed = ['B', 'Y', 'G']

    const valid = guess.length === 5
     && feedback.length === 5
     && guessArr.every(char => guessAllowed.includes(char))
     && feedbackArr.every(char => feedbackAllowed.includes(char));

     return valid
}

// We want updateSifter to be called if the user presses Enter
// with keyboard focus on either of the input fields
document.addEventListener('DOMContentLoaded', function () {
    const guessInput = document.getElementById('guess');
    const feedbackInput = document.getElementById('feedback');
    const updateButton = document.getElementById('updateButton');

    guessInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            updateSifter();
        }
    });
    guessInput.addEventListener('focus', function() {this.select();});

    feedbackInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            updateSifter();
        }
    });
    feedbackInput.addEventListener('focus', function() {this.select();});

    function validateInputsHandler() {
        const guessValue = guessInput.value.trim();
        const feedbackValue = feedbackInput.value.trim();

        updateButton.disabled = !validateInputs(guessValue, feedbackValue);
    }

    guessInput.addEventListener('input', validateInputsHandler);
    feedbackInput.addEventListener('input', validateInputsHandler);
});

// Fetch the word list and initialize the app
fetch('dictionary.json')
    .then(response => {
        return response.json();
    })
    .then(data => {
        initializeApp(data.words);  // Initialize the sifter and UI
    })
    .catch(error => {
        console.error('Error loading word list:', error);
    });
