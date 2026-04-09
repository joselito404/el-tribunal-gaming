const fs = require('fs');

let c = fs.readFileSync('src/App.jsx', 'utf8');

const target = `<img
                            src={game.img}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt={game.title}
                          />`;

const replacement = `<img
                            src={game.img}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt={game.title}
                            onError={(e) => {
                              if (e.target.src !== game.headerImg && game.headerImg && !e.target.src.includes('placehold.co')) {
                                e.target.src = game.headerImg;
                              } else {
                                e.target.src = \`https://placehold.co/600x900/111827/a5b4fc?text=\${encodeURIComponent(game.title)}\`;
                              }
                            }}
                          />`;

c = c.replace(target, replacement);

fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('Fallback onError applied');
