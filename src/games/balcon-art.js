// Illustrations des plantes du balcon (SVG dessinés à la main, style « cartoon contouré » comme les autres jeux).
// Chaque illustration tient dans un viewBox 100 × 100.
const INK = '#1d1712';
const ol = `stroke="${INK}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;

const grad = (id, a, b, vertical = true) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

// Feuille pointant vers +x depuis l'origine, avec nervure
const leaf = (len, wid, fill, vein = '#2f6a1f') =>
  `<path d="M0,0 C ${len * 0.25},${-wid} ${len * 0.75},${-wid} ${len},0 C ${len * 0.75},${wid} ${len * 0.25},${wid} 0,0 Z" fill="${fill}" ${ol}/>` +
  `<path d="M${len * 0.06},0 L${len * 0.9},0" stroke="${vein}" stroke-width="1.6" stroke-linecap="round" fill="none"/>` +
  `<path d="M${len * 0.3},0 L${len * 0.5},${-wid * 0.55} M${len * 0.3},0 L${len * 0.5},${wid * 0.55} M${len * 0.55},0 L${len * 0.72},${-wid * 0.4} M${len * 0.55},0 L${len * 0.72},${wid * 0.4}" stroke="${vein}" stroke-width="1.1" stroke-linecap="round" fill="none" opacity=".7"/>`;

// Feuille dentelée (menthe)
const toothed = (fill) =>
  `<path d="M0,0 L5,-5 L8,-9 L13,-9 L16,-13 L22,-11 L25,-14 L31,-9 L35,-6 L40,0 L35,6 L31,9 L25,14 L22,11 L16,13 L13,9 L8,9 L5,5 Z" fill="${fill}" ${ol}/>` +
  `<path d="M3,0 L37,0 M12,0 L18,-8 M12,0 L18,8 M22,0 L28,-8 M22,0 L28,8" stroke="#2c6a2a" stroke-width="1.3" stroke-linecap="round" fill="none" opacity=".75"/>`;

const shine = (d, o = 0.45) => `<path d="${d}" fill="#fff" opacity="${o}"/>`;

const ART = {
  piment: `
    ${grad('pg-red', '#ff6a4d', '#b3160f')}
    <path d="M46,24 C28,28 18,48 28,70 C34,84 52,92 80,86 C66,80 62,70 64,56 C66,40 62,26 46,24 Z" fill="url(#pg-red)" ${ol}/>
    ${shine('M38,36 C30,44 28,56 31,64 C34,54 38,44 44,38 Z', 0.5)}
    <path d="M60,30 C66,40 66,52 64,60" stroke="#8c0f0a" stroke-width="2" fill="none" opacity=".4" stroke-linecap="round"/>
    <path d="M38,26 C38,18 50,16 56,22 C58,28 52,30 46,30 C42,30 38,30 38,26 Z" fill="#4d9a2f" ${ol}/>
    <path d="M47,20 C46,12 50,8 56,6" stroke="#2f6a1f" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M47,20 C46,12 50,8 56,6" stroke="#6dbb3f" stroke-width="2" fill="none" stroke-linecap="round"/>`,

  menthe: `
    <path d="M50,94 C48,72 52,48 50,16" stroke="${INK}" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    <path d="M50,94 C48,72 52,48 50,16" stroke="#3f8f3a" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${grad('mg', '#7bd36a', '#2f8f3a')}
    <g transform="translate(50,78) rotate(-35)">${toothed('url(#mg)')}</g>
    <g transform="translate(50,80) rotate(-148)">${toothed('url(#mg)')}</g>
    <g transform="translate(50,58) rotate(-30)">${toothed('url(#mg)')}</g>
    <g transform="translate(50,60) rotate(-152)">${toothed('url(#mg)')}</g>
    <g transform="translate(50,40) rotate(-38) scale(.85)">${toothed('url(#mg)')}</g>
    <g transform="translate(50,42) rotate(-142) scale(.85)">${toothed('url(#mg)')}</g>
    <g transform="translate(50,22) rotate(-68) scale(.7)">${toothed('url(#mg)')}</g>
    <g transform="translate(50,22) rotate(-112) scale(.7)">${toothed('url(#mg)')}</g>`,

  basilic: `
    <path d="M50,95 C50,76 50,60 50,44" stroke="${INK}" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    <path d="M50,95 C50,76 50,60 50,44" stroke="#4a9a35" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${grad('bg', '#8be07a', '#2f9a3f')}
    <g transform="translate(50,78) rotate(-28)">${leaf(40, 17, 'url(#bg)')}</g>
    <g transform="translate(50,80) rotate(-152)">${leaf(40, 17, 'url(#bg)')}</g>
    <g transform="translate(50,58) rotate(-42)">${leaf(32, 14, 'url(#bg)')}</g>
    <g transform="translate(50,60) rotate(-138)">${leaf(32, 14, 'url(#bg)')}</g>
    <g transform="translate(50,46) rotate(-70)">${leaf(24, 10, 'url(#bg)')}</g>
    <g transform="translate(50,46) rotate(-110)">${leaf(24, 10, 'url(#bg)')}</g>
    <g transform="translate(50,46) rotate(-90)">${leaf(22, 9, 'url(#bg)')}</g>`,

  ciboulette: `
    ${[[34, 40, 0], [42, 22, 1], [50, 14, 2], [58, 24, 3], [66, 42, 4]].map(([x, y]) => `<path d="M50,94 C50,70 ${x},${y + 30} ${x},${y}" stroke="${INK}" stroke-width="7.5" fill="none" stroke-linecap="round"/>`).join('')}
    ${[[34, 40], [42, 22], [50, 14], [58, 24], [66, 42]].map(([x, y]) => `<path d="M50,94 C50,70 ${x},${y + 30} ${x},${y}" stroke="#58b04a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M50,94 C50,70 ${x},${y + 30} ${x},${y}" stroke="#a6e08a" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".7"/>`).join('')}
    <path d="M36,80 H64 L62,92 H38 Z" fill="#e9eed9" ${ol}/>
    <path d="M56,86 C66,64 76,54 74,40" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M56,86 C66,64 76,54 74,40" stroke="#58b04a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g transform="translate(78,30)">
      
      ${[[0, -4], [-8, 0], [8, 0], [-5, -10], [5, -10], [0, -14], [-9, -7], [9, -7], [0, 3]].map(([x, y]) => `<circle cx="${x - 4}" cy="${y + 4}" r="5.2" fill="#c9a2e6" stroke="#7b4aa6" stroke-width="1.6"/>`).join('')}
    </g>`,

  muguet: `
    ${grad('lg', '#6fcf6a', '#2c8a3a')}
    <g transform="translate(46,95) rotate(-118)">${leaf(62, 16, 'url(#lg)')}</g>
    <g transform="translate(54,95) rotate(-52)">${leaf(58, 15, 'url(#lg)')}</g>
    <path d="M50,95 C50,56 56,24 82,22" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path d="M50,95 C50,56 56,24 82,22" stroke="#5bb04a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    ${[[52, 48], [58, 36], [68, 28], [80, 24]].map(([x, y]) => `
      <path d="M${x},${y} q-1,5 0,9" stroke="#3f8f3a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <g transform="translate(${x},${y + 9}) scale(1.05)"><path d="M-6,-1 A6,6 0 0 1 6,-1 L7.5,6 Q4.5,10 2.5,6.5 Q0,10 -2.5,6.5 Q-4.5,10 -7.5,6 Z" fill="#fffdf6" stroke="#6f745f" stroke-width="1.8" stroke-linejoin="round"/><path d="M-3,-2 Q-3,-4 -1,-4.5" stroke="#d6dcc4" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`).join('')}`,

  fraise: `
    ${grad('fg', '#ff5a5a', '#c4161f')}
    <path d="M50,92 C26,78 14,56 20,40 C26,28 40,28 50,32 C60,28 74,28 80,40 C86,56 74,78 50,92 Z" fill="url(#fg)" ${ol}/>
    ${shine('M30,40 C24,48 24,58 28,66 C30,56 34,48 40,42 Z', 0.5)}
    ${[[34, 48], [48, 46], [62, 48], [28, 60], [42, 58], [56, 58], [70, 60], [36, 70], [50, 70], [64, 70], [44, 80], [57, 80], [50, 54]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.8" ry="2.6" fill="#ffe28a" stroke="#8c3a14" stroke-width=".8"/>`).join('')}
    <path d="M50,30 L36,22 L40,32 L24,32 L38,38 L34,46 L50,38 L66,46 L62,38 L76,32 L60,32 L64,22 Z" fill="#4d9a2f" ${ol}/>
    <path d="M50,30 C50,20 54,12 60,8" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path d="M50,30 C50,20 54,12 60,8" stroke="#5bb04a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,

  cerise: `<g transform="translate(6,10) scale(.88)">
    ${grad('cg', '#ff5470', '#a8101f')}
    <path d="M50,8 C44,28 36,44 32,56" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path d="M50,8 C56,28 64,40 68,52" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path d="M50,8 C44,28 36,44 32,56" stroke="#5bb04a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M50,8 C56,28 64,40 68,52" stroke="#5bb04a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <g transform="translate(50,8) rotate(-25)">${leaf(34, 12, '#58b04a')}</g>
    <path d="M24,76 C24,64 32,56 44,60 M24,76" fill="none"/>
    <circle cx="32" cy="74" r="20" fill="url(#cg)" ${ol}/>
    <circle cx="68" cy="68" r="20" fill="url(#cg)" ${ol}/>
    <path d="M32,56 C28,58 26,60 26,62 C30,62 34,60 36,57 Z" fill="#8c0f1a" opacity=".5"/>
    <path d="M68,50 C64,52 62,54 62,56 C66,56 70,54 72,51 Z" fill="#8c0f1a" opacity=".5"/>
    <ellipse cx="24" cy="68" rx="5" ry="3.2" fill="#fff" opacity=".6" transform="rotate(-45 24 68)"/>
    <ellipse cx="60" cy="62" rx="5" ry="3.2" fill="#fff" opacity=".6" transform="rotate(-45 60 62)"/></g>`,

  patate: `
    ${grad('pt', '#e8c485', '#b0803f')}
    <path d="M50,34 C50,22 54,14 62,8" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M50,34 C50,22 54,14 62,8" stroke="#6dbb3f" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <g transform="translate(58,16) rotate(-30)">${leaf(22, 8, '#58b04a')}</g>
    <g transform="translate(52,26) rotate(-150)">${leaf(18, 7, '#58b04a')}</g>
    <path d="M14,62 C10,40 30,26 54,28 C80,30 94,46 88,66 C82,86 54,92 32,86 C20,82 16,74 14,62 Z" fill="url(#pt)" ${ol}/>
    <path d="M26,44 C32,36 44,32 54,33" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".45"/>
    ${[[34, 60], [62, 52], [70, 72], [46, 76]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="2.4" fill="#6b4520" stroke="${INK}" stroke-width="1.2"/><path d="M${x - 5},${y - 4} Q${x},${y - 8} ${x + 5},${y - 4}" fill="none" stroke="#8a5a2a" stroke-width="1.4" stroke-linecap="round"/>`).join('')}
    ${[[40, 48], [56, 66], [76, 60], [28, 72], [60, 82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#8a5a2a" opacity=".7"/>`).join('')}`,

  myrtille: `
    ${grad('yg', '#7e8ee0', '#2b2f86')}
    <path d="M50,22 C50,14 56,10 66,10" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M50,22 C50,14 56,10 66,10" stroke="#5bb04a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <g transform="translate(64,12) rotate(-15)">${leaf(30, 11, '#58b04a')}</g>
    <path d="M50,22 L30,44 M50,22 L70,42" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    ${[[30, 58, 21], [70, 56, 21], [50, 76, 21]].map(([x, y, r]) => `
      <circle cx="${x}" cy="${y}" r="${r}" fill="url(#yg)" ${ol}/>
      <ellipse cx="${x}" cy="${y - r * 0.35}" rx="${r * 0.3}" ry="${r * 0.2}" fill="#1c1f5e" ${ol.replace('2.6', '1.6')}/>
      <path d="M${x - r * 0.55},${y - r * 0.3} L${x - r * 0.3},${y - r * 0.4} M${x + r * 0.55},${y - r * 0.3} L${x + r * 0.3},${y - r * 0.4} M${x},${y - r * 0.9} L${x},${y - r * 0.55}" stroke="#1c1f5e" stroke-width="1.6" stroke-linecap="round"/>
      <ellipse cx="${x - r * 0.4}" cy="${y + r * 0.1}" rx="${r * 0.22}" ry="${r * 0.14}" fill="#fff" opacity=".4" transform="rotate(-40 ${x - r * 0.4} ${y + r * 0.1})"/>`).join('')}`,

  groseille: `
    ${grad('rg', '#ff7a7a', '#c4161f')}
    <path d="M14,28 C32,8 62,6 86,26" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <path d="M14,28 C32,8 62,6 86,26" stroke="#5bb04a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <g transform="translate(46,10) rotate(20)">${leaf(24, 9, '#58b04a')}</g>
    ${[[24, 30], [40, 20], [58, 18], [76, 28], [30, 48], [50, 40], [68, 48], [40, 64], [58, 62], [50, 82]].map(([x, y]) => `
      <path d="M${x},${y - 12} L${x},${y - 6}" stroke="#3f8f3a" stroke-width="1.6"/>
      <circle cx="${x}" cy="${y}" r="9.5" fill="url(#rg)" ${ol.replace('2.6', '2')}/>
      <circle cx="${x}" cy="${y + 6.5}" r="1.6" fill="#7a0e12"/>
      <ellipse cx="${x - 3}" cy="${y - 3}" rx="2.6" ry="1.8" fill="#fff" opacity=".6" transform="rotate(-35 ${x - 3} ${y - 3})"/>`).join('')}`,

  carotte: `<g transform="translate(7,14) scale(.86)">
    ${grad('kg', '#ffa24a', '#e0620f')}
    ${[[36, 6, -24], [50, 2, 0], [64, 8, 24]].map(([x, y, r]) => `
      <path d="M50,36 C50,24 ${x},${y + 14} ${x},${y + 4}" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M50,36 C50,24 ${x},${y + 14} ${x},${y + 4}" stroke="#4f9a34" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <g transform="translate(${x},${y + 10}) rotate(${r - 70})">${leaf(14, 5, '#6dbb3f')}</g>
      <g transform="translate(${x},${y + 10}) rotate(${r - 110})">${leaf(14, 5, '#58b04a')}</g>
      <g transform="translate(${x},${y + 4}) rotate(${r - 90})">${leaf(14, 5, '#6dbb3f')}</g>`).join('')}
    <path d="M30,38 C30,28 70,28 70,38 C70,54 60,78 50,95 C40,78 30,54 30,38 Z" fill="url(#kg)" ${ol}/>
    <path d="M30,38 C30,34 70,34 70,38 C70,40 30,40 30,38 Z" fill="#c24f0a" opacity=".35"/>
    <path d="M36,48 q6,3 12,0 M54,56 q6,3 11,0 M40,64 q5,3 10,0 M46,76 q4,2 8,0" stroke="#b8480a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M37,40 C37,52 41,62 44,70" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".4"/></g>`,

  erable: `
    ${grad('eg', '#8fd65a', '#2f8f2f')}
    ${grad('eo', '#ffb347', '#d9480f')}
    ${grad('ep', '#e58a5a', '#a84a25')}
    <path d="M50,78 C50,64 49,52 50,38" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M50,60 C44,54 38,50 33,46 M50,52 C58,48 64,44 68,40" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M50,78 C50,64 49,52 50,38" stroke="#8a5a2d" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M50,60 C44,54 38,50 33,46 M50,52 C58,48 64,44 68,40" stroke="#8a5a2d" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    ${[[50, 24, 1, 'eg', 0], [30, 40, 0.78, 'eg', -20], [70, 35, 0.8, 'eo', 18]].map(([x, y, k, f, r]) => `
      <g transform="translate(${x},${y}) rotate(${r}) scale(${k})">
        <path d="M0,-22 L5,-12 L12,-15 L10,-4 L20,-8 L16,2 L22,6 L8,10 L10,16 L0,12 L-10,16 L-8,10 L-22,6 L-16,2 L-20,-8 L-10,-4 L-12,-15 L-5,-12 Z" fill="url(#${f})" ${ol}/>
        <path d="M0,12 L0,-18 M0,4 L-12,-4 M0,4 L12,-4 M0,-4 L-6,-12 M0,-4 L6,-12" stroke="${f === 'eo' ? '#8c2f08' : '#1f6a1f'}" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".75"/>
      </g>`).join('')}
    <g transform="translate(82,70) rotate(35) scale(.5)">
      <path d="M0,-22 L5,-12 L12,-15 L10,-4 L20,-8 L16,2 L22,6 L8,10 L10,16 L0,12 L-10,16 L-8,10 L-22,6 L-16,2 L-20,-8 L-10,-4 L-12,-15 L-5,-12 Z" fill="url(#eo)" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    </g>
    <path d="M30,76 H70 L65,95 Q64,97 61,97 H39 Q36,97 35,95 Z" fill="url(#ep)" ${ol}/>
    <rect x="27" y="70" width="46" height="9" rx="3" fill="url(#ep)" ${ol}/>
    <path d="M32,74 H68" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>`,
};

export const artSVG = (key, cls = 'bp__art') =>
  `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true"><defs></defs>${ART[key]}</svg>`;
