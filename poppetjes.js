// ============================================================================
// poppetjes.js — de getekende dieren + accessoires (SVG)
//
// Elk dier is zelf getekend, met vaste "ankerpunten" waar de accessoires op
// passen. Daardoor zit een hoed altijd precies goed op dat dier, op elk apparaat
// (echte emoji zien er op elke telefoon/computer anders uit, dit dus niet).
//
// Per dier staat er:
//   achter : wordt VOOR het hoofd getekend (bv. ronde oren)
//   hoofd  : hoofd + gezicht
//   voor   : wordt NA de hoed getekend, dus de hoed zit er ACHTER. Hiermee gaat
//            een hoed "om de oren" van een konijn, of tussen de ogen van een kikker.
//   kruin  : waar de hoed zit: x,y = het punt op het hoofd, b = de breedte van
//            de hoed, r = eventuele scheefstand in graden, strik = waar de strik zit
//   ogen   : y = hoogte van de ogen, dx = afstand van het midden tot een oog
//            (daar wordt de bril op afgestemd), s = eventueel afwijkende lensgrootte
//
// Het tekenvlak is 100 x 100; hoeden mogen erboven uitsteken.
// Het dier zelf wordt bewaard als emoji (zoals altijd) in Firebase; alleen het
// tekenen is anders.
// ============================================================================

const DONKER = '#2b2140';

const oog = (x, y, r = 4.6) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${DONKER}"/>` +
  `<circle cx="${x + r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.34}" fill="#fff"/>`;
const wang = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff8fa3" opacity=".45"/>`;
const ellips = (cx, cy, rx, ry, fill, extra = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const cirkel = (cx, cy, r, fill, extra = '') =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const lijn = (d, kleur = DONKER, dikte = 2.4) =>
  `<path d="${d}" fill="none" stroke="${kleur}" stroke-width="${dikte}" stroke-linecap="round" stroke-linejoin="round"/>`;
// Kleine snuit-mond: streepje omlaag en twee boogjes (kat, konijn, hond, ...)
const snuitMond = (x, y, b = 7) => lijn(`M${x} ${y} V${y + 3} M${x} ${y + 3} Q${x - b * 0.5} ${y + 8} ${x - b} ${y + 4} M${x} ${y + 3} Q${x + b * 0.5} ${y + 8} ${x + b} ${y + 4}`);

const DIER_TEKENINGEN = {
  // ---------- Hond ----------
  '🐶': {
    achter: ellips(19, 54, 11, 23, '#8a5a2b', 'transform="rotate(12 19 54)"') +
            ellips(81, 54, 11, 23, '#8a5a2b', 'transform="rotate(-12 81 54)"'),
    hoofd: ellips(50, 58, 35, 33, '#e2ac72') +
           ellips(64, 51, 13, 12, '#8a5a2b') +
           ellips(50, 71, 18, 14, '#f7e1c4') +
           ellips(50, 79, 4.5, 5.5, '#ff7a93') +
           ellips(50, 64, 7, 5, DONKER) + cirkel(48, 62.5, 1.6, '#fff', 'opacity=".6"') +
           lijn('M50 69 V74 M50 74 Q44 79 41 74 M50 74 Q56 79 59 74') +
           oog(38, 54) + oog(62, 53),
    voor: '',
    kruin: { x: 50, y: 28, b: 46 },
    ogen: { y: 54, dx: 12 }
  },

  // ---------- Kat ----------
  '🐱': {
    achter: '',
    hoofd: ellips(50, 60, 35, 31, '#f2b25f') +
           lijn('M50 30 V40 M40 32 L42 40 M60 32 L58 40', '#d98a2b', 3) +
           ellips(50, 71, 13, 9, '#fbe9cf') +
           `<path d="M46 65 H54 L50 70 Z" fill="#ff8fa3"/>` +
           snuitMond(50, 70, 6) +
           lijn('M22 66 L37 68 M22 74 L37 72 M78 66 L63 68 M78 74 L63 72', '#8a6a3a', 1.6) +
           oog(37, 56, 5) + oog(63, 56, 5) + wang(28, 67) + wang(72, 67),
    voor: `<path d="M13 50 L15 10 L41 31 Z" fill="#f2b25f"/><path d="M20 42 L21 21 L35 32 Z" fill="#ff9db3"/>` +
          `<path d="M87 50 L85 10 L59 31 Z" fill="#f2b25f"/><path d="M80 42 L79 21 L65 32 Z" fill="#ff9db3"/>`,
    kruin: { x: 50, y: 31, b: 40 },
    ogen: { y: 56, dx: 13 }
  },

  // ---------- Muis ----------
  '🐭': {
    achter: cirkel(20, 32, 15, '#b8b8c4') + cirkel(20, 32, 9, '#ffb3c1') +
            cirkel(80, 32, 15, '#b8b8c4') + cirkel(80, 32, 9, '#ffb3c1'),
    hoofd: ellips(50, 58, 32, 31, '#c9c9d4') +
           ellips(50, 70, 15, 11, '#ecebf2') +
           cirkel(50, 65, 4.6, '#ff8fa3') +
           snuitMond(50, 68, 6) +
           lijn('M22 66 L35 68 M22 73 L35 72 M78 66 L65 68 M78 73 L65 72', '#8b8b9a', 1.5) +
           oog(38, 54) + oog(62, 54) + wang(28, 64) + wang(72, 64),
    voor: '',
    kruin: { x: 50, y: 30, b: 44 },
    ogen: { y: 54, dx: 12 }
  },

  // ---------- Hamster ----------
  '🐹': {
    achter: cirkel(24, 33, 9, '#e3a868') + cirkel(24, 33, 5, '#ffb3c1') +
            cirkel(76, 33, 9, '#e3a868') + cirkel(76, 33, 5, '#ffb3c1'),
    hoofd: ellips(50, 60, 38, 31, '#f0c48a') +
           ellips(50, 74, 28, 15, '#fff5e6') +
           ellips(50, 45, 12, 9, '#fff5e6') +
           cirkel(50, 64, 4, '#ff8fa3') +
           `<rect x="46.5" y="68" width="7" height="7" rx="1.5" fill="#fff" stroke="#e3c9a5" stroke-width="1"/>` +
           lijn('M50 68 V75', '#e3c9a5', 1) +
           oog(37, 55, 4.4) + oog(63, 55, 4.4) + wang(22, 68, 6) + wang(78, 68, 6),
    voor: '',
    kruin: { x: 50, y: 31, b: 44 },
    ogen: { y: 55, dx: 13 }
  },

  // ---------- Konijn: de oren staan VOOR de hoed, dus de hoed gaat om de oren ----------
  '🐰': {
    achter: '',
    hoofd: ellips(50, 63, 32, 30, '#f4f1f8') +
           ellips(50, 72, 14, 10, '#fff', 'opacity=".9"') +
           `<path d="M46.5 66 H53.5 L50 70 Z" fill="#ff8fa3"/>` +
           snuitMond(50, 70, 6) +
           `<rect x="46.5" y="76" width="7" height="7" rx="1.5" fill="#fff" stroke="#e1dcea" stroke-width="1"/>` +
           lijn('M50 76 V83', '#e1dcea', 1) +
           oog(38, 59) + oog(62, 59) + wang(27, 69) + wang(73, 69),
    voor: ellips(29, 24, 9, 27, '#f4f1f8', 'transform="rotate(-13 29 24)"') +
          ellips(29, 26, 4.5, 19, '#ffb3c8', 'transform="rotate(-13 29 26)"') +
          ellips(71, 24, 9, 27, '#f4f1f8', 'transform="rotate(13 71 24)"') +
          ellips(71, 26, 4.5, 19, '#ffb3c8', 'transform="rotate(13 71 26)"'),
    kruin: { x: 50, y: 37, b: 46, strik: 0 },
    ogen: { y: 59, dx: 12 }
  },

  // ---------- Vos ----------
  '🦊': {
    achter: '',
    hoofd: ellips(50, 60, 34, 29, '#f28a30') +
           `<path d="M16 62 Q30 84 50 90 Q70 84 84 62 Q66 72 50 72 Q34 72 16 62 Z" fill="#fff"/>` +
           ellips(50, 82, 6, 4.5, DONKER) +
           lijn('M50 86 Q44 91 40 87 M50 86 Q56 91 60 87') +
           oog(37, 55) + oog(63, 55),
    voor: `<path d="M13 50 L17 8 L44 31 Z" fill="#f28a30"/><path d="M20 42 L21 20 L36 31 Z" fill="#3a2a2a"/>` +
          `<path d="M87 50 L83 8 L56 31 Z" fill="#f28a30"/><path d="M80 42 L79 20 L64 31 Z" fill="#3a2a2a"/>`,
    kruin: { x: 50, y: 32, b: 40 },
    ogen: { y: 55, dx: 13 }
  },

  // ---------- Beer ----------
  '🐻': {
    achter: cirkel(20, 30, 12, '#a86a3c') + cirkel(20, 30, 6.5, '#d9a273') +
            cirkel(80, 30, 12, '#a86a3c') + cirkel(80, 30, 6.5, '#d9a273'),
    hoofd: ellips(50, 58, 35, 33, '#a86a3c') +
           ellips(50, 70, 15, 12, '#e3bd8f') +
           ellips(50, 65, 6, 4.5, DONKER) +
           lijn('M50 69 V73 M50 73 Q45 78 42 74 M50 73 Q55 78 58 74') +
           oog(37, 52, 4.2) + oog(63, 52, 4.2),
    voor: '',
    kruin: { x: 50, y: 28, b: 46 },
    ogen: { y: 52, dx: 13 }
  },

  // ---------- Panda ----------
  '🐼': {
    achter: cirkel(20, 30, 12, DONKER, 'stroke="#6b6488" stroke-width="1.6"') + cirkel(80, 30, 12, DONKER, 'stroke="#6b6488" stroke-width="1.6"'),
    hoofd: ellips(50, 58, 36, 33, '#ffffff', 'stroke="#dcd8e8" stroke-width="1.5"') +
           ellips(36, 54, 8, 11, DONKER, 'transform="rotate(20 36 54)"') +
           ellips(64, 54, 8, 11, DONKER, 'transform="rotate(-20 64 54)"') +
           cirkel(37, 54, 4.2, '#fff') + cirkel(37.6, 55, 2.4, DONKER) +
           cirkel(63, 54, 4.2, '#fff') + cirkel(62.4, 55, 2.4, DONKER) +
           ellips(50, 67, 6, 4.2, DONKER) +
           lijn('M50 70 V73 M50 73 Q45 78 42 74 M50 73 Q55 78 58 74'),
    voor: '',
    kruin: { x: 50, y: 27, b: 46 },
    ogen: { y: 54, dx: 13 }
  },

  // ---------- Koala ----------
  '🐨': {
    achter: cirkel(18, 38, 17, '#a9aab8') + cirkel(18, 38, 10, '#f0e6ee') +
            cirkel(82, 38, 17, '#a9aab8') + cirkel(82, 38, 10, '#f0e6ee'),
    hoofd: ellips(50, 58, 33, 31, '#a9aab8') +
           ellips(50, 63, 8.5, 11, '#3a3a48') + ellips(47.5, 59, 2.2, 3, '#fff', 'opacity=".35"') +
           oog(36, 53, 4) + oog(64, 53, 4),
    voor: '',
    kruin: { x: 50, y: 29, b: 40 },
    ogen: { y: 53, dx: 14 }
  },

  // ---------- Tijger ----------
  '🐯': {
    achter: cirkel(21, 30, 11, '#f5a340') + cirkel(21, 30, 6, '#fff3d9') +
            cirkel(79, 30, 11, '#f5a340') + cirkel(79, 30, 6, '#fff3d9'),
    hoofd: ellips(50, 58, 35, 33, '#f5a340') +
           lijn('M50 26 V38 M38 28 L41 38 M62 28 L59 38 M15 52 L26 55 M15 64 L27 63 M85 52 L74 55 M85 64 L73 63', DONKER, 3.4) +
           ellips(50, 70, 16, 12, '#fff3d9') +
           `<path d="M44.5 63 H55.5 L50 70 Z" fill="#e0566f"/>` +
           lijn('M50 70 V73 M50 73 Q45 78 42 74 M50 73 Q55 78 58 74') +
           oog(37, 53) + oog(63, 53),
    voor: '',
    kruin: { x: 50, y: 28, b: 42 },
    ogen: { y: 53, dx: 13 }
  },

  // ---------- Leeuw ----------
  '🦁': {
    achter: (() => {
      let manen = cirkel(50, 56, 40, '#c9782c');
      for (let i = 0; i < 14; i++) {
        const hoek = (i / 14) * Math.PI * 2;
        manen += cirkel((50 + Math.cos(hoek) * 37).toFixed(1), (56 + Math.sin(hoek) * 37).toFixed(1), 11, '#c9782c');
      }
      manen += cirkel(30, 32, 7.5, '#f6c15b') + cirkel(70, 32, 7.5, '#f6c15b');
      return manen;
    })(),
    hoofd: ellips(50, 58, 28, 27, '#f6c15b') +
           ellips(50, 68, 13, 10, '#fff1cf') +
           `<path d="M45 62 H55 L50 68 Z" fill="#7a3b1a"/>` +
           lijn('M50 68 V71 M50 71 Q45 76 42 72 M50 71 Q55 76 58 72') +
           oog(40, 52, 4) + oog(60, 52, 4),
    voor: '',
    kruin: { x: 50, y: 24, b: 44 },
    ogen: { y: 52, dx: 10 }
  },

  // ---------- Koe ----------
  '🐮': {
    achter: `<path d="M27 36 Q14 26 20 12 Q27 24 36 31 Z" fill="#f3e2b0"/>` +
            `<path d="M73 36 Q86 26 80 12 Q73 24 64 31 Z" fill="#f3e2b0"/>` +
            ellips(14, 46, 13, 7, '#fafafa', 'transform="rotate(-22 14 46)"') +
            ellips(14, 46, 7, 3.5, '#ffb3c1', 'transform="rotate(-22 14 46)"') +
            ellips(86, 46, 13, 7, '#fafafa', 'transform="rotate(22 86 46)"') +
            ellips(86, 46, 7, 3.5, '#ffb3c1', 'transform="rotate(22 86 46)"'),
    hoofd: ellips(50, 60, 34, 31, '#fafafa', 'stroke="#e6e3ee" stroke-width="1.2"') +
           ellips(30, 43, 11, 9, '#3a3a48', 'transform="rotate(-25 30 43)"') +
           ellips(50, 73, 21, 14, '#ffb3c1') +
           ellips(42, 73, 2.6, 3.6, '#c94a68') + ellips(58, 73, 2.6, 3.6, '#c94a68') +
           oog(38, 53, 4.4) + oog(62, 53, 4.4),
    voor: '',
    kruin: { x: 50, y: 31, b: 42 },
    ogen: { y: 53, dx: 12 }
  },

  // ---------- Varken ----------
  '🐷': {
    achter: `<path d="M19 40 L13 15 L41 30 Z" fill="#ff97ab"/><path d="M81 40 L87 15 L59 30 Z" fill="#ff97ab"/>`,
    hoofd: ellips(50, 58, 35, 32, '#ffb3c1') +
           ellips(50, 68, 16, 12, '#ff8fa8') +
           ellips(44, 68, 2.8, 4.2, '#c94a68') + ellips(56, 68, 2.8, 4.2, '#c94a68') +
           oog(36, 52, 4.2) + oog(64, 52, 4.2) + wang(25, 62, 5.5) + wang(75, 62, 5.5),
    voor: '',
    kruin: { x: 50, y: 28, b: 42 },
    ogen: { y: 52, dx: 14 }
  },

  // ---------- Kikker: de ogen staan VOOR de pet, dus de pet zit tussen de ogen ----------
  '🐸': {
    achter: '',
    hoofd: ellips(50, 64, 38, 27, '#6cc24a') +
           ellips(50, 78, 28, 12, '#a6e07f') +
           lijn('M20 68 Q50 92 80 68', '#2f6f2a', 3) +
           cirkel(45, 58, 1.8, '#2f6f2a') + cirkel(55, 58, 1.8, '#2f6f2a') +
           wang(22, 71, 5.5) + wang(78, 71, 5.5),
    voor: cirkel(26, 40, 13, '#6cc24a') + cirkel(74, 40, 13, '#6cc24a') +
          cirkel(26, 40, 9.5, '#fff') + cirkel(74, 40, 9.5, '#fff') +
          cirkel(27, 41, 5, DONKER) + cirkel(73, 41, 5, DONKER) +
          cirkel(28.6, 39, 1.7, '#fff') + cirkel(74.6, 39, 1.7, '#fff'),
    kruin: { x: 50, y: 39, b: 34, strik: 0 },
    ogen: { x: 50, y: 40, dx: 24, s: 0.75 }
  },

  // ---------- Aap ----------
  '🐵': {
    achter: cirkel(16, 58, 11, '#a5673f') + cirkel(16, 58, 6.5, '#f0c9a0') +
            cirkel(84, 58, 11, '#a5673f') + cirkel(84, 58, 6.5, '#f0c9a0'),
    hoofd: ellips(50, 58, 34, 32, '#a5673f') +
           `<path d="M50 52 Q37 41 29 51 Q23 63 34 75 Q50 90 66 75 Q77 63 71 51 Q63 41 50 52 Z" fill="#f0c9a0"/>` +
           ellips(50, 73, 14, 10, '#f7dcb8') +
           cirkel(46, 69, 1.6, '#8a5a3a') + cirkel(54, 69, 1.6, '#8a5a3a') +
           lijn('M42 76 Q50 82 58 76') +
           oog(40, 57, 4) + oog(60, 57, 4),
    voor: '',
    kruin: { x: 50, y: 28, b: 44 },
    ogen: { y: 57, dx: 10 }
  },

  // ---------- Kip ----------
  '🐔': {
    achter: cirkel(40, 29, 8.5, '#e5384b') + cirkel(50, 24, 9.5, '#e5384b') + cirkel(60, 29, 8.5, '#e5384b'),
    hoofd: ellips(50, 60, 32, 31, '#ffffff', 'stroke="#e6e3ee" stroke-width="1.2"') +
           `<path d="M42 62 L58 62 L50 75 Z" fill="#ffab2e"/>` +
           ellips(50, 78, 4.5, 5.5, '#e5384b') +
           oog(37, 54) + oog(63, 54) + wang(28, 66) + wang(72, 66),
    voor: '',
    kruin: { x: 50, y: 31, b: 44 },
    ogen: { y: 54, dx: 13 }
  },

  // ---------- Pinguïn ----------
  '🐧': {
    achter: '',
    hoofd: ellips(50, 58, 34, 32, '#2f3a5a', 'stroke="#6d7ba6" stroke-width="1.6"') +
           `<path d="M50 46 Q35 32 27 50 Q23 70 40 82 Q50 88 60 82 Q77 70 73 50 Q65 32 50 46 Z" fill="#fff"/>` +
           ellips(50, 66, 8, 5, '#ffab2e') +
           oog(40, 55, 4) + oog(60, 55, 4) + wang(31, 64) + wang(69, 64),
    voor: '',
    kruin: { x: 50, y: 28, b: 44 },
    ogen: { y: 55, dx: 10 }
  },

  // ---------- Eenhoorn: de hoorn staat VOOR de hoed ----------
  '🦄': {
    achter: `<path d="M23 42 L19 14 L41 31 Z" fill="#fbeaf7"/><path d="M27 37 L25 22 L37 31 Z" fill="#ffb3d9"/>` +
            `<path d="M77 42 L81 14 L59 31 Z" fill="#fbeaf7"/><path d="M73 37 L75 22 L63 31 Z" fill="#ffb3d9"/>` +
            cirkel(22, 46, 9, '#c39bff') + cirkel(15, 58, 9, '#ff9de2') + cirkel(18, 70, 9, '#8fd3ff'),
    hoofd: ellips(50, 60, 33, 31, '#fbeaf7') +
           ellips(50, 73, 15, 11, '#ffe6f5') +
           cirkel(45, 73, 1.8, '#d987b8') + cirkel(55, 73, 1.8, '#d987b8') +
           lijn('M43 79 Q50 84 57 79') +
           oog(38, 57) + oog(62, 57) + wang(27, 68) + wang(73, 68),
    voor: `<path d="M50 3 L43 37 L57 37 Z" fill="#ffd23f"/>` +
          lijn('M45.5 27 L54 24 M44 33 L55.5 30 M47 20 L52.5 18', '#e5a400', 1.6),
    kruin: { x: 50, y: 33, b: 40, strik: 0 },
    ogen: { y: 57, dx: 12 }
  },

  // ---------- Wolf ----------
  '🐺': {
    achter: '',
    hoofd: ellips(50, 60, 34, 30, '#8b93a3') +
           `<path d="M16 64 Q30 88 50 92 Q70 88 84 64 Q66 74 50 74 Q34 74 16 64 Z" fill="#dfe3ec"/>` +
           ellips(50, 82, 6.5, 4.8, DONKER) +
           lijn('M50 87 Q44 92 40 88 M50 87 Q56 92 60 88') +
           oog(37, 55) + oog(63, 55),
    voor: `<path d="M13 52 L16 8 L44 31 Z" fill="#8b93a3"/><path d="M20 44 L21 20 L36 31 Z" fill="#4a4f5e"/>` +
          `<path d="M87 52 L84 8 L56 31 Z" fill="#8b93a3"/><path d="M80 44 L79 20 L64 31 Z" fill="#4a4f5e"/>`,
    kruin: { x: 50, y: 32, b: 40 },
    ogen: { y: 55, dx: 13 }
  },

  // ---------- Draak: de hoorns staan VOOR de hoed ----------
  '🐲': {
    achter: `<path d="M18 52 L3 43 L15 63 Z" fill="#2f9b6a"/><path d="M82 52 L97 43 L85 63 Z" fill="#2f9b6a"/>`,
    hoofd: ellips(50, 60, 34, 31, '#4cc38a') +
           ellips(50, 73, 18, 12, '#8ee0b4') +
           cirkel(44, 70, 2, '#2f9b6a') + cirkel(56, 70, 2, '#2f9b6a') +
           lijn('M40 77 Q50 84 60 77') +
           `<path d="M43 79 L45.5 85 L48 80 Z M52 80 L54.5 85 L57 79 Z" fill="#fff"/>` +
           oog(37, 53, 5) + oog(63, 53, 5) +
           lijn('M31 46 Q37 42 43 46 M57 46 Q63 42 69 46', '#2f9b6a', 2.4),
    voor: `<path d="M21 42 L12 12 L37 33 Z" fill="#ffd23f"/><path d="M79 42 L88 12 L63 33 Z" fill="#ffd23f"/>`,
    kruin: { x: 50, y: 31, b: 40 },
    ogen: { y: 53, dx: 13 }
  }
};

const DIEREN = Object.keys(DIER_TEKENINGEN);

// Deze twee dieren heeft iedereen gratis. De rest van DIEREN hierboven blijft
// gewoon bestaan (de tekeningen zijn nodig zodra iemand zo'n dier wint uit een
// mysteriebox), maar wordt nergens meer standaard aangeboden: sitebeheer stopt
// ze desgewenst in een mysteriebox in de winkel (zie app.js, "Winkel").
const STANDAARD_DIEREN = ['🐶', '🐱'];

// ---------------------------------------------------------------------------
// Accessoires. Elke plek (boven / gezicht / hoek) heeft eigen tekeningen.
// Hoeden zijn getekend met de onderkant op y=0 en het midden op x=0; een
// breedte van 100 = de "b" van het dier (zie kruin hierboven).
// Brillen zijn een functie (dx, s) die de twee lenzen op de ogen zet.
// Hoek-dingen passen in een vakje van 24 x 24.
// ---------------------------------------------------------------------------

const hartje = (kleur, licht = '#fff') =>
  `<path d="M12 22 C3 15 1 10 1 7 A5.5 5.5 0 0 1 12 6 A5.5 5.5 0 0 1 23 7 C23 10 21 15 12 22 Z" fill="${kleur}"/>` +
  `<ellipse cx="7" cy="8.5" rx="2.4" ry="1.5" fill="${licht}" opacity=".55" transform="rotate(-30 7 8.5)"/>`;
const glinster = (x, y, s, kleur = '#ffd23f') =>
  `<path d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z" fill="${kleur}"/>`;

const ACCESSOIRES = {
  // ----- Hoeden -----
  '🎩': { plek: 'boven', naam: 'hoge hoed', tekening:
    `<ellipse cx="0" cy="-3" rx="52" ry="8" fill="#22222e" stroke="#6d6d8c" stroke-width="1.8"/>` +
    `<path d="M-31 -6 L-28 -72 Q0 -78 28 -72 L31 -6 Q0 2 -31 -6 Z" fill="#2f2f3d" stroke="#6d6d8c" stroke-width="1.8" stroke-linejoin="round"/>` +
    `<path d="M-30 -20 Q0 -12 30 -20 L29.5 -32 Q0 -24 -29.5 -32 Z" fill="#d63a4f"/>` +
    `<ellipse cx="0" cy="-72" rx="28" ry="6" fill="#3d3d4f"/>` +
    `<path d="M-20 -60 L-18 -38" stroke="#fff" opacity=".14" stroke-width="5" stroke-linecap="round"/>` },
  '👑': { plek: 'boven', naam: 'kroon', tekening:
    `<path d="M-42 0 L-48 -52 L-24 -30 L0 -62 L24 -30 L48 -52 L42 0 Z" fill="#f7c93b" stroke="#d99a06" stroke-width="3" stroke-linejoin="round"/>` +
    `<rect x="-43" y="-14" width="86" height="13" fill="#e5a90f"/>` +
    `<circle cx="-48" cy="-54" r="6" fill="#e5384b"/><circle cx="0" cy="-64" r="6.5" fill="#3a8dff"/><circle cx="48" cy="-54" r="6" fill="#e5384b"/>` +
    `<circle cx="-20" cy="-7.5" r="3.2" fill="#3a8dff"/><circle cx="0" cy="-7.5" r="3.2" fill="#e5384b"/><circle cx="20" cy="-7.5" r="3.2" fill="#3a8dff"/>` },
  '🎓': { plek: 'boven', naam: 'afstudeerhoed', tekening:
    `<path d="M-32 -20 L-32 -2 Q0 10 32 -2 L32 -20 Z" fill="#3a3a5c" stroke="#7a7a9e" stroke-width="1.8" stroke-linejoin="round"/>` +
    `<path d="M-62 -34 L0 -56 L62 -34 L0 -14 Z" fill="#26263f" stroke="#7a7a9e" stroke-width="1.8" stroke-linejoin="round"/>` +
    `<circle cx="0" cy="-35" r="3.5" fill="#f7c93b"/>` +
    `<path d="M0 -35 L50 -31 L50 -10" stroke="#f7c93b" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M46 -12 H54 L56 2 H44 Z" fill="#f7c93b"/>` },
  '🧢': { plek: 'boven', naam: 'pet', tekening:
    `<path d="M-44 0 Q-46 -54 0 -54 Q46 -54 44 0 Q0 8 -44 0 Z" fill="#3b82f6"/>` +
    `<path d="M0 -54 Q-9 -30 -8 3 M0 -54 Q9 -30 8 3" stroke="#2c66c9" stroke-width="2.4" fill="none"/>` +
    `<circle cx="0" cy="-55" r="4" fill="#2c66c9"/>` +
    `<path d="M-44 -7 Q0 3 44 -7 L44 0 Q0 8 -44 0 Z" fill="#2c66c9"/>` +
    `<path d="M4 -5 Q44 -17 76 4 Q78 12 66 12 Q36 6 4 6 Z" fill="#2c66c9"/>` },
  '🤠': { plek: 'boven', naam: 'cowboyhoed', tekening:
    `<path d="M-78 -10 Q-68 8 -36 4 L36 4 Q68 8 78 -10 Q64 -2 40 -6 L-40 -6 Q-64 -2 -78 -10 Z" fill="#a8703a"/>` +
    `<path d="M-36 -4 Q-42 -46 -20 -56 Q-10 -46 0 -52 Q10 -46 20 -56 Q42 -46 36 -4 Q0 4 -36 -4 Z" fill="#b9803f"/>` +
    `<path d="M-36.5 -10 Q0 -2 36.5 -10 L37.5 -22 Q0 -14 -37.5 -22 Z" fill="#6b4423"/>` },
  '👒': { plek: 'boven', naam: 'strohoed', tekening:
    `<ellipse cx="0" cy="-5" rx="72" ry="15" fill="#ecc978"/>` +
    `<ellipse cx="0" cy="-8" rx="70" ry="12" fill="#f7dc9d"/>` +
    `<path d="M-34 -8 Q-36 -50 0 -50 Q36 -50 34 -8 Q0 0 -34 -8 Z" fill="#f7dc9d"/>` +
    `<path d="M-34.5 -12 Q0 -4 34.5 -12 L34 -24 Q0 -16 -34 -24 Z" fill="#e0566f"/>` +
    `<circle cx="26" cy="-15" r="6" fill="#c93a56"/>` },
  '🎅': { plek: 'boven', naam: 'kerstmuts', tekening:
    `<path d="M-46 -2 C-46 -50 -14 -72 24 -64 C44 -60 58 -44 62 -26 L46 -2 Z" fill="#d93636"/>` +
    `<rect x="-52" y="-16" width="104" height="18" rx="9" fill="#fff"/>` +
    `<circle cx="62" cy="-24" r="10" fill="#fff"/>` },
  // De strik zit standaard schuin rechts op het hoofd; kruin.strik zet hem elders (0 = in het midden).
  '🎀': { plek: 'boven', naam: 'strik', tekening: (x = 30) =>
    `<g transform="translate(${x} 4) rotate(14)">` +
    `<path d="M0 -8 L-30 -24 Q-38 -8 -30 8 Z" fill="#ff5c9a"/>` +
    `<path d="M0 -8 L30 -24 Q38 -8 30 8 Z" fill="#ff5c9a"/>` +
    `<path d="M0 -8 L-30 -24 L-30 -12 Z M0 -8 L30 -24 L30 -12 Z" fill="#e0367a" opacity=".45"/>` +
    `<circle cx="0" cy="-8" r="7" fill="#e0367a"/></g>` },

  // ----- Brillen -----
  '🕶️': { plek: 'gezicht', naam: 'zonnebril', bril: (dx, s) => {
    const lens = `<path d="M-19 -15 H19 V4 Q19 17 6 17 H-6 Q-19 17 -19 4 Z" fill="#1f1f2e" stroke="#6d6d8c" stroke-width="1.5" stroke-linejoin="round"/>` +
                 `<path d="M-13 -8 H-4" stroke="#fff" opacity=".4" stroke-width="3.5" stroke-linecap="round"/>`;
    return `<g transform="translate(${-dx} 0) scale(${s})">${lens}</g><g transform="translate(${dx} 0) scale(${s})">${lens}</g>` +
      `<path d="M${-dx + 17 * s} ${-8 * s} Q0 ${-14 * s} ${dx - 17 * s} ${-8 * s}" stroke="#1f1f2e" stroke-width="${5 * s}" fill="none"/>` +
      `<path d="M${-dx - 19 * s} ${-10 * s} L${-dx - 30 * s} ${-14 * s} M${dx + 19 * s} ${-10 * s} L${dx + 30 * s} ${-14 * s}" stroke="#1f1f2e" stroke-width="${5 * s}" stroke-linecap="round"/>`;
  } },
  '👓': { plek: 'gezicht', naam: 'bril', bril: (dx, s) => {
    const lens = `<circle cx="0" cy="0" r="19" fill="#bfe6ff" fill-opacity=".3" stroke="#3a3a4d" stroke-width="5"/>`;
    return `<g transform="translate(${-dx} 0) scale(${s})">${lens}</g><g transform="translate(${dx} 0) scale(${s})">${lens}</g>` +
      `<path d="M${-dx + 19 * s} ${-3 * s} Q0 ${-9 * s} ${dx - 19 * s} ${-3 * s}" stroke="#3a3a4d" stroke-width="${5 * s}" fill="none"/>` +
      `<path d="M${-dx - 19 * s} ${-4 * s} L${-dx - 30 * s} ${-8 * s} M${dx + 19 * s} ${-4 * s} L${dx + 30 * s} ${-8 * s}" stroke="#3a3a4d" stroke-width="${5 * s}" stroke-linecap="round"/>`;
  } },

  // ----- Hartjes en meer (rechtsboven naast het hoofd) -----
  '❤️': { plek: 'hoek', naam: 'hartje', tekening: hartje('#e5384b') },
  '💖': { plek: 'hoek', naam: 'glitterhartje', tekening: hartje('#ff6fb1') + glinster(21, 4, 3.6) + glinster(3, 22, 2.8) },
  '💙': { plek: 'hoek', naam: 'blauw hartje', tekening: hartje('#3a8dff') },
  '💚': { plek: 'hoek', naam: 'groen hartje', tekening: hartje('#3fbf5a') },
  '💛': { plek: 'hoek', naam: 'geel hartje', tekening: hartje('#ffc928') },
  '💜': { plek: 'hoek', naam: 'paars hartje', tekening: hartje('#a06bff') },
  '⭐': { plek: 'hoek', naam: 'ster', tekening:
    `<path d="M12 1.5 L15 8.6 L22.6 9.3 L16.8 14.3 L18.6 21.8 L12 17.8 L5.4 21.8 L7.2 14.3 L1.4 9.3 L9 8.6 Z" fill="#ffd23f" stroke="#e5a400" stroke-width="1.2" stroke-linejoin="round"/>` },
  '✨': { plek: 'hoek', naam: 'glitters', tekening: glinster(11, 13, 10) + glinster(20, 4, 4.2) + glinster(4, 21, 4.6) },
  '🌸': { plek: 'hoek', naam: 'bloem', tekening: (() => {
    let blaadjes = '';
    for (let i = 0; i < 5; i++) {
      const hoek = (i / 5) * Math.PI * 2 - Math.PI / 2;
      blaadjes += cirkel((12 + Math.cos(hoek) * 6.5).toFixed(1), (12 + Math.sin(hoek) * 6.5).toFixed(1), 5.2, '#ff9bc4');
    }
    return blaadjes + cirkel(12, 12, 3.6, '#ffd23f');
  })() },
  '🔥': { plek: 'hoek', naam: 'vuurtje', tekening:
    `<path d="M12 1 C13 7 20 9 20 16 A8 8 0 0 1 4 16 C4 12 7 10 8 6 C10 8 11 8 12 1 Z" fill="#ff7a1a"/>` +
    `<path d="M12 12 C13 15 16 16 16 19 A4 4 0 0 1 8 19 C8 16 11 15 12 12 Z" fill="#ffd23f"/>` },
  '💎': { plek: 'hoek', naam: 'diamant', tekening:
    `<path d="M6 3 H18 L23 10 L12 22 L1 10 Z" fill="#5ac8fa"/>` +
    `<path d="M1 10 H23 M6 3 L9 10 L12 22 M18 3 L15 10 L12 22 M9 10 L12 3 L15 10" stroke="#2b8fc7" stroke-width="1" fill="none" stroke-linejoin="round"/>` },
  '🍀': { plek: 'hoek', naam: 'klavertje', tekening:
    `<path d="M12 14 Q13 20 18 23" stroke="#2b8c3f" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    cirkel(8, 8, 5.5, '#3fbf5a') + cirkel(16, 8, 5.5, '#3fbf5a') +
    cirkel(8, 16, 5.5, '#3fbf5a') + cirkel(16, 16, 5.5, '#3fbf5a') +
    cirkel(12, 12, 2, '#2b8c3f') }
};

// Zo staan ze in het kiesmenu (tab "Accessoires").
const ACCESSOIRE_GROEPEN = [
  { plek: 'boven',   titel: 'Hoeden',          items: ['🎩', '👑', '🎓', '🧢', '🤠', '👒', '🎅', '🎀'] },
  { plek: 'gezicht', titel: 'Brillen',         items: ['🕶️', '👓'] },
  { plek: 'hoek',    titel: 'Hartjes en meer', items: ['❤️', '💖', '💙', '💚', '💛', '💜', '⭐', '✨', '🌸', '🔥', '💎', '🍀'] }
];

// Deze bril heeft iedereen gratis. De rest van ACCESSOIRE_GROEPEN hierboven
// (hoeden, de gewone bril, hartjes en meer) zit verstopt in mysterieboxen.
const STANDAARD_ACCESSOIRES = ['🕶️'];

// Geeft alleen de geldige accessoires terug, als { plek: emoji }.
function geldigeAccessoires(accessoires) {
  const resultaat = {};
  if (!accessoires || typeof accessoires !== 'object') return resultaat;
  ACCESSOIRE_GROEPEN.forEach(groep => {
    const emoji = accessoires[groep.plek];
    if (groep.items.indexOf(emoji) !== -1) resultaat[groep.plek] = emoji;
  });
  return resultaat;
}

// Bouwt het hele poppetje als SVG-tekst: dier + accessoires, passend gemaakt.
function poppetjeSvg(dier, accessoires) {
  const tekening = DIER_TEKENINGEN[dier];
  if (!tekening) return '';
  const acc = geldigeAccessoires(accessoires);

  let delen = tekening.achter + tekening.hoofd;

  if (acc.boven) {
    const k = tekening.kruin;
    const hoed = ACCESSOIRES[acc.boven].tekening;
    const hoedTekening = typeof hoed === 'function' ? hoed(k.strik) : hoed;
    delen += `<g transform="translate(${k.x} ${k.y}) rotate(${k.r || 0}) scale(${k.b / 100})">${hoedTekening}</g>`;
  }

  delen += tekening.voor;

  if (acc.gezicht) {
    const o = tekening.ogen;
    // dx = afstand van het midden tot het midden van een oog; s = grootte van de lenzen
    // (standaard passend bij dx; bij dieren met bijzondere ogen, zoals de kikker, apart ingesteld).
    delen += `<g transform="translate(${o.x || 50} ${o.y})">${ACCESSOIRES[acc.gezicht].bril(o.dx, o.s || o.dx / 28)}</g>`;
  }

  if (acc.hoek) {
    delen += `<g transform="translate(77 -10) scale(1.2)">${ACCESSOIRES[acc.hoek].tekening}</g>`;
  }

  return `<svg class="poppetje-svg" viewBox="-10 -26 120 126" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${delen}</svg>`;
}
