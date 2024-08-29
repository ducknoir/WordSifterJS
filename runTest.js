// runDirect.js (at the same level as your docs folder)

const WordSifter = require('./docs/WordSifter');  // Path to the WordSifter class
let words = ['ABOUT', 'ASADA', 'ATOMS', 'AXONS', 'BOEPS', 'CAPIZ', 'CONUS', 'DROVE', 'EJIDO', 'FATWA', 'FLEAM', 'GAITT', 'GAUZE', 'GHUSL', 'GWINE', 'HALMA', 'HAZED', 'HEMPS', 'HIRES', 'HOLTS', 'KAIDS', 'KALIS', 'KRAUT', 'LALLS', 'LONGA', 'MAIRS', 'MAKAN', 'NASHO', 'NEMNS', 'NOYED', 'OCTAL', 'PAMPA', 'PEERY', 'PICOT', 'RIDIC', 'ROUES', 'RUGGY', 'SAMEL', 'SENOR', 'SLAID', 'SOOKY', 'SORRY', 'SPUME', 'SQUAD', 'STILB', 'SWITH', 'TIFTS', 'VICHY', 'WHEAT', 'ZEERA'];

const sifter = new WordSifter(words);  // Creating an instance of WordSifter

function prepare(guess, feedback) {
    console.log(guess, feedback);
    sifter.prepareState(guess, feedback);  // Updating the game state
    console.log("_blacks_set: ", sifter._blacks_set);
    console.log(sifter._yellows_bag._map);
}

prepare('SOUPY', 'GYYYG');
prepare('BINGO', 'BBBBB');
prepare('DOOBY', 'BYYBB');
prepare('AACCC', 'YYYYY');
prepare(['BEDEL', 'BELCH', 'BEVEL', 'BEZEL', 'BEZIL', 'BILED', 'CELEB', 'CHIEL', 'CULEX', 'DEBEL', 'DECYL', 'DELED', 'DEVEL', 'DEVIL', 'EXCEL', 'EXFIL', 'FELCH', 'FELID', 'FELIX', 'FILED', 'GELID', 'GEMEL', 'GIBEL', 'GIMEL', 'HELED', 'HELIX', 'HEVEL', 'HEXYL', 'HYDEL', 'HYLEG', 'IDLED', 'JEBEL', 'JEWEL', 'JHEEL', 'KELIM', 'KEVEL', 'KEVIL', 'KIDEL', 'KILEY', 'KUGEL', 'LECCY', 'LEDGY', 'LEDUM', 'LEECH', 'LEGGY', 'LEMED', 'LEMEL', 'LEUCH', 'LEUGH', 'LEVEL', 'LEZZY', 'LIBEL', 'LIFEY', 'LIKED', 'LIMED', 'LIMEY', 'LIVED', 'LUBED', 'LUGED', 'LUXED', 'MELCH', 'MELIC', 'MELIK', 'MULED', 'MULEY', 'UMBEL', 'VELUM', 'VEXIL', 'WEDEL', 'WELCH', 'WHEEL', 'WILED', 'WYLED', 'XYLEM', 'YCLED', 'ZIZEL']);
prepare('JEWEL', 'BGBYY');
prepare();


const word = 'BEDEL';
console.log(`'${word}' -> ${sifter.isKeep(word, true)}`);
// for (word of words) {
//     console.log(`'${word}' -> ${sifter.isKeep(word)}`);
// }
