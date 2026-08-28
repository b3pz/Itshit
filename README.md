# IT SHIFT — M5.0.1 CAPO EXIT HOTFIX

Hotfix cumulativo sopra M5.0.

## Fix
- Martedì: dopo il dialogo con il Capo non resti più bloccato nella Sala Meet Capo.
- Il salto 11:10 -> 14:15 riprende nel corridoio fuori da Direzione.
- La porta Direzione non si richiude più magicamente subito dopo il dialogo: resta aperta per il resto del martedì.
- Tutto il resto della M5.0 resta invariato.

## File root-ready
- index.html
- game.js
- itshift_menu.png
- hud_frame.png
- day_card_frame.png
- README.md

---

# M5.1 -> M5.5 // PASSATA AUDIO + UI + ILLUSTRAZIONI

Cumulativa sopra M5.0.1, NON ancora playtestata in browser — verificare prima di considerarla il nuovo riferimento stabile.

## Gameplay / logica
- Audio: tutti i canali ambient (bed ufficio, fluorescenti, server, stampante, telefono) e gli SFX puntuali (passi, blip, beep, bussare) erano mixati a un volume quasi impercettibile nonostante masterGain a .72. Alzati ~2.5x.
- CORRIDOIO SUD (quello davanti a Cucina/Bagni/Galleria/Spazio A/Stampanti/Stampa 3D) non aveva nessun corpo illuminante: aggiunte 7 plafoniere.
- Ogni postazione PC aveva un raggio di interazione (1.78) più largo della distanza tra due scrivanie vicine (1.6 in Centrale): le postazioni si rubavano l'interazione a vicenda. Raggio ristretto a .95 + aggiunti 4 punti di avvicinamento mancanti (tra cui la postazione dell'IT Manager, che non ce l'aveva).
- 12 monitor (IT, BIM, Centrale fila 2, Interior, Renderisti, Galleria Digitale) erano orientati dal lato sbagliato rispetto alla sedia: psxCrtShell ora supporta un parametro di direzione (default invariato).
- Anta delle porte chiuse larga 1.10 contro un vano di 1.80: restava staccata dagli stipiti. Portata a 1.74.
- Aggiunta una posa "seduta" al generatore di sprite NPC (16 membri dello staff, prima erano tutti in piedi anche alla scrivania). L'IT Manager era posizionato a >1.5 unità da qualsiasi sedia: riallineato. Se un NPC seduto viene spostato dalla trama (es. Betty in pausa pranzo), torna automaticamente in piedi finché non è di nuovo al proprio posto.

## UI
- Balloon dialoghi, riquadro obiettivo, minimappa, barra di interazione: erano CSS piatto (gradiente + bordo), sostituiti con un trattamento a pannello (bevel + angoli a mirino + scanline), stessa famiglia visiva in tutto l'HUD di gioco.
- `hud_frame.png` e `day_card_frame.png`: sostituiti i placeholder (solo linee) con le illustrazioni definitive.
- Schermata finale: prima un box generico uguale per i 3 ending. Ora ogni finale (`ending_good.png` / `ending_normal.png` / `ending_evil.png`) ha la propria illustrazione a piena immagine, stesso schema del menu principale, testo posizionato nella fascia scura dedicata. Gestito via classi `ending-good/normal/evil` su `#endingScreen`, applicate da `showEnding()`.

## Ancora da fare
- Playtest completo delle 5 giornate e dei 3 finali in browser.
- Verificare a schermo la posa seduta e l'allineamento dei monitor corretti.
- `day_card_frame.png` e le 3 immagini finali sono a piena qualità (~1-1.6MB ciascuna, come `itshift_menu.png`): valutare se ottimizzare ulteriormente dopo il playtest.

---

# M5.6 // FIX DA PRIMO PLAYTEST REALE

- 2 bacheche (Centrale, Editoria) erano posizionate esattamente sopra il vano porta, non solo "vicine a un muro" (il controllo precedente verificava la distanza dal muro ma non la posizione lungo il muro rispetto alla porta). Spostate.
- Tutti i 16 NPC da scrivania avevano ancora uno scarto (0.07-0.71 unità) tra sprite e sedia reale: alcuni (Marino, Render 02) erano fuori dalla soglia che attiva la posa seduta e restavano sempre in piedi; altri erano seduti ma visibilmente scentrati rispetto alla sedia. Ora tutti e 16 coincidono esattamente con la propria sedia, aggiornati in tutte le tabelle dove le coordinate erano duplicate (sprite, interactable, home position post-pranzo).
- Le vetrate di Sala Meet e Sala Meet Capo erano 10 pannelli totali: 6 aggiunti in un secondo momento ("extra glazed frames") avevano l'orientamento sbagliato e non erano agganciati a nessun muro reale, quindi si vedevano come vetri sparsi in mezzo alla stanza. Rimossi, restano i 4 pannelli corretti stretti accanto alla porta come vetrate laterali.




---

# M5.7 // FIX SCHERMO ACCESO NON ALLINEATO

- Il "corpo" del monitor (cornice/tastiera, gia' corretto in M5.6-precedente) e lo schermo che si illumina sono disegnati da due pezzi di codice separati. Il secondo (officeScreens) offsettava sempre lo schermo acceso verso sud, indipendentemente dalla direzione reale del monitor: per le postazioni girate verso ovest (Interior, Renderisti) o sud (IT, BIM, Centrale fila 2) lo schermo restava nel posto sbagliato rispetto alla cornice. Ora rispetta la stessa direzione (7 postazioni "sud", 4 "ovest").


---

# M5.8 // TASCA NON CALPESTABILE IN CORRIDOIO SUD

- Segnalato dall'utente come "un pezzo di mappa non calpestabile" sempre nello stesso punto. Trovato con un vero browser di test (Playwright + Chrome headless, ora disponibile nell'ambiente): tra ogni coppia di stanze sud (Cucina/Bagni/Galleria Digitale/Spazio A/Stampanti/Stampa 3D) restava una fessura di 0.3-0.5 unita' dove NESSUNA delle due stanze forniva il muro di confine verso il corridoio. Il giocatore poteva camminarci dentro: niente pavimento, niente nome-stanza (l'HUD mostrava un generico "CORRIDOIO"), un buco vero e proprio.
- Chiuse tutte e 5 le fessure con brevi tratti di muro. Verificato camminando davvero nella zona con input da tastiera simulato (non solo teletrasporto): prima si attraversava senza ostacoli, ora il muro blocca il passaggio.


---

# M5.9 // NPC SEDUTI (fix vero) + BUCHI NERI FUORI MAPPA

- Posa "seduta" degli NPC: la versione precedente (M5.6) accorciava le gambe lasciando trasparente la parte "tagliata" - dato che sono sprite piatti (billboard) in un mondo 3D, quella trasparenza poteva rivelare oggetti vicini (es. il case scuro del monitor), creando un blocco nero illeggibile invece di una sagoma seduta. Ora la sagoma resta sempre piena/opaca come idle, solo piu' bassa e raccolta - stessa idea ma senza mai creare una finestra su quello che sta dietro.
- I "riquadri neri enormi" segnalati vicino a Cucina e Sala Meet Capo NON erano buchi nel senso proprio: con un vero test di cammino (input da tastiera simulato, non teletrasporto) si e' confermato che la collisione fermava gia' il giocatore in quei punti - il problema e' che oltre quel punto non c'era NESSUNA parete disegnata (l'etichetta stanza diventava "FUORI MAPPA" pochi passi piu' in la), quindi si vedeva nero pieno invece di un muro. Sono le due zone a nord di Corridoio Sud (tratto Cucina/Bagni) e a nord di Sala Meet Capo, dove nessuna stanza e' mai stata definita. Aggiunte pareti vere (collisione + rendering) a chiudere entrambe. Verificato di nuovo camminando: ora si vede una parete uniforme invece del nero.


---

# M5.10 // ARREDAMENTO BAGNO

- Segnalato come "arredamento del bagno fuori". Verificato camminando: i sanitari sono davvero dentro BAGNI (l'etichetta stanza "CORRIDOIO SUD" nello screenshot riflette la posizione del giocatore appena fuori dalla porta aperta, non la posizione dei mobili) - ma la porta e' molto vicina ai sanitari in una stanza piccola, quindi anche da corretti riempiono comunque lo schermo appena ci si affaccia.
- Trovato pero' un problema vero mentre verificavo: il lavandino/specchio (psxBathroomSet) sfondava il muro est del bagno di circa 0.3 unita'. Corretto l'offset cosi' resta dentro la stanza, con uno spazio visibile tra water e lavandino invece che accavallati.


---

# M5.11 // NPC SEDUTI - ORIENTAMENTO BILLBOARD (causa radice)

- Trovata la causa di fondo del "seduti strani": le 16 postazioni da scrivania non erano billboard veri - avevano un orientamento FISSO nello spazio 3D (npcFacingYaw), invece di ruotare sempre verso la telecamera. Avvicinandosi da certi angoli (compreso quello normale di avvicinamento alla scrivania) lo sprite piatto si vedeva quasi di taglio, con parti del corpo che sembravano staccarsi dalla sagoma.
- Ora tutti gli NPC seduti seguono sempre la telecamera come billboard veri, leggibili da qualunque lato ci si avvicini. Verificato da piu' angolazioni, incluse quelle che prima mostravano il problema.
