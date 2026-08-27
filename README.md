# IT SHIFT — M4.6 CORE

Build root-ready per GitHub Pages.

## File da caricare nella root

- `index.html`
- `game.js`
- `itshift_menu.png`
- `README.md`

## Core M4.6

### Menu principale
- il menu non viene più costruito graficamente dal motore
- `itshift_menu.png` è la schermata iniziale completa ad alta qualità
- l'HTML aggiunge soltanto 3 hotspot trasparenti esattamente sopra:
  - NUOVO TURNO
  - CONTINUA
  - OPZIONI
- mouse, touch e navigazione da tastiera dei pulsanti restano disponibili
- OPZIONI continua ad aprire il pannello reale per audio / CRT / salvataggio

### NPC
- durante il normale lavoro gli NPC non ruotano continuamente verso il giocatore
- durante un dialogo il personaggio coinvolto può rivolgersi al protagonista
- il camera-follow innaturale viene riutilizzato soltanto per:
  - manifestazioni
  - Capo demoniaco
  - Lorenzo nel reveal finale
  - colleghi rimasti nella fase decaduta del venerdì
- questo rende lo sguardo "zombie" un elemento horror progressivo invece di un comportamento normale

### Corridoi
- rimossi i principali pannelli/mobili aggiunti nel mezzo della circolazione dalla M4.5
- mantenute le luci e la densità dentro le stanze
- piccoli elementi di corridoio sono ora più vicini ai bordi
- pannelli/vetrate delle Sale Meet spostati leggermente all'interno delle stanze

### Stampa 3D
- stampante 3D ridisegnata come struttura aperta con:
  - telaio
  - piano di stampa
  - gantry/testina
  - piccolo pannello di controllo
  - supporto materiale
- la stanza usa una stampante leggibile, un banco di fabbricazione e materiali, invece di più volumi pieni sovrapposti

### Conservato dalla M4.5.1
- hotfix del boot / array grandi
- postazioni accessibili dal lato corretto
- stampante accessibile frontalmente
- altre workstation esaminabili
- Server / Magazzino IT densificato
- pavimento/subfloor continuo
- HUD minimale
- fix NPC durante dialoghi e pranzo
- settimana completa e 3 finali
- LMN_01
