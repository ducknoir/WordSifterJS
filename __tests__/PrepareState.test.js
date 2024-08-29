// PrepareState.test.js

const fs = require('fs');
const path = require('path');
const dictPath = path.join(__dirname, '../docs/dictionary.json');

const WordSifter = require('../docs/WordSifter');

describe('PrepareState', () => {
    test('Prepare with BINGO, BGYYB correctly sets blacks and yellows', () => {
        const sifter = new WordSifter([]);
  
        sifter.prepareState('BINGO', 'BGYYB');  // Updating the state
        expect(sifter._yellows_bag._map).toEqual(new Map([['N', 1], ['G', 1]]));
        expect(sifter._blacks_set).toEqual(new Set(['B', 'O']));
    });

    test('Second prepare correctly changes state', () => {
        const sifter = new WordSifter([]);
  
        sifter.prepareState('BINGO', 'BGYYB');
        expect(sifter._yellows_bag._map).toEqual(new Map([['N', 1], ['G', 1]]));
        expect(sifter._blacks_set).toEqual(new Set(['B', 'O']));
        expect(sifter._guesses.length).toEqual(1);
        expect(sifter._feedbacks.length).toEqual(1);
        expect(sifter._guesses[0]).toEqual(['B', 'I', 'N', 'G', 'O']);
        expect(sifter._feedbacks[0]).toEqual(['B', 'G', 'Y', 'Y', 'B']);

        sifter.prepareState('DOOBY', 'GYYGB');
        expect(sifter._yellows_bag._map).toEqual(new Map([['O', 2]]));
        expect(sifter._blacks_set).toEqual(new Set(['Y']));
        expect(sifter._guesses.length).toEqual(2);
        expect(sifter._feedbacks.length).toEqual(2);
        expect(sifter._guesses[0]).toEqual(['B', 'I', 'N', 'G', 'O']);
        expect(sifter._feedbacks[0]).toEqual(['B', 'G', 'Y', 'Y', 'B']);
        expect(sifter._guesses[1]).toEqual(['D', 'O', 'O', 'B', 'Y']);
        expect(sifter._feedbacks[1]).toEqual(['G', 'Y', 'Y', 'G', 'B']);
    });

    test('reset correctly clears state', () => {
        const wordsObj = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
        const words = wordsObj.words;
        expect(Array.isArray(words)).toBe(true);
        expect(words.length).toEqual(14855);

        const sifter = new WordSifter(words);

        expect(sifter.filteredWords.length).toEqual(words.length);
  
        sifter.prepareState('SLANT', 'BYBBB');
        sifter.filterList();
        expect(sifter.filteredWords.length).toEqual(640);

        sifter.prepareState('PROLE', 'BBBYY');
        sifter.filterList();
        expect(sifter.filteredWords.length).toEqual(76);

        expect(sifter._yellows_bag._map).toEqual(new Map([['E', 1], ['L', 1]]));
        expect(sifter._blacks_set).toEqual(new Set(['O', 'P', 'R']));

        expect(sifter._guesses.length).toEqual(2);
        expect(sifter._feedbacks.length).toEqual(2);
        expect(sifter._guesses[0]).toEqual(['S', 'L', 'A', 'N', 'T']);
        expect(sifter._feedbacks[0]).toEqual(['B', 'Y', 'B', 'B', 'B']);
        expect(sifter._guesses[1]).toEqual(['P', 'R', 'O', 'L', 'E']);
        expect(sifter._feedbacks[1]).toEqual(['B', 'B', 'B', 'Y', 'Y']);

        sifter.reset();

        expect(sifter.filteredWords.length).toEqual(words.length);
        expect(sifter._yellows_bag).toBeNull();
        expect(sifter._blacks_set).toBeNull();
        expect(Array.isArray(sifter._guesses)).toBe(true);
        expect(sifter._guesses.length).toEqual(0);
        expect(Array.isArray(sifter._feedbacks)).toBe(true);
        expect(sifter._feedbacks.length).toEqual(0);
    });

});
