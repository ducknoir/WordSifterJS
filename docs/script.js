class WordSifter {
    constructor(words) {
        this._all_words = words;
        this._blacks = new Set();
        this._yellows = Array.from({ length: 5 }, () => new Set());
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
            let greensRegexStr = `^${this._greens.map(letter => letter || '.').join('')}$`
            let greensRegex = new RegExp(greensRegexStr);

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
function handleUpdate (sifter) {
    const guess = document.getElementById('guess').value;
    const feedback = document.getElementById('feedback').value;

    if (validate(guess, feedback)) {
        sifter.updateGameState(guess, feedback);
        const words_list = sifter.filteredWords;
        displayWords(words_list);
    } else {
        alert('Please enter a valid 5-letter guess and feedback.');
    }
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

// Check guess and feedback input for validity. This should be made more strict
// eventually, to check for only-letters for the guess, and for only b, y, or g
// in the feedback.
function validate(guess, feedback) {
    return guess.length === 5 && feedback.length === 5;
}

// Reset the entire application. Clears the filters, reloads the word list, 
// And initializes the display.
function resetApp() {
    const guessInput = document.getElementById('guess');
    const feedbackInput = document.getElementById('feedback');

    // Clear input fields
    guessInput.value = '';
    feedbackInput.value = '';

    // Re-initialize the sifter to its original state, then update the diaplay
    fetch('words.json')
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

// We want updateSifter to be called if the user presses Enter
// with keyboard focus on either of the input fields
document.addEventListener('DOMContentLoaded', function () {
    const guessInput = document.getElementById('guess');
    const feedbackInput = document.getElementById('feedback');

    guessInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            updateSifter();
        }
    });

    feedbackInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            updateSifter();
        }
    });

    document.getElementById('guess').addEventListener('focus', function() {this.select();});
    document.getElementById('feedback').addEventListener('focus', function() {this.select();});
});

// Fetch the word list from the JSON file
fetch('words.json')
    .then(response => {
        console.log('Fetch response status:', response.status);
        return response.json();
    })
    .then(resetApp)
    .catch(error => {
        console.error('Error loading word list:', error);
    });
