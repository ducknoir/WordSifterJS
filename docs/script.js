class WordSifter {
    constructor(words) {
        this._all_words = words;
        this._blacks = new Set();
        this._yellows = new Array(5).fill().map(() => new Set())
        this._greens = Array(5).fill(null);
        this._have_filter = false; 
    }

    updateGameState(guess, feedback) {
        if (guess && feedback) {
            guess = guess.trim().toUpperCase();
            feedback = feedback.trim().toUpperCase();
            feedback.split('').forEach((color, i) => {
                let letter = guess[i];
                if (color === 'G') {
                    this._greens[i] = letter;
                } else if (color === 'Y') {
                    this._yellows[i].add(letter);
                } else if (color === 'B' && !this._greens.includes(letter) && !this._yellows.some(set => set.has(letter))) {
                    this._blacks.add(letter);
                }
            });
            this._have_filter = true;
        }
    }

    get filteredWords() {
        let filtered = this._all_words
        if (this._have_filter) {
            // For each letter in the array this._greens, place that letter. For empty
            // positions place '.' to match anything
            let greensRegexParts = this._greens.map(letter => letter || '.').join('')
            let greensRegex = new RegExp(`^${greensRegexParts}$`);

            // For each letter position, combine the blacks and yellows to make a full set
            // of letters to exclude for that position
            let combinedExcludes = this._yellows.map(yellows_set => new Set([...this._blacks, ...yellows_set]));
            let excludesRegexParts = combinedExcludes.map(excludeSet => excludeSet.size ? `[^${[...excludeSet].join('')}]` : '.');
            let excludesRegex = new RegExp(`^${excludesRegexParts.join('')}$`);

            // Create a set of all unique yellow letters from all positions
            const yellowChars = [...new Set(this._yellows.flatMap(set => [...set]))];

            let filters = [
                word => greensRegex.test(word),
                word => excludesRegex.test(word),
                word => yellowChars.every(char => word.includes(char))
            ];

            filtered = filtered.filter(word => filters.every(f => f(word)));
        }
        return filtered
    }
}

// Called when user clicks "Update", or presses Enter, after entering guess and feedback
// Reads the new guess and feedback from the DOM, updates the sifter state, gets the
// updated filtered list, and pushes the updated list back to the display.
// Assumes input has already been validated.
function handleUpdate (sifter) {
    const guess = document.getElementById('guess').value;
    const feedback = document.getElementById('feedback').value;

    sifter.updateGameState(guess, feedback);
    const words_list = sifter.filteredWords;
    displayWords(words_list);
}

// Update the display of filtered words and the word count, based on the current list of words
function displayWords(words) {
    const filteredWordsList = document.getElementById('filtered-words');
    const wordCountHeading = document.getElementById('word-count');

    // Update the word count in the heading
    wordCountHeading.textContent = `${words.length} Words:`;

    filteredWordsList.innerHTML = '';
    words.forEach(word => {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        filteredWordsList.appendChild(listItem);
    });
}

// Reset the entire application. Clears the filters, reloads zthe word list, 
// And initializes the display.
function resetApp() {
    const guessInput = document.getElementById('guess');
    const feedbackInput = document.getElementById('feedback');

    // Clear input fields
    guessInput.value = '';
    feedbackInput.value = '';

    document.getElementById('updateButton').disabled = true;

    // Re-initialize the sifter to its original state, then update the diaplay
    fetch('dictionary.json')
        .then(response => response.json())
        .then(data => {
            // Reset the sifter state
            const sifter = new WordSifter(data.words);
            // Update the display to the full word liet
            displayWords(sifter.filteredWords);
            // Re-attach the update handler
            window.updateSifter = () => handleUpdate(sifter);
        })
        .catch(error => {
        });
}

function validateInputs(guess, feedback) {
    guessArr = guess.trim().toUpperCase().split('')
    feedbackArr = feedback.trim().toUpperCase().split('')

    const ASCII_CODE_A = 65;
    const guessAllowed = Array.from({ length: 26 }, (_, i) => String.fromCharCode(ASCII_CODE_A + i));
    let feedbackAllowed = ['B', 'Y', 'G']

    let valid = guess.length === 5
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

// Fetch the word list from the JSON file
fetch('dictionary.json')
    .then(response => {
        console.log('Fetch response status:', response.status);
        return response.json();
    })
    .then(resetApp)
    .catch(error => {
        console.error('Error loading word list:', error);
    });
