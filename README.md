# IT SHIFT — M4.4 ENVIRONMENT & GAMEPLAY POLISH

Build root-ready per GitHub Pages.

## File da caricare nella root
- `index.html`
- `game.js`
- `README.md`

## M4.4 — cosa cambia

### Studio meno vuoto
Tutte le aree principali hanno ora un dressing dedicato in stile low-poly/PSX:
- Reception / Segreteria
- HR
- IT
- Server / Magazzino IT
- BIM
- Centrale
- Editoria
- Interior
- Renderisti
- Sala Meet
- Sala Meet Capo
- Cucina
- Bagni
- Galleria Digitale
- Spazio A
- Stampanti
- Stampa 3D

Sono stati aggiunti CRT, sedie, armadi, scaffali, piante, bacheche, lavagne, materiali, scatole, aree break, copier e stampanti 3D. I nuovi elementi di dressing sono per lo più visual-only per non creare nuovi blocchi nella navigazione.

### Sale Meeting
Le due sale meeting non sono più semplici stanze con un tavolo:
- sedute attorno ai tavoli
- lavagna / parete presentazione
- schermi
- armadi e piante
- differenza visiva fra Sala Meet normale e Sala Meet Capo

### Pavimento
Il pass PSX a piastrelle ora copre l'intero studio, corridoi compresi. Non si interrompe più dopo IT/HR.

### Postazioni e interventi
- tutte le workstation principali sono esaminabili
- le postazioni di missione hanno punti di interazione sul lato accessibile della scrivania
- stampante, BIM, Interior, Render, IT, server e telefono non richiedono più di infilarsi dietro al PC
- la stampante ha un punto di accesso frontale più chiaro
- le postazioni non coinvolte in un ticket possono comunque essere esaminate

### NPC
- un NPC non può più sparire mentre il suo dialogo è ancora aperto
- lunedì a pranzo i colleghi restano nelle aree break finché il protagonista non rientra davvero in IT
- mercoledì il gruppo non si teletrasporta via appena termina il dialogo con Zia Ale; Betty rientra per prima perché è l'obiettivo successivo

### HUD / prompt
- HUD sinistro compattato in un singolo pannello PSX
- giorno e orario sono più piccoli e integrati
- obiettivo resta leggibile senza quattro box che si scontrano fra loro
- prompt interazione semplificato: `SPAZIO / PARLA / USA / ESAMINA`
- nomi tecnici mostrati al giocatore ridotti dove non servono
- schermata di ingresso stanza resa più simile a una targhetta / overlay PSX

### Menu
- eliminato lo sfondo prerenderizzato che conteneva già scritte e pulsanti
- il menu ora usa il gioco reale come sfondo oscurato
- nessuna duplicazione fra immagine e pulsanti HTML
- resta: Nuovo turno / Continua / Opzioni
- Cancella salvataggio resta dentro Opzioni
- il contatore finali compare solo dopo aver trovato almeno un finale

## Compatibilità
La chiave di salvataggio resta compatibile con M4.2/M4.3.
