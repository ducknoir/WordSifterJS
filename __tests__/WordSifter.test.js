// WordSifter.test.js

const WordSifter = require('../docs/WordSifter');

describe('WordSifter', () => {
  test('should initialize with the correct word list', () => {
    const words = ['hemps', 'asada', 'noyed', 'capiz', 'ruggy', 'samel', 'longa', 'picot', 'fleam', 'makan', 'holts', 'gwine', 'spume', 'halma', 'about', 'nemns', 'wheat', 'fatwa', 'kalis', 'conus', 'pampa', 'gauze', 'senor', 'kraut', 'lalls', 'hires', 'octal', 'ridic', 'stilb', 'boeps', 'vichy', 'swith', 'kaids', 'drove', 'hazed', 'mairs', 'sorry', 'ghusl', 'tifts', 'roues', 'nasho', 'peery', 'zeera', 'atoms', 'gaitt', 'squad', 'axons', 'slaid', 'sooky', 'ejido'];
    const sifter = new WordSifter(words);
    expect(sifter.filteredWords).toEqual(words);
  });

  // test('should filter words based on game state', () => {
  //   const words = ['APPLE', 'BANANA', 'GRAPE'];
  //   const sifter = new WordSifter(words);

  //   // Simulate a guess where A is in the right place, P is in the wrong place, and L is not in the word
  //   sifter.updateGameState('APPLE', 'GYYBB');

  //   // Expected result: BANANA matches the pattern, GRAPE doesn't (since P shouldn't be in the second position)
  //   expect(sifter.filteredWords).toEqual(['BANANA']);
  // });

  // test('should return all words if no filter is applied', () => {
  //   const words = ['APPLE', 'BANANA', 'GRAPE'];
  //   const sifter = new WordSifter(words);
  //   expect(sifter.filteredWords).toEqual(words);
  // });
});
