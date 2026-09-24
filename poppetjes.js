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
  '🥸': { plek: 'gezicht', naam: 'grappige bril', bril: (dx, s) =>
    brilPaar(`<circle cx="0" cy="0" r="19" fill="#fff" fill-opacity=".35" stroke="#26263a" stroke-width="5"/>`, dx, s, '#26263a') +
    `<ellipse cx="0" cy="${dx * 0.95}" rx="${dx * 0.32}" ry="${dx * 0.26}" fill="#f2b28a"/>` +
    `<path d="M${-dx * 0.9} ${dx * 1.35} Q${-dx * 0.4} ${dx * 0.95} 0 ${dx * 1.2} Q${dx * 0.4} ${dx * 0.95} ${dx * 0.9} ${dx * 1.35} Q${dx * 0.5} ${dx * 1.75} 0 ${dx * 1.45} Q${-dx * 0.5} ${dx * 1.75} ${-dx * 0.9} ${dx * 1.35} Z" fill="#5a3a22"/>` },
  '🧐': { plek: 'gezicht', naam: 'monocle', bril: (dx, s) =>
    `<circle cx="${dx}" cy="0" r="${21 * s}" fill="#bfe6ff" fill-opacity=".3" stroke="#d99a06" stroke-width="${4.4 * s}"/>` +
    `<path d="M${dx + 6 * s} ${20 * s} Q${dx + 22 * s} ${44 * s} ${dx + 8 * s} ${66 * s}" stroke="#d99a06" stroke-width="${1.8 * s}" fill="none"/>` },
  '🤡': { plek: 'gezicht', naam: 'clownsneus', bril: (dx, s) =>
    `<circle cx="0" cy="${dx * 1.05}" r="${dx * 0.55}" fill="#e5384b" stroke="#a81f30" stroke-width="${1.6 * s}"/>` +
    `<circle cx="${-dx * 0.18}" cy="${dx * 0.85}" r="${dx * 0.16}" fill="#fff" opacity=".6"/>` },
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
  return {
    achter: `<ellipse cx="50" cy="56" rx="35" ry="37" fill="${kleur}" opacity=".96"/>`,
    hoofd: `<ellipse cx="50" cy="59" rx="31" ry="30" fill="${kleur}"/>` +
      `<ellipse cx="39" cy="55" rx="4" ry="5" fill="#2b2140"/><ellipse cx="61" cy="55" rx="4" ry="5" fill="#2b2140"/>` +
      `<circle cx="38" cy="53" r="1.3" fill="#fff"/><circle cx="60" cy="53" r="1.3" fill="#fff"/>` +
      `<path d="M42 71 Q50 77 58 71" fill="none" stroke="#2b2140" stroke-width="2.5" stroke-linecap="round"/>` +
      `<circle cx="50" cy="67" r="2.5" fill="#ff8fa3"/>` +
      maakEmojiTekst(emoji, 50, 36, 27),
    voor: '',
    kruin: { x: 50, y: 29, b: 46 },
    ogen: { y: 55, dx: 11 }
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

// Bouwt het hele poppetje als SVG-tekst: dier + accessoires, passend gemaakt.
function poppetjeSvg(dier, accessoires) {
  let tekening = DIER_TEKENINGEN[dier];
  if (!tekening && AANGEPASTE_POPPETJES[dier]) {
    tekening = tekenAangepastPoppetje(AANGEPASTE_POPPETJES[dier]);
  }
  if (!tekening) return '';
  const acc = geldigeAccessoires(accessoires);

  let delen = tekening.achter + tekening.hoofd;

  if (acc.boven) {
    const k = tekening.kruin;
    const boven = ACCESSOIRES[acc.boven];
    if (boven.customEmoji) {
      const kleur = boven.customKleur || '#f0c04d';
      delen += `<g transform="translate(${k.x} ${k.y}) rotate(${k.r || 0}) scale(${k.b / 100})">` +
        `<ellipse cx="0" cy="-22" rx="32" ry="12" fill="${kleur}" opacity=".95"/>` +
        maakEmojiTekst(boven.customEmoji, 0, -24, 42) + `</g>`;
    } else {
      const hoed = boven.tekening;
      const hoedTekening = typeof hoed === 'function' ? hoed(k.strik) : hoed;
      delen += `<g transform="translate(${k.x} ${k.y}) rotate(${k.r || 0}) scale(${k.b / 100})">${hoedTekening}</g>`;
    }
  }

  delen += tekening.voor;

  if (acc.gezicht) {
    const o = tekening.ogen;
    // dx = afstand van het midden tot het midden van een oog; s = grootte van de lenzen
    // (standaard passend bij dx; bij dieren met bijzondere ogen, zoals de kikker, apart ingesteld).
    delen += `<g transform="translate(${o.x || 50} ${o.y})">${ACCESSOIRES[acc.gezicht].bril(o.dx, o.s || o.dx / 28)}</g>`;
  }

  if (acc.hoek) {
    const hoekAcc = ACCESSOIRES[acc.hoek];
    if (hoekAcc.customEmoji) {
      delen += `<g transform="translate(77 -10) scale(1.2)">` +
        `<circle cx="12" cy="12" r="12" fill="${hoekAcc.customKleur || '#f0c04d'}" opacity=".35"/>` +
        maakEmojiTekst(hoekAcc.customEmoji, 12, 12, 24) + `</g>`;
    } else {
      delen += `<g transform="translate(77 -10) scale(1.2)">${hoekAcc.tekening}</g>`;
    }
  }

  return `<svg class="poppetje-svg" viewBox="-10 -26 120 126" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${delen}</svg>`;
}
