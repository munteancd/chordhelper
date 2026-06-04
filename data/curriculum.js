// data/curriculum.js
// Level-based curriculum for ChordHelper v3.
// Each level: { id, title, desc, lessons:[...], challenge: songId }
// Each lesson: { id, title, goal, chords:[names], strumming: patternId|null, steps:[text], practice:{chords, bpm} }

// ─── GUITAR ──────────────────────────────────────────────────────────────────

const guitarLevel1 = {
  id: 'g-l1',
  title: 'Primii pași',
  desc: 'Primele acorduri de bază: Em, A, D, G. Pui mâna pe chitară și scoți primele sunete.',
  challenge: 'song-g1',
  lessons: [
    { id: 'g1', title: 'Primul acord: Mi minor (Em)', goal: 'Înveți să ții acordul Em curat.',
      chords: ['Em'], strumming: null,
      steps: [
        'Pune degetul 2 pe coarda A (a 5-a) fret 2, și degetul 3 pe coarda D (a 4-a) fret 2.',
        'Apasă ferm, cu vârful degetelor, aproape de bara de fret.',
        'Ciupește pe rând fiecare coardă: toate trebuie să sune clar, fără buzz.',
      ],
      practice: { chords: ['Em'], bpm: 60 } },
    { id: 'g2', title: 'Al doilea acord: La (A)', goal: 'Înveți acordul A și îl ții curat.',
      chords: ['A'], strumming: null,
      steps: [
        'Degetele 1, 2, 3 pe corzile D, G, B (4-3-2), toate la fret 2.',
        'Coarda A (a 5-a) rămâne liberă; coarda joasă E (a 6-a) nu se cântă.',
        'Ciupește corzile A-D-G-B-e: toate clar.',
      ],
      practice: { chords: ['A'], bpm: 60 } },
    { id: 'g3', title: 'Schimbă între Em și A', goal: 'Treci lin de la Em la A și înapoi.',
      chords: ['Em', 'A'], strumming: 'allDown',
      steps: [
        'Ține Em, apoi A, apoi Em — fără grabă, doar mișcarea degetelor.',
        'Pornește metronomul la 60 BPM. Schimbă acordul la fiecare 4 bătăi.',
        'Lovește o dată în jos pe fiecare bătaie (pattern „Tot în jos").',
      ],
      practice: { chords: ['Em', 'A'], bpm: 60 } },
    { id: 'g4', title: 'Acordul Re (D)', goal: 'Adaugi D la repertoriu.',
      chords: ['D'], strumming: 'allDown',
      steps: [
        'Degetele 1, 3, 2 pe corzile G, B, e (3-2-1): fret 2, 3, 2.',
        'Se cântă doar de la coarda D în jos (primele două corzi groase mute).',
        'Lovește în jos pe fiecare bătaie la 60 BPM.',
      ],
      practice: { chords: ['D'], bpm: 60 } },
    { id: 'g5', title: 'Acordul Sol (G)', goal: 'Înveți G, cel mai întins acord de început.',
      chords: ['G'], strumming: 'downUp',
      steps: [
        'Deget 2 pe E jos (fret 3), deget 1 pe A (fret 2), deget 3 pe e sus (fret 3).',
        'Restul corzilor libere.',
        'Încearcă pattern-ul „Jos-Sus" la 60 BPM.',
      ],
      practice: { chords: ['G'], bpm: 60 } },
    { id: 'g6', title: 'Cântă o progresie: Em – G – D – A', goal: 'Pui totul cap la cap într-o buclă.',
      chords: ['Em', 'G', 'D', 'A'], strumming: 'downUp',
      steps: [
        'Ține fiecare acord câte un rând de 4 bătăi, în ordinea Em → G → D → A.',
        'Pornește la 60 BPM cu pattern „Jos-Sus".',
        'Când e curat, crește la 70 BPM.',
      ],
      practice: { chords: ['Em', 'G', 'D', 'A'], bpm: 60 } },
  ],
};

// Guitar L2: C, E, Am, Dm
// C: [-1,3,2,0,1,0] fingers [0,3,2,0,1,0] — x pe E gros, deget 3 pe A fret 3, deget 2 pe D fret 2, G liber, deget 1 pe B fret 1, e liber
// E: [0,2,2,1,0,0]  fingers [0,2,3,1,0,0] — E jos liber, deget 2 pe A fret 2, deget 3 pe D fret 2, deget 1 pe G fret 1, B și e libere
// Am: [-1,0,2,2,1,0] fingers [0,0,2,3,1,0] — x pe E gros, A liber, deget 2 pe D fret 2, deget 3 pe G fret 2, deget 1 pe B fret 1, e liber
// Dm: [-1,-1,0,2,3,1] fingers [0,0,0,2,3,1] — primele 2 corzi groase mute, D liber, deget 2 pe G fret 2, deget 3 pe B fret 3, deget 1 pe e fret 1
const guitarLevel2 = {
  id: 'g-l2',
  title: 'Major & minor',
  desc: 'Extinzi paleta de acorduri cu C, E, Am și Dm — sună deja ca o piesă adevărată.',
  challenge: 'song-g2',
  lessons: [
    { id: 'g7', title: 'Acordul Do (C)', goal: 'Înveți C, un acord esențial de chitară.',
      chords: ['C'], strumming: null,
      steps: [
        'Coarda E gros (a 6-a) nu se cântă — poți să o amuți cu degetul mare.',
        'Deget 3 pe coarda A (a 5-a) la fret 3.',
        'Deget 2 pe coarda D (a 4-a) la fret 2.',
        'Deget 1 pe coarda B (a 2-a) la fret 1.',
        'Corzile G și e (3-a și 1-a) rămân libere.',
        'Ciupește pe rând corzile A până la e — fiecare trebuie să sune clar.',
      ],
      practice: { chords: ['C'], bpm: 60 } },
    { id: 'g8', title: 'Acordul Mi major (E)', goal: 'Înveți E major — plin și sonor.',
      chords: ['E'], strumming: null,
      steps: [
        'Deget 1 pe coarda G (a 3-a) la fret 1.',
        'Deget 2 pe coarda A (a 5-a) la fret 2.',
        'Deget 3 pe coarda D (a 4-a) la fret 2.',
        'Corzile E jos, B și e (6, 2, 1) rămân libere.',
        'Lovește toate cele 6 corzi — trebuie să sune plin și rotund.',
      ],
      practice: { chords: ['E'], bpm: 60 } },
    { id: 'g9', title: 'Acordul La minor (Am)', goal: 'Înveți Am — sunet întunecat, expresiv.',
      chords: ['Am'], strumming: null,
      steps: [
        'Coarda E gros (a 6-a) nu se cântă.',
        'Coarda A (a 5-a) rămâne liberă.',
        'Deget 2 pe coarda D (a 4-a) la fret 2.',
        'Deget 3 pe coarda G (a 3-a) la fret 2.',
        'Deget 1 pe coarda B (a 2-a) la fret 1.',
        'Coarda e (a 1-a) rămâne liberă.',
        'Ciupește corzile A până la e — fiecare sunet trebuie să fie clar.',
      ],
      practice: { chords: ['Am'], bpm: 60 } },
    { id: 'g10', title: 'Acordul Re minor (Dm)', goal: 'Înveți Dm — acordul cu cel mai trist caracter.',
      chords: ['Dm'], strumming: 'allDown',
      steps: [
        'Primele două corzi groase (E și A) nu se cântă.',
        'Coarda D (a 4-a) rămâne liberă.',
        'Deget 2 pe coarda G (a 3-a) la fret 2.',
        'Deget 3 pe coarda B (a 2-a) la fret 3.',
        'Deget 1 pe coarda e (a 1-a) la fret 1.',
        'Lovește ușor numai corzile D-G-B-e.',
      ],
      practice: { chords: ['Dm'], bpm: 60 } },
    { id: 'g11', title: 'Schimbă C și Am', goal: 'Treci rapid între C și Am — au un deget comun.',
      chords: ['C', 'Am'], strumming: 'downUp',
      steps: [
        'Observă că degetul 1 stă pe B fret 1 în ambele acorduri — nu-l ridica!',
        'Din C, ridici degetele 2 și 3 și le repozițio­nezi: deget 2 pe D fret 2, deget 3 pe G fret 2.',
        'Exersează tranziția lent, fără metronom, 10 repetări.',
        'Pornește metronomul la 60 BPM, schimbă la fiecare 4 bătăi.',
      ],
      practice: { chords: ['C', 'Am'], bpm: 60 } },
    { id: 'g12', title: 'Progresie L2: Am – C – Dm – E', goal: 'Unești acordurile de nivel 2 într-o buclă dramatică.',
      chords: ['Am', 'C', 'Dm', 'E'], strumming: 'downUp',
      steps: [
        'Ordinea: Am → C → Dm → E, câte 4 bătăi fiecare.',
        'Pattern „Jos-Sus" la 60 BPM.',
        'Concentrează-te pe tranziția Dm → E — ridici toate degetele și le repui.',
        'Când e curat, încearcă 70–80 BPM.',
      ],
      practice: { chords: ['Am', 'C', 'Dm', 'E'], bpm: 60 } },
  ],
};

// Guitar L3: E7, A7, D7, C7
// E7: [0,2,0,1,0,0] fingers [0,2,0,1,0,0] — deget 2 pe A fret 2, deget 1 pe G fret 1, restul libere
// A7: [-1,0,2,0,2,0] fingers [0,0,2,0,3,0] — x E gros, A liber, deget 2 pe D fret 2, G liber, deget 3 pe B fret 2, e liber
// D7: [-1,-1,0,2,1,2] fingers [0,0,0,2,1,3] — primele 2 mute, D liber, deget 2 pe G fret 2, deget 1 pe B fret 1, deget 3 pe e fret 2
// C7: [-1,3,2,3,1,0] fingers [0,3,2,4,1,0] — x E gros, deget 3 pe A fret 3, deget 2 pe D fret 2, deget 4 pe G fret 3, deget 1 pe B fret 1, e liber
const guitarLevel3 = {
  id: 'g-l3',
  title: 'Blues & septime',
  desc: 'Acordurile de septimă dau culoare blues și jazz — schimbare mică, efect mare.',
  challenge: 'song-g3',
  lessons: [
    { id: 'g13', title: 'Mi cu septimă (E7)', goal: 'Înveți E7 — Em cu un deget mai puțin.',
      chords: ['E7'], strumming: null,
      steps: [
        'E7 seamănă cu Em, dar scoți degetul 3 de pe coarda D.',
        'Deget 2 pe coarda A (a 5-a) la fret 2.',
        'Deget 1 pe coarda G (a 3-a) la fret 1.',
        'Corzile E jos, D, B, e rămân libere.',
        'Lovește toate 6 corzile — sunetul e deschis, ușor bluesy.',
      ],
      practice: { chords: ['E7'], bpm: 60 } },
    { id: 'g14', title: 'La cu septimă (A7)', goal: 'Înveți A7 — varianta mai colorată a acordului A.',
      chords: ['A7'], strumming: null,
      steps: [
        'Coarda E gros (a 6-a) nu se cântă.',
        'Coarda A (a 5-a) rămâne liberă.',
        'Deget 2 pe coarda D (a 4-a) la fret 2.',
        'Coarda G (a 3-a) rămâne liberă.',
        'Deget 3 pe coarda B (a 2-a) la fret 2.',
        'Coarda e (a 1-a) rămâne liberă.',
        'Alternează A și A7 ca să simți diferența de culoare.',
      ],
      practice: { chords: ['A7'], bpm: 60 } },
    { id: 'g15', title: 'Re cu septimă (D7)', goal: 'Înveți D7 — acordul care „cheamă" G.',
      chords: ['D7'], strumming: 'allDown',
      steps: [
        'Primele două corzi groase (E și A) nu se cântă.',
        'Coarda D (a 4-a) rămâne liberă.',
        'Deget 2 pe coarda G (a 3-a) la fret 2.',
        'Deget 1 pe coarda B (a 2-a) la fret 1.',
        'Deget 3 pe coarda e (a 1-a) la fret 2.',
        'Ciupește corzile D-G-B-e — atenție la degetul 3 pe e, să nu atingă B.',
      ],
      practice: { chords: ['D7'], bpm: 60 } },
    { id: 'g16', title: 'Do cu septimă (C7)', goal: 'Înveți C7 — C cu un deget în plus pe G.',
      chords: ['C7'], strumming: 'allDown',
      steps: [
        'Coarda E gros (a 6-a) nu se cântă.',
        'Deget 3 pe coarda A (a 5-a) la fret 3.',
        'Deget 2 pe coarda D (a 4-a) la fret 2.',
        'Deget 4 (degetul mic) pe coarda G (a 3-a) la fret 3 — acesta este degetul nou față de C!',
        'Deget 1 pe coarda B (a 2-a) la fret 1.',
        'Coarda e (a 1-a) rămâne liberă.',
        'Ciupește corzile A până la e.',
      ],
      practice: { chords: ['C7'], bpm: 60 } },
    { id: 'g17', title: 'Schimbare blues: E7 – A7', goal: 'Treci rapid între E7 și A7 — fundament de 12 bări.',
      chords: ['E7', 'A7'], strumming: 'downUp',
      steps: [
        'Ține E7 4 bătăi, apoi A7 4 bătăi — repetă bucla.',
        'Pattern „Jos-Sus" la 60 BPM.',
        'Simte că ambele sunt acorduri deschise, cu mutări mici de degete.',
      ],
      practice: { chords: ['E7', 'A7'], bpm: 60 } },
    { id: 'g18', title: 'Progresie blues: E7 – A7 – D7 – C7', goal: 'Unești toate acordurile de septimă în blues.',
      chords: ['E7', 'A7', 'D7', 'C7'], strumming: 'downUp',
      steps: [
        'Ordinea: E7 → A7 → D7 → C7, câte 4 bătăi fiecare.',
        'Pattern „Jos-Sus" la 60 BPM.',
        'Tranziția D7 → C7 este cea mai dificilă — exerseaz-o separat mai întâi.',
        'Când curge lin, crește tempoul la 70–75 BPM.',
      ],
      practice: { chords: ['E7', 'A7', 'D7', 'C7'], bpm: 60 } },
  ],
};

// Guitar L4: F (barré), Bm (barré)
// F: [1,3,3,2,1,1] fingers [1,3,4,2,1,1] baseFret 1 — barré complet cu degetul 1 pe fret 1, deget 3 pe A fret 3, deget 4 pe D fret 3, deget 2 pe G fret 2
// Bm: [2,2,4,4,3,2] fingers [1,1,3,4,2,1] baseFret 1 — barré parțial deget 1 pe fret 2 (corzile A,B,e), deget 2 pe G fret 3...
//   Corect: frets [2,2,4,4,3,2] la baseFret 1 înseamnă fret absolut: E=2, A=2, D=4, G=4, B=3, e=2
//   Fingers: 1=barré pe fret 2, 2 pe B(fret 3), 3 pe D(fret 4), 4 pe G(fret 4)
const guitarLevel4 = {
  id: 'g-l4',
  title: 'Barré (avansat)',
  desc: 'Primul barré — F și Bm sunt acorduri esențiale care deschid tot restul gâtului.',
  challenge: 'song-g4',
  lessons: [
    { id: 'g19', title: 'Acordul Fa (F) — primul barré', goal: 'Înveți F, cel mai temut acord pentru începători.',
      chords: ['F'], strumming: null,
      steps: [
        'Degetul 1 apasă simultan toate 6 corzile la fret 1 — acesta este barré-ul.',
        'Rotește ușor degetul 1 spre spatele lui (unghia), nu cu buricul plat — apasă mai eficient.',
        'Deget 3 pe coarda A (a 5-a) la fret 3.',
        'Deget 4 pe coarda D (a 4-a) la fret 3.',
        'Deget 2 pe coarda G (a 3-a) la fret 2.',
        'Ciupește pe rând fiecare coardă — dacă buzz-ul vine din barré, apasă mai aproape de fret.',
        'Exersează barré-ul singur (fără celelalte degete) 2 minute înainte de a pune forma completă.',
      ],
      practice: { chords: ['F'], bpm: 60 } },
    { id: 'g20', title: 'Acordul Si minor (Bm)', goal: 'Înveți Bm — barré complet pe fret 2.',
      chords: ['Bm'], strumming: null,
      steps: [
        'Degetul 1 apasă toate 6 corzile la fret 2 — barré complet (la fel ca F, dar la fret 2).',
        'Deget 2 pe coarda B (a 2-a) la fret 3.',
        'Deget 3 pe coarda D (a 4-a) la fret 4.',
        'Deget 4 pe coarda G (a 3-a) la fret 4.',
        'Coarda E gros și coarda A rămân acoperite de barré (fret 2).',
        'Ciupește pe rând corzile A până la e — fiecare trebuie să sune clar.',
        'Sfat: exersează barré-ul pe fret 2 singur, fără celelalte degete, câteva minute.',
      ],
      practice: { chords: ['Bm'], bpm: 60 } },
    { id: 'g21', title: 'Tranziție G – F', goal: 'Treci de la G deschis la barré-ul F.',
      chords: ['G', 'F'], strumming: 'allDown',
      steps: [
        'Ține G, ridică toate degetele, poziționează barré-ul F pe fret 1.',
        'Exersează lent, fără metronom: G → F → G → F, de 10 ori.',
        'Pornește la 50 BPM — chiar mai lent decât de obicei, pentru că barré-ul cere timp.',
        'Crește la 60 BPM numai când tranziția e curată.',
      ],
      practice: { chords: ['G', 'F'], bpm: 60 } },
    { id: 'g22', title: 'Progresie avansat: Bm – G – D – F', goal: 'Bucla care combină barré cu acorduri deschise.',
      chords: ['Bm', 'G', 'D', 'F'], strumming: 'downUp',
      steps: [
        'Ordinea: Bm → G → D → F, câte 4 bătăi.',
        'Pattern „Jos-Sus" la 50–60 BPM.',
        'Tranziția cea mai grea e D → F — planifică mutarea cu o bătaie înainte.',
        'Răbdare: barré cere săptămâni de practică zilnică — 5 minute pe zi e mai bine decât o oră la 2 săptămâni.',
      ],
      practice: { chords: ['Bm', 'G', 'D', 'F'], bpm: 60 } },
  ],
};

// ─── UKULELE ─────────────────────────────────────────────────────────────────

const ukuleleLevel1 = {
  id: 'u-l1',
  title: 'Primii pași',
  desc: 'Primele acorduri de bază: C, Am, F, G. Pui mâna pe ukulele și scoți primele sunete.',
  challenge: 'song-u1',
  lessons: [
    { id: 'u1', title: 'Primul acord: Do (C)', goal: 'Cel mai ușor acord — un singur deget.',
      chords: ['C'], strumming: null,
      steps: [
        'Deget 3 pe coarda A (prima de jos) la fret 3. Restul libere.',
        'Lovește toate cele 4 corzi de sus în jos cu degetul mare sau arătătorul.',
        'Trebuie să sune clar și rotund.',
      ],
      practice: { chords: ['C'], bpm: 60 } },
    { id: 'u2', title: 'Al doilea acord: La minor (Am)', goal: 'Înveți Am.',
      chords: ['Am'], strumming: null,
      steps: [
        'Deget 2 pe coarda G (a 4-a, cea de sus) la fret 2. Restul libere.',
        'Lovește toate corzile. Sunet trist, frumos.',
      ],
      practice: { chords: ['Am'], bpm: 60 } },
    { id: 'u3', title: 'Schimbă între C și Am', goal: 'Treci lin C ↔ Am.',
      chords: ['C', 'Am'], strumming: 'allDown',
      steps: [
        'Alternează C și Am fără metronom, doar mișcarea.',
        'Apoi 60 BPM, schimbă la fiecare 4 bătăi, lovituri în jos.',
      ],
      practice: { chords: ['C', 'Am'], bpm: 60 } },
    { id: 'u4', title: 'Acordul Fa (F)', goal: 'Adaugi F (două degete).',
      chords: ['F'], strumming: 'allDown',
      steps: [
        'Deget 2 pe G (fret 2) și deget 1 pe E (fret 1).',
        'Lovește toate corzile, verifică să sune curat.',
      ],
      practice: { chords: ['F'], bpm: 60 } },
    { id: 'u5', title: 'Acordul Sol (G)', goal: 'Înveți G pe ukulele.',
      chords: ['G'], strumming: 'island',
      steps: [
        'Degete pe C (fret 2), E (fret 3), A (fret 2) — formă de triunghi.',
        'Încearcă pattern-ul „D DU UDU" rar, la 60 BPM.',
      ],
      practice: { chords: ['G'], bpm: 60 } },
    { id: 'u6', title: 'Cântă o progresie: C – Am – F – G', goal: 'Bucla clasică pe care merg sute de melodii.',
      chords: ['C', 'Am', 'F', 'G'], strumming: 'island',
      steps: [
        'Câte 4 bătăi pe fiecare acord, în ordinea C → Am → F → G.',
        '60 BPM cu „D DU UDU", apoi crește când e curat.',
      ],
      practice: { chords: ['C', 'Am', 'F', 'G'], bpm: 60 } },
  ],
};

// Ukulele L2: D, Em, A, Dm
// Tuning ukulele (de sus în jos vizual, index 0=G, 1=C, 2=E, 3=A)
// D: frets [2,2,2,0] fingers [1,2,3,0] — deget 1 pe G fret 2, deget 2 pe C fret 2, deget 3 pe E fret 2, A liber
// Em: frets [0,4,3,2] fingers [0,3,2,1] — G liber, deget 3 pe C fret 4, deget 2 pe E fret 3, deget 1 pe A fret 2
// A: frets [2,1,0,0] fingers [2,1,0,0] — deget 2 pe G fret 2, deget 1 pe C fret 1, E liber, A liber
// Dm: frets [2,2,1,0] fingers [2,3,1,0] — deget 2 pe G fret 2, deget 3 pe C fret 2, deget 1 pe E fret 1, A liber
const ukuleleLevel2 = {
  id: 'u-l2',
  title: 'Major & minor',
  desc: 'Extinzi paleta cu D, Em, A și Dm — suni deja ca un muzician.',
  challenge: 'song-u2',
  lessons: [
    { id: 'u7', title: 'Acordul Re (D)', goal: 'Înveți D — trei degete pe trei corzi.',
      chords: ['D'], strumming: null,
      steps: [
        'Deget 1 pe coarda G (a 4-a, de sus) la fret 2.',
        'Deget 2 pe coarda C (a 3-a) la fret 2.',
        'Deget 3 pe coarda E (a 2-a) la fret 2.',
        'Coarda A (a 1-a, de jos) rămâne liberă.',
        'Ciupește toate 4 corzile — forma e un zid drept la fret 2.',
      ],
      practice: { chords: ['D'], bpm: 60 } },
    { id: 'u8', title: 'Acordul Mi minor (Em)', goal: 'Înveți Em pe ukulele — accent melancolic.',
      chords: ['Em'], strumming: null,
      steps: [
        'Coarda G (a 4-a) rămâne liberă.',
        'Deget 3 pe coarda C (a 3-a) la fret 4.',
        'Deget 2 pe coarda E (a 2-a) la fret 3.',
        'Deget 1 pe coarda A (a 1-a) la fret 2.',
        'Ciupește toate 4 corzile — atenție, fret 4 pe C cere un pic de extensie.',
      ],
      practice: { chords: ['Em'], bpm: 60 } },
    { id: 'u9', title: 'Acordul La (A)', goal: 'Înveți A pe ukulele — două degete.',
      chords: ['A'], strumming: 'allDown',
      steps: [
        'Deget 2 pe coarda G (a 4-a) la fret 2.',
        'Deget 1 pe coarda C (a 3-a) la fret 1.',
        'Corzile E și A rămân libere.',
        'Lovește toate 4 corzile în jos la 60 BPM.',
      ],
      practice: { chords: ['A'], bpm: 60 } },
    { id: 'u10', title: 'Acordul Re minor (Dm)', goal: 'Înveți Dm — asemănător cu D, dar cu o notă coborâtă.',
      chords: ['Dm'], strumming: 'allDown',
      steps: [
        'Deget 1 pe coarda E (a 2-a) la fret 1 — acesta e degetul cheie care diferă de D.',
        'Deget 2 pe coarda G (a 4-a) la fret 2.',
        'Deget 3 pe coarda C (a 3-a) la fret 2.',
        'Coarda A rămâne liberă.',
        'Compară Dm cu D: singura diferență e degetul 1 pe E fret 1 — simți cum sună mai „trist"?',
      ],
      practice: { chords: ['Dm'], bpm: 60 } },
    { id: 'u11', title: 'Schimbă D și A', goal: 'Treci rapid D ↔ A — ambele au degetul 2 pe G.',
      chords: ['D', 'A'], strumming: 'downUp',
      steps: [
        'Observă că degetul 2 stă pe coarda G fret 2 în ambele acorduri — ține-l fixat!',
        'Din D, ridici degetele 1 și 3 și pui degetul 1 pe C fret 1.',
        'Exersează tranziția fără metronom de 10 ori.',
        '60 BPM cu „Jos-Sus", schimbi la fiecare 4 bătăi.',
      ],
      practice: { chords: ['D', 'A'], bpm: 60 } },
    { id: 'u12', title: 'Progresie L2: D – A – Dm – Em', goal: 'Bucla care combină acordurile de nivel 2.',
      chords: ['D', 'A', 'Dm', 'Em'], strumming: 'downUp',
      steps: [
        'Ordinea: D → A → Dm → Em, câte 4 bătăi.',
        'Pattern „Jos-Sus" la 60 BPM.',
        'Tranziția Em este mai dificilă — degetele fac o săritură mai mare.',
        'Crește la 70 BPM când sună curat.',
      ],
      practice: { chords: ['D', 'A', 'Dm', 'Em'], bpm: 60 } },
  ],
};

// Ukulele L3: C7, A7, D7, G7
// C7: frets [0,0,0,1] fingers [0,0,0,1] — G/C/E libere, deget 1 pe A fret 1
// A7: frets [0,1,0,0] fingers [0,1,0,0] — G liber, deget 1 pe C fret 1, E/A libere
// D7: frets [2,2,2,3] fingers [1,1,1,2] — deget 1 barré pe fret 2 (G,C,E), deget 2 pe A fret 3
// G7: frets [0,2,1,2] fingers [0,2,1,3] — G liber, deget 2 pe C fret 2, deget 1 pe E fret 1, deget 3 pe A fret 2
const ukuleleLevel3 = {
  id: 'u-l3',
  title: 'Septime',
  desc: 'Acordurile de septimă adaugă culoare și feeling — sună mai interesant cu un efort mic.',
  challenge: 'song-u3',
  lessons: [
    { id: 'u13', title: 'Do cu septimă (C7)', goal: 'Înveți C7 — C cu un singur deget adăugat.',
      chords: ['C7'], strumming: null,
      steps: [
        'Deget 1 pe coarda A (a 1-a, de jos) la fret 1.',
        'Corzile G, C și E (corzile 4, 3 și 2) rămân libere.',
        'Compară cu C simplu: C are degetul 3 pe A fret 3, C7 are degetul 1 pe A fret 1 — cu totul altă formă, mai ușoară!',
        'Lovește toate 4 corzile — sunetul e mai tensive, „cheamă" F.',
      ],
      practice: { chords: ['C7'], bpm: 60 } },
    { id: 'u14', title: 'La cu septimă (A7)', goal: 'Înveți A7 — un singur deget pe ukulele.',
      chords: ['A7'], strumming: null,
      steps: [
        'Deget 1 pe coarda C (a 3-a) la fret 1.',
        'Corzile G, E și A rămân complet libere.',
        'E unul dintre cele mai ușoare acorduri pe ukulele — lovește toate 4 corzile.',
        'Alternează A și A7 ca să simți diferența: A e mai plin, A7 mai tensive.',
      ],
      practice: { chords: ['A7'], bpm: 60 } },
    { id: 'u15', title: 'Re cu septimă (D7)', goal: 'Înveți D7 — barré ușor pe fret 2.',
      chords: ['D7'], strumming: 'allDown',
      steps: [
        'Degetul 1 apasă simultan corzile G, C și E la fret 2 (mini barré).',
        'Deget 2 pe coarda A (a 1-a) la fret 3.',
        'Apasă barré-ul cu degetul 1 aproape de fret — mai puțin efort.',
        'Lovește toate 4 corzile în jos la 60 BPM.',
      ],
      practice: { chords: ['D7'], bpm: 60 } },
    { id: 'u16', title: 'Sol cu septimă (G7)', goal: 'Înveți G7 — acordul care pregătește C.',
      chords: ['G7'], strumming: 'allDown',
      steps: [
        'Coarda G (a 4-a) rămâne liberă.',
        'Deget 2 pe coarda C (a 3-a) la fret 2.',
        'Deget 1 pe coarda E (a 2-a) la fret 1.',
        'Deget 3 pe coarda A (a 1-a) la fret 2.',
        'Ciupește pe rând toate 4 corzile — atenție ca fiecare să sune clar.',
      ],
      practice: { chords: ['G7'], bpm: 60 } },
    { id: 'u17', title: 'Schimbă C7 și G7', goal: 'Treci C7 ↔ G7 — progresie clasică de ukulele.',
      chords: ['C7', 'G7'], strumming: 'downUp',
      steps: [
        'C7 e simplu (un deget), G7 mai complex (trei degete).',
        'Din C7 spre G7: adaugi degetele 2 și 3 și muți degetul 1.',
        'Exersează tranziția lent de 10 ori, fără metronom.',
        '60 BPM cu „Jos-Sus", schimbi la fiecare 4 bătăi.',
      ],
      practice: { chords: ['C7', 'G7'], bpm: 60 } },
    { id: 'u18', title: 'Progresie septime: A7 – D7 – G7 – C7', goal: 'Bucla de septime — sună jazz și blues simultan.',
      chords: ['A7', 'D7', 'G7', 'C7'], strumming: 'island',
      steps: [
        'Ordinea: A7 → D7 → G7 → C7, câte 4 bătăi.',
        'Pattern „D DU UDU" la 60 BPM.',
        'Această progresie se numește lanț de cvarte — e baza multor standarde jazz.',
        'Crește la 70 BPM când curg natural.',
      ],
      practice: { chords: ['A7', 'D7', 'G7', 'C7'], bpm: 60 } },
  ],
};

// Ukulele L4: Bb, E
// Bb: frets [3,2,1,1] fingers [3,2,1,1] — deget 3 pe G fret 3, deget 2 pe C fret 2, deget 1 barré pe E+A fret 1
// E: frets [1,4,0,2] fingers [1,4,0,2] — deget 1 pe G fret 1, deget 4 pe C fret 4, E liber, deget 2 pe A fret 2
const ukuleleLevel4 = {
  id: 'u-l4',
  title: 'Avansat',
  desc: 'Bb și E sunt acorduri mai solicitante — odată stăpânite, poți cânta în orice tonalitate.',
  challenge: 'song-u4',
  lessons: [
    { id: 'u19', title: 'Acordul Si bemol (Bb)', goal: 'Înveți Bb — barré parțial, acord de modulare.',
      chords: ['Bb'], strumming: null,
      steps: [
        'Degetul 1 apasă simultan corzile E (a 2-a) și A (a 1-a) la fret 1 — mini barré.',
        'Deget 2 pe coarda C (a 3-a) la fret 2.',
        'Deget 3 pe coarda G (a 4-a) la fret 3.',
        'Ciupește pe rând fiecare coardă — barré-ul pe E și A trebuie să sune clar.',
        'Dacă buzz-ul vine din barré, rotește ușor degetul 1 spre unghie și apasă mai aproape de fret.',
      ],
      practice: { chords: ['Bb'], bpm: 60 } },
    { id: 'u20', title: 'Acordul Mi (E)', goal: 'Înveți E pe ukulele — formă neobișnuită, sună interesant.',
      chords: ['E'], strumming: null,
      steps: [
        'Deget 1 pe coarda G (a 4-a) la fret 1.',
        'Deget 4 (degetul mic) pe coarda C (a 3-a) la fret 4 — extensie mare!',
        'Coarda E (a 2-a) rămâne liberă.',
        'Deget 2 pe coarda A (a 1-a) la fret 2.',
        'Exersează extensia C fret 4 separat — streatch-ul degetului mic se antrenează în timp.',
        'Ciupește toate 4 corzile ușor.',
      ],
      practice: { chords: ['E'], bpm: 60 } },
    { id: 'u21', title: 'Tranziție F – Bb', goal: 'Treci de la F la Bb — au degete comune.',
      chords: ['F', 'Bb'], strumming: 'allDown',
      steps: [
        'Observă că degetul 1 stă pe E (a 2-a) fret 1 în ambele acorduri — ține-l ancorat!',
        'Din F, adaugi degetul 2 pe C fret 2 și degetul 3 pe G fret 3, și extinzi barré-ul la A.',
        'Exersează tranziția de 10 ori fără metronom.',
        '60 BPM, lovituri în jos, schimbi la fiecare 4 bătăi.',
      ],
      practice: { chords: ['F', 'Bb'], bpm: 60 } },
    { id: 'u22', title: 'Progresie avansat: E – A – Bb – F', goal: 'Bucla care combină toate acordurile avansate.',
      chords: ['E', 'A', 'Bb', 'F'], strumming: 'island',
      steps: [
        'Ordinea: E → A → Bb → F, câte 4 bătăi.',
        'Pattern „D DU UDU" la 50–60 BPM.',
        'E → A e tranziția cu salt mare — planifică mutarea.',
        'Când curge lin, crește la 70 BPM.',
      ],
      practice: { chords: ['E', 'A', 'Bb', 'F'], bpm: 60 } },
  ],
};

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

export const CURRICULUM = {
  guitar: [guitarLevel1, guitarLevel2, guitarLevel3, guitarLevel4],
  ukulele: [ukuleleLevel1, ukuleleLevel2, ukuleleLevel3, ukuleleLevel4],
};

// Flat lesson list per instrument, derived — used for backward-compatible progress.
export const LESSONS = {
  guitar: CURRICULUM.guitar.flatMap((lv) => lv.lessons),
  ukulele: CURRICULUM.ukulele.flatMap((lv) => lv.lessons),
};
