// WordSifter.js

class MultiSet {
    constructor() {
        this._map = new Map();
    }

    add(letter) {
        this._map.set(letter, (this._map.get(letter) || 0) + 1);
    }

    remove(letter) {
        if (!this._map.has(letter)) return;
        const count = this._map.get(letter);
        count > 1 ? this._map.set(letter, count - 1) : this._map.delete(letter);
    }

    has(letter) {
        return this._map.has(letter);
    }

    clone() {
        const newSet = new MultiSet();
        for (let [item, count] of this._map) {
            newSet._map.set(item, count);
        }
        return newSet;
    }

    get isEmpty() {
        return this._map.size === 0;
    }

    toString() {
        const entries = [];
        for (const [key, value] of this._map) {
            entries.push(`"${key}": ${value}`);
        }
        return `{ ${entries.join(', ')} }`;
    }
}


class WordSifter {
    constructor(words) {
        if (!Array.isArray(words)) {
            throw new TypeError("WordSifter constructor argument must be an array.");
        }
        this._all_words = words;
        this.reset();
    }

    reset() {
        this._filtered_words = this._all_words;
        this._guesses = [];
        this._feedbacks = [];
        this._blacks_set = null;
        this._yellows_bag = null;
    }

    // Prepare the state that will be needed by the filter
    // Outputs:
    //    new guess_array is pushed onto this._guesses
    //    new feedback_array is pushed onto this._feedback_array
    //    this._yellows_bag gets set for new guess
    //
    prepareState(guess, feedback) {
        if (!(guess && feedback)) 
            return;

        this._blacks_set = new Set();
        this._yellows_bag = new MultiSet();

        const guess_array = guess.trim().toUpperCase().split('');
        this._guesses.push(guess_array);

        const feedback_array = feedback.trim().toUpperCase().split('');
        this._feedbacks.push(feedback_array);

        this._blacks_set = new Set();
        this._yellows_bag = new MultiSet();

        // Build the auxiliary data structures we'll need
        for (let i = 0; i < feedback_array.length; i++) {
            const letter = guess_array[i];
            const color = feedback_array[i];
            if (color === 'B') {
                this._blacks_set.add(letter);
            } else if (color === 'Y') {
                this._yellows_bag.add(letter);
            }
        };
    }

    isKeep(
        word,
        guess_array = this._guesses[this._guesses.length - 1],
        feedback_array = this._feedbacks[this._feedbacks.length - 1]
    ) {
        const word_array = word.trim().toUpperCase().split('');
        const yellows_bag = this._yellows_bag.clone();

        let keep = true;

        // for each letter in word . . . 
        for (let i = 0; i < word_array.length; i++) {
            const w = word_array[i];
            const c = feedback_array[i];
            const g = guess_array[i];

            if (c === 'G') {
                if (w != g) {
                    keep = false; break;
                } else {
                    continue;
                }
            } else if (c === 'Y' && w === g) {
                keep = false; break;
            } else if (this._blacks_set.has(w)) {
                keep = false; break;
            }

            // We've covered every other reason to exclude the word based on this position; 
            // now, if the letter matches a letter left in the yellows bag, pull one of 
            // those letters. Until the bag is empty, we can't keep the word.
            if (keep && yellows_bag.has(w)) {
                yellows_bag.remove(w);
            }
        }

        // Only thing left to check is, did we account for all the required yellows.
        // Empty bag == keep the word
        keep = keep && yellows_bag.isEmpty;
        return keep;
    }

    // Needs:
    // this._filtered_words
    // this._yellows_bag (prepared by updateState, cloned for each word)
    // this._blacks_set (prepared by updateState)
    // most recent guess, as this._guesses[this._guesses.length - 1]
    // most recent feedback, as this._feedbacks[this._feedbacks.length - 1]
    filterList() {
        // Go through the current word list
        const filtered = this._filtered_words.filter(word => this.isKeep(word));

        this._filtered_words = filtered;
    }

    update(guess, feedback) {
        this.prepareState(guess, feedback);
        this.filterList();
    }

    get filteredWords() {
        return this._filtered_words;
    }    

    get guesses() {
        return this._guesses;
    }

    get feedbacks() {
        return this._feedbacks;
    }
}

// // This will attach WordSifter to the window object in the browser
// if (typeof window !== 'undefined') {
//     window.WordSifter = WordSifter;
// }

// // This will only be executed in Node.js environments (e.g., for Jest tests)
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = WordSifter;
// }
export default WordSifter;