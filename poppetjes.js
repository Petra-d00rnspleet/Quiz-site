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
    ogen: { x: 50, y: 40, dx: 24, s: 0.62 }
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


// ============================================================================
// EXTRA DIEREN (en een paar "dingen" zoals de sneeuwpop) — allemaal zelf getekend.
// Ze staan in de catalogus en kunnen door sitebeheer in mysterieboxen gestopt
// worden. Wil je er een gratis voor iedereen maken? Zet hem in STANDAARD_DIEREN.
// ============================================================================
const oogW = (x, y, r = 4.6) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>` +
  `<circle cx="${x + r * 0.15}" cy="${y + r * 0.1}" r="${r * 0.55}" fill="${DONKER}"/>` +
  `<circle cx="${x + r * 0.35}" cy="${y - r * 0.2}" r="${r * 0.2}" fill="#fff"/>`;
const glimlach = (x, y, b = 8) => lijn(`M${x - b} ${y} Q${x} ${y + b * 0.95} ${x + b} ${y}`);
const driehoek = (x1, y1, x2, y2, x3, y3, fill, extra = '') =>
  `<path d="M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} Z" fill="${fill}" ${extra}/>`;
const spiegel = (svgTekst) => `<g transform="translate(100 0) scale(-1 1)">${svgTekst}</g>`;

Object.assign(DIER_TEKENINGEN, {
  // ---------- Das ----------
  '🦡': {
    achter: cirkel(24, 33, 10, '#6b6b78') + cirkel(24, 33, 5.5, '#f4f4f8') + cirkel(76, 33, 10, '#6b6b78') + cirkel(76, 33, 5.5, '#f4f4f8'),
    hoofd: ellips(50, 58, 34, 32, '#8a8a97') +
           ellips(36, 58, 10, 27, '#2b2b35') + ellips(64, 58, 10, 27, '#2b2b35') +
           ellips(50, 57, 9, 31, '#f4f4f8') +
           ellips(50, 74, 6.5, 5, DONKER) + lijn('M50 79 V82 M50 82 Q45 86 42 83 M50 82 Q55 86 58 83') +
           oogW(36, 53, 4.6) + oogW(64, 53, 4.6),
    voor: '', kruin: { x: 50, y: 28, b: 44 }, ogen: { y: 53, dx: 14 }
  },

  // ---------- Egel ----------
  '🦔': {
    achter: (() => {
      let s = '';
      for (let i = 0; i <= 12; i++) {
        const a = Math.PI + (i / 12) * Math.PI;
        const x1 = 50 + Math.cos(a - 0.2) * 32, y1 = 62 + Math.sin(a - 0.2) * 30;
        const x2 = 50 + Math.cos(a + 0.2) * 32, y2 = 62 + Math.sin(a + 0.2) * 30;
        const xt = 50 + Math.cos(a) * 49, yt = 62 + Math.sin(a) * 47;
        s += driehoek(x1.toFixed(1), y1.toFixed(1), xt.toFixed(1), yt.toFixed(1), x2.toFixed(1), y2.toFixed(1), i % 2 ? '#7a5638' : '#5c3f28');
      }
      return s;
    })(),
    hoofd: ellips(50, 62, 33, 29, '#6b4a33') +
           ellips(50, 68, 25, 22, '#f2d6b3') +
           ellips(50, 74, 5, 4, DONKER) + glimlach(50, 78, 6) +
           oog(39, 62, 4.4) + oog(61, 62, 4.4) + wang(30, 72) + wang(70, 72),
    voor: '', kruin: { x: 50, y: 22, b: 40 }, ogen: { y: 62, dx: 11 }
  },

  // ---------- Olifant ----------
  '🐘': {
    achter: ellips(13, 52, 15, 25, '#9aa3b8') + ellips(14, 52, 9, 17, '#f0b8c8') +
            ellips(87, 52, 15, 25, '#9aa3b8') + ellips(86, 52, 9, 17, '#f0b8c8'),
    hoofd: ellips(50, 54, 29, 29, '#aab3c6') +
           `<path d="M41 62 Q38 82 43 93 Q50 99 57 93 Q62 82 59 62 Z" fill="#aab3c6"/>` +
           lijn('M41.5 74 H58.5 M41.5 81 H58.5 M42 88 H58', '#8790a5', 1.6) +
           lijn('M36 68 Q28 80 33 90', '#fff', 4.2) + lijn('M64 68 Q72 80 67 90', '#fff', 4.2) +
           oog(37, 50, 4.4) + oog(63, 50, 4.4) + wang(28, 60) + wang(72, 60),
    voor: '', kruin: { x: 50, y: 26, b: 38 }, ogen: { y: 50, dx: 13 }
  },

  // ---------- Sneeuwpop ----------
  '⛄': {
    achter: '',
    hoofd: cirkel(50, 58, 34, '#ffffff', 'stroke="#c9dcf0" stroke-width="2"') +
           cirkel(37, 50, 3.6, DONKER) + cirkel(63, 50, 3.6, DONKER) +
           cirkel(36, 49, 1.1, '#fff') + cirkel(62, 49, 1.1, '#fff') +
           `<path d="M50 58 L80 63 L50 67 Z" fill="#ff8a1f"/><path d="M50 58 L80 63 L50 60 Z" fill="#ffb066"/>` +
           cirkel(31, 68, 2, DONKER) + cirkel(36, 74, 2, DONKER) + cirkel(43, 77, 2, DONKER) + cirkel(50, 78, 2, DONKER) +
           wang(27, 62, 5) + wang(73, 62, 5) +
           `<path d="M20 82 Q50 94 80 82 L78 90 Q50 100 22 90 Z" fill="#e5384b"/>` +
           `<path d="M64 89 L70 99 L60 99 Z" fill="#c92f42"/>`,
    voor: '', kruin: { x: 50, y: 28, b: 40 }, ogen: { y: 50, dx: 13 }
  },

  // ---------- Giraf ----------
  '🦒': {
    achter: ellips(17, 42, 10, 5, '#f3c65c', 'transform="rotate(-28 17 42)"') + ellips(83, 42, 10, 5, '#f3c65c', 'transform="rotate(28 83 42)"'),
    hoofd: ellips(50, 60, 30, 31, '#f3c65c') +
           cirkel(36, 40, 5, '#b57a2e') + cirkel(62, 42, 6, '#b57a2e') + cirkel(28, 60, 4, '#b57a2e') + cirkel(72, 58, 4.5, '#b57a2e') +
           ellips(50, 76, 18, 13, '#f9e0a0') + cirkel(43, 74, 2, '#8a5a1a') + cirkel(57, 74, 2, '#8a5a1a') +
           glimlach(50, 82, 6) + oog(38, 55) + oog(62, 55),
    voor: `<rect x="33" y="14" width="6" height="22" rx="3" fill="#d29a4a"/><circle cx="36" cy="13" r="5" fill="#7a4a1a"/>` +
          `<rect x="61" y="14" width="6" height="22" rx="3" fill="#d29a4a"/><circle cx="64" cy="13" r="5" fill="#7a4a1a"/>`,
    kruin: { x: 50, y: 32, b: 26 }, ogen: { y: 55, dx: 12 }
  },

  // ---------- Zebra ----------
  '🦓': {
    achter: driehoek(20, 46, 20, 10, 42, 30, '#fff', 'stroke="#2b2140" stroke-width="2.4" stroke-linejoin="round"') +
            driehoek(80, 46, 80, 10, 58, 30, '#fff', 'stroke="#2b2140" stroke-width="2.4" stroke-linejoin="round"'),
    hoofd: ellips(50, 60, 31, 31, '#ffffff', 'stroke="#dcdce8" stroke-width="1.4"') +
           lijn('M35 32 Q31 42 36 50 M50 29 V45 M65 32 Q69 42 64 50 M21 58 L31 62 M79 58 L69 62 M22 68 L32 70 M78 68 L68 70', DONKER, 4.6) +
           `<path d="M40 30 Q50 20 60 30 L57 38 Q50 32 43 38 Z" fill="${DONKER}"/>` +
           ellips(50, 76, 16, 12, '#8d8da3') + cirkel(44, 74, 2.2, DONKER) + cirkel(56, 74, 2.2, DONKER) +
           oogW(38, 54, 4.6) + oogW(62, 54, 4.6),
    voor: '', kruin: { x: 50, y: 29, b: 36 }, ogen: { y: 54, dx: 12 }
  },

  // ---------- Nijlpaard ----------
  '🦛': {
    achter: cirkel(21, 36, 8, '#9a91bd') + cirkel(21, 36, 4, '#e8b4c4') + cirkel(79, 36, 8, '#9a91bd') + cirkel(79, 36, 4, '#e8b4c4'),
    hoofd: ellips(50, 58, 35, 30, '#a39bc4') +
           ellips(50, 74, 29, 18, '#c0b9dc') +
           cirkel(40, 66, 3.4, '#5b5478') + cirkel(60, 66, 3.4, '#5b5478') +
           `<rect x="30" y="80" width="6" height="7" rx="2" fill="#fff"/><rect x="64" y="80" width="6" height="7" rx="2" fill="#fff"/>` +
           glimlach(50, 82, 10) +
           oog(34, 47, 4.4) + oog(66, 47, 4.4),
    voor: '', kruin: { x: 50, y: 30, b: 42 }, ogen: { y: 47, dx: 16 }
  },

  // ---------- Neushoorn ----------
  '🦏': {
    achter: cirkel(22, 34, 8, '#8a91a2') + cirkel(78, 34, 8, '#8a91a2'),
    hoofd: ellips(50, 60, 34, 30, '#a0a6b6') +
           ellips(50, 76, 23, 14, '#b9bfcc') + cirkel(41, 74, 2.6, '#5e6475') + cirkel(59, 74, 2.6, '#5e6475') +
           lijn('M40 84 Q50 88 60 84', DONKER, 2) +
           oog(34, 54, 3.8) + oog(66, 54, 3.8),
    voor: `<path d="M43 52 Q46 24 54 20 Q56 34 57 52 Z" fill="#eee7d2" stroke="#b9ae90" stroke-width="1.6" stroke-linejoin="round"/>`,
    kruin: { x: 50, y: 32, b: 36 }, ogen: { y: 54, dx: 16 }
  },

  // ---------- Schaap ----------
  '🐑': {
    achter: [[24, 50, 14], [28, 32, 14], [42, 24, 14], [58, 24, 14], [72, 32, 14], [76, 50, 14], [24, 70, 11], [76, 70, 11]]
      .map(c => cirkel(c[0], c[1], c[2], '#fff', 'stroke="#e3e3ee" stroke-width="1.4"')).join(''),
    hoofd: ellips(50, 62, 23, 28, '#3f3a4d') +
           ellips(23, 58, 10, 5, '#3f3a4d', 'transform="rotate(20 23 58)"') + ellips(77, 58, 10, 5, '#3f3a4d', 'transform="rotate(-20 77 58)"') +
           cirkel(50, 36, 13, '#fff', 'stroke="#e3e3ee" stroke-width="1.4"') +
           oogW(41, 58, 4.6) + oogW(59, 58, 4.6) +
           ellips(50, 72, 5.5, 4, '#7a7488') + glimlach(50, 76, 6),
    voor: '', kruin: { x: 50, y: 26, b: 38 }, ogen: { y: 58, dx: 9 }
  },

  // ---------- Geit ----------
  '🐐': {
    achter: lijn('M35 36 Q22 16 36 6', '#c9b98a', 5) + lijn('M65 36 Q78 16 64 6', '#c9b98a', 5) +
            ellips(20, 46, 13, 5.5, '#e9e2d5', 'transform="rotate(22 20 46)"') + ellips(80, 46, 13, 5.5, '#e9e2d5', 'transform="rotate(-22 80 46)"'),
    hoofd: ellips(50, 58, 28, 30, '#efe9dc') +
           `<path d="M43 84 Q50 100 57 84 Z" fill="#d8d0bd"/>` +
           ellips(50, 73, 12, 10, '#f7cfcf') + cirkel(46, 72, 1.8, '#a85a6a') + cirkel(54, 72, 1.8, '#a85a6a') +
           glimlach(50, 80, 5) + oog(39, 52) + oog(61, 52),
    voor: '', kruin: { x: 50, y: 28, b: 32 }, ogen: { y: 52, dx: 11 }
  },

  // ---------- Paard ----------
  '🐴': {
    achter: `<path d="M36 26 Q22 30 26 58 Q18 44 22 24 Q32 6 50 8 Q68 6 78 24 Q82 44 74 58 Q78 30 64 26 Z" fill="#4a2f1c"/>`,
    hoofd: ellips(50, 58, 27, 31, '#b0703c') +
           `<path d="M46.5 30 H53.5 L55 72 H45 Z" fill="#fff" opacity=".85"/>` +
           ellips(50, 77, 18, 13, '#cc8f58') + cirkel(43, 76, 2.4, '#5a3a20') + cirkel(57, 76, 2.4, '#5a3a20') +
           glimlach(50, 84, 6) + oog(38, 50) + oog(62, 50),
    voor: driehoek(28, 34, 26, 8, 40, 26, '#b0703c') + driehoek(72, 34, 74, 8, 60, 26, '#b0703c') +
          `<path d="M42 26 Q50 46 58 26 Q50 20 42 26 Z" fill="#4a2f1c"/>`,
    kruin: { x: 50, y: 24, b: 34 }, ogen: { y: 50, dx: 12 }
  },

  // ---------- Ezel ----------
  '🫏': {
    achter: '',
    hoofd: ellips(50, 63, 29, 29, '#98989f') +
           ellips(50, 78, 20, 13, '#efe5d6') + cirkel(43, 76, 2.4, '#7a6a5a') + cirkel(57, 76, 2.4, '#7a6a5a') +
           glimlach(50, 84, 6) + oog(38, 56) + oog(62, 56) + wang(27, 68),
    voor: ellips(31, 26, 8, 25, '#98989f', 'transform="rotate(-10 31 26)"') + ellips(31, 28, 4, 18, '#f0b8c8', 'transform="rotate(-10 31 28)"') +
          ellips(69, 26, 8, 25, '#98989f', 'transform="rotate(10 69 26)"') + ellips(69, 28, 4, 18, '#f0b8c8', 'transform="rotate(10 69 28)"'),
    kruin: { x: 50, y: 39, b: 32, strik: 0 }, ogen: { y: 56, dx: 12 }
  },

  // ---------- Eend ----------
  '🦆': {
    achter: '',
    hoofd: ellips(50, 58, 32, 30, '#ffd83b') +
           lijn('M50 29 Q44 18 54 15', '#f0b800', 3) +
           ellips(50, 72, 20, 10, '#ff9a2e') + lijn('M32 72 Q50 78 68 72', '#d97a12', 1.8) +
           cirkel(43, 69, 1.5, '#b85f0a') + cirkel(57, 69, 1.5, '#b85f0a') +
           oog(37, 51) + oog(63, 51) + wang(26, 62) + wang(74, 62),
    voor: '', kruin: { x: 50, y: 30, b: 40 }, ogen: { y: 51, dx: 13 }
  },

  // ---------- Uil ----------
  '🦉': {
    achter: '',
    hoofd: ellips(50, 58, 34, 32, '#a06f43') +
           lijn('M30 84 Q34 90 38 84 M44 88 Q50 94 56 88 M62 84 Q66 90 70 84', '#7a4f2b', 2) +
           cirkel(36, 54, 15, '#f7e3c0') + cirkel(64, 54, 15, '#f7e3c0') +
           cirkel(36, 54, 9.5, '#ffd23f') + cirkel(64, 54, 9.5, '#ffd23f') +
           cirkel(36, 54, 5, DONKER) + cirkel(64, 54, 5, DONKER) +
           cirkel(38, 51.5, 1.7, '#fff') + cirkel(66, 51.5, 1.7, '#fff') +
           driehoek(45, 62, 55, 62, 50, 76, '#ff9a2e'),
    voor: driehoek(20, 44, 18, 8, 42, 28, '#a06f43') + driehoek(80, 44, 82, 8, 58, 28, '#a06f43'),
    kruin: { x: 50, y: 28, b: 34 }, ogen: { y: 54, dx: 14, s: 0.5 }
  },

  // ---------- Vleermuis ----------
  '🦇': {
    achter: `<path d="M24 52 Q2 36 0 60 Q10 54 14 70 Q20 58 28 72 Z" fill="#4b3b6b"/>` +
            `<path d="M76 52 Q98 36 100 60 Q90 54 86 70 Q80 58 72 72 Z" fill="#4b3b6b"/>`,
    hoofd: ellips(50, 60, 28, 28, '#5f4d85') +
           ellips(50, 72, 14, 10, '#7d6aa8') + cirkel(46, 68, 1.6, DONKER) + cirkel(54, 68, 1.6, DONKER) +
           glimlach(50, 74, 7) + driehoek(43, 78, 46, 84, 48, 78, '#fff') + driehoek(52, 78, 54, 84, 57, 78, '#fff') +
           oogW(39, 55, 4.4) + oogW(61, 55, 4.4),
    voor: driehoek(26, 50, 24, 8, 44, 34, '#5f4d85') + driehoek(29, 44, 28, 20, 40, 34, '#ff9db3') +
          driehoek(74, 50, 76, 8, 56, 34, '#5f4d85') + driehoek(71, 44, 72, 20, 60, 34, '#ff9db3'),
    kruin: { x: 50, y: 32, b: 30 }, ogen: { y: 55, dx: 11 }
  },

  // ---------- Dolfijn ----------
  '🐬': {
    achter: `<path d="M44 36 Q48 4 68 8 Q56 18 58 36 Z" fill="#5a9cc4"/>`,
    hoofd: ellips(50, 58, 34, 30, '#72b4da') +
           ellips(50, 72, 26, 16, '#c3e3f4') +
           ellips(50, 74, 14, 9, '#a8d4ea') + lijn('M30 76 Q50 90 70 76', '#2f6f96', 2.2) +
           cirkel(50, 36, 1.8, '#3f7fa8') +
           oog(36, 52) + oog(64, 52) + wang(25, 64) + wang(75, 64),
    voor: '', kruin: { x: 50, y: 30, b: 38 }, ogen: { y: 52, dx: 14 }
  },

  // ---------- Walvis ----------
  '🐳': {
    achter: lijn('M50 32 V14 M50 14 Q40 4 32 14 M50 14 Q60 4 68 14', '#8fd3ff', 3.4) + cirkel(32, 16, 2.6, '#8fd3ff') + cirkel(68, 16, 2.6, '#8fd3ff'),
    hoofd: ellips(50, 62, 39, 30, '#4a86c7') +
           ellips(50, 78, 30, 14, '#e2edf9') +
           lijn('M30 74 H44 M56 74 H70 M34 80 H46 M54 80 H66', '#b6cde8', 1.6) +
           lijn('M24 66 Q50 84 76 66', '#2b5c96', 2.4) +
           oog(30, 55, 4.2) + oog(70, 55, 4.2) + wang(20, 66) + wang(80, 66),
    voor: '', kruin: { x: 50, y: 32, b: 40 }, ogen: { y: 55, dx: 20, s: 0.55 }
  },

  // ---------- Vis ----------
  '🐟': {
    achter: `<path d="M18 62 L0 44 L2 80 Z" fill="#ff7a1a"/><path d="M82 62 L100 44 L98 80 Z" fill="#ff7a1a"/>` +
            `<path d="M34 34 Q50 8 66 34 Z" fill="#ff7a1a"/>`,
    hoofd: ellips(50, 60, 34, 29, '#ffa03c') +
           lijn('M28 44 Q20 60 28 76 M72 44 Q80 60 72 76', '#ffc987', 2.4) +
           lijn('M36 38 Q34 46 36 52 M64 38 Q66 46 64 52', '#fff', 3) +
           cirkel(37, 54, 9, '#fff') + cirkel(63, 54, 9, '#fff') + cirkel(38, 55, 4.6, DONKER) + cirkel(62, 55, 4.6, DONKER) +
           cirkel(39.6, 53, 1.6, '#fff') + cirkel(63.6, 53, 1.6, '#fff') +
           ellips(50, 78, 10, 6.5, '#ff6f6f') + lijn('M42 78 Q50 82 58 78', '#c94a4a', 1.8),
    voor: '', kruin: { x: 50, y: 32, b: 34 }, ogen: { y: 54, dx: 13, s: 0.5 }
  },

  // ---------- Octopus ----------
  '🐙': {
    achter: `<path d="M20 64 Q8 80 18 92 Q24 84 30 72 Z" fill="#d94d75"/><path d="M80 64 Q92 80 82 92 Q76 84 70 72 Z" fill="#d94d75"/>` +
            `<path d="M34 76 Q28 94 40 98 Q44 88 44 76 Z" fill="#d94d75"/><path d="M66 76 Q72 94 60 98 Q56 88 56 76 Z" fill="#d94d75"/>`,
    hoofd: ellips(50, 50, 33, 31, '#e8607f') +
           cirkel(36, 30, 4, '#f39ab0') + cirkel(46, 24, 3, '#f39ab0') + cirkel(64, 32, 3.6, '#f39ab0') +
           ellips(50, 74, 22, 12, '#e8607f') +
           glimlach(50, 68, 9) + oogW(38, 52, 5.2) + oogW(62, 52, 5.2) + wang(26, 62, 5) + wang(74, 62, 5),
    voor: '', kruin: { x: 50, y: 22, b: 42 }, ogen: { y: 52, dx: 12 }
  },

  // ---------- Krab ----------
  '🦀': {
    achter: cirkel(14, 40, 12, '#e5484d') + `<path d="M8 32 L2 16 L14 24 Z" fill="#e5484d"/><path d="M20 30 L26 16 L14 24 Z" fill="#e5484d"/>` +
            cirkel(86, 40, 12, '#e5484d') + `<path d="M92 32 L98 16 L86 24 Z" fill="#e5484d"/><path d="M80 30 L74 16 L86 24 Z" fill="#e5484d"/>` +
            lijn('M22 78 L8 90 M28 84 L18 98 M78 78 L92 90 M72 84 L82 98', '#c9383d', 4),
    hoofd: ellips(50, 66, 35, 26, '#ef5a5f') +
           lijn('M30 52 Q50 44 70 52', '#c9383d', 2) +
           glimlach(50, 74, 10) + wang(28, 72, 5) + wang(72, 72, 5),
    voor: lijn('M37 46 V30 M63 46 V30', '#c9383d', 3) +
          cirkel(37, 28, 8, '#fff') + cirkel(63, 28, 8, '#fff') + cirkel(38, 29, 4, DONKER) + cirkel(62, 29, 4, DONKER) +
          cirkel(39.4, 27, 1.4, '#fff') + cirkel(63.4, 27, 1.4, '#fff'),
    kruin: { x: 50, y: 46, b: 30, strik: 0 }, ogen: { x: 50, y: 28, dx: 13, s: 0.55 }
  },

  // ---------- Schildpad ----------
  '🐢': {
    achter: cirkel(50, 52, 43, '#4f9d4b') +
            lijn('M22 40 Q50 20 78 40 M14 60 Q50 44 86 60 M50 14 V36 M30 30 L36 46 M70 30 L64 46', '#2f6f2a', 2.6) +
            cirkel(50, 30, 2, '#2f6f2a'),
    hoofd: ellips(50, 68, 25, 26, '#86c66e') +
           ellips(50, 78, 14, 9, '#a8dd8f') +
           glimlach(50, 78, 7) + oog(41, 64, 4.4) + oog(59, 64, 4.4) + wang(33, 73, 4.5) + wang(67, 73, 4.5),
    voor: '', kruin: { x: 50, y: 46, b: 32 }, ogen: { y: 64, dx: 9 }
  },

  // ---------- Slang ----------
  '🐍': {
    achter: '',
    hoofd: ellips(50, 62, 30, 27, '#5cbf5c') +
           `<path d="M50 38 L58 46 L50 54 L42 46 Z M38 52 L44 58 L38 64 L32 58 Z M62 52 L68 58 L62 64 L56 58 Z" fill="#3a9a3f"/>` +
           lijn('M50 78 V90 M50 90 L44 96 M50 90 L56 96', '#e5384b', 2.4) +
           ellips(50, 76, 20, 9, '#b7ea9c') + cirkel(45, 70, 1.5, '#2f6f2a') + cirkel(55, 70, 1.5, '#2f6f2a') +
           glimlach(50, 76, 8) +
           cirkel(37, 56, 6.5, '#ffe14d') + cirkel(63, 56, 6.5, '#ffe14d') +
           ellips(37, 56, 1.7, 5.2, DONKER) + ellips(63, 56, 1.7, 5.2, DONKER),
    voor: '', kruin: { x: 50, y: 37, b: 34 }, ogen: { y: 56, dx: 13, s: 0.5 }
  },

  // ---------- Krokodil ----------
  '🐊': {
    achter: '',
    hoofd: ellips(50, 56, 32, 26, '#4fae4f') +
           ellips(50, 74, 27, 17, '#68c468') +
           cirkel(41, 68, 2.4, '#2f6f2a') + cirkel(59, 68, 2.4, '#2f6f2a') +
           lijn('M26 80 Q50 90 74 80', '#2f6f2a', 2.4) +
           driehoek(32, 81, 36, 88, 39, 83, '#fff') + driehoek(44, 84, 48, 91, 51, 85, '#fff') + driehoek(58, 85, 61, 91, 65, 84, '#fff') + driehoek(66, 83, 70, 88, 73, 81, '#fff'),
    voor: cirkel(30, 40, 11, '#4fae4f') + cirkel(70, 40, 11, '#4fae4f') +
          cirkel(30, 40, 7, '#fff') + cirkel(70, 40, 7, '#fff') +
          ellips(30, 41, 2, 5.4, DONKER) + ellips(70, 41, 2, 5.4, DONKER),
    kruin: { x: 50, y: 40, b: 30, strik: 0 }, ogen: { x: 50, y: 40, dx: 20, s: 0.55 }
  },

  // ---------- Vlinder ----------
  '🦋': {
    achter: ellips(20, 42, 18, 24, '#b07cf5', 'transform="rotate(-18 20 42)"') + ellips(80, 42, 18, 24, '#b07cf5', 'transform="rotate(18 80 42)"') +
            ellips(24, 70, 14, 16, '#f79ad0') + ellips(76, 70, 14, 16, '#f79ad0') +
            cirkel(17, 40, 6, '#ffe6a8') + cirkel(83, 40, 6, '#ffe6a8') + cirkel(23, 71, 4.5, '#fff') + cirkel(77, 71, 4.5, '#fff'),
    hoofd: ellips(50, 60, 20, 28, '#6b4a35') +
           ellips(50, 68, 12, 14, '#f4d9b8') +
           glimlach(50, 72, 6) + oogW(43, 54, 4.2) + oogW(57, 54, 4.2),
    voor: lijn('M45 36 Q40 20 34 14 M55 36 Q60 20 66 14', '#4a3222', 2.4) + cirkel(33, 13, 3.4, '#4a3222') + cirkel(67, 13, 3.4, '#4a3222'),
    kruin: { x: 50, y: 35, b: 26, strik: 0 }, ogen: { y: 54, dx: 7 }
  },

  // ---------- Bij ----------
  '🐝': {
    achter: ellips(28, 30, 15, 9, '#e6f6ff', 'transform="rotate(-30 28 30)" stroke="#a9d3ea" stroke-width="1.5"') +
            ellips(72, 30, 15, 9, '#e6f6ff', 'transform="rotate(30 72 30)" stroke="#a9d3ea" stroke-width="1.5"'),
    hoofd: ellips(50, 60, 32, 30, '#ffd23f') +
           `<path d="M20 68 Q50 78 80 68 L81 75 Q50 85 19 75 Z" fill="${DONKER}"/>` +
           `<path d="M26 80 Q50 90 74 80 L70 86 Q50 94 30 86 Z" fill="${DONKER}"/>` +
           oog(38, 54) + oog(62, 54) + glimlach(50, 62, 7) + wang(27, 62) + wang(73, 62),
    voor: lijn('M42 34 Q38 20 30 16 M58 34 Q62 20 70 16', DONKER, 2.4) + cirkel(29, 15, 3.2, DONKER) + cirkel(71, 15, 3.2, DONKER),
    kruin: { x: 50, y: 32, b: 34, strik: 0 }, ogen: { y: 54, dx: 12 }
  },

  // ---------- Lieveheersbeestje ----------
  '🐞': {
    achter: '',
    hoofd: ellips(50, 60, 34, 31, '#e5384b') +
           lijn('M50 40 V90', DONKER, 2.6) +
           `<path d="M18 50 Q50 14 82 50 Q50 40 18 50 Z" fill="${DONKER}"/>` +
           cirkel(30, 66, 6, DONKER) + cirkel(70, 66, 6, DONKER) + cirkel(38, 80, 5, DONKER) + cirkel(62, 80, 5, DONKER) + cirkel(24, 54, 3.4, DONKER) + cirkel(76, 54, 3.4, DONKER) +
           oogW(40, 41, 4.4) + oogW(60, 41, 4.4) + glimlach(50, 50, 6, DONKER),
    voor: lijn('M44 28 Q40 14 32 10 M56 28 Q60 14 68 10', DONKER, 2.4) + cirkel(31, 9, 3, DONKER) + cirkel(69, 9, 3, DONKER),
    kruin: { x: 50, y: 26, b: 34, strik: 0 }, ogen: { y: 41, dx: 10 }
  },

  // ---------- Slak ----------
  '🐌': {
    achter: cirkel(50, 40, 30, '#c9884a') + cirkel(50, 40, 20, '#dda468') + cirkel(50, 40, 10, '#c9884a') +
            lijn('M50 40 m-4 0 a4 4 0 1 1 4 4 a9 9 0 1 1 -9 -9 a15 15 0 1 1 15 15', '#8a5a2b', 2),
    hoofd: ellips(50, 72, 33, 22, '#ecd0a4') +
           oog(40, 68, 4.4) + oog(60, 68, 4.4) + glimlach(50, 76, 7) + wang(30, 76, 4.5) + wang(70, 76, 4.5),
    voor: lijn('M36 62 Q30 50 30 36 M64 62 Q70 50 70 36', '#ecd0a4', 4) + cirkel(30, 34, 6, '#ecd0a4') + cirkel(70, 34, 6, '#ecd0a4') +
          cirkel(30, 34, 3, DONKER) + cirkel(70, 34, 3, DONKER),
    kruin: { x: 50, y: 16, b: 34, strik: 0 }, ogen: { y: 68, dx: 10 }
  },

  // ---------- Spin ----------
  '🕷️': {
    achter: lijn('M28 50 Q6 30 10 12 M26 60 Q0 56 2 40 M26 70 Q2 76 6 92 M30 78 Q14 92 22 100 M72 50 Q94 30 90 12 M74 60 Q100 56 98 40 M74 70 Q98 76 94 92 M70 78 Q86 92 78 100', '#6a5a86', 4.2),
    hoofd: ellips(50, 60, 30, 28, '#4a3a5c') +
           `<path d="M50 40 L58 50 L50 60 L42 50 Z" fill="#e5384b"/>` +
           oogW(40, 56, 6.4) + oogW(60, 56, 6.4) + cirkel(46, 46, 2.4, '#fff') + cirkel(54, 46, 2.4, '#fff') +
           glimlach(50, 70, 7) + driehoek(44, 76, 47, 84, 49, 76, '#fff') + driehoek(51, 76, 53, 84, 56, 76, '#fff'),
    voor: '', kruin: { x: 50, y: 32, b: 34 }, ogen: { y: 56, dx: 10, s: 0.5 }
  },

  // ---------- Eekhoorn ----------
  '🐿️': {
    achter: `<path d="M74 64 Q106 54 94 12 Q76 18 72 46 Z" fill="#d98b48"/><path d="M76 58 Q98 50 90 22" fill="none" stroke="#f0b47a" stroke-width="3" stroke-linecap="round"/>`,
    hoofd: ellips(50, 60, 30, 29, '#c9783a') +
           ellips(50, 72, 17, 12, '#f5dcc0') + cirkel(50, 66, 3.6, DONKER) +
           `<rect x="45.5" y="72" width="9" height="8" rx="2" fill="#fff" stroke="#e3c9a5" stroke-width="1"/><path d="M50 72 V80" stroke="#e3c9a5" stroke-width="1"/>` +
           oog(38, 54) + oog(62, 54) + wang(28, 66) + wang(72, 66),
    voor: driehoek(24, 44, 22, 12, 42, 32, '#c9783a') + lijn('M22 12 L22 4 M22 12 L16 6', '#7a4a1a', 2) +
          driehoek(76, 44, 78, 12, 58, 32, '#c9783a') + lijn('M78 12 L78 4 M78 12 L84 6', '#7a4a1a', 2),
    kruin: { x: 50, y: 32, b: 32, strik: 0 }, ogen: { y: 54, dx: 12 }
  },

  // ---------- Kameel ----------
  '🐫': {
    achter: cirkel(50, 28, 19, '#c1934f') + ellips(22, 42, 6, 8, '#d2a45f') + ellips(78, 42, 6, 8, '#d2a45f'),
    hoofd: ellips(50, 62, 27, 30, '#d8ac68') +
           ellips(50, 78, 19, 13, '#ebcd98') + cirkel(44, 76, 2.2, '#8a6a34') + cirkel(56, 76, 2.2, '#8a6a34') +
           glimlach(50, 84, 5) +
           lijn('M35 47 L32 43 M39 46 L38 41', DONKER, 1.6) + lijn('M65 47 L68 43 M61 46 L62 41', DONKER, 1.6) +
           oog(38, 54) + oog(62, 54),
    voor: '', kruin: { x: 50, y: 36, b: 32 }, ogen: { y: 54, dx: 12 }
  },

  // ---------- Lama ----------
  '🦙': {
    achter: cirkel(50, 26, 14, '#fff', 'stroke="#e6e0d2" stroke-width="1.4"') + cirkel(38, 32, 12, '#fff', 'stroke="#e6e0d2" stroke-width="1.4"') + cirkel(62, 32, 12, '#fff', 'stroke="#e6e0d2" stroke-width="1.4"'),
    hoofd: ellips(50, 62, 24, 28, '#f6efe2') +
           ellips(50, 77, 14, 11, '#ecdcc4') + cirkel(46, 75, 1.8, '#8a6a4a') + cirkel(54, 75, 1.8, '#8a6a4a') +
           glimlach(50, 82, 5) + oog(40, 57) + oog(60, 57) + wang(31, 68, 4.5) + wang(69, 68, 4.5),
    voor: ellips(30, 30, 5.5, 14, '#f6efe2', 'transform="rotate(-25 30 30)" stroke="#e6e0d2" stroke-width="1.2"') +
          ellips(70, 30, 5.5, 14, '#f6efe2', 'transform="rotate(25 70 30)" stroke="#e6e0d2" stroke-width="1.2"'),
    kruin: { x: 50, y: 34, b: 30 }, ogen: { y: 57, dx: 10 }
  },

  // ---------- Hert ----------
  '🦌': {
    achter: lijn('M36 34 L28 16 M31 25 L20 20 M28 19 L28 6 M64 34 L72 16 M69 25 L80 20 M72 19 L72 6', '#7a5230', 4.2),
    hoofd: ellips(50, 62, 27, 30, '#b87e48') +
           cirkel(36, 44, 2, '#f3e2c4') + cirkel(62, 42, 2, '#f3e2c4') + cirkel(30, 54, 1.8, '#f3e2c4') + cirkel(70, 52, 1.8, '#f3e2c4') +
           ellips(50, 78, 15, 11, '#ebcfa6') + ellips(50, 72, 5.5, 4, DONKER) +
           glimlach(50, 80, 5) + oog(39, 56) + oog(61, 56),
    voor: ellips(24, 40, 11, 5.5, '#b87e48', 'transform="rotate(-30 24 40)"') + ellips(24, 40, 6, 2.6, '#f0b8c8', 'transform="rotate(-30 24 40)"') +
          ellips(76, 40, 11, 5.5, '#b87e48', 'transform="rotate(30 76 40)"') + ellips(76, 40, 6, 2.6, '#f0b8c8', 'transform="rotate(30 76 40)"'),
    kruin: { x: 50, y: 33, b: 34 }, ogen: { y: 56, dx: 11 }
  },

  // ---------- Wasbeer ----------
  '🦝': {
    achter: cirkel(22, 32, 11, '#8a8a98') + cirkel(22, 32, 5.5, '#f4f4f8') + cirkel(78, 32, 11, '#8a8a98') + cirkel(78, 32, 5.5, '#f4f4f8'),
    hoofd: ellips(50, 58, 34, 30, '#a0a0ae') +
           `<path d="M17 50 Q34 40 50 50 Q66 40 83 50 Q79 68 62 62 Q50 56 38 62 Q21 68 17 50 Z" fill="#33333f"/>` +
           ellips(50, 72, 14, 10, '#f2f0f7') + ellips(50, 68, 5, 3.6, DONKER) + glimlach(50, 74, 6) +
           oogW(38, 54, 4.4) + oogW(62, 54, 4.4),
    voor: '', kruin: { x: 50, y: 29, b: 42 }, ogen: { y: 54, dx: 12 }
  },

  // ---------- Stinkdier ----------
  '🦨': {
    achter: `<path d="M74 62 Q106 44 88 4 Q70 12 68 42 Z" fill="#3a3a48"/><path d="M78 54 Q98 40 86 12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>` +
            cirkel(24, 34, 8, '#3a3a48') + cirkel(76, 34, 8, '#3a3a48'),
    hoofd: ellips(50, 60, 30, 30, '#3f3f4d') +
           ellips(50, 46, 6, 20, '#fff') +
           ellips(50, 74, 13, 10, '#f2f0f7') + ellips(50, 70, 4.4, 3.4, '#ff8fa3') + glimlach(50, 76, 6) +
           oogW(38, 58, 4.6) + oogW(62, 58, 4.6),
    voor: '', kruin: { x: 50, y: 30, b: 34 }, ogen: { y: 58, dx: 12 }
  },

  // ---------- Luiaard ----------
  '🦥': {
    achter: '',
    hoofd: ellips(50, 58, 33, 30, '#cdaa78') +
           ellips(50, 60, 26, 22, '#f0e4c8') +
           ellips(37, 56, 9, 6.5, '#7a5c3a', 'transform="rotate(-22 37 56)"') + ellips(63, 56, 9, 6.5, '#7a5c3a', 'transform="rotate(22 63 56)"') +
           oogW(37, 56, 3.6) + oogW(63, 56, 3.6) +
           ellips(50, 68, 5, 3.8, DONKER) + glimlach(50, 71, 8) + wang(30, 70, 4.5) + wang(70, 70, 4.5),
    voor: '', kruin: { x: 50, y: 28, b: 42 }, ogen: { y: 56, dx: 13, s: 0.5 }
  },

  // ---------- Otter ----------
  '🦦': {
    achter: cirkel(24, 34, 7, '#7a5a38') + cirkel(76, 34, 7, '#7a5a38'),
    hoofd: ellips(50, 60, 33, 29, '#8f6842') +
           ellips(50, 73, 19, 13, '#ecd9bb') + ellips(50, 67, 5.6, 4, DONKER) + glimlach(50, 74, 7) +
           lijn('M22 68 L36 70 M22 75 L36 74 M78 68 L64 70 M78 75 L64 74', '#c9b48e', 1.4) +
           cirkel(40, 76, 1, '#a58a5f') + cirkel(60, 76, 1, '#a58a5f') +
           oog(37, 53, 4.6) + oog(63, 53, 4.6),
    voor: '', kruin: { x: 50, y: 31, b: 40 }, ogen: { y: 53, dx: 13 }
  },

  // ---------- Kangoeroe ----------
  '🦘': {
    achter: '',
    hoofd: ellips(50, 62, 25, 29, '#cc9058') +
           ellips(50, 76, 15, 12, '#efd3ac') + ellips(50, 70, 5, 3.6, DONKER) + glimlach(50, 77, 6) +
           oog(39, 56) + oog(61, 56) + wang(30, 68, 4.5) + wang(70, 68, 4.5),
    voor: ellips(31, 22, 7, 19, '#cc9058', 'transform="rotate(-12 31 22)"') + ellips(31, 24, 3.6, 13, '#f0b8c8', 'transform="rotate(-12 31 24)"') +
          ellips(69, 22, 7, 19, '#cc9058', 'transform="rotate(12 69 22)"') + ellips(69, 24, 3.6, 13, '#f0b8c8', 'transform="rotate(12 69 24)"'),
    kruin: { x: 50, y: 36, b: 28, strik: 0 }, ogen: { y: 56, dx: 11 }
  },

  // ---------- Flamingo ----------
  '🦩': {
    achter: ellips(50, 30, 12, 10, '#ff8fb1') + ellips(38, 34, 9, 8, '#ff8fb1') + ellips(62, 34, 9, 8, '#ff8fb1'),
    hoofd: ellips(50, 60, 28, 28, '#ff8fb1') +
           `<path d="M39 62 Q50 58 61 62 Q62 80 50 86 Q38 80 39 62 Z" fill="#ffd3e0"/>` +
           `<path d="M41 76 Q50 80 59 76 Q57 86 50 86 Q43 86 41 76 Z" fill="${DONKER}"/>` +
           cirkel(46, 68, 1.4, '#c94a78') + cirkel(54, 68, 1.4, '#c94a78') +
           cirkel(36, 52, 5.5, '#ffe58a') + cirkel(64, 52, 5.5, '#ffe58a') + cirkel(36.4, 52.4, 2.8, DONKER) + cirkel(63.6, 52.4, 2.8, DONKER) +
           wang(27, 64) + wang(73, 64),
    voor: '', kruin: { x: 50, y: 34, b: 34 }, ogen: { y: 52, dx: 14, s: 0.5 }
  },

  // ---------- Pauw ----------
  '🦚': {
    achter: (() => {
      let s = '';
      const kleuren = ['#1fa89a', '#2b7fd6', '#3fbf5a'];
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + 0.15 + (i / 8) * (Math.PI - 0.3);
        const x = 50 + Math.cos(a) * 38, y = 66 + Math.sin(a) * 44;
        s += ellips(x.toFixed(1), y.toFixed(1), 10, 15, kleuren[i % 3], `transform="rotate(${((a * 180) / Math.PI + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"`);
        s += cirkel(x.toFixed(1), y.toFixed(1), 4.4, '#ffd23f') + cirkel(x.toFixed(1), y.toFixed(1), 2, '#2b2140');
      }
      return s;
    })(),
    hoofd: ellips(50, 66, 21, 24, '#2b7fd6') +
           ellips(50, 66, 13, 15, '#e8f3ff') +
           driehoek(46, 66, 54, 66, 50, 76, '#ffc22e') +
           oog(42, 60, 3.6) + oog(58, 60, 3.6) + wang(38, 70, 3.6) + wang(62, 70, 3.6),
    voor: lijn('M46 46 Q44 34 40 30 M50 44 V28 M54 46 Q56 34 60 30', '#1a5fae', 2.2) +
          cirkel(40, 29, 3.2, '#3fbf5a') + cirkel(50, 27, 3.2, '#3fbf5a') + cirkel(60, 29, 3.2, '#3fbf5a'),
    kruin: { x: 50, y: 46, b: 26, strik: 0 }, ogen: { y: 60, dx: 8, s: 0.36 }
  },

  // ---------- Papegaai ----------
  '🦜': {
    achter: `<path d="M38 34 Q34 14 44 8 Q46 22 50 34 Z" fill="#3a8dff"/><path d="M50 34 Q52 10 60 8 Q62 22 60 34 Z" fill="#ffd23f"/>`,
    hoofd: ellips(50, 58, 32, 31, '#e5384b') +
           cirkel(36, 52, 10, '#fff') + cirkel(64, 52, 10, '#fff') +
           cirkel(37, 53, 4.8, DONKER) + cirkel(63, 53, 4.8, DONKER) + cirkel(38.5, 51.5, 1.6, '#fff') + cirkel(64.5, 51.5, 1.6, '#fff') +
           `<path d="M39 60 Q50 52 61 60 Q64 78 50 84 Q38 76 39 60 Z" fill="#ffc22e"/>` +
           lijn('M42 72 Q50 76 58 72', '#c98a00', 1.8) + wang(26, 66) + wang(74, 66),
    voor: '', kruin: { x: 50, y: 30, b: 38 }, ogen: { y: 52, dx: 14, s: 0.5 }
  },

  // ---------- Zwaan ----------
  '🦢': {
    achter: '',
    hoofd: ellips(50, 60, 28, 29, '#ffffff', 'stroke="#dfe3f0" stroke-width="1.6"') +
           lijn('M50 32 Q46 22 54 18', '#dfe3f0', 3) +
           ellips(50, 72, 13, 8, '#ff9a2e') + cirkel(50, 65, 4.4, DONKER) + lijn('M38 72 Q50 78 62 72', '#d97a12', 1.6) +
           lijn('M30 52 Q34 56 38 54 M70 52 Q66 56 62 54', DONKER, 2) +
           oog(36, 55, 4.2) + oog(64, 55, 4.2) + wang(28, 66) + wang(72, 66),
    voor: '', kruin: { x: 50, y: 32, b: 34 }, ogen: { y: 55, dx: 14 }
  },

  // ---------- Haai ----------
  '🦈': {
    achter: `<path d="M42 36 Q48 2 70 6 Q56 16 58 36 Z" fill="#65809f"/>`,
    hoofd: ellips(50, 58, 34, 29, '#7d93ad') +
           ellips(50, 74, 26, 14, '#e8eef6') +
           lijn('M22 68 Q50 92 78 68', DONKER, 2.4) +
           driehoek(28, 71, 32, 79, 36, 74, '#fff') + driehoek(38, 76, 42, 84, 46, 78, '#fff') + driehoek(54, 78, 58, 84, 62, 76, '#fff') + driehoek(64, 74, 68, 79, 72, 71, '#fff') +
           lijn('M18 52 V60 M14 52 V60 M82 52 V60 M86 52 V60', '#5a7291', 1.8) +
           oog(36, 52, 4.2) + oog(64, 52, 4.2),
    voor: '', kruin: { x: 50, y: 30, b: 38 }, ogen: { y: 52, dx: 14 }
  },

  // ---------- Zeehond ----------
  '🦭': {
    achter: '',
    hoofd: ellips(50, 60, 33, 30, '#a9abbb') +
           cirkel(30, 66, 1.2, '#6a6c7c') + cirkel(34, 70, 1.2, '#6a6c7c') + cirkel(70, 66, 1.2, '#6a6c7c') + cirkel(66, 70, 1.2, '#6a6c7c') +
           ellips(50, 72, 17, 12, '#e8eaf2') + ellips(50, 66, 6, 4.4, DONKER) + glimlach(50, 73, 7) +
           lijn('M24 72 L36 72 M24 78 L36 76 M76 72 L64 72 M76 78 L64 76', '#8a8c9c', 1.4) +
           oog(36, 53, 5.4) + oog(64, 53, 5.4) + wang(28, 63, 4.5) + wang(72, 63, 4.5),
    voor: '', kruin: { x: 50, y: 31, b: 40 }, ogen: { y: 53, dx: 14 }
  },

  // ---------- IJsbeer ----------
  '🐻‍❄️': {
    achter: cirkel(20, 30, 12, '#f2f6fc', 'stroke="#d3ddec" stroke-width="1.4"') + cirkel(20, 30, 6.5, '#ffd3de') +
            cirkel(80, 30, 12, '#f2f6fc', 'stroke="#d3ddec" stroke-width="1.4"') + cirkel(80, 30, 6.5, '#ffd3de'),
    hoofd: ellips(50, 58, 35, 33, '#fbfdff', 'stroke="#d3ddec" stroke-width="1.6"') +
           ellips(50, 71, 15, 12, '#e8effa') + ellips(50, 65, 6, 4.5, DONKER) +
           lijn('M50 69 V73 M50 73 Q45 78 42 74 M50 73 Q55 78 58 74') +
           oog(37, 52, 4.2) + oog(63, 52, 4.2) + wang(27, 62) + wang(73, 62),
    voor: '', kruin: { x: 50, y: 28, b: 46 }, ogen: { y: 52, dx: 13 }
  },

  // ---------- Kalkoen ----------
  '🦃': {
    achter: (() => {
      let s = '';
      const kleuren = ['#c9783a', '#e5384b', '#f0b429', '#8a5a3a'];
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + 0.1 + (i / 8) * (Math.PI - 0.2);
        const x = 50 + Math.cos(a) * 36, y = 62 + Math.sin(a) * 40;
        s += ellips(x.toFixed(1), y.toFixed(1), 9, 16, kleuren[i % 4], `transform="rotate(${((a * 180) / Math.PI + 90).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"`);
      }
      return s;
    })(),
    hoofd: ellips(50, 64, 24, 26, '#8a5a3a') +
           ellips(50, 82, 7, 10, '#e5384b') +
           driehoek(45, 66, 55, 66, 50, 76, '#ffc22e') +
           oogW(41, 58, 4.4) + oogW(59, 58, 4.4) + wang(34, 68, 3.6) + wang(66, 68, 3.6),
    voor: '', kruin: { x: 50, y: 42, b: 30 }, ogen: { y: 58, dx: 9 }
  },

  // ---------- Gorilla ----------
  '🦍': {
    achter: cirkel(16, 58, 10, '#3f3f4d') + cirkel(84, 58, 10, '#3f3f4d'),
    hoofd: ellips(50, 58, 34, 34, '#4a4a58') +
           ellips(50, 32, 20, 11, '#3a3a46') +
           ellips(50, 66, 25, 22, '#7d7378') +
           ellips(50, 78, 14, 9, '#9a9095') + cirkel(45, 72, 2, DONKER) + cirkel(55, 72, 2, DONKER) +
           lijn('M40 82 Q50 86 60 82', DONKER, 2) +
           `<path d="M28 48 Q38 42 46 48 L46 52 Q38 48 28 52 Z M72 48 Q62 42 54 48 L54 52 Q62 48 72 52 Z" fill="#33333f"/>` +
           oogW(38, 55, 4.2) + oogW(62, 55, 4.2),
    voor: '', kruin: { x: 50, y: 28, b: 42 }, ogen: { y: 55, dx: 12 }
  },

  // ---------- Mammoet ----------
  '🦣': {
    achter: ellips(13, 52, 15, 25, '#7a4a2a') + ellips(87, 52, 15, 25, '#7a4a2a'),
    hoofd: ellips(50, 54, 29, 29, '#a9683c') +
           cirkel(36, 30, 10, '#8a5230') + cirkel(50, 26, 11, '#8a5230') + cirkel(64, 30, 10, '#8a5230') +
           `<path d="M41 62 Q38 80 43 91 Q50 97 57 91 Q62 80 59 62 Z" fill="#a9683c"/>` +
           lijn('M41.5 74 H58.5 M41.5 81 H58.5', '#7a4a2a', 1.6) +
           `<path d="M38 66 Q22 70 22 90 Q26 98 34 92" fill="none" stroke="#f3ead2" stroke-width="5" stroke-linecap="round"/>` +
           `<path d="M62 66 Q78 70 78 90 Q74 98 66 92" fill="none" stroke="#f3ead2" stroke-width="5" stroke-linecap="round"/>` +
           oog(38, 50, 4.2) + oog(62, 50, 4.2),
    voor: '', kruin: { x: 50, y: 24, b: 34 }, ogen: { y: 50, dx: 12 }
  },

  // ---------- Dinosaurus ----------
  '🦖': {
    achter: driehoek(34, 34, 40, 14, 46, 32, '#f39a2e') + driehoek(46, 30, 52, 8, 58, 30, '#f39a2e') + driehoek(56, 32, 64, 14, 68, 36, '#f39a2e'),
    hoofd: ellips(50, 58, 33, 29, '#5aa64f') +
           ellips(50, 74, 25, 15, '#78c266') + cirkel(42, 68, 2.4, '#2f6f2a') + cirkel(58, 68, 2.4, '#2f6f2a') +
           lijn('M28 82 Q50 90 72 82', '#2f6f2a', 2.4) +
           driehoek(34, 82, 38, 88, 41, 84, '#fff') + driehoek(46, 85, 50, 91, 53, 86, '#fff') + driehoek(60, 84, 63, 88, 67, 82, '#fff') +
           cirkel(30, 62, 2.2, '#3f8a3a') + cirkel(70, 62, 2.2, '#3f8a3a') +
           oog(36, 50, 4.6) + oog(64, 50, 4.6),
    voor: '', kruin: { x: 50, y: 32, b: 40 }, ogen: { y: 50, dx: 14 }
  },

  // ---------- Robot ----------
  '🤖': {
    achter: lijn('M50 32 V16', '#8a93a8', 3) + cirkel(50, 14, 5, '#e5384b') +
            `<rect x="10" y="48" width="9" height="20" rx="3" fill="#8a93a8"/><rect x="81" y="48" width="9" height="20" rx="3" fill="#8a93a8"/>`,
    hoofd: `<rect x="17" y="32" width="66" height="58" rx="14" fill="#b6c0d4" stroke="#8a93a8" stroke-width="2"/>` +
           `<rect x="26" y="42" width="48" height="24" rx="10" fill="#2b3350"/>` +
           cirkel(38, 54, 6, '#5ce1ff') + cirkel(62, 54, 6, '#5ce1ff') + cirkel(40, 52, 2, '#fff') + cirkel(64, 52, 2, '#fff') +
           `<rect x="34" y="74" width="32" height="9" rx="3" fill="#2b3350"/>` +
           lijn('M42 74 V83 M50 74 V83 M58 74 V83', '#b6c0d4', 1.6) +
           cirkel(24, 78, 2, '#8a93a8') + cirkel(76, 78, 2, '#8a93a8'),
    voor: '', kruin: { x: 50, y: 32, b: 40 }, ogen: { y: 54, dx: 12 }
  },

  // ---------- Spook ----------
  '👻': {
    achter: '',
    hoofd: `<path d="M18 92 L18 52 Q18 20 50 20 Q82 20 82 52 L82 92 L72 84 L62 94 L50 84 L38 94 L28 84 Z" fill="#f6f6ff" stroke="#d3d3ea" stroke-width="2" stroke-linejoin="round"/>` +
           ellips(38, 52, 5, 8, DONKER) + ellips(62, 52, 5, 8, DONKER) + cirkel(36.6, 49, 1.6, '#fff') + cirkel(60.6, 49, 1.6, '#fff') +
           ellips(50, 70, 6, 8, DONKER) + wang(27, 64, 5) + wang(73, 64, 5),
    voor: '', kruin: { x: 50, y: 24, b: 38 }, ogen: { y: 52, dx: 12 }
  },

  // ---------- Alien ----------
  '👽': {
    achter: '',
    hoofd: `<path d="M50 20 Q84 20 84 52 Q84 78 60 92 Q50 96 40 92 Q16 78 16 52 Q16 20 50 20 Z" fill="#8be36e" stroke="#5cbf5c" stroke-width="2"/>` +
           ellips(35, 54, 11, 15, DONKER, 'transform="rotate(20 35 54)"') + ellips(65, 54, 11, 15, DONKER, 'transform="rotate(-20 65 54)"') +
           cirkel(31, 49, 2.6, '#fff', 'opacity=".8"') + cirkel(61, 49, 2.6, '#fff', 'opacity=".8"') +
           cirkel(46, 74, 1.4, '#3a9a3f') + cirkel(54, 74, 1.4, '#3a9a3f') + glimlach(50, 80, 5),
    voor: '', kruin: { x: 50, y: 24, b: 38 }, ogen: { y: 54, dx: 15, s: 0.55 }
  },

  // ---------- Pompoen ----------
  '🎃': {
    achter: `<path d="M46 26 Q44 14 52 10 Q54 20 54 26 Z" fill="#4c8a2f"/>`,
    hoofd: ellips(50, 60, 40, 32, '#ff8a1f') + ellips(30, 60, 14, 31, '#ff9d3a') + ellips(70, 60, 14, 31, '#ff9d3a') +
           ellips(50, 60, 13, 31, '#f77b0a') +
           driehoek(32, 48, 44, 48, 38, 60, DONKER) + driehoek(56, 48, 68, 48, 62, 60, DONKER) +
           `<path d="M30 70 L38 76 L44 70 L50 78 L56 70 L62 76 L70 70 L66 84 Q50 92 34 84 Z" fill="${DONKER}"/>` +
           driehoek(38, 76, 44, 76, 41, 84, '#ffd23f') + driehoek(56, 76, 62, 76, 59, 84, '#ffd23f'),
    voor: '', kruin: { x: 50, y: 30, b: 40 }, ogen: { y: 52, dx: 13 }
  }
});

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


// ----- EXTRA accessoires (hoeden, brillen, hartjes en meer) -----
const brilPaar = (lens, dx, s, brug = '#3a3a4d') =>
  `<g transform="translate(${-dx} 0) scale(${s})">${lens}</g><g transform="translate(${dx} 0) scale(${s})">${lens}</g>` +
  `<path d="M${-dx + 19 * s} ${-3 * s} Q0 ${-9 * s} ${dx - 19 * s} ${-3 * s}" stroke="${brug}" stroke-width="${4 * s}" fill="none"/>` +
  `<path d="M${-dx - 19 * s} ${-4 * s} L${-dx - 30 * s} ${-8 * s} M${dx + 19 * s} ${-4 * s} L${dx + 30 * s} ${-8 * s}" stroke="${brug}" stroke-width="${4 * s}" stroke-linecap="round"/>`;

Object.assign(ACCESSOIRES, {
  // ----- Hoeden -----
  '🧙': { plek: 'boven', naam: 'tovenaarshoed', tekening:
    `<ellipse cx="0" cy="-3" rx="56" ry="9" fill="#5a3cc0"/>` +
    `<path d="M-34 -4 Q-22 -60 2 -96 Q10 -60 34 -4 Q0 6 -34 -4 Z" fill="#6a4bd6"/>` +
    `<path d="M2 -96 Q20 -104 26 -86 Q12 -92 2 -96 Z" fill="#6a4bd6"/>` +
    `<path d="M-32 -12 Q0 -2 32 -12 L33 -22 Q0 -12 -33 -22 Z" fill="#f7c93b"/>` +
    glinster(-8, -46, 6) + glinster(10, -62, 4.4, '#fff') + glinster(-2, -28, 3.4, '#fff') },
  '👷': { plek: 'boven', naam: 'bouwhelm', tekening:
    `<path d="M-44 0 Q-46 -52 0 -52 Q46 -52 44 0 Z" fill="#ffd23f"/>` +
    `<rect x="-8" y="-52" width="16" height="50" rx="4" fill="#e5b400"/>` +
    `<path d="M-54 0 H54 Q54 -9 44 -9 H-44 Q-54 -9 -54 0 Z" fill="#e5b400"/>` +
    `<path d="M-30 -30 Q-28 -44 -14 -46" stroke="#fff" opacity=".45" stroke-width="4" fill="none" stroke-linecap="round"/>` },
  '🥳': { plek: 'boven', naam: 'feesthoedje', tekening:
    `<path d="M-28 0 L0 -84 L28 0 Q0 8 -28 0 Z" fill="#ff5c9a"/>` +
    `<path d="M-19 -26 L19 -26 M-10 -52 L10 -52" stroke="#ffd23f" stroke-width="6" stroke-linecap="round"/>` +
    cirkel(-12, -14, 3, '#5ac8fa') + cirkel(12, -12, 3, '#5ac8fa') + cirkel(0, -38, 3, '#5ac8fa') +
    cirkel(0, -86, 9, '#ffd23f') },
  '😺': { plek: 'boven', naam: 'kattenoren', tekening:
    `<path d="M-46 4 Q0 -22 46 4" stroke="#3a3a4d" stroke-width="6" fill="none" stroke-linecap="round"/>` +
    `<path d="M-46 -4 L-40 -50 L-14 -14 Z" fill="#3a3a4d" stroke="#3a3a4d" stroke-width="3" stroke-linejoin="round"/><path d="M-38 -14 L-36 -38 L-24 -18 Z" fill="#ff9db3"/>` +
    `<path d="M46 -4 L40 -50 L14 -14 Z" fill="#3a3a4d" stroke="#3a3a4d" stroke-width="3" stroke-linejoin="round"/><path d="M38 -14 L36 -38 L24 -18 Z" fill="#ff9db3"/>` },
  '😈': { plek: 'boven', naam: 'duivelshoorntjes', tekening:
    `<path d="M-36 -2 Q-50 -30 -30 -54 Q-26 -30 -12 -12 Z" fill="#e5384b" stroke="#a81f30" stroke-width="2" stroke-linejoin="round"/>` +
    `<path d="M36 -2 Q50 -30 30 -54 Q26 -30 12 -12 Z" fill="#e5384b" stroke="#a81f30" stroke-width="2" stroke-linejoin="round"/>` },
  '👼': { plek: 'boven', naam: 'engelenkrans', tekening:
    `<ellipse cx="0" cy="-44" rx="32" ry="10" fill="none" stroke="#fff6b0" stroke-width="12" opacity=".5"/>` +
    `<ellipse cx="0" cy="-44" rx="32" ry="10" fill="none" stroke="#ffd23f" stroke-width="6"/>` },
  '🍄': { plek: 'boven', naam: 'paddenstoelhoed', tekening:
    `<path d="M-54 -2 Q-52 -68 0 -68 Q52 -68 54 -2 Q0 10 -54 -2 Z" fill="#e5384b"/>` +
    cirkel(-28, -30, 8, '#fff') + cirkel(6, -48, 9, '#fff') + cirkel(30, -26, 7, '#fff') + cirkel(-8, -18, 5, '#fff') + cirkel(38, -46, 4.4, '#fff') },
  '🍦': { plek: 'boven', naam: 'ijsje', tekening:
    `<path d="M-28 0 L-22 -20 H22 L28 0 Z" fill="#e0a95c"/>` +
    cirkel(0, -34, 26, '#ff9bc4') + cirkel(0, -58, 19, '#fff2b8') + cirkel(0, -78, 6, '#e5384b') +
    lijn('M-16 -34 Q0 -26 16 -34', '#fff', 3) },
  '👨‍🍳': { plek: 'boven', naam: 'koksmuts', tekening:
    `<rect x="-36" y="-20" width="72" height="20" rx="4" fill="#fff" stroke="#dcdcea" stroke-width="2"/>` +
    cirkel(-24, -46, 20, '#fff', 'stroke="#dcdcea" stroke-width="2"') + cirkel(24, -46, 20, '#fff', 'stroke="#dcdcea" stroke-width="2"') + cirkel(0, -60, 24, '#fff', 'stroke="#dcdcea" stroke-width="2"') +
    `<rect x="-36" y="-20" width="72" height="20" rx="4" fill="#fff" stroke="#dcdcea" stroke-width="2"/>` },
  '☠️': { plek: 'boven', naam: 'piratenhoed', tekening:
    `<path d="M-62 -4 Q-42 -64 0 -60 Q42 -64 62 -4 Q0 12 -62 -4 Z" fill="#26263a" stroke="#f7c93b" stroke-width="2.4"/>` +
    cirkel(0, -32, 10, '#fff') + cirkel(-3.6, -33, 2.4, '#26263a') + cirkel(3.6, -33, 2.4, '#26263a') + `<rect x="-4" y="-25" width="8" height="5" fill="#26263a"/>` +
    lijn('M-18 -20 L18 -44 M18 -20 L-18 -44', '#fff', 3) },
  '🚒': { plek: 'boven', naam: 'brandweerhelm', tekening:
    `<path d="M-46 0 Q-48 -56 0 -56 Q48 -56 46 0 Z" fill="#e5384b"/>` +
    `<path d="M-6 -56 Q0 -66 6 -56 L4 -4 H-4 Z" fill="#c92f42"/>` +
    `<path d="M-56 2 H56 Q56 -8 46 -8 H-46 Q-56 -8 -56 2 Z" fill="#c92f42"/>` +
    cirkel(0, -30, 11, '#ffd23f', 'stroke="#c98a00" stroke-width="2"') + lijn('M-5 -30 H5 M0 -35 V-25', '#c92f42', 2.4) },
  '🎧': { plek: 'boven', naam: 'koptelefoon', tekening:
    `<path d="M-50 14 Q-54 -58 0 -58 Q54 -58 50 14" stroke="#3a3a4d" stroke-width="8" fill="none" stroke-linecap="round"/>` +
    `<rect x="-62" y="-2" width="18" height="34" rx="9" fill="#ff5c9a" stroke="#c92a6d" stroke-width="2.4"/>` +
    `<rect x="44" y="-2" width="18" height="34" rx="9" fill="#ff5c9a" stroke="#c92a6d" stroke-width="2.4"/>` },
  '👽': { plek: 'boven', naam: 'antennes', tekening:
    lijn('M-18 -2 Q-26 -40 -34 -62', '#5cbf5c', 4.4) + cirkel(-35, -64, 9, '#8be36e', 'stroke="#3a9a3f" stroke-width="2"') +
    lijn('M18 -2 Q26 -40 34 -62', '#5cbf5c', 4.4) + cirkel(35, -64, 9, '#8be36e', 'stroke="#3a9a3f" stroke-width="2"') },

  // ----- Brillen -----
  '🥽': { plek: 'gezicht', naam: 'duikbril', bril: (dx, s) =>
    `<path d="M${-dx - 22 * s} 0 L${-dx - 38 * s} ${-2 * s} M${dx + 22 * s} 0 L${dx + 38 * s} ${-2 * s}" stroke="#e5384b" stroke-width="${6 * s}" stroke-linecap="round"/>` +
    `<rect x="${-dx - 23 * s}" y="${-17 * s}" width="${2 * dx + 46 * s}" height="${34 * s}" rx="${15 * s}" fill="#8fd3ff" fill-opacity=".5" stroke="#e5384b" stroke-width="${5 * s}"/>` +
    `<path d="M${-dx - 12 * s} ${-8 * s} H${-dx + 2 * s}" stroke="#fff" opacity=".7" stroke-width="${3.4 * s}" stroke-linecap="round"/>` },
  '🥸': { plek: 'gezicht', naam: 'grappige bril', bril: (dx, s, ny = dx * 1.05, nr = 4.6) =>
    brilPaar(`<circle cx="0" cy="0" r="19" fill="#fff" fill-opacity=".35" stroke="#26263a" stroke-width="5"/>`, dx, s, '#26263a') +
    `<ellipse cx="0" cy="${ny - nr * 0.1}" rx="${nr * 0.95}" ry="${nr * 0.8}" fill="#f2b28a" stroke="#c98a62" stroke-width="${nr * 0.12}"/>` +
    `<path d="M${-nr * 2.1} ${ny + nr * 0.9} Q${-nr * 1.0} ${ny + nr * 0.1} 0 ${ny + nr * 0.55} Q${nr * 1.0} ${ny + nr * 0.1} ${nr * 2.1} ${ny + nr * 0.9} Q${nr * 1.1} ${ny + nr * 1.9} 0 ${ny + nr * 1.35} Q${-nr * 1.1} ${ny + nr * 1.9} ${-nr * 2.1} ${ny + nr * 0.9} Z" fill="#5a3a22"/>` },
  '🧐': { plek: 'gezicht', naam: 'monocle', bril: (dx, s) =>
    `<circle cx="${dx}" cy="0" r="${21 * s}" fill="#bfe6ff" fill-opacity=".3" stroke="#d99a06" stroke-width="${4.4 * s}"/>` +
    `<path d="M${dx + 6 * s} ${20 * s} Q${dx + 22 * s} ${44 * s} ${dx + 8 * s} ${66 * s}" stroke="#d99a06" stroke-width="${1.8 * s}" fill="none"/>` },
  '🤡': { plek: 'gezicht', naam: 'clownsneus', bril: (dx, s, ny = dx * 1.05, nr = 4.6) =>
    `<circle cx="0" cy="${ny}" r="${nr * 1.25}" fill="#e5384b" stroke="#a81f30" stroke-width="${1.4 * s * 1.4}"/>` +
    `<circle cx="${-nr * 0.4}" cy="${ny - nr * 0.45}" r="${nr * 0.35}" fill="#fff" opacity=".6"/>` },
  '😍': { plek: 'gezicht', naam: 'hartjesbril', bril: (dx, s) =>
    brilPaar(`<path d="M0 17 C-26 0 -22 -18 -9 -18 C-3 -18 0 -12 0 -12 C0 -12 3 -18 9 -18 C22 -18 26 0 0 17 Z" fill="#ff5c9a" stroke="#c92a6d" stroke-width="3.4" stroke-linejoin="round"/><ellipse cx="-9" cy="-8" rx="4" ry="2.4" fill="#fff" opacity=".6"/>`, dx, s, '#c92a6d') },
  '🤩': { plek: 'gezicht', naam: 'sterrenbril', bril: (dx, s) =>
    brilPaar(`<path d="M0 -22 L6 -7 L22 -6 L10 4 L14 20 L0 11 L-14 20 L-10 4 L-22 -6 L-6 -7 Z" fill="#ffd23f" stroke="#e5a400" stroke-width="3.4" stroke-linejoin="round"/>`, dx, s, '#e5a400') },
  '🏴': { plek: 'gezicht', naam: 'oogklep', bril: (dx, s) =>
    `<path d="M${-dx * 1.7} ${-dx * 0.9} L${dx - 10 * s} ${-6 * s} M${dx + 14 * s} ${6 * s} L${dx * 1.9} ${dx * 0.5}" stroke="#1f1f2e" stroke-width="${3 * s}" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="${dx}" cy="0" rx="${19 * s}" ry="${16 * s}" fill="#1f1f2e" stroke="#4a4a66" stroke-width="${1.6 * s}"/>` },
  '🎭': { plek: 'gezicht', naam: 'maskertje', bril: (dx, s) =>
    `<path d="M${-dx - 30 * s} ${-9 * s} Q0 ${-24 * s} ${dx + 30 * s} ${-9 * s} L${dx + 28 * s} ${13 * s} Q${dx + 10 * s} ${22 * s} ${dx - 4 * s} ${11 * s} Q0 ${6 * s} ${-dx + 4 * s} ${11 * s} Q${-dx - 10 * s} ${22 * s} ${-dx - 28 * s} ${13 * s} Z" fill="#1f1f2e"/>` +
    cirkel(-dx, 0, 9 * s, '#fff') + cirkel(dx, 0, 9 * s, '#fff') + cirkel(-dx, 0, 4.6 * s, DONKER) + cirkel(dx, 0, 4.6 * s, DONKER) },

  // ----- Hartjes en meer (hoek) -----
  '🎈': { plek: 'hoek', naam: 'ballon', tekening:
    lijn('M12 18 Q9 21 13 24', '#8a8aa0', 1.2) + ellips(12, 9, 7.5, 9, '#e5384b') + `<path d="M10.5 18 H13.5 L12 20.4 Z" fill="#c92f42"/>` + ellips(9, 6, 2, 3, '#fff', 'opacity=".5"') },
  '🍭': { plek: 'hoek', naam: 'lolly', tekening:
    `<rect x="11" y="15" width="2.2" height="9" rx="1" fill="#fff" stroke="#d6d6e6" stroke-width=".6"/>` + cirkel(12, 9, 8, '#ff7ab8') +
    lijn('M12 9 m-1 0 a1 1 0 1 1 1 1 a3 3 0 1 1 -3 -3 a5 5 0 1 1 5 5', '#fff', 1.4) },
  '🌈': { plek: 'hoek', naam: 'regenboog', tekening:
    lijn('M1.5 21 A10.5 10.5 0 0 1 22.5 21', '#e5384b', 2.6) + lijn('M4 21 A8 8 0 0 1 20 21', '#ffa62b', 2.6) +
    lijn('M6.5 21 A5.5 5.5 0 0 1 17.5 21', '#3fbf5a', 2.6) + lijn('M9 21 A3 3 0 0 1 15 21', '#3a8dff', 2.6) },
  '☀️': { plek: 'hoek', naam: 'zonnetje', tekening: (() => {
    let s = '';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      s += lijn(`M${(12 + Math.cos(a) * 8.5).toFixed(1)} ${(12 + Math.sin(a) * 8.5).toFixed(1)} L${(12 + Math.cos(a) * 11.5).toFixed(1)} ${(12 + Math.sin(a) * 11.5).toFixed(1)}`, '#ffb31a', 2);
    }
    return s + cirkel(12, 12, 6.2, '#ffc928') + cirkel(10, 10, 1.6, '#fff', 'opacity=".5"');
  })() },
  '🌙': { plek: 'hoek', naam: 'maantje', tekening:
    `<path d="M15 2 A10 10 0 1 0 22 16 A8 8 0 1 1 15 2 Z" fill="#ffd95a" stroke="#e5b400" stroke-width="1" stroke-linejoin="round"/>` + glinster(20, 6, 2.4, '#fff') },
  '⚡': { plek: 'hoek', naam: 'bliksem', tekening:
    `<path d="M14 1 L4 13 H11 L9 23 L20 9 H13 Z" fill="#ffd23f" stroke="#e5a400" stroke-width="1.3" stroke-linejoin="round"/>` },
  '🎵': { plek: 'hoek', naam: 'muzieknoot', tekening:
    ellips(7, 19, 4.6, 3.6, '#e9e9ff', 'transform="rotate(-20 7 19)"') + `<path d="M11 18.6 V4 L20 6.4 V9.6 L11 7.4" fill="#e9e9ff" stroke="#e9e9ff" stroke-width="1.6" stroke-linejoin="round"/>` },
  '🍓': { plek: 'hoek', naam: 'aardbei', tekening:
    `<path d="M12 22.5 C3 17 2.5 8.5 12 8 C21.5 8.5 21 17 12 22.5 Z" fill="#e5384b"/>` +
    `<path d="M6 8 L12 4 L18 8 L14 9 L12 7 L10 9 Z" fill="#3fbf5a"/>` +
    cirkel(9, 13, .9, '#ffe9a8') + cirkel(15, 13, .9, '#ffe9a8') + cirkel(12, 16, .9, '#ffe9a8') + cirkel(9.5, 18, .9, '#ffe9a8') + cirkel(14.5, 18, .9, '#ffe9a8') },
  '🦋': { plek: 'hoek', naam: 'vlindertje', tekening:
    ellips(7, 8, 6, 6.5, '#b07cf5', 'transform="rotate(-20 7 8)"') + ellips(17, 8, 6, 6.5, '#b07cf5', 'transform="rotate(20 17 8)"') +
    ellips(8, 16, 4.4, 5, '#f79ad0') + ellips(16, 16, 4.4, 5, '#f79ad0') + `<rect x="11" y="4" width="2" height="16" rx="1" fill="#4a3222"/>` +
    lijn('M12 5 Q10 1 8 1 M12 5 Q14 1 16 1', '#4a3222', 1) },
  '❄️': { plek: 'hoek', naam: 'sneeuwvlok', tekening:
    lijn('M12 1.5 V22.5 M2.9 6.8 L21.1 17.2 M2.9 17.2 L21.1 6.8', '#8fd3ff', 2) +
    lijn('M9 4 L12 7 L15 4 M9 20 L12 17 L15 20', '#8fd3ff', 1.6) },
  '🎁': { plek: 'hoek', naam: 'cadeautje', tekening:
    `<rect x="3" y="10" width="18" height="12" rx="1.6" fill="#e5384b"/><rect x="2" y="7" width="20" height="5" rx="1.4" fill="#ff5a6c"/>` +
    `<rect x="10.6" y="7" width="2.8" height="15" fill="#ffd23f"/>` +
    `<path d="M12 7 C7 1 3 5 7 7 Z M12 7 C17 1 21 5 17 7 Z" fill="#ffd23f"/>` },
  '🏆': { plek: 'hoek', naam: 'beker', tekening:
    `<path d="M6 2 H18 V9 A6 6 0 0 1 6 9 Z" fill="#ffd23f" stroke="#e5a400" stroke-width="1.2" stroke-linejoin="round"/>` +
    lijn('M6 4 Q1 4 2 8 Q3 11 7 11 M18 4 Q23 4 22 8 Q21 11 17 11', '#e5a400', 1.6) +
    `<rect x="10.6" y="14.5" width="2.8" height="4" fill="#e5a400"/><rect x="7" y="18.5" width="10" height="3.6" rx="1.2" fill="#e5a400"/>` },
  '🍩': { plek: 'hoek', naam: 'donut', tekening:
    `<path fill-rule="evenodd" d="M12 2 A10 10 0 1 1 11.99 2 Z M12 8.6 A3.4 3.4 0 1 0 12.01 8.6 Z" fill="#e0a95c"/>` +
    `<path fill-rule="evenodd" d="M12 3.6 A8.4 8.4 0 1 1 11.99 3.6 Z M12 8.6 A3.4 3.4 0 1 0 12.01 8.6 Z" fill="#ff9bc4"/>` +
    lijn('M6 8 L8 9 M16 6 L17 8 M18 14 L16 15 M8 18 L9 16 M13 19 L14 17', '#fff', 1.3) },
  '🎂': { plek: 'hoek', naam: 'taart', tekening:
    `<rect x="3" y="14" width="18" height="8" rx="1.6" fill="#f4b7d0"/><rect x="5" y="9" width="14" height="6" rx="1.4" fill="#fff2b8"/>` +
    `<path d="M3 15 Q6 18 9 15 Q12 18 15 15 Q18 18 21 15" fill="none" stroke="#fff" stroke-width="1.6"/>` +
    `<rect x="11.2" y="3.5" width="1.6" height="6" fill="#5ac8fa"/><path d="M12 0.6 Q14 3 12 4.4 Q10 3 12 0.6 Z" fill="#ffa62b"/>` },
  '⚽': { plek: 'hoek', naam: 'voetbal', tekening:
    cirkel(12, 12, 10, '#fff', 'stroke="#3a3a4d" stroke-width="1.4"') +
    `<path d="M12 7 L16 10 L14.6 14.6 H9.4 L8 10 Z" fill="#3a3a4d"/>` +
    lijn('M12 7 V2.4 M16 10 L21 8.6 M14.6 14.6 L17.6 19.4 M9.4 14.6 L6.4 19.4 M8 10 L3 8.6', '#3a3a4d', 1.3) },
  '🧸': { plek: 'hoek', naam: 'knuffelbeertje', tekening:
    cirkel(6, 6, 3.6, '#a8703a') + cirkel(18, 6, 3.6, '#a8703a') + cirkel(12, 12, 8.6, '#c48a50') +
    ellips(12, 15, 4.4, 3.4, '#f0d2a8') + ellips(12, 13.6, 1.6, 1.1, DONKER) + cirkel(8.6, 10.4, 1.1, DONKER) + cirkel(15.4, 10.4, 1.1, DONKER) }
});

// Zo staan ze in het kiesmenu (tab "Accessoires").
const ACCESSOIRE_GROEPEN = [
  { plek: 'boven',   titel: 'Hoeden',          items: ['🎩', '👑', '🎓', '🧢', '🤠', '👒', '🎅', '🎀',
                                                       '🧙', '👷', '🥳', '😺', '😈', '👼', '🍄', '🍦', '👨‍🍳', '☠️', '🚒', '🎧', '👽'] },
  { plek: 'gezicht', titel: 'Brillen',         items: ['🕶️', '👓', '🥽', '🥸', '🧐', '🤡', '😍', '🤩', '🏴', '🎭'] },
  { plek: 'hoek',    titel: 'Hartjes en meer', items: ['❤️', '💖', '💙', '💚', '💛', '💜', '⭐', '✨', '🌸', '🔥', '💎', '🍀',
                                                       '🎈', '🍭', '🌈', '☀️', '🌙', '⚡', '🎵', '🍓', '🦋', '❄️', '🎁', '🏆', '🍩', '🎂', '⚽', '🧸'] }
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


// ---------------------------------------------------------------------------
// Aangepaste poppetjes/accessoires die sitebeheer kan maken uit een emoji.
// Deze worden vanuit Firebase geregistreerd door app.js. Ze gebruiken een
// eenvoudige, apparaat-onafhankelijke SVG in plaats van het emoji-lettertype
// rechtstreeks in de pagina.
// ---------------------------------------------------------------------------
const AANGEPASTE_POPPETJES = {};
const AANGEPASTE_ACCESSOIRES = {};

function maakEmojiTekst(emoji, x, y, grootte = 52) {
  const veilig = String(emoji || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="${grootte}" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${veilig}</text>`;
}

function registreerAangepastPoppetje(id, data) {
  const sleutel = String(id);
  AANGEPASTE_POPPETJES[sleutel] = Object.assign({}, data, { id: sleutel });
  if (DIEREN.indexOf(sleutel) === -1) DIEREN.push(sleutel);
}

function registreerAangepastAccessoire(id, data) {
  const sleutel = String(id);
  const plek = data.plek || 'hoek';
  AANGEPASTE_ACCESSOIRES[sleutel] = Object.assign({}, data, { id: sleutel, plek: plek });
  ACCESSOIRES[sleutel] = Object.assign({}, ACCESSOIRES[sleutel] || {}, {
    plek: plek,
    naam: data.naam || 'Aangepast accessoire',
    customEmoji: data.emoji || '✨',
    customKleur: data.kleur || '#f0c04d'
  });
  let groep = ACCESSOIRE_GROEPEN.find(g => g.plek === plek);
  if (!groep) {
    groep = { plek: plek, titel: plek === 'boven' ? 'Hoeden' : plek === 'gezicht' ? 'Brillen' : 'Hartjes en meer', items: [] };
    ACCESSOIRE_GROEPEN.push(groep);
  }
  if (groep.items.indexOf(sleutel) === -1) groep.items.push(sleutel);
}

function verwijderAangepastPoppetjeUitCatalogus(id) {
  const i = DIEREN.indexOf(id);
  if (i !== -1) DIEREN.splice(i, 1);
  delete AANGEPASTE_POPPETJES[id];
}

function verwijderAangepastAccessoireUitCatalogus(id) {
  delete ACCESSOIRES[id];
  delete AANGEPASTE_ACCESSOIRES[id];
  ACCESSOIRE_GROEPEN.forEach(g => {
    const i = g.items.indexOf(id);
    if (i !== -1) g.items.splice(i, 1);
  });
}

function tekenAangepastPoppetje(data) {
  const kleur = data.kleur || '#8b93a3';
  const emoji = data.emoji || '🙂';
  // Ronde kop met het gekozen plaatje op het voorhoofd. De hoed zit er precies bovenop
  // (kruin), onder de hoed blijft het plaatje vrij, en de bril zit op de ogen (ogen).
  return {
    achter: `<ellipse cx="50" cy="58" rx="36" ry="35" fill="${kleur}" opacity=".96"/>`,
    hoofd: `<ellipse cx="50" cy="60" rx="32" ry="31" fill="${kleur}"/>` +
      maakEmojiTekst(emoji, 50, 44, 22) +
      `<ellipse cx="39" cy="63" rx="4" ry="5" fill="#2b2140"/><ellipse cx="61" cy="63" rx="4" ry="5" fill="#2b2140"/>` +
      `<circle cx="38" cy="61" r="1.3" fill="#fff"/><circle cx="60" cy="61" r="1.3" fill="#fff"/>` +
      `<circle cx="29" cy="72" r="4.2" fill="#ff8fa3" opacity=".4"/><circle cx="71" cy="72" r="4.2" fill="#ff8fa3" opacity=".4"/>` +
      `<path d="M43 78 Q50 84 57 78" fill="none" stroke="#2b2140" stroke-width="2.5" stroke-linecap="round"/>`,
    voor: '',
    kruin: { x: 50, y: 29, b: 46 },
    ogen: { y: 63, dx: 11 }
  };
}

function tekenAangepastAccessoire(id, data) {
  const emoji = data.emoji || '✨';
  const kleur = data.kleur || '#f0c04d';
  const plek = data.plek || 'hoek';
  const naam = data.naam || 'Aangepast accessoire';
  return Object.assign({}, ACCESSOIRES[id], {
    plek, naam, customEmoji: emoji, customKleur: kleur
  });
}


// ============================================================================
// PASVORM — hoeden, brillen en meer passen automatisch op ELK dier
//
// Per dier staat in KOP_PROFIEL de echte vorm van de kop (hoe hoog de bovenkant
// van het hoofd is op elke plek, en hoe breed het hoofd is op elke hoogte).
// Daarmee wordt elke hoed uitgerekend: breedte, hoogte, schuinte, en of hij
// precies op het hoofd rust, zonder de ogen te bedekken. Koptelefoon, kattenoren,
// hoorntjes, strik en antennes lopen mee met de bolling van het hoofd.
// De bril staat precies op de ogen; de pootjes van de bril eindigen bij de rand
// van het hoofd. Heb je een nieuw dier getekend? Zet het dan in KOP_PROFIEL
// (of laat het weg: dan wordt kruin/ogen gebruikt, zoals vroeger).
// ============================================================================

// Gemeten vorm van elke kop (automatisch gemaakt uit de tekeningen).
const KOP_PROFIEL = {
  '🐶': {t:[null,null,null,null,null,null,null,null,49.8,44.5,40.8,55.8,46.8,42.5,39.5,36.8,34.8,33,31.5,27,26.3,25.8,25.5,25.2,25,25,25,25.2,25.5,25.8,26.3,27,31.7,33.2,35,37.2,39.7,42.8,47.3,38.3,41.2,44.8,50.5,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,41,35.2,31.3,28.3,25.8,23.8,22.2,20.7,19.3,18.3,17.3,16.7,16,15.5,15.3,15,15,15,15.3,15.7,16,16.7,17.5,18.3,19.5,20.7,22.2,24,26.2,28.5,31.7,35.7,41.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,58.8,64.7,68.5,71.5,74,76,77.7,79.2,80.5,81.5,82.5,83.2,83.8,84.3,84.5,84.8,84.8,84.8,84.5,84.2,83.8,83.2,82.3,81.5,80.3,79.2,77.7,75.8,73.7,71.2,68.2,64.2,58,null,null,null,null,null]},
  '🐱': {t:[null,null,null,null,null,null,null,null,52.3,47.3,44,58,49.5,45.5,42.5,40.2,38.2,36.5,35.2,30.8,30.3,29.8,29.5,29.2,29,28.5,29,29.2,29.5,29.8,30.3,30.8,31.7,36.7,38.3,40.3,42.8,45.8,49.8,41.5,44.2,47.7,53,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,40.8,34.8,30.8,27.7,25.2,23.2,21.5,20,18.7,17.7,16.8,16.2,15.7,15.3,15,15,15.2,15.3,15.7,16.2,16.8,17.8,18.8,20,21.7,23.3,25.5,28,31,35.2,41.7,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,59,65,69,72.2,74.7,76.7,78.3,79.8,81.2,82.2,83,83.7,84.2,84.5,84.8,84.8,84.7,84.5,84.2,83.7,82.8,82,81,79.8,78.2,76.5,74.3,71.8,68.8,64.7,58.2,null,null,null,null,null]},
  '🐭': {t:[null,null,null,null,null,null,null,null,null,55.8,47,42.8,39.8,50,44.7,41.3,38.5,36.3,34.5,33,28.5,28,27.5,27.3,27,27,27,27.3,27.5,28,28.5,33.2,34.7,36.5,38.8,41.5,45.2,50.7,40,43.2,47.5,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,41.5,36.2,32.5,29.7,27.3,25.5,23.8,22.5,21.5,20.5,19.7,19,18.7,18.3,18,18,18,18.3,18.7,19.2,19.8,20.5,21.5,22.7,24,25.7,27.5,29.8,32.7,36.5,42.3,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,58.3,63.7,67.3,70.2,72.5,74.3,76,77.3,78.3,79.3,80.2,80.8,81.2,81.5,81.8,81.8,81.7,81.5,81.2,80.7,80,79.3,78.3,77.2,75.8,74.2,72.3,70,67.2,63.3,57.5,null,null,null,null,null,null]},
  '🐹': {t:[null,null,null,null,null,null,58,49.8,46,43.2,52.7,47.8,44.5,42,39.8,38.2,36.7,35.3,31.2,30.5,30,29.7,29.3,29.2,29,29,29,29.2,29.3,29.7,30.2,30.7,31.2,32,36.7,38.3,40,42.2,44.8,48.2,53.3,43.5,46.3,50.3,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,40,33.5,29.2,25.8,23.2,20.8,19,17.3,16,14.8,14,13.3,12.7,12.3,12,12,12.2,12.3,12.7,13.3,14,15,16.2,17.5,19.2,21,23.3,26,29.5,33.8,41,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,59.8,66.3,70.7,74,76.7,79,80.8,82.5,83.8,84.8,85.8,86.5,87.2,87.5,87.7,87.8,87.7,87.5,87.2,86.5,85.8,84.8,83.7,82.3,80.7,78.8,76.5,73.7,70.3,66,58.8,null,null,null,null,null]},
  '🐰': {t:[null,null,null,null,null,null,null,null,null,61,52.3,48.3,45.5,55.3,50.2,46.8,44.2,42,40.3,38.8,34.5,34,33.5,33.2,33,33,33.2,33.3,33.5,34,34.5,38.8,40.5,42.2,44.3,47,50.5,55.8,45.7,48.7,52.8,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,41.5,35.8,32.2,29.3,27,25.2,23.7,22.3,21.2,20.2,19.5,18.8,18.5,18.2,18,18,18.2,18.5,19,19.5,20.3,21.2,22.3,23.7,25.3,27.2,29.5,32.5,36.2,42.2,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,58.3,63.8,67.7,70.5,72.8,74.7,76.2,77.5,78.7,79.7,80.3,81,81.3,81.7,81.8,81.8,81.7,81.3,80.8,80.3,79.5,78.7,77.5,76.2,74.5,72.7,70.3,67.3,63.7,57.7,null,null,null,null]},
  '🦊': {t:[null,null,null,null,null,null,null,null,58.2,50,46.2,43.5,52.8,48,44.7,42.3,40.3,38.5,37.2,32.8,32.3,31.8,31.5,31.2,31,31,31,31.2,31.5,31.8,32.3,32.8,37.3,38.7,40.5,42.5,45,48.3,53.3,43.7,46.5,50.5,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,40.7,34.8,30.8,27.7,25.3,23.3,21.5,20.2,19,18,17.3,16.7,16.3,16.2,16,16,16.3,16.8,17.3,18.2,19.2,20.3,21.7,23.5,25.5,28,31,35.2,39.5,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,59.2,65,69,72.2,74.5,76.5,78.3,79.7,80.8,81.8,82.5,83.2,83.5,83.7,83.8,83.8,83.5,83,82.5,81.7,80.7,79.5,78.2,76.3,74.3,71.8,68.8,64.7,60.3,null,null,null,null,null,null]},
  '🐻': {t:[null,null,null,null,null,null,null,null,49.8,44.5,40.8,55.8,46.8,42.5,39.5,36.8,34.8,33,31.5,27,26.3,25.8,25.5,25.2,25,25,25,25.2,25.5,25.8,26.3,27,31.7,33.2,35,37.2,39.7,42.8,47.3,38.3,41.2,44.8,50.5,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,41,35.2,31.3,28.3,25.8,23.8,22.2,20.7,19.3,18.3,17.3,16.7,16,15.5,15.3,15,15,15,15.3,15.7,16,16.7,17.5,18.3,19.5,20.7,22.2,24,26.2,28.5,31.7,35.7,41.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,58.8,64.7,68.5,71.5,74,76,77.7,79.2,80.5,81.5,82.5,83.2,83.8,84.3,84.5,84.8,84.8,84.8,84.5,84.2,83.8,83.2,82.3,81.5,80.3,79.2,77.7,75.8,73.7,71.2,68.2,64.2,58,null,null,null,null,null]},
  '🐼': {t:[null,null,null,null,null,null,null,50.8,45,41.3,38.3,47.5,43,39.8,37.2,35,33.2,31.7,26.8,26.2,25.5,25,24.7,24.5,24.3,24.3,24.3,24.5,24.7,25.2,25.5,26.2,26.8,31.7,33.3,35.2,37.3,40,43.3,48,38.7,41.5,45.3,51.5,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,38.2,33,29.3,26.5,24.2,22,20.3,18.8,17.7,16.5,15.7,14.8,14.3,13.8,13.5,13.3,13.3,13.3,13.5,13.8,14.3,15,15.7,16.7,17.7,19,20.5,22.2,24.3,26.7,29.7,33.3,38.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,61.7,66.8,70.5,73.3,75.7,77.8,79.5,81,82.2,83.3,84.2,85,85.5,86,86.3,86.5,86.5,86.5,86.3,86,85.5,84.8,84.2,83.2,82.2,80.8,79.3,77.7,75.5,73.2,70.2,66.5,61,null,null,null,null,null]},
  '🐨': {t:[null,null,null,null,null,null,null,null,null,50.2,45,41.5,56,47.2,43.2,40.2,37.7,35.7,34,29.2,28.5,27.8,27.5,27.2,27,27,27,27.3,27.5,28,28.5,29.2,34.2,35.8,37.8,40.3,43.3,47.7,39,41.8,45.3,50.8,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,41.3,35.7,31.8,29,26.7,24.7,23.2,21.7,20.5,19.5,18.7,18.2,17.7,17.3,17,17,17.2,17.3,17.7,18.2,18.8,19.7,20.7,21.8,23.2,24.8,26.8,29.2,32.2,36,42.2,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,58.5,64.2,68,70.8,73.2,75.2,76.7,78.2,79.3,80.3,81.2,81.7,82.2,82.5,82.8,82.8,82.7,82.5,82.2,81.7,81,80.2,79.2,78,76.7,75,73,70.7,67.7,63.8,57.7,null,null,null,null,null,null]},
  '🐯': {t:[null,null,null,null,null,null,null,50.7,49.8,44.5,40.8,50.3,46.8,42.5,39.5,36.8,34.8,33,31.5,30.2,26.3,25.8,25.5,25.2,25,24.3,25,25.2,25.5,25.8,26.3,30.3,31.7,33.2,35,37.2,39.7,42.8,47.3,50.5,41.2,44.8,50.5,50.7,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,41,35.2,31.3,28.3,25.8,23.8,22.2,20.7,19.3,18.3,17.3,16.7,16,13.3,15.3,15,15,15,15.3,13.3,16,16.7,17.5,18.3,19.5,20.7,22.2,24,26.2,28.5,31.7,35.7,41.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,58.8,64.7,68.5,71.5,74,76,77.7,79.2,80.5,81.5,82.5,83.2,83.8,86.5,84.5,84.8,84.8,84.8,84.5,86.5,83.8,83.2,82.3,81.5,80.3,79.2,77.7,75.8,73.7,71.2,68.2,64.2,58,null,null,null,null,null]},
  '🦁': {t:[null,54.7,49.5,37.2,33,51.3,48.3,34.5,32,30.5,29.5,29,22.2,16.2,16.2,16.5,14.8,16.8,16.8,16.8,13.2,9,9.2,9.8,10.8,12.5,10.8,9.7,9.2,9,13.5,16.8,16.8,16.8,15.2,16.5,16.2,16.2,22.5,29,29.7,30.5,32.2,34.8,48.5,51.7,33.3,37.8,49.8,null,null],l:[null,null,null,null,null,36.8,34,32.5,31.5,20.7,18.5,17.2,16.3,16,16,11.8,9,7.3,6.3,5.8,5.7,6,6.5,7.7,5.3,3.7,2.7,2.2,2,2.2,2.8,3.8,5.5,7.5,6.5,5.8,5.7,5.8,6.5,7.5,9.2,12.2,16,16,16.3,17.2,18.7,20.8,31.5,32.5,34],r:[null,null,null,null,null,63,65.8,67.3,68.3,79.2,81.3,82.7,83.5,83.8,83.8,88,90.8,92.5,93.5,94,94.2,93.8,93.3,92.2,94.5,96.2,97.2,97.7,97.8,97.7,97,96,94.3,92.3,93.3,94,94.2,94,93.3,92.3,90.7,87.7,83.8,83.8,83.5,82.7,81.2,79,68.3,67.2,65.8]},
  '🐮': {t:[null,null,null,null,null,null,null,null,53.7,47.8,41,37.8,50.3,45.8,39.2,33.7,33,32,31.2,30.3,29.7,29.3,28.8,28.7,28.5,28.5,28.5,28.7,29,29.3,29.8,30.5,35,36.5,38.2,40.3,42.8,46.2,50.8,41.5,44.3,48.2,54.5,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,39,33.8,28.2,24,21.8,20.5,19.7,19.3,19,18,17.2,16.5,16,15.7,15.5,15.3,15.5,15.7,16,16.5,17.2,18,19,20.2,21.7,23.3,25.2,27.7,30.5,34.2,39.5,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,60.8,66,69.7,72.5,74.8,76.7,78.3,79.7,80.8,81.8,82.7,83.3,83.8,84.2,84.3,84.5,84.3,84.2,83.8,83.3,82.7,81.8,80.8,79.7,78.2,76.5,74.5,72.2,69.3,65.7,60.3,null,null,null,null,null]},
  '🐷': {t:[null,null,null,null,null,null,null,null,50.2,44.8,41.3,56,47.2,43,40,37.5,35.5,33.8,32.3,28,27.3,26.8,26.5,26.2,26,26,26,26.2,26.5,26.8,27.3,28,32.5,34,35.7,37.7,40.2,43.3,47.7,38.8,41.7,45.2,50.8,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,47.7,37.7,32.8,29.5,26.7,24.5,22.7,21,19.7,18.5,17.5,16.7,16.2,15.7,15.3,15,15,15.2,15.3,15.7,16.2,16.8,17.7,18.5,19.8,21.2,22.8,24.7,27,29.7,33.2,38,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,52.2,62.2,67,70.3,73.2,75.3,77.2,78.8,80.2,81.3,82.3,83.2,83.7,84.2,84.5,84.8,84.8,84.7,84.5,84.2,83.7,83,82.2,81.3,80,78.7,77,75.2,72.8,70.2,66.7,61.8,null,null,null,null,null,null]},
  '🐸': {t:[null,null,null,null,null,null,62.3,55.2,51.8,49.3,57.7,53.3,50.5,48.3,46.5,45,40.2,39.5,38.8,38.3,38,37.7,37.3,37.2,37,37,37,37.2,37.3,37.7,38,38.3,39,39.5,40.2,45,46.7,48.5,50.7,53.7,58.2,49.5,52,55.5,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,39.3,32.3,27.8,24.3,21.7,19.3,17.5,15.8,14.7,13.7,13,12.3,12.2,12,12.2,12.5,13,13.8,14.8,16,17.7,19.5,21.8,24.7,28.2,32.8,40.3,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,60.5,67.5,72,75.5,78.2,80.5,82.3,84,85.2,86.2,86.8,87.5,87.7,87.8,87.7,87.3,86.8,86,85,83.8,82.2,80.3,78,75.2,71.7,67,59.5,null,null,null,null,null]},
  '🐵': {t:[null,null,null,null,null,null,null,null,55.8,47,42.8,39.7,50,44.7,41.2,38.5,36.2,34.3,32.8,28,27.3,26.8,26.5,26.2,26,26,26,26.2,26.5,27,27.5,28.2,32.8,34.5,36.3,38.7,41.5,45,50.7,40,43.2,47.5,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,47.8,38,33.3,30,27.3,25.2,23.3,21.8,20.5,19.3,18.5,17.7,17,16.7,16.3,16,16,16.2,16.3,16.7,17.2,17.7,18.5,19.5,20.7,22,23.5,25.3,27.7,30.3,33.7,38.3,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,52,61.8,66.5,69.8,72.5,74.7,76.5,78,79.3,80.5,81.3,82.2,82.8,83.2,83.5,83.8,83.8,83.7,83.5,83.2,82.7,82.2,81.3,80.3,79.2,77.8,76.3,74.5,72.2,69.5,66.2,61.5,null,null,null,null,null,null]},
  '🐔': {t:[null,null,null,null,null,null,null,null,null,53.7,47.5,43.7,40.8,50.2,45.3,42.2,39.7,37.5,35.8,34.3,30,29.3,29,28.7,28.5,28.5,28.5,28.7,29,29.5,30,34.3,35.8,37.7,39.8,42.5,45.7,50.5,41,44,47.8,54.5,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,39.7,34.7,31.3,28.7,26.5,24.7,23.2,21.8,20.7,19.8,19.2,18.5,18,17.7,17.5,17.3,17.5,17.7,18,18.5,19.2,19.8,20.8,22,23.3,24.8,26.7,29,31.7,35.2,40.2,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,60.2,65.2,68.5,71.2,73.3,75.2,76.7,78,79.2,80,80.7,81.3,81.8,82.2,82.3,82.5,82.3,82.2,81.8,81.3,80.7,80,79,77.8,76.5,75,73.2,70.8,68.2,64.7,59.7,null,null,null,null,null]},
  '🐧': {t:[null,null,null,null,null,null,null,null,50.7,45,41.2,38.3,47.3,43,39.7,37.2,35.2,33.3,31.8,27.2,26.5,26,25.7,25.5,25.3,25.2,25.3,25.5,25.7,26.2,26.7,27.3,31.8,33.5,35.3,37.3,40,43.3,47.8,38.7,41.5,45.3,51.3,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,42,35.7,31.7,28.7,26.2,24.2,22.3,20.8,19.5,18.5,17.7,16.8,16.2,15.8,15.5,15.3,15.2,15.3,15.5,15.8,16.3,16.8,17.7,18.5,19.7,21,22.5,24.3,26.3,28.8,32,36.2,42.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,57.8,64.2,68.2,71.2,73.7,75.7,77.5,79,80.3,81.3,82.2,83,83.7,84,84.3,84.5,84.7,84.5,84.3,84,83.5,83,82.2,81.3,80.2,78.8,77.3,75.5,73.5,71,67.8,63.7,57,null,null,null,null,null]},
  '🦄': {t:[null,null,null,null,null,null,null,null,null,52.2,47,43.5,58,49.2,45.2,42.2,39.7,37.7,36,31.2,30.5,29.8,29.5,29.2,29,29,29,29.3,29.5,30,30.5,31.2,36.2,37.8,39.8,42.3,45.3,49.7,41,43.8,47.3,52.8,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,41.3,35.7,31.8,29,26.7,24.7,23.2,21.7,20.5,19.5,18.7,18.2,17.7,17.3,17,17,17.2,17.3,17.7,18.2,18.8,19.7,20.7,21.8,23.2,24.8,26.8,29.2,32.2,36,42.2,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,58.5,64.2,68,70.8,73.2,75.2,76.7,78.2,79.3,80.3,81.2,81.7,82.2,82.5,82.8,82.8,82.7,82.5,82.2,81.7,81,80.2,79.2,78,76.7,75,73,70.7,67.7,63.8,57.7,null,null,null,null,null]},
  '🐺': {t:[null,null,null,null,null,null,null,null,58,49.7,45.8,42.8,52.5,47.5,44.2,41.7,39.7,37.8,36.3,31.8,31.3,30.8,30.5,30.2,30,30,30,30.2,30.5,30.8,31.3,32,36.5,38,39.8,41.8,44.5,47.8,53.2,43.2,46,50.2,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,47.8,37.7,32.8,29.5,26.8,24.7,22.7,21.2,19.8,18.8,17.8,17.2,16.7,16.3,16,16,16.2,16.3,16.7,17.3,18,18.8,20,21.3,22.8,24.7,27,29.7,33.2,38.2,40.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,52,62.2,67,70.3,73,75.2,77.2,78.7,80,81,81.8,82.7,83.2,83.5,83.8,83.8,83.7,83.5,83.2,82.5,81.8,81,79.8,78.5,77,75,72.8,70.2,66.7,61.7,59,null,null,null,null,null]},
  '🐲': {t:[null,null,null,null,null,null,null,null,58,49.3,45.3,42.3,52.2,47.2,43.7,41,39,37.2,35.5,31,30.3,29.8,29.5,29.2,29,29,29,29.2,29.5,29.8,30.3,31,35.7,37.2,39,41.3,44,47.5,52.8,42.5,45.7,49.8,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,41,35.3,31.3,28.3,26,24,22.3,20.8,19.7,18.7,17.8,17.2,16.7,16.3,16,16,16.2,16.3,16.7,17.2,17.8,18.7,19.7,21,22.3,24.2,26.2,28.7,31.7,35.7,41.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,58.8,64.5,68.5,71.5,73.8,75.8,77.5,79,80.2,81.2,82,82.7,83.2,83.5,83.8,83.8,83.7,83.5,83.2,82.7,82,81.2,80.2,78.8,77.5,75.7,73.7,71.2,68.2,64.2,58,null,null,null,null,null]},
  '🦡': {t:[null,null,null,null,null,null,null,null,55.8,47,42.8,39.7,50,44.7,41.2,38.5,36.2,34.3,32.8,28,27.3,26.8,26.5,26.2,26,26,26,26.2,26.5,27,27.5,28.2,32.8,34.5,36.3,38.7,41.5,45,50.7,40,43.2,47.5,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,47.8,38,33.3,30,27.3,25.2,23.3,21.8,20.5,19.3,18.5,17.7,17,16.7,16.3,16,16,16.2,16.3,16.7,17.2,17.7,18.5,19.5,20.7,22,23.5,25.3,27.7,30.3,33.7,38.3,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,52,61.8,66.5,69.8,72.5,74.7,76.5,78,79.3,80.5,81.3,82.2,82.8,83.2,83.5,83.8,83.8,83.7,83.5,83.2,82.7,82.2,81.3,80.3,79.2,77.8,76.3,74.5,72.2,69.5,66.2,61.5,null,null,null,null,null,null]},
  '🦔': {t:[null,61.7,49.7,49.5,38.7,49.8,49.7,49.5,40,40,40,40,33,33.5,33.5,33.5,33.5,28.7,30.3,30.3,30.3,30.3,26.3,25.8,27.8,27.8,27.8,26.2,26.2,30.2,30.2,30.2,30.2,28.5,33.7,33.7,33.7,33.7,33,40,40,40,40,49.5,49.7,49.8,38.5,49.7,49.7,61.7,null],l:[null,null,null,null,null,null,null,null,49.7,37.2,37,25.7,26,26.3,26.7,16,17,18,18.8,19.8,9,10.7,12.5,14.2,15.8,3.2,6.2,9.2,12.2,12.5,6.7,1.2,7.2,13,17.7,18.3,19,20,21.2,22.5,24.2,26.2,28.7,31.7,35.5,41.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,50.2,62.7,62.8,74.2,73.8,73.5,73.2,83.8,82.8,81.8,81,80,90.8,89.2,87.3,85.7,84,96.7,93.7,90.7,87.7,87.3,93.2,98.7,92.7,86.8,82.2,81.5,80.8,79.8,78.7,77.3,75.7,73.7,71.2,68.2,64.3,58,null,null,null,null,null]},
  '🐘': {t:[null,null,null,null,null,null,null,null,null,null,null,46.2,41,37.7,52.3,43.3,39.2,36.3,34,32,30.5,26.2,25.7,25.3,25.2,25,25.2,25.3,25.7,26.2,30.7,32.2,34.2,36.5,39.5,43.7,35.2,37.8,41.3,47,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,42.2,37,33.7,31,29,27.2,25.8,24.5,23.5,22.8,22.2,21.7,21.3,21.2,21,21.2,21.3,21.7,22.2,22.8,23.7,24.7,25.8,27.3,29.2,29.8,29.3,29,29,29,29.3,30,30.7,32.7,44.5,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,57.7,62.8,66.2,68.8,70.8,72.7,74,75.3,76.3,77,77.7,78.2,78.5,78.7,78.8,78.7,78.5,78.2,77.7,77,76.2,75.2,74,72.5,70.7,70,70.5,70.8,70.8,70.8,70.5,69.8,69.2,67.2,55.3,null,null,null]},
  '⛄': {t:[null,null,null,null,null,null,null,null,49.3,43.7,39.8,55.7,46.2,41.7,38.3,35.7,33.5,31.5,30,25.2,24.5,23.8,23.5,23.2,23,23,23,23.2,23.5,24,24.5,25.2,30,31.7,33.7,35.8,38.5,41.8,46.7,37.2,40.2,44,50,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,41.3,35.7,31.8,28.8,26.5,24.5,22.7,21.2,20,18.8,17.8,17.2,16.5,15.8,15.5,15.2,15,15,15,15.2,15.5,16,16.5,17.2,18,18.8,20,21.3,22.8,20,20.5,21,21.5,22.3,28.7,38,61.2,60.3,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,58.5,64.2,68,71,73.3,75.3,77.2,78.7,79.8,81,82,82.7,83.3,84,84.3,84.7,84.8,84.8,84.8,84.7,84.3,83.8,83.3,82.7,81.8,80.8,79.8,78.5,77,79.8,79.3,78.8,78.3,77.7,71.2,66.8,68,69.3,null]},
  '🦒': {t:[null,null,null,null,null,null,null,null,null,null,58.2,48.7,44.5,41.3,51.8,46.3,42.7,40,37.8,36,34.3,30,29.7,29.3,29,29,29.2,29.3,29.7,30.2,34.5,36,38,40.2,43,46.7,52.3,41.5,44.7,49.2,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,42,37,33.5,30.8,28.8,27,25.5,24.3,23.2,22.3,21.5,21,20.5,20.3,20.2,20,20.2,20.3,20.7,21,21.7,22.3,23.3,24.3,25.7,27.2,29,31.2,33.8,37.3,42.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,57.8,62.8,66.3,69,71,72.8,74.3,75.5,76.7,77.5,78.2,78.8,79.3,79.5,79.7,79.8,79.7,79.5,79.2,78.8,78.2,77.5,76.5,75.5,74.2,72.7,70.8,68.7,66,62.5,57,null,null,null,null,null]},
  '🦓': {t:[null,null,null,null,null,null,null,null,null,null,49.7,45,41.7,53.2,47,43.3,40.3,38.2,36.2,34.5,29.8,28.2,31,30.3,29,25,29.2,30.3,31,28.3,30,34.7,36.3,38.3,40.7,43.5,47.3,53.8,42,45.3,50.2,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,45.3,42.2,33.7,32.5,31.8,29.2,27.2,25.3,23.8,22.5,21.5,20.7,20,19.3,18.8,18.5,18.3,18.3,18.3,18.7,18.8,19.3,20,20.7,21.7,22.7,24,25.5,27.3,29.3,32,35.3,40.2,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,54.5,57.7,66.2,67.3,68,70.7,72.7,74.5,76,77.3,78.3,79.2,79.8,80.5,81,81.3,81.5,81.5,81.5,81.2,81,80.5,79.8,79.2,78.2,77.2,75.8,74.3,72.5,70.5,67.8,64.5,59.7,null,null,null,null,null]},
  '🦛': {t:[null,null,null,null,null,null,null,null,50.5,45.7,42.5,56.2,47.8,44,41.2,38.8,37,35.3,30.5,29.8,29.2,28.8,28.5,28.2,28,28,28,28.2,28.5,28.8,29.3,29.8,30.5,35.5,37.2,39,41.3,44.2,48.2,40.2,42.7,46,51.2,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,47.7,37.2,32.3,28.8,26.2,23.8,22,20.3,19,17.8,17,16.2,15.7,15.3,15.2,15,15.2,15.3,15.7,16.3,17,18,19.2,20.5,21.2,21.8,22.8,24.2,26,28.5,32,37.2,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,52.2,62.7,67.5,71,73.7,76,77.8,79.5,80.8,82,82.8,83.7,84.2,84.5,84.7,84.8,84.7,84.5,84.2,83.5,82.8,81.8,80.7,79.3,78.7,78,77,75.7,73.8,71.3,67.8,62.7,null,null,null,null,null]},
  '🦏': {t:[null,null,null,null,null,null,null,null,58,49.7,45.8,42.8,52.5,47.5,44.2,41.7,39.7,37.8,36.3,31.8,31.3,30.8,30.5,30.2,30,30,30,30.2,30.5,30.8,31.3,32,36.5,38,39.8,41.8,44.5,47.8,53.2,43.2,46,50.2,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,47.8,37.7,32.8,29.5,26.8,24.7,22.7,21.2,19.8,18.8,17.8,17.2,16.7,16.3,16,16,16.2,16.3,16.7,17.3,18,18.8,20,21.3,22.8,24.7,27,29.7,33.2,38.2,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,52,62.2,67,70.3,73,75.2,77.2,78.7,80,81,81.8,82.7,83.2,83.5,83.8,83.8,83.7,83.5,83.2,82.5,81.8,81,79.8,78.5,77,75,72.8,70.2,66.7,61.7,null,null,null,null,null,null]},
  '🐑': {t:[null,null,null,null,null,45.3,41.5,27.3,23.5,43,40.2,25,22.2,17.5,17.3,15.5,17.5,17.3,17,14.2,9.5,9.3,9.5,9.8,10.7,11.7,10.5,9.8,9.5,9.3,9.5,14.3,17.3,17.3,17.7,15.7,17.3,17.5,22.3,25.3,40.3,43.3,23.7,27.8,41.7,45.8,null,null,null,null,null],l:[null,null,null,null,null,37.3,33.5,31.2,29.7,23.3,19.5,17.2,15.7,14.5,13.8,13.5,13.3,13.5,13.8,14.7,13.2,11.7,10.5,9.8,9.5,9.3,9.5,9.8,10.7,11.7,13.3,15.3,13.8,13,12.5,12.3,12.5,13,14,15.5,18,34,35.8,38.3,41.7,null,null,null,null,null,null],r:[null,null,null,null,null,62.5,66.3,68.7,70.2,76.5,80.3,82.7,84.2,85.3,86,86.3,86.5,86.3,86,85.2,86.7,88.2,89.3,90,90.3,90.5,90.3,90,89.2,88.2,86.5,84.5,86,86.8,87.3,87.5,87.3,86.8,85.8,84.3,81.8,65.8,64,61.5,58.2,null,null,null,null,null,null]},
  '🐐': {t:[null,null,null,null,null,null,null,null,null,null,null,56.3,46.7,42.5,39.3,49.8,44.3,40.8,38.2,36,34.2,29.2,28.7,28.3,28.2,28,28.2,28.3,28.7,29.3,34.3,36.2,38.3,41,44.7,50.5,39.7,42.8,47.2,null,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,48.2,39.8,36,33.2,31,29.2,27.5,26.3,25.2,24.3,23.7,23,22.5,22.3,22.2,22,22.2,22.3,22.7,23,23.7,24.3,25.3,26.3,27.7,29.3,31.2,33.3,36.2,40.2,45.2,46.7,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.7,60,63.8,66.7,68.8,70.7,72.2,73.5,74.7,75.5,76.2,76.8,77.3,77.5,77.7,77.8,77.7,77.5,77.2,76.8,76.2,75.5,74.5,73.5,72.2,70.5,68.7,66.5,63.7,59.7,54.7,53.2,null,null,null,null,null]},
  '🐴': {t:[null,null,null,null,null,null,null,null,null,null,null,null,49.3,43.7,40,56,46,41.7,38.3,35.8,33.8,32.2,27.8,27.3,27.2,27,27.2,27.3,27.8,32.3,34,36,38.7,42,46.5,37.3,40.2,44,50.2,null,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,42.8,38.3,35.2,32.8,30.8,29.3,28,26.8,25.8,25,24.5,24,23.5,23.2,23,23,23.2,23.3,23.5,24,24.5,25.2,26,27,28.2,29.5,31,33,35,37.2,40.7,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,57,61.5,64.7,67,69,70.5,71.8,73,74,74.8,75.3,75.8,76.3,76.7,76.8,76.8,76.7,76.5,76.3,75.8,75.3,74.7,73.8,72.8,71.7,70.3,68.8,66.8,64.8,62.7,59.2,null,null,null,null,null,null]},
  '🫏': {t:[null,null,null,null,null,null,null,null,null,null,null,55.2,50,46.7,61.3,52.3,48.2,45.3,43,41,39.5,35.2,34.7,34.3,34.2,34,34.2,34.3,34.7,35.2,39.7,41.2,43.2,45.5,48.5,52.7,44.2,46.8,50.3,56,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,48.2,39.3,35.2,32.3,30,28,26.5,25.2,24,23.2,22.5,21.8,21.5,21.2,21,21,21.2,21.5,21.8,22.5,23.2,24.2,25.2,26.7,28.2,30.2,32.5,35.5,39.7,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.7,60.5,64.7,67.5,69.8,71.8,73.3,74.7,75.8,76.7,77.3,78,78.3,78.7,78.8,78.8,78.7,78.3,77.8,77.3,76.7,75.7,74.5,73.2,71.7,69.7,67.3,64.3,60.2,null,null,null,null,null]},
  '🦆': {t:[null,null,null,null,null,null,null,null,null,56,47.3,43.3,40.5,50.3,45.2,41.8,39.2,37,35.3,33.8,29.5,29,28.5,28.2,29.2,28.8,29.2,29.8,28.5,29,29.5,33.8,35.5,37.2,39.3,42,45.5,50.8,40.7,43.7,47.8,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,52.2,48.8,47.2,46.5,46.3,46.5,47,47.8,38.3,33.8,30.7,28.2,26.2,24.3,22.8,21.7,20.7,19.8,19.2,18.7,18.3,18,18,18.2,18.3,18.7,19.2,19.8,20.7,21.7,23,24.5,26.2,28.3,31,34.2,38.8,null,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,55,54.8,50.8,49.3,49.2,49.3,50,51.8,61.5,66,69.2,71.7,73.7,75.5,77,78.2,79.2,80,80.7,81.2,81.5,81.8,81.8,81.7,81.5,81.2,80.7,80,79.2,78.2,76.8,75.3,73.7,71.5,68.8,65.7,61,null,null,null,null,null,null,null]},
  '🦉': {t:[null,null,null,null,null,null,null,null,55.8,47,42.8,39.7,50,44.7,41.2,38.5,36.2,34.3,32.8,28,27.3,26.8,26.5,26.2,26,26,26,26.2,26.5,27,27.5,28.2,32.8,34.5,36.3,38.7,41.5,45,50.7,40,43.2,47.5,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,47.8,38,33.3,30,27.3,25.2,23.3,21.8,20.5,19.3,18.5,17.7,17,16.7,16.3,16,16,16.2,16.3,16.7,17.2,17.7,18.5,19.5,20.7,22,23.5,25.3,27.7,29,30.3,38.3,44.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,52,61.8,66.5,69.8,72.5,74.7,76.5,78,79.3,80.5,81.3,82.2,82.8,83.2,83.5,83.8,83.8,83.7,83.5,83.2,82.7,82.2,81.3,80.3,79.2,77.8,76.3,74.5,72.2,70.8,69.5,61.5,55,null,null,null,null,null]},
  '🦇': {t:[null,null,null,null,null,null,null,null,null,null,null,58.2,49.5,45.5,42.7,52.3,47.3,44,41.5,39.3,37.7,33.2,32.7,32.3,32.2,32,32.2,32.3,32.7,33.2,37.8,39.5,41.7,44.2,47.7,53,42.8,45.8,49.8,null,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,48.2,39.3,35.5,32.7,30.3,28.5,27,25.7,24.7,23.8,23.2,22.7,22.3,22.2,22,22.2,22.3,22.7,23.2,23.8,24.8,25.8,27.2,28.7,30.5,32.8,35.8,39.8,null,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.7,60.5,64.3,67.2,69.5,71.3,72.8,74.2,75.2,76,76.7,77.2,77.5,77.7,77.8,77.7,77.5,77.2,76.7,76,75,74,72.7,71.2,69.3,67,64,60,null,null,null,null,null,null,null]},
  '🐬': {t:[null,null,null,null,null,null,null,null,56,47.7,43.8,40.8,50.5,45.5,42.2,39.7,37.7,35.8,34.3,29.8,29.3,28.8,28.5,28.2,28,28,28,28.2,28.5,28.8,29.3,30,34.5,36,37.8,39.8,42.5,45.8,51.2,41.2,44,48.2,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,47.8,37.7,32.8,29.5,26.8,24.7,22.7,21.2,19.8,18.8,17.8,17.2,16.7,16.3,16,16,16.2,16.3,16.7,17.3,18,18.8,20,21.3,22.8,24.7,27,29.7,33,37.7,null,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,52,62.2,67,70.3,73,75.2,77.2,78.7,80,81,81.8,82.7,83.2,83.5,83.8,83.8,83.7,83.5,83.2,82.5,81.8,81,79.8,78.5,77,75,72.8,70.2,66.8,62.2,null,null,null,null,null,null,null]},
  '🐳': {t:[null,null,null,null,null,null,55,50.3,47.2,60.2,52.3,48.7,46,43.7,41.8,40.3,35.3,34.7,34,33.5,33,32.7,32.3,32.2,32,32,32,32.2,32.3,32.7,33,33.5,34,34.7,35.5,40.5,42,43.8,46.2,48.8,52.7,45,47.5,50.7,55.7,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,47.5,35.8,30.3,26.5,23.3,20.8,18.7,17,15.5,14.2,13.2,12.3,11.8,11.3,11.2,11,11.2,11.3,11.8,12.5,13.3,14.3,15.5,17.2,18.8,21,23,25.5,29.2,35,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,52.3,64,69.5,73.3,76.5,79,81.2,82.8,84.3,85.7,86.7,87.5,88,88.5,88.7,88.8,88.7,88.5,88,87.3,86.5,85.5,84.3,82.7,81,78.8,76.8,74.3,70.7,64.8,null,null,null,null,null]},
  '🐟': {t:[null,null,null,null,null,null,null,null,58.2,50,46.2,43.5,52.8,48,44.7,42.3,40.3,38.5,37.2,32.8,32.3,31.8,31.5,31.2,31,31,31,31.2,31.5,31.8,32.3,32.8,37.3,38.7,40.5,42.5,45,48.3,53.3,43.7,46.5,50.5,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,40.7,34.8,30.8,27.7,25.3,23.3,21.5,20.2,19,18,17.3,16.7,16.3,16.2,16,16.2,16.3,16.8,17.3,18.2,19.2,20.3,21.7,23.5,25.5,28,31,35.2,41.5,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,59.2,65,69,72.2,74.5,76.5,78.3,79.7,80.8,81.8,82.5,83.2,83.5,83.7,83.8,83.7,83.5,83,82.5,81.7,80.7,79.5,78.2,76.3,74.3,71.8,68.8,64.7,58.3,null,null,null,null,null,null]},
  '🐙': {t:[null,null,null,null,null,null,null,null,null,42.2,37,33.5,48,39.2,35.2,32.2,29.7,27.7,26,21.2,20.5,19.8,19.5,19.2,19,19,19,19.3,19.5,20,20.5,21.2,26.2,27.8,29.8,32.3,35.3,39.7,31,33.8,37.3,42.8,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,41.3,35.7,31.8,29,26.7,24.7,23.2,21.7,20.5,19.5,18.7,18.2,17.7,17.3,17,17,17.2,17.3,17.7,18.2,18.8,19.7,20.7,21.8,23.2,24.8,26.8,28,28.3,29.3,31,33.8,38.2,null,null,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,58.5,64.2,68,70.8,73.2,75.2,76.7,78.2,79.3,80.3,81.2,81.7,82.2,82.5,82.8,82.8,82.7,82.5,82.2,81.7,81,80.2,79.2,78,76.7,75,73,71.8,71.5,70.5,68.8,66,61.7,null,null,null,null,null,null,null,null]},
  '🦀': {t:[null,null,null,null,null,null,null,null,59.7,55.3,52.5,64.3,57.2,53.8,51.3,49.3,47.8,42.8,42.2,41.5,41,40.7,40.3,40.2,40,40,40,40.2,40.5,40.7,41.2,41.7,42.2,46.5,47.8,49.5,51.5,54,57.5,50.5,52.7,55.7,60.2,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,47.7,36.3,31.2,27.5,24.7,22.3,20.5,18.8,17.7,16.7,16,15.3,15.2,15,15.2,15.5,16,16.7,17.7,19,20.5,22.5,24.8,27.8,31.7,36.7,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,52.2,63.5,68.7,72.3,75.2,77.5,79.3,81,82.2,83.2,83.8,84.5,84.7,84.8,84.7,84.3,83.8,83.2,82.2,80.8,79.2,77.3,75,72,68.2,63.2,null,null,null,null,null]},
  '🐢': {t:[null,null,null,null,null,null,null,null,null,null,null,null,null,60.5,55.5,52.3,66.2,57.7,53.8,51,48.8,47.2,42.8,42.3,42.2,42,42.2,42.3,42.8,47.3,49,51.2,54,58,50.2,52.5,55.8,61.2,null,null,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,48.3,40.2,36.5,34,32,30.3,28.8,27.8,26.8,26.2,25.7,25.3,25.2,25,25.2,25.3,25.7,26.3,27,27.8,29,30.3,32,34.2,36.8,40.5,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.5,59.7,63.3,65.8,67.8,69.5,71,72,73,73.7,74.2,74.5,74.7,74.8,74.7,74.5,74.2,73.5,72.8,72,70.8,69.5,67.8,65.7,63,59.3,null,null,null,null]},
  '🐍': {t:[null,null,null,null,null,null,null,null,null,null,60.5,52.2,48.3,45.8,54.8,50.2,47,44.7,42.7,41,36.5,36,35.5,35.3,35,35,35.2,35.3,35.5,36,36.7,41.2,42.8,44.8,47.2,50.3,55.3,46,48.7,52.5,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,41.5,36,32.5,29.8,27.7,25.8,24.3,23.2,22.2,21.3,20.7,20.3,20.2,20,20.2,20.3,20.8,21.3,22.2,23.2,24.3,26,27.8,30,32.8,36.5,42.3,48.2,46.2,44.2,42.8,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,58.3,63.8,67.3,70,72.2,74,75.5,76.7,77.7,78.5,79.2,79.5,79.7,79.8,79.7,79.5,79,78.5,77.7,76.7,75.5,73.8,72,69.8,67,63.3,57.5,51.7,53.7,55.7,57,null,null]},
  '🐊': {t:[null,null,null,null,null,null,null,null,null,54.2,46.8,43.3,40.8,49.3,44.8,42,39.7,37.8,36.3,31.8,31.3,30.8,30.5,30.2,30,30,30.2,30.2,30.5,30.8,31.3,31.8,36.5,38,39.8,42.2,45.2,49.8,41,43.5,47.2,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,48,37.5,32.8,29.5,26.8,24.7,23,21.5,20.3,19.5,18.8,18.3,18.2,18,18.2,18.3,18.8,19.7,20.5,21.7,23.2,23.2,23,23.2,23.8,24.8,26.3,28.3,31,34.8,41.3,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.8,62.3,67,70.3,73,75.2,76.8,78.3,79.5,80.3,81,81.5,81.7,81.8,81.7,81.5,81,80.2,79.3,78.2,76.7,76.7,76.8,76.7,76,75,73.5,71.5,70.7,64.8,61.3,null,null,null,null,null]},
  '🦋': {t:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,57.5,47.7,43.2,40,51,45.2,41.3,38.7,36.5,32.2,32,32.2,36.7,38.8,41.7,45.5,51.7,40.2,43.5,48.2,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,48.7,42.5,39.7,37.5,36,34.7,33.5,32.7,32,31.3,30.8,30.5,30.2,30,30,30,30.2,30.5,30.8,31.3,32,32.7,33.7,34.8,36.2,37.7,39.8,42.8,null,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.2,57.3,60.2,62.3,63.8,65.2,66.3,67.2,67.8,68.5,69,69.3,69.7,69.8,69.8,69.8,69.7,69.3,69,68.5,67.8,67.2,66.2,65,63.7,62.2,60,57,null,null,null,null,null,null,null]},
  '🐝': {t:[null,null,null,null,null,null,null,null,null,58,49.3,45.3,42.5,52.3,47.2,43.8,41.2,39,37.3,35.8,31.5,31,30.5,30.2,30,30,30.2,30.3,30.5,31,31.5,35.8,37.5,39.2,41.3,44,47.5,52.8,42.7,45.7,49.8,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,48,38.3,33.8,30.7,28.2,26.2,24.3,22.8,21.7,20.7,19.8,19.2,18.7,18.3,18,18,18.2,18.3,18.7,19.2,19.7,19.5,19.2,22.7,24.5,26.2,27.3,28.7,30.2,36.2,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.8,61.5,66,69.2,71.7,73.7,75.5,77,78.2,79.2,80,80.7,81.2,81.5,81.8,81.8,81.7,81.5,81.2,80.7,80.2,80.3,80.7,77.2,75.3,73.7,72.5,71.2,69.7,63.7,null,null,null,null,null,null]},
  '🐞': {t:[null,null,null,null,null,null,null,null,58,49.3,45.3,42.3,52.2,47.2,43.7,41,39,37.2,35.5,31,30.3,29.8,29.5,29.2,29,29,29,29.2,29.5,29.8,30.3,31,35.7,37.2,39,41.3,44,47.5,52.8,42.5,45.7,49.8,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,41,35.3,31.3,28.3,26,24,22.3,20.8,19.7,18.7,17.8,17.2,16.7,16.3,16,16,16.2,16.3,16.7,17.2,17.8,18.7,19.7,21,22.3,24.2,26.2,28.7,31.7,35.7,41.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,58.8,64.5,68.5,71.5,73.8,75.8,77.5,79,80.2,81.2,82,82.7,83.2,83.5,83.8,83.8,83.7,83.5,83.2,82.7,82,81.2,80.2,78.8,77.5,75.7,73.7,71.2,68.2,64.2,58,null,null,null,null,null]},
  '🐌': {t:[null,null,null,null,null,null,null,null,null,66.5,38.3,29,70.5,64.3,32,26.8,23.3,20.7,18.5,16.7,11.7,11.2,10.7,10.3,10,10,10.2,10.3,10.7,11.2,11.8,16.8,18.7,20.8,23.5,27.2,32.7,64.7,25.2,29.5,63,66.8,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,48,39,34.8,31.8,29.5,27.5,26,24.7,23.5,22.5,21.7,21,20.7,20.3,20.2,20,20.2,20.3,20.7,21.2,21.8,22.5,23.5,24.7,24.5,22.3,20.5,19.2,18.2,17.5,17.2,17,17.2,17.7,18.3,19.3,20.7,22.5,24.7,27.5,31.3,36.7,null,null,null,null],r:[null,null,null,null,null,51.8,60.8,64.8,68,70.3,72.3,73.8,75.2,76.3,77.3,78.2,78.8,79.2,79.5,79.7,79.8,79.7,79.5,79.2,78.7,78,77.3,76.3,75.2,75.3,77.5,79.3,80.7,81.7,82.3,82.7,82.8,82.7,82.2,81.5,80.5,79.2,77.3,75.2,72.3,68.5,63.2,null,null,null,null]},
  '🕷️': {t:[null,null,null,null,null,null,null,null,null,null,58.3,49.8,46,43.2,52.7,47.7,44.5,42,40,38.3,33.7,33,32.5,32.3,32,32,32.2,32.3,32.7,33,33.7,38.3,40.2,42.2,44.7,48,53.2,43.3,46.2,50.2,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,48,38.7,34.5,31.3,29,27,25.3,24,22.8,22,21.2,20.7,20.3,20.2,20,20.2,20.3,20.7,21.3,22,23,24.2,25.5,27.2,29.2,31.7,34.7,39.2,null,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.8,61.2,65.3,68.5,70.8,72.8,74.5,75.8,77,77.8,78.7,79.2,79.5,79.7,79.8,79.7,79.5,79.2,78.5,77.8,76.8,75.7,74.3,72.7,70.7,68.2,65.2,60.7,null,null,null,null,null,null,null]},
  '🐿️': {t:[null,null,null,null,null,null,null,null,null,null,58.3,49.5,45.3,42.5,52.3,47.2,43.8,41.3,39.2,37.5,32.7,32,31.5,31.3,31,31,31.2,31.3,31.7,32,32.7,37.7,39.3,41.5,44.2,47.5,52.8,42.8,45.7,49.8,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,41.8,36.5,33,30.3,28.2,26.5,25,23.7,22.7,21.8,21.2,20.7,20.3,20.2,20,20.2,20.3,20.7,21.2,21.8,22.7,23.8,25,26.5,28.3,30.7,33.3,36.8,42.5,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,58,63.3,66.8,69.5,71.7,73.3,74.8,76.2,77.2,78,78.7,79.2,79.5,79.7,79.8,79.7,79.5,79.2,78.7,78,77.2,76,74.8,73.3,71.5,69.2,66.5,63,57.3,null,null,null,null,null,null]},
  '🐫': {t:[null,null,null,null,null,null,null,null,null,null,null,null,53.7,48.2,44.5,60.2,50.5,46.2,43,40.7,38.7,37,32.8,32.3,32.2,32,32.2,32.3,32.8,37.2,38.8,40.8,43.3,46.5,51,42,44.8,48.5,54.3,null,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,48.2,40.2,36.5,33.7,31.7,29.8,28.3,27.2,26.2,25.2,24.5,24,23.5,23.3,23.2,23,23.2,23.3,23.5,24,24.7,25.3,26.2,27.2,28.5,30,31.8,34,36.7,40.5,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.7,59.7,63.3,66.2,68.2,70,71.5,72.7,73.7,74.7,75.3,75.8,76.3,76.5,76.7,76.8,76.7,76.5,76.3,75.8,75.2,74.5,73.7,72.7,71.3,69.8,68,65.8,63.2,59.3,null,null,null,null,null]},
  '🦙': {t:[null,null,null,null,null,null,null,null,null,null,null,null,null,60,50.7,46.3,43.5,53.7,48.3,44.8,42.2,40,34.8,34.3,34.2,34,34.2,34.5,35,40.2,42.3,45.2,48.7,54.5,43.7,46.7,51.2,null,null,null,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,48.5,41,37.5,35,33.2,31.5,30.3,29.2,28.3,27.7,27,26.5,26.3,26,26,26.2,26.3,26.5,27,27.7,28.3,29.3,30.3,31.7,33.3,35.3,37.8,41.3,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.3,58.8,62.3,64.8,66.7,68.3,69.5,70.7,71.5,72.2,72.8,73.3,73.5,73.8,73.8,73.7,73.5,73.3,72.8,72.2,71.5,70.5,69.5,68.2,66.5,64.5,62,58.5,null,null,null,null,null,null]},
  '🦌': {t:[null,null,null,null,null,null,null,null,null,null,null,null,53.7,48.2,44.5,60.2,50.5,46.2,43,40.7,38.7,37,32.8,32.3,32.2,32,32.2,32.3,32.8,37.2,38.8,40.8,43.3,46.5,51,42,44.8,48.5,54.3,null,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,48.2,40.2,36.5,33.7,31.7,29.8,28.3,27.2,26.2,25.2,24.5,24,23.5,23.3,23.2,23,23.2,23.3,23.5,24,24.7,25.3,26.2,27.2,28.5,30,31.8,34,36.7,40.5,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.7,59.7,63.3,66.2,68.2,70,71.5,72.7,73.7,74.7,75.3,75.8,76.3,76.5,76.7,76.8,76.7,76.5,76.3,75.8,75.2,74.5,73.7,72.7,71.3,69.8,68,65.8,63.2,59.3,null,null,null,null,null]},
  '🦝': {t:[null,null,null,null,null,null,null,null,56,47.7,43.8,40.8,50,45.5,42.2,39.7,37.7,35.8,34.3,29.8,29.3,28.8,28.5,28.2,28,28,28,28.2,28.5,28.8,29.3,30,34.5,36,37.8,39.8,42.5,45.8,51.2,41.2,44,48.2,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,47.8,37.7,32.8,29.5,26.8,24.7,22.7,21.2,19.8,18.8,17.8,17,16.7,16.3,16,16,16.2,16.3,16.7,17.3,18,18.8,20,21.3,22.8,24.7,27,29.7,33.2,38.2,null,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,52,62.2,67,70.3,73,75.2,77.2,78.7,80,81,81.8,82.8,83.2,83.5,83.8,83.8,83.7,83.5,83.2,82.5,81.8,81,79.8,78.5,77,75,72.8,70.2,66.7,61.7,null,null,null,null,null,null,null]},
  '🦨': {t:[null,null,null,null,null,null,null,null,null,null,58.3,49,44.8,41.8,52,46.8,43.3,40.7,38.5,36.7,31.7,31.2,30.7,30.3,31.3,30.8,31.3,30.3,30.7,31.2,35.3,36.8,38.7,40.8,43.5,47.2,52.7,42.2,45.2,49.5,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,49.5,47.3,46.3,39,34.8,31.8,29.5,27.5,26,24.7,23.5,22.5,21.7,21,20.7,20.3,20.2,20,20.2,20.3,20.7,21.2,21.8,22.5,23.5,24.7,26,27.7,29.7,32.2,35.2,39.5,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,50.3,52.5,53.5,60.8,64.8,68,70.3,72.3,73.8,75.2,76.3,77.3,78.2,78.8,79.2,79.5,79.7,79.8,79.7,79.5,79.2,78.7,78,77.3,76.3,75.2,73.8,72.2,70.2,67.7,64.7,60.3,null,null,null,null,null,null]},
  '🦥': {t:[null,null,null,null,null,null,null,null,null,50.3,45.3,42,56,47.5,43.5,40.7,38.3,36.5,34.8,30,29.3,28.8,28.5,28.2,28,28,28,28.2,28.5,29,29.5,30.2,34.8,36.5,38.5,40.8,43.8,48,39.7,42.3,45.7,51,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,47.8,38,33.3,30,27.5,25.3,23.5,22,20.8,19.7,18.8,18.2,17.7,17.3,17,17,17.2,17.3,17.7,18.2,19,19.8,20.8,22.2,23.7,25.5,27.7,30.3,33.7,38.5,null,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,52,61.8,66.5,69.8,72.3,74.5,76.3,77.8,79,80.2,81,81.7,82.2,82.5,82.8,82.8,82.7,82.5,82.2,81.7,80.8,80,79,77.7,76.2,74.3,72.2,69.5,66.2,61.3,null,null,null,null,null,null,null]},
  '🦦': {t:[null,null,null,null,null,null,null,null,null,52.7,47.8,44.5,58,49.8,46,43.2,41,39.2,37.5,33,32.3,31.8,31.5,31.2,31,31,31,31.2,31.5,31.8,32.3,33,37.7,39.3,41.2,43.5,46.3,50.3,42.3,44.8,48.2,53.3,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,41,35.2,31.3,28.3,26,24,22.3,21,20,19,18.3,17.7,17.3,17,17,17.2,17.3,17.7,18.3,19,20,21.2,22.5,24.2,26.2,28.7,31.7,35.5,41.8,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,58.8,64.7,68.5,71.5,73.8,75.8,77.5,78.8,79.8,80.8,81.5,82.2,82.5,82.8,82.8,82.7,82.5,82.2,81.5,80.8,79.8,78.7,77.3,75.7,73.7,71.2,68.2,64.3,58,null,null,null,null,null,null]},
  '🦘': {t:[null,null,null,null,null,null,null,null,null,null,null,null,null,53.5,48,44.5,60,50.5,46.2,43.2,40.7,38.8,33.8,33.3,33.2,33,33.2,33.3,33.8,38.8,40.8,43.3,46.5,50.8,42,44.8,48.3,54.3,null,null,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,43.3,38.8,35.8,33.7,31.8,30.3,29.2,28,27.2,26.5,26,25.5,25.3,25,25,25.2,25.3,25.5,26,26.7,27.3,28.2,29.2,30.5,32,33.8,36,39.2,43.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,56.5,61,64,66.2,68,69.5,70.7,71.8,72.7,73.3,73.8,74.3,74.5,74.8,74.8,74.7,74.5,74.3,73.8,73.2,72.5,71.7,70.7,69.3,67.8,66,63.8,60.7,56,null,null,null,null,null]},
  '🦩': {t:[null,null,null,null,null,null,null,null,null,null,null,58.2,49.5,45.5,42.7,52.3,47.3,44,41.5,39.3,37.7,33.2,32.7,32.3,32.2,32,32.2,32.3,32.7,33.2,37.8,39.5,41.7,44.2,47.7,53,42.8,45.8,49.8,null,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,48.2,39.3,35.5,32.7,30.3,28.5,27,25.7,24.7,23.8,23.2,22.7,22.3,22.2,22,22.2,22.3,22.7,23.2,23.8,24.8,25.8,27.2,28.7,30.5,32.8,35.8,39.8,null,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.7,60.5,64.3,67.2,69.5,71.3,72.8,74.2,75.2,76,76.7,77.2,77.5,77.7,77.8,77.7,77.5,77.2,76.7,76,75,74,72.7,71.2,69.3,67,64,60,null,null,null,null,null,null,null]},
  '🦚': {t:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,58.5,53.5,50.3,64.2,55.7,51.8,49.2,47.2,42.5,42.2,42,42.2,42.5,47.2,49.3,52.2,56,48.2,50.7,53.8,59,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,48.7,41.5,38.3,36,34.3,33,31.8,30.8,30.2,29.7,29.3,29.2,29,29.2,29.3,29.7,30.3,31,31.8,33,34.5,36.2,38.5,41.8,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.2,58.3,61.5,63.8,65.5,66.8,68,69,69.7,70.2,70.5,70.7,70.8,70.7,70.5,70.2,69.5,68.8,68,66.8,65.3,63.7,61.3,58,null,null,null,null,null,null]},
  '🦜': {t:[null,null,null,null,null,null,null,null,null,55.8,47,42.8,39.8,50,44.7,41.3,38.5,36.3,34.5,33,28.5,28,27.5,27.3,27,27,27,27.3,27.5,28,28.5,33.2,34.7,36.5,38.8,41.5,45.2,50.7,40,43.2,47.5,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,41.5,36.2,32.5,29.7,27.3,25.5,23.8,22.5,21.5,20.5,19.7,19,18.7,18.3,18,18,18,18.3,18.7,19.2,19.8,20.5,21.5,22.7,24,25.7,27.5,29.8,32.7,36.5,42.3,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,58.3,63.7,67.3,70.2,72.5,74.3,76,77.3,78.3,79.3,80.2,80.8,81.2,81.5,81.8,81.8,81.7,81.5,81.2,80.7,80,79.3,78.3,77.2,75.8,74.2,72.3,70,67.2,63.3,57.5,null,null,null,null,null,null]},
  '🦢': {t:[null,null,null,null,null,null,null,null,null,null,null,52.8,47,43.3,40.7,49.5,45,42,39.5,37.5,35.8,31.3,30.8,30.5,31.7,31.2,31.8,32.5,31,31.5,36,37.7,39.7,42.2,45.3,50,40.8,43.7,47.3,53.5,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,51,49,47.8,47.3,47.2,47.3,47.8,40,35.8,32.8,30.5,28.7,27,25.7,24.5,23.7,22.8,22.2,21.8,21.5,21.3,21.2,21.3,21.5,21.8,22.3,23,23.7,24.7,25.8,27.2,28.7,30.7,33,36.2,40.5,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,55.3,53.2,51.2,50.2,50,50.2,50.7,59.8,64,67,69.3,71.2,72.8,74.2,75.3,76.2,77,77.5,78,78.3,78.5,78.7,78.5,78.3,78,77.5,76.8,76.2,75.2,74,72.7,71.2,69.2,66.8,63.7,59.3,null,null,null,null,null,null]},
  '🦈': {t:[null,null,null,null,null,null,null,51.2,56.2,48,44.2,41.5,50.8,46,42.7,40.3,38.3,36.5,35.2,30.8,30.3,29.8,29.5,29.2,29,29,29,29.2,29.5,29.8,30.3,30.8,35.3,36.7,38.5,40.5,43,46.3,51.3,41.7,44.5,48.5,null,51.2,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,40.7,34.8,30.8,27.7,25.3,23.3,21.5,20.2,19,18,17.3,13.2,13.2,13.2,13.2,13.2,16.3,16.8,17.3,18.2,19.2,20.3,21.7,23.5,25.2,26.7,28.8,32,37,null,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,59.2,65,69,72.2,74.5,76.5,78.3,79.7,80.8,81.8,82.5,86.7,86.7,86.7,86.7,86.7,83.5,83,82.5,81.7,80.7,79.5,78.2,76.3,74.7,73.2,71,67.8,62.8,null,null,null,null,null,null,null]},
  '🦭': {t:[null,null,null,null,null,null,null,null,null,52.3,47.3,44,58,49.5,45.5,42.7,40.3,38.5,36.8,32,31.3,30.8,30.5,30.2,30,30,30,30.2,30.5,31,31.5,32.2,36.8,38.5,40.5,42.8,45.8,50,41.7,44.3,47.7,53,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,47.8,38,33.3,30,27.5,25.3,23.5,22,20.8,19.7,18.8,18.2,17.7,17.3,17,17,17.2,17.3,17.7,18.2,19,19.8,20.8,22.2,23.3,25.5,27.7,30.3,33.7,38.5,null,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,52,61.8,66.5,69.8,72.3,74.5,76.3,77.8,79,80.2,81,81.7,82.2,82.5,82.8,82.8,82.7,82.5,82.2,81.7,80.8,80,79,77.7,76.5,74.3,72.2,69.5,66.2,61.3,null,null,null,null,null,null]},
  '🐻‍❄️': {t:[null,null,null,null,null,null,null,null,47.2,42.7,39.5,50.5,44.7,41,38,35.7,33.7,32,30.5,26.2,25.5,25,24.7,24.5,24.3,24.2,24.3,24.5,24.7,25.2,25.7,26.2,30.7,32.2,33.8,35.8,38.3,41.2,45.2,51.3,39.7,43,47.7,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,38.3,33.3,29.8,27,24.7,22.8,21,19.7,18.5,17.3,16.5,15.8,15.2,14.8,14.5,14.3,14.2,14.3,14.5,14.8,15.2,15.8,16.5,17.5,18.5,19.8,21.2,22.8,24.8,27.2,30,33.7,38.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,61.5,66.5,70,72.8,75.2,77,78.8,80.2,81.3,82.5,83.3,84,84.7,85,85.3,85.5,85.7,85.5,85.3,85,84.7,84,83.3,82.3,81.3,80,78.7,77,75,72.7,69.8,66.2,61,null,null,null,null,null]},
  '🦃': {t:[null,null,null,null,null,null,null,null,null,null,null,null,null,62,53.5,49.5,46.8,56.3,51.3,48,45.5,43.7,38.8,38.3,38.2,38,38.2,38.3,38.8,43.8,45.8,48.3,51.5,57,47,49.8,53.8,null,null,null,null,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,48.5,40.5,37.2,34.7,32.7,31,29.7,28.7,27.8,27.2,26.7,26.3,26,26,26.2,26.3,26.7,27.2,27.8,28.8,29.8,31.2,32.8,34.8,37.3,40.8,45.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,51.3,59.3,62.7,65.2,67.2,68.8,70.2,71.2,72,72.7,73.2,73.5,73.7,73.8,73.7,73.5,73.2,72.7,72,71,70,68.7,67,65,62.5,59,54,null,null,null,null,null]},
  '🦍': {t:[null,null,null,null,null,null,null,null,55.8,46.3,41.8,38.7,49.5,43.8,40.2,37.2,34.8,32.8,31.2,28.5,26.2,21.8,21.5,21.2,21,21,21,21.2,21.5,22,26.3,28.7,31.3,33,35,37.5,40.5,44.3,50.2,38.8,42.2,46.8,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,41.3,36.2,33.2,31.3,30.3,28,25.8,24,22.5,21.2,20,19,18.2,17.5,17,16.5,16.2,16,16,16,16.3,16.5,17,17.5,18.2,19,20,21.2,22.5,24.2,26,28.2,30.8,34.2,38.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,58.5,63.7,66.7,68.5,69.5,71.8,74,75.8,77.3,78.7,79.8,80.8,81.7,82.3,82.8,83.3,83.7,83.8,83.8,83.8,83.5,83.3,82.8,82.3,81.7,80.8,79.8,78.7,77.2,75.7,73.8,71.7,69,65.7,61.2,null,null,null,null,null]},
  '🦣': {t:[null,null,null,null,null,null,null,null,null,null,82.8,46.2,41,28.8,52.3,43.3,39.2,25.5,20,20.2,20.8,18.3,20.8,20.8,19.5,15,19.8,20.8,20.8,18.5,20.8,20.2,20,25.8,39.5,43.7,79.2,37.8,41.3,47,84,null,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,45.3,42.3,34.8,29.8,28,26.8,26.2,26,26.2,26.8,27.2,25.8,24.5,23.5,22.8,22.2,21.7,21.3,21.2,21,21.2,21.3,21.7,22.2,22.8,23.7,24.7,25.8,24.3,23,22,21.3,20.7,20.2,19.8,19.7,19.5,19.5,20.3,21.7,24.2,null,null],r:[null,null,null,null,null,null,null,null,54.5,57.5,65,70,71.8,73,73.7,73.8,73.7,73,72.7,74,75.3,76.3,77,77.7,78.2,78.5,78.7,78.8,78.7,78.5,78.2,77.7,77,76.2,75.2,74,75.5,76.8,77.8,78.5,79.2,79.7,80,80.2,80.3,80.3,79.5,78.2,75.7,null,null]},
  '🦖': {t:[null,null,null,null,null,null,null,null,null,50.7,45.8,42.5,56,47.8,44,41.2,39,37.2,35.5,31,30.3,29.8,29.5,29.2,29,29,29,29.2,29.5,29.8,30.3,31,35.7,37.3,39.2,41.5,44.3,48.3,40.3,42.8,46.2,51.3,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,41,35.2,31.3,28.3,26,24,22.3,21,20,19,18.3,17.7,17.3,17,17,17.2,17.3,17.7,18.3,19,20,21.2,22.5,24.2,26,27.2,26.8,30.5,35.2,41.3,49.3,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,58.8,64.7,68.5,71.5,73.8,75.8,77.5,78.8,79.8,80.8,81.5,82.2,82.5,82.8,82.8,82.7,82.5,82.2,81.5,80.8,79.8,78.7,77.3,75.7,73.8,72.7,73,69.3,64.7,58.5,50.3,null,null,null,null,null]},
  '🤖': {t:[null,null,null,null,null,null,null,null,44.5,38.3,35.7,34,40.3,36.8,34.8,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,31,34.8,37.2,40.8,34,35.8,38.7,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,25.3,21.8,19.8,18.3,17.2,16.5,16.2,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16.2,16.5,17.3,18.3,19.8,22.2,25.8,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,74.5,78,80,81.5,82.7,83.3,83.7,83.8,83.8,83.8,83.8,83.8,83.8,83.8,83.8,83.8,83.8,83.8,83.8,83.8,83.8,83.8,83.8,83.7,83.3,82.5,81.5,80,77.7,74,null,null,null,null,null]},
  '👻': {t:[null,null,null,null,null,null,null,null,null,41.2,35,31.3,49,37.7,33,29.8,27.5,25.7,21,20.3,19.8,19.5,19.3,19.2,19,19,19,19.2,19.3,19.5,20,20.3,21,25.8,27.7,30,33.3,38.2,28.8,31.5,35.3,42,null,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,39.2,33,29.3,26.7,24.5,22.8,21.5,20.5,19.7,19,18.3,17.8,17.5,17.3,17.2,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,36.7,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,60.7,66.8,70.5,73.2,75.3,77,78.2,79.3,80.2,80.8,81.5,82,82.3,82.5,82.7,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,82.8,63.2,null,null,null]},
  '👽': {t:[null,null,null,null,null,null,null,null,41.5,35.5,31.8,49.2,38,33.5,30.3,28,26.2,21.3,20.7,20.2,19.8,19.5,19.3,19.2,19,19,19,19.2,19.3,19.5,19.8,20.2,20.7,21.3,26.3,28.2,30.5,33.7,38.5,29.3,32,35.8,42.3,null,null,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,38.5,32,28,25.2,23,21.3,19.8,18.7,17.8,17,16.5,16,15.7,15.3,15.2,15,15,15,15.2,15.3,15.7,16,16.5,17,17.7,18.3,19.3,20.3,21.5,22.8,24.3,26,28,30,32.5,35.2,38.2,43.3,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,61.3,67.8,71.8,74.7,76.8,78.5,80,81.2,82,82.8,83.3,83.8,84.2,84.5,84.7,84.8,84.8,84.8,84.7,84.5,84.2,83.8,83.3,82.8,82.2,81.5,80.5,79.5,78.3,77,75.5,73.8,71.8,69.8,67.3,64.7,61.7,56.5,null,null,null]},
  '🎃': {t:[null,null,null,null,null,58,49.8,46,43,52.7,47.7,44.3,41.8,39.7,36.2,33.2,29.3,30.3,30,29.5,29,28.7,28.3,28.2,28,28,28,28.2,28.3,28.7,29,29.5,30,30.2,29.3,33.3,36.5,39.8,42,44.7,48,53.2,43.3,46.2,50.2,null,null,null,null,null,null],l:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,47.3,26.3,24,22.3,21.2,20.2,18.7,16.8,15.3,14,12.8,12,11.2,10.7,10.3,10,10,10.2,10.3,10.7,11.3,12,13,14.2,15.5,17,18.8,20.2,21.2,22.5,24.2,26.7,null,null,null,null,null],r:[null,null,null,null,null,null,null,null,null,null,null,null,null,null,52.5,73.5,75.8,77.5,78.7,79.7,81.2,83,84.5,85.8,87,87.8,88.7,89.2,89.5,89.8,89.8,89.7,89.5,89.2,88.5,87.8,86.8,85.7,84.3,82.8,81,79.7,78.7,77.3,75.7,73.2,null,null,null,null,null]}
};

const KOP_LAAG_ACHTER = ['🦁', '🐑', '🦔', '🐌'];   // bij deze dieren is de manen/wol/stekels/schelp de bovenkant van het hoofd
// Bij deze dieren is de kop zelf smaller dan het profiel (manen/wol/stekels): hoeden iets kleiner
const KOP_SCHAAL = { '🦁': 0.74, '🐑': 0.72, '🦔': 0.75, '🐌': 0.8, '🐸': 0.56, '🐊': 0.58, '🦀': 0.66, '🦚': 1.35 };
// Dieren met de ogen bovenop de kop (de ogen worden NA de hoed getekend, dus de hoed zit erachter):
// hier gaat de hoed-passing uit van deze "gezichtslijn" in plaats van de ogen, en de hoed wordt kleiner
const KOP_HOED_OGEN = { '🐸': 56, '🐊': 52, '🦀': 54 };
const KOP_HOED_VOOR = ['🐸', '🐊'];     // hier staat de hoed vóór de uitpuilende ogen, tussen de ogen in
const KOP_HANDMATIG = [];

function kopWaarde(rij, pos) {                         // rij met punten om de 2 eenheden, lineair ertussen
  const i = Math.max(0, Math.min(rij.length - 1.001, pos / 2));
  const a = Math.floor(i), f = i - a;
  const y0 = rij[a], y1 = rij[a + 1];
  if (y0 == null && y1 == null) return null;
  if (y0 == null) return y1;
  if (y1 == null) return y0;
  return y0 + (y1 - y0) * f;
}

// Vorm van de kop van een dier (met de afgeleide maten), of null als we hem niet kennen
const KOP_CACHE = {};
function kopVan(dier, tekening) {
  if (KOP_CACHE[dier]) return KOP_CACHE[dier];
  let p = KOP_PROFIEL[dier];
  if (!p && AANGEPASTE_POPPETJES[dier]) {          // zelfgemaakt poppetje: ronde kop (ellips 50,60 / 32x31)
    const t = [], l = [], r = [];
    for (let i = 0; i <= 50; i++) {
      const dxx = (i * 2 - 50) / 32, v = 1 - dxx * dxx;
      t.push(v > 0 ? Math.round((60 - 31 * Math.sqrt(v)) * 10) / 10 : null);
      const dyy = (i * 2 - 60) / 31, w = 1 - dyy * dyy;
      l.push(w > 0 ? Math.round((50 - 32 * Math.sqrt(w)) * 10) / 10 : null);
      r.push(w > 0 ? Math.round((50 + 32 * Math.sqrt(w)) * 10) / 10 : null);
    }
    p = { t, l, r };
  }
  if (!p) return null;
  const o = { y: KOP_HOED_OGEN[dier] || tekening.ogen.y };
  const k = { t: p.t, l: p.l, r: p.r };
  let topmin = 999;
  k.t.forEach(v => { if (v != null && v < topmin) topmin = v; });
  k.topmin = topmin;
  const yl = kopWaarde(k.l, o.y), yr = kopWaarde(k.r, o.y);
  k.W = (yl != null && yr != null) ? yr - yl : 70;                  // breedte van het hoofd op ooghoogte
  k.links = yl != null ? yl : 15; k.rechts = yr != null ? yr : 85;
  if (KOP_SCHAAL[dier]) k.W *= KOP_SCHAAL[dier];
  KOP_CACHE[dier] = k;
  return k;
}
const kopTop = (k, x) => { const v = kopWaarde(k.t, x); return v == null ? null : v; };
// hoogte van de bovenkant van het hoofd op x; buiten het hoofd: de dichtstbijzijnde rand
function kopTopOfRand(k, x, vang) {
  const v = kopTop(k, x);
  return v == null ? vang : v;
}
// hoek (graden) van de bovenrand van het hoofd op x
function kopHoek(k, x) {
  const a = kopTop(k, x - 3), b = kopTop(k, x + 3);
  if (a == null || b == null) return 0;
  return Math.atan2(b - a, 6) * 180 / Math.PI;
}
const rd = v => Math.round(v * 100) / 100;

// ---------------------------------------------------------------------------
// Hoeden die als één stuk op het hoofd gezet worden.
//   w = breedte van de hoed (met rand), f = hoeveel van de kopbreedte die inneemt,
//   c = halve breedte waar de hoed het hoofd raakt, d = hoe diep de onderkant zakt,
//   u = hoeveel de onderkant (midden) onder de hoedlijn uitsteekt
// ---------------------------------------------------------------------------
const HOED_PAS = {
  '🎩': { w: 104, f: 0.86, c: 34, d: 3, u: 5 , h: 78 },
  '👑': { w: 100, f: 0.66, c: 41, d: 2, u: 1 , h: 66 },
  '🎓': { w: 124, f: 1.0,  c: 30, d: 1, u: 5 , h: 56 },
  '🧢': { w: 88,  f: 0.98, c: 42, d: 2, u: 6, dx: 4 , h: 55 },
  '🤠': { w: 156, f: 1.22, c: 34, d: 3, u: 6 , h: 56 },
  '👒': { w: 144, f: 1.15, c: 33, d: 3, u: 5 , h: 50 },
  '🎅': { w: 104, f: 1.0,  c: 44, d: 2, u: 1, dx: 4 , h: 72 },
  '🧙': { w: 112, f: 1.05, c: 33, d: 3, u: 6 , h: 104 },
  '👷': { w: 108, f: 1.05, c: 42, d: 2, u: 1 , h: 52 },
  '🥳': { w: 56,  f: 0.40, c: 26, d: 3, u: 4 , h: 86 },
  '🍄': { w: 108, f: 1.04, c: 44, d: 2, u: 6 , h: 68 },
  '🍦': { w: 56,  f: 0.42, c: 24, d: 3, u: 0 , h: 84 },
  '👨‍🍳': { w: 88, f: 0.95, c: 34, d: 2, u: 0 , h: 84 },
  '☠️': { w: 124, f: 1.14, c: 44, d: 2, u: 7 , h: 62 },
  '🚒': { w: 112, f: 1.06, c: 44, d: 2, u: 2 , h: 66 }
};
const HOED_STANDAARD = { w: 100, f: 0.9, c: 36, d: 2, u: 4, h: 70 };   // voor hoeden die we (nog) niet kennen

function hoedPlaats(spec, k, ogenY, schaal) {
  let s = spec.f * k.W * (schaal || 1) / spec.w;
  const halfTop = (kopWaarde(k.r, k.topmin + 10) - kopWaarde(k.l, k.topmin + 10)) / 2 || k.W / 2;
  let y = k.topmin;
  for (let i = 0; i < 60; i++) {
    const xl = 50 - spec.c * s, xr = 50 + spec.c * s;
    const yl = kopTopOfRand(k, xl, ogenY), yr = kopTopOfRand(k, xr, ogenY);
    y = Math.max(yl, yr) + spec.d * s;
    const vrij = ogenY - 5.5 - (y + spec.u * s);               // ruimte tussen hoed en ogen
    const top = y - (spec.h || 70) * s;                        // bovenkant van de hoed moet in beeld blijven
    if (vrij >= 0 && spec.c * s <= halfTop * 0.97 && top >= -22) break;
    s *= 0.97;
  }
  y = Math.min(y, ogenY - 5.5 - spec.u * s);
  return { x: 50 + (spec.dx || 0) * s, y, s };
}

// ---------------------------------------------------------------------------
// Hoeden die meebuigen met de vorm van het hoofd
// ---------------------------------------------------------------------------
function kopLijn(k, xa, xb, op) {                      // lijn langs de bovenkant van het hoofd, "op" eenheden erboven
  let d = '';
  for (let x = xa; x <= xb + 0.01; x += 1.5) {
    const y = kopTopOfRand(k, x, k.topmin + 20) - op;
    d += (d ? ' L' : 'M') + rd(x) + ' ' + rd(y);
  }
  return d;
}

function hoedKoptelefoon(k, o) {
  const W = k.W, ye = o.y - 1, cw = 0.15 * W, ch = 0.27 * W, band = 0.062 * W;
  const xl = kopWaarde(k.l, ye), xr = kopWaarde(k.r, ye);
  const cl = xl + cw * 0.05, cr = xr - cw * 0.05;
  const boven = ye - ch / 2;
  let d = 'M' + rd(cl) + ' ' + rd(boven + 2);
  for (let x = cl + 1.5; x <= cr - 1.4; x += 1.5) {
    const y = Math.min(kopTopOfRand(k, x, boven) - band * 0.5, boven + 1);
    d += ' L' + rd(x) + ' ' + rd(y);
  }
  d += ' L' + rd(cr) + ' ' + rd(boven + 2);
  const cup = x => `<rect x="${rd(x - cw / 2)}" y="${rd(ye - ch / 2)}" width="${rd(cw)}" height="${rd(ch)}" rx="${rd(cw / 2)}" fill="#ff5c9a" stroke="#c92a6d" stroke-width="${rd(band * 0.3)}"/>`;
  return `<path d="${d}" fill="none" stroke="#1f1f2e" stroke-width="${rd(band + W * 0.03)}" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>` +
    `<path d="${d}" fill="none" stroke="#5a5a78" stroke-width="${rd(band)}" stroke-linecap="round" stroke-linejoin="round"/>` + cup(cl) + cup(cr);
}

function hoedKattenoren(k, o) {
  const W = k.W, e = 0.30 * W, bd = 0.05 * W;
  let s = '';
  const xa = 50 - 0.27 * W - e * 0.3, xb = 50 + 0.27 * W + e * 0.3;
  s += `<path d="${kopLijn(k, xa, xb, bd * 0.5)}" fill="none" stroke="#3a3a4d" stroke-width="${rd(bd)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  [-1, 1].forEach(sg => {
    const x = 50 + sg * 0.27 * W, y = kopTopOfRand(k, x, k.topmin + 6), hk = kopHoek(k, x) + sg * 4;
    const buiten = (px, py) => rd(sg * px) + ' ' + rd(py);
    const bb = e / 2;
    const ear = (m) => `M${rd(sg * bb * m)} ${rd(0.12 * e)} L${rd(-sg * bb * m)} ${rd(0.12 * e)} L${rd(sg * 0.2 * e * m)} ${rd(-1.05 * e * m)} Z`;
    s += `<g transform="translate(${rd(x)} ${rd(y + bd * 0.2)}) rotate(${rd(hk)})">` +
         `<path d="${ear(1)}" fill="#3a3a4d" stroke="#3a3a4d" stroke-width="${rd(bd * 0.6)}" stroke-linejoin="round"/>` +
         `<path d="M${rd(sg * bb * 0.5)} ${rd(0.02 * e)} L${rd(-sg * bb * 0.5)} ${rd(0.02 * e)} L${rd(sg * 0.17 * e)} ${rd(-0.7 * e)} Z" fill="#ff9db3"/></g>`;
  });
  return s;
}

function hoedHoorns(k, o) {
  const W = k.W, bw = 0.18 * W, hh = 0.38 * W;
  let s = '';
  [-1, 1].forEach(sg => {
    const x = 50 + sg * 0.25 * W, y = kopTopOfRand(k, x, k.topmin + 6), hk = kopHoek(k, x) + sg * 6;
    const X = v => rd(sg * v);
    s += `<g transform="translate(${rd(x)} ${rd(y + bw * 0.18)}) rotate(${rd(hk)})">` +
         `<path d="M${X(bw * 0.5)} ${rd(bw * 0.15)} Q${X(bw * 1.15)} ${rd(-hh * 0.55)} ${X(bw * 0.6)} ${rd(-hh)} Q${X(-bw * 0.1)} ${rd(-hh * 0.5)} ${X(-bw * 0.5)} ${rd(bw * 0.05)} Z" ` +
         `fill="#e5384b" stroke="#a81f30" stroke-width="${rd(W * 0.025)}" stroke-linejoin="round"/></g>`;
  });
  return s;
}

function hoedAntennes(k, o) {
  const W = k.W, len = 0.40 * W, br = 0.062 * W;
  let s = '';
  [-1, 1].forEach(sg => {
    const x = 50 + sg * 0.15 * W, y = kopTopOfRand(k, x, k.topmin + 4), hk = kopHoek(k, x) + sg * 9;
    const X = v => rd(sg * v);
    s += `<g transform="translate(${rd(x)} ${rd(y + 1.2)}) rotate(${rd(hk)})">` +
         `<path d="M0 0 Q${X(len * 0.04)} ${rd(-len * 0.6)} ${X(len * 0.2)} ${rd(-len)}" fill="none" stroke="#5cbf5c" stroke-width="${rd(W * 0.05)}" stroke-linecap="round"/>` +
         `<circle cx="${X(len * 0.2)}" cy="${rd(-len - br * 0.7)}" r="${rd(br)}" fill="#8be36e" stroke="#3a9a3f" stroke-width="${rd(W * 0.022)}"/></g>`;
  });
  return s;
}

function hoedKrans(k, o) {                              // zweeft boven het hoofd
  const W = k.W, cy = k.topmin - 0.10 * W, rx = 0.27 * W, ry = 0.075 * W;
  return `<ellipse cx="50" cy="${rd(cy)}" rx="${rd(rx)}" ry="${rd(ry)}" fill="none" stroke="#fff6b0" stroke-width="${rd(W * 0.095)}" opacity=".5"/>` +
         `<ellipse cx="50" cy="${rd(cy)}" rx="${rd(rx)}" ry="${rd(ry)}" fill="none" stroke="#ffd23f" stroke-width="${rd(W * 0.05)}"/>`;
}

function hoedStrik(k, o, midden) {
  const W = k.W, s = 0.40 * W / 76;
  const x = midden ? 50 : 50 + 0.22 * W, y = kopTopOfRand(k, x, k.topmin + 6), hk = kopHoek(k, x) + (midden ? 0 : 6);
  return `<g transform="translate(${rd(x)} ${rd(y + 4 * s)}) rotate(${rd(hk)}) scale(${rd(s)})">${ACCESSOIRES['🎀'].tekening(0)}</g>`.replace('translate(0 4) rotate(14)', 'translate(0 0) rotate(0)');
}

const HOED_BIJZONDER = {
  '🎧': hoedKoptelefoon, '😺': hoedKattenoren, '😈': hoedHoorns, '👽': hoedAntennes, '👼': hoedKrans
};

// ---------------------------------------------------------------------------
// Alles bij elkaar: het poppetje als SVG
// ---------------------------------------------------------------------------
let PAS_TELLER = 0;

// Neus van elk dier: [hoogte, straal]. Daar komen de clownsneus en de neus van de grappige bril.
const NEUS_PROFIEL = {'🐶': [64, 5.9], '🐱': [68, 3.2], '🐭': [65, 4.6], '🐹': [64, 4.0], '🐰': [68, 2.6], '🐻': [65, 5.2], '🐼': [67, 5.0], '🐨': [63, 9.7], '🐔': [68, 7.2], '🐧': [66, 6.3], '🦔': [74, 4.5], '🐑': [72, 4.7], '🐿️': [66, 3.6], '🦌': [72, 4.7], '🦝': [68, 4.2], '🦨': [70, 3.9], '🦥': [68, 4.4], '🦦': [67, 4.7], '🦘': [70, 4.2], '🦢': [65, 4.4], '🦭': [66, 5.1], '🐻‍❄️': [65, 5.2]};
function neusVan(dier, o) {
  const n = NEUS_PROFIEL[dier];
  const y = n ? n[0] : o.y + 11;
  const r = n ? Math.max(3.2, Math.min(7, n[1])) : 4.6;
  return { ny: y - o.y, nr: r };
}

function hoedSvg(emoji, tekening, k, dier) {
  const boven = ACCESSOIRES[emoji];
  const oy = KOP_HOED_OGEN[dier] || tekening.ogen.y;
  const kr = tekening.kruin;
  if (!k) {                                             // dier zonder profiel (of ogen bovenop): kruin uit de tekening
    if (boven.customEmoji) {
      const kleur = boven.customKleur || '#f0c04d';
      return `<g transform="translate(${kr.x} ${kr.y}) rotate(${kr.r || 0}) scale(${kr.b / 100})">` +
        `<ellipse cx="0" cy="-8" rx="34" ry="13" fill="${kleur}" opacity=".95"/>` + maakEmojiTekst(boven.customEmoji, 0, -12, 44) + `</g>`;
    }
    const hoed = typeof boven.tekening === 'function' ? boven.tekening(kr.strik) : boven.tekening;
    return `<g transform="translate(${kr.x} ${kr.y}) rotate(${kr.r || 0}) scale(${kr.b / 100})">${hoed}</g>`;
  }
  if (boven.customEmoji) {
    const kleur = boven.customKleur || '#f0c04d';
    const pl = hoedPlaats({ w: 68, f: 0.72, c: 28, d: 4, u: 5 }, k, oy);
    return `<g transform="translate(${rd(pl.x)} ${rd(pl.y)}) scale(${rd(pl.s)})">` +
      `<ellipse cx="0" cy="-8" rx="34" ry="13" fill="${kleur}" opacity=".95"/>` + maakEmojiTekst(boven.customEmoji, 0, -12, 44) + `</g>`;
  }
  if (HOED_BIJZONDER[emoji]) return HOED_BIJZONDER[emoji](k, { y: oy });
  if (emoji === '🎀') return hoedStrik(k, { y: oy }, kr.strik === 0);
  const spec = HOED_PAS[emoji] || HOED_STANDAARD;
  const pl = hoedPlaats(spec, k, oy);
  const hoed = typeof boven.tekening === 'function' ? boven.tekening(0) : boven.tekening;
  return `<g transform="translate(${rd(pl.x)} ${rd(pl.y)}) scale(${rd(pl.s)})">${hoed}</g>`;
}

function brilSvg(emoji, tekening, k, dier) {
  const o = tekening.ogen, bril = ACCESSOIRES[emoji];
  const sc = o.s || o.dx / 28;
  const ox = o.x || 50;
  if (bril.customEmoji) {
    return `<g transform="translate(${ox} ${o.y})"><ellipse cx="0" cy="0" rx="${o.dx + 20 * sc}" ry="${19 * sc}" fill="${bril.customKleur || '#f0c04d'}" opacity=".35"/>` +
      maakEmojiTekst(bril.customEmoji, 0, 0, sc * 60) + `</g>`;
  }
  const nz = neusVan(dier, o);
  let inhoud = bril.bril(o.dx, sc, nz.ny, nz.nr);
  let clip = '', clipAttr = '';
  if (k && !o.vrij) {                                    // pootjes van de bril eindigen bij de rand van het hoofd
    const l = kopWaarde(k.l, o.y - 3), r = kopWaarde(k.r, o.y - 3);
    if (l != null && r != null) {
      const id = 'bp' + (PAS_TELLER++);
      clip = `<clipPath id="${id}"><rect x="${rd(l - 0.8)}" y="-30" width="${rd(r - l + 1.6)}" height="160"/></clipPath>`;
      clipAttr = ` clip-path="url(#${id})"`;
    }
  }
  return clip + `<g${clipAttr}><g transform="translate(${ox} ${o.y})">${inhoud}</g></g>`;
}

function hoekSvg(emoji) {
  const hoekAcc = ACCESSOIRES[emoji];
  if (hoekAcc.customEmoji) {
    return `<g transform="translate(77 -10) scale(1.2)">` +
      `<circle cx="12" cy="12" r="12" fill="${hoekAcc.customKleur || '#f0c04d'}" opacity=".35"/>` +
      maakEmojiTekst(hoekAcc.customEmoji, 12, 12, 24) + `</g>`;
  }
  return `<g transform="translate(77 -10) scale(1.2)">${hoekAcc.tekening}</g>`;
}

// Bouwt het hele poppetje als SVG-tekst: dier + accessoires, passend gemaakt.
function poppetjeSvg(dier, accessoires) {
  let tekening = DIER_TEKENINGEN[dier];
  if (!tekening && AANGEPASTE_POPPETJES[dier]) {
    tekening = tekenAangepastPoppetje(AANGEPASTE_POPPETJES[dier]);
  }
  if (!tekening) return '';
  const acc = geldigeAccessoires(accessoires);
  const k = KOP_HANDMATIG.indexOf(dier) === -1 ? kopVan(dier, tekening) : null;

  let delen = tekening.achter + tekening.hoofd;
  const hoedVoor = KOP_HOED_VOOR.indexOf(dier) !== -1;
  if (acc.boven && !hoedVoor) delen += hoedSvg(acc.boven, tekening, k, dier);
  delen += tekening.voor;
  if (acc.boven && hoedVoor) delen += hoedSvg(acc.boven, tekening, k, dier);
  if (acc.gezicht) delen += brilSvg(acc.gezicht, tekening, k, dier);
  if (acc.hoek) delen += hoekSvg(acc.hoek);

  return `<svg class="poppetje-svg" viewBox="-10 -26 120 126" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${delen}</svg>`;
}
