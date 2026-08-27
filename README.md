# IT SHIFT — M4.7 UI / PAUSE / SAVE / ENVIRONMENT FIX

Build root-ready per GitHub Pages.

## File
- `index.html`
- `game.js`
- `itshift_menu.png`
- `README.md`

## M4.7

### Testi e font
- dialoghi molto più grandi
- nuovo font `Courier New` / monospace di fallback
- nome NPC più grande
- hint di avanzamento più leggibile
- HUD, obiettivo, prompt e toast ingranditi
- menu iniziale statico M4.6 mantenuto invariato

### Pausa e salvataggio
- `ESC` apre il menu **PAUSA**
- PAUSA contiene:
  - Riprendi
  - Salva partita
  - Opzioni
  - Salva e torna al menu
- `F5` = salvataggio rapido
- il salvataggio conserva giorno, step narrativo, posizione e orientamento
- feedback visivo `PARTITA SALVATA`
- a ogni cambio giorno compare `CHECKPOINT SALVATO`

### Porte
- corretta la misura dei telai: ora coprono realmente il vano da 1.80 unità
- i montanti arrivano fino ai bordi del muro e non devono più apparire sospesi/staccati

### Corridoi
- rimossi i pochi cestini/oggetti a pavimento usati come riempitivo
- aggiunte targhette e piccole luci integrate ai muri/telai delle porte
- nessun nuovo arredo viene messo nel percorso di passaggio

### Conservato dalla M4.6
- menu statico cliccabile a 3 hotspot
- NPC normali con orientamento stabile; sguardo inquietante solo nelle fasi horror
- postazioni accessibili dal lato corretto
- Stampa 3D open-frame
- Server/Magazzino IT
- tre finali e LMN_01
