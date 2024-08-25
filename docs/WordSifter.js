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

// This will attach WordSifter to the window object in the browser
if (typeof window !== 'undefined') {
    window.WordSifter = WordSifter;
}

// This will only be executed in Node.js environments (e.g., for Jest tests)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WordSifter };
}
