// WordSifter.test.js

const WordSifter = require('../docs/WordSifter');

describe('WordSifter', () => {
  test('should initialize with the correct word list', () => {
    const words = ['HEMPS', 'ASADA', 'NOYED', 'CAPIZ', 'RUGGY', 'SAMEL', 'LONGA', 'PICOT', 'FLEAM', 'MAKAN', 'HOLTS', 'GWINE', 'SPUME', 'HALMA', 'ABOUT', 'NEMNS', 'WHEAT', 'FATWA', 'KALIS', 'CONUS', 'PAMPA', 'GAUZE', 'SENOR', 'KRAUT', 'LALLS', 'HIRES', 'OCTAL', 'RIDIC', 'STILB', 'BOEPS', 'VICHY', 'SWITH', 'KAIDS', 'DROVE', 'HAZED', 'MAIRS', 'SORRY', 'GHUSL', 'TIFTS', 'ROUES', 'NASHO', 'PEERY', 'ZEERA', 'ATOMS', 'GAITT', 'SQUAD', 'AXONS', 'SLAID', 'SOOKY', 'EJIDO'];
    const sifter = new WordSifter(words);
    expect(sifter.filteredWords).toEqual(words);
  });

  test('should filter words based on game state', () => {
    const words = ['HEMPS', 'ASADA', 'NOYED', 'CAPIZ', 'RUGGY', 'SAMEL', 'LONGA', 'PICOT', 'FLEAM', 'MAKAN', 'HOLTS', 'GWINE', 'SPUME', 'HALMA', 'ABOUT', 'NEMNS', 'WHEAT', 'FATWA', 'KALIS', 'CONUS', 'PAMPA', 'GAUZE', 'SENOR', 'KRAUT', 'LALLS', 'HIRES', 'OCTAL', 'RIDIC', 'STILB', 'BOEPS', 'VICHY', 'SWITH', 'KAIDS', 'DROVE', 'HAZED', 'MAIRS', 'SORRY', 'GHUSL', 'TIFTS', 'ROUES', 'NASHO', 'PEERY', 'ZEERA', 'ATOMS', 'GAITT', 'SQUAD', 'AXONS', 'SLAID', 'SOOKY', 'EJIDO'];
    const sifter = new WordSifter(words);

    // Simulate a guess where A is in the right place, P is in the wrong place, and L is not in the word
    sifter.update('SLANT', 'GYYBB');

    console.log(sifter.filteredWords)
    expect(sifter.filteredWords).toEqual(['SAMEL']);
  });

  // test('should return all words if no filter is applied', () => {
  //   const words = ['APPLE', 'BANANA', 'GRAPE'];
  //   const sifter = new WordSifter(words);
  //   expect(sifter.filteredWords).toEqual(words);
  // });
});
