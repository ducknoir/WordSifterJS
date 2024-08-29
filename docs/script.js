// script.js

(function() {

    let sifter;

    let guessInput, feedbackInput;
    let updateButton, resetButton;
    let guessGrid, filteredWords, wordCountHeading;

    // Called every time the user submits a new guess/feedback. Builds a row
    // of colored tiles showing the letters, and appends the row to 
    // the guess-grid on the di
    function updateGuessGrid(wordSifter) {
        guessGrid.innerHTML = ''; // Clear previous entries

        guesses = wordSifter.guesses;
        feedbacks = wordSifter.feedbacks;
        guesses.forEach((guess, index) => {
            guess.forEach((letter, i) => {
                const square = document.createElement('div');
                square.classList.add('grid-square');
                square.textContent = letter;
                // Assign color based on feedback
                const color = feedbacks[index][i] === 'G' ? 'green' :
                            feedbacks[index][i] === 'Y' ? 'yellow' : 'gray';
                square.classList.add(color);
                guessGrid.appendChild(square);
            });
        });
    }

    // Called when user clicks "Update", or presses Enter, after entering guess and feedback
    // Reads the new guess and feedback from the DOM, updates the sifter state, gets the
    // updated filtered list, and pushes the updated list back to the display.
    // Assumes input has already been validated.
    function handleUpdate (wordSifter) {
        const guess = guessInput.value;
        const feedback = feedbackInput.value;

        wordSifter.update(guess, feedback);
        updateGuessGrid(wordSifter); // Update the guess grid display

        const words_list = wordSifter.filteredWords;
        displayWords(words_list);
    }

    // Update the display of filtered words and the word count, based on the current list of words
    function displayWords(words) {

        // Update the word count in the heading
        wordCountHeading.textContent = `${words.length} Word${words.length != 1 ? "s" : ""}:`;

        filteredWords.innerHTML = '';
        words.forEach(word => {
            const listItem = document.createElement('li');
            listItem.textContent = word;
            filteredWords.appendChild(listItem);
        });
    }

    function resetApp(wordSifter) {
        guessGrid.innerHTML = '';

        guessInput.value = '';
        feedbackInput.value = '';
        updateButton.disabled = true;

        wordSifter.reset();  // Call the reset method on the sifter
        displayWords(wordSifter.filteredWords);  // Re-display the full word list
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

    document.addEventListener('DOMContentLoaded', function () {
        guessInput = document.getElementById('guess-input');
        feedbackInput = document.getElementById('feedback-input');
        updateButton = document.getElementById('update-button');
        resetButton = document.getElementById('reset-button');
        guessGrid = document.getElementById('guess-grid');
        filteredWords = document.getElementById('filtered-words');
        wordCountHeading = document.getElementById('word-count');

        guessInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                handleUpdate(sifter);
            }
        });
        guessInput.addEventListener('focus', function() {this.select();});

        feedbackInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                handleUpdate(sifter);
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

        updateButton.addEventListener('click', () => handleUpdate(sifter));
        resetButton.addEventListener('click', () => resetApp(sifter));

    });

    function initializeApp(words) {
        sifter = new WordSifter(words);
        const filtered = sifter.filteredWords;
        displayWords(filtered);
    }

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
})();
