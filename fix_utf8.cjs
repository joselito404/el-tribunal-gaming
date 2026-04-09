const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const replacements = {
    'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
    'Ã±': 'ñ', 'Â¿': '¿', 'Â¡': '¡', 'Â': '',
    'Ã–': 'Ö', 'Ã¼': 'ü', 'Ã': 'í' // Be careful with single characters
};

// More specific ones
c = c.replace(/Ã¡/g, 'á');
c = c.replace(/Ã©/g, 'é');
c = c.replace(/Ã\*/g, 'í'); // This is a common one if it was corrupted twice
c = c.replace(/Ã­/g, 'í');
c = c.replace(/Ã³/g, 'ó');
c = c.replace(/Ãº/g, 'ú');
c = c.replace(/Ã±/g, 'ñ');
c = c.replace(/Â¿/g, '¿');
c = c.replace(/Â¡/g, '¡');
c = c.replace(/ðŸ”¥/g, '🔥');
c = c.replace(/ðŸ  /g, '🐕');
c = c.replace(/ðŸ¤¡/g, '👾');
c = c.replace(/ðŸ’€/g, '💀');
c = c.replace(/ðŸ‘‘/g, '👑');
c = c.replace(/ðŸ’©/g, '💩');
c = c.replace(/ðŸ’¸/g, '💸');
c = c.replace(/ðŸ”®/g, '🔮');
c = c.replace(/ðŸ‘®â™‚ï¸ /g, '👮‍♂️');

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('UTF-8 Fix complete');
