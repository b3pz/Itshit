# IT SHIFT // PSX PROTOTYPE — M2.7 LIGHT ESCALATION

## M2.5
La build M2.5 estende la base stabile M2.4 senza modificare la pianta calpestabile M2.3.2.

Sequenza giocabile di apertura:
1. 09:00 — parla con Zia Ale in Segreteria;
2. raggiungi il Reparto IT;
3. parla con l'IT Manager;
4. accedi al PC IT e leggi il ticket prioritario;
5. raggiungi Server / Magazzino IT;
6. ripristina Rack Server 02;
7. torna in IT e aggiorna il Manager;
8. 09:22 — primo intervento chiuso.

Sono stati aggiunti due NPC low-poly, interazioni contestuali e dialoghi concatenati. Mappa, corridoi, porte, collisioni e superficie walkable restano quelli della build stabile.

---

# IT SHIFT // PSX PROTOTYPE M1

Primo ramo 3D separato dalla 2D 1.0.

## M1
- WebGL puro, nessuna dipendenza esterna.
- Studio low-poly prototipale.
- Camera 3/4 inclinata.
- Rendering interno ridotto.
- WASD / frecce.
- Collisioni muri + arredi.
- Percorso test Ingresso → Reparto IT → Server/Magazzino IT.
- E per confermare gli step.
- Joystick + E touch base.

Dopo approvazione: M2 = mappa completa 1:1 + porte + NPC placeholder.


## M1.1 — Render Fix
- corretto il calcolo matriciale in formato column-major compatibile WebGL;
- corretta la matrice view/lookAt;
- camera leggermente più larga per validare subito la scena;
- nessuna modifica a collisioni, stanze o obiettivo M1.


## M1.2 — Camera 3/4 Fix
- camera abbassata drasticamente;
- distanza ridotta;
- punto di mira spostato davanti al player;
- FOV leggermente più stretto;
- player leggermente più grande per leggibilità;
- nessuna modifica a collisioni e percorso.


## M1.3 — Upright Camera Fix
- corretto l'asse X della matrice lookAt;
- eliminata la proiezione specchiata/capovolta;
- pavimento ora sotto il personaggio, camera sopra la scena;
- mantenuta l'inquadratura 3/4 di M1.2;
- nessuna modifica a collisioni o geometria.


## M1.4 — Follow Camera + Doors + Occlusion Avoidance
- camera follow con smoothing;
- camera centrata continuamente sul personaggio;
- distanza camera adattiva: se un muro finisce tra camera e player, la camera si avvicina;
- questo evita che il personaggio resti nascosto dietro pareti alte senza introdurre alpha sorting prematuro;
- aggiunti telai porta visibili verso Reparto IT e Server/Magazzino IT;
- feedback di cambio stanza;
- collisioni e obiettivo M1 preservati.

Nota: il vero wall fade trasparente verrà introdotto quando il renderer passa a mesh separate/materiali ordinabili. In M1.4 la soluzione è camera collision/occlusion avoidance, più robusta per il prototipo.


## M1.5 — Real Doors + Occlusion Fix
- i varchi CORRIDOIO → IT e IT → SERVER sono ora veri buchi nella collisione;
- aggiunte soglie visive a pavimento per individuare subito le porte;
- i muri sono renderizzati separatamente;
- se un muro è tra camera e player viene abbassato a parapetto;
- la collisione del muro resta attiva, cambia solo la sua altezza visiva;
- camera anti-occlusione mantenuta come seconda protezione;
- obiettivo M1 invariato.


# M2 — Full Studio + Minimap

Nuovo milestone:
- studio 3D esteso con blockout di tutti i reparti principali;
- minimappa 2D sempre visibile;
- player marker;
- marker obiettivo;
- stanza corrente evidenziata;
- TAB apre la mappa grande con nomi stanze;
- obiettivo M2: IT → Server → Centrale → apri mappa;
- camera follow e occlusione della M1.5 preservate.

La geometria è ancora blockout: il focus è navigazione, scala e orientamento.


# M2.1 — Navigation Rewrite

Questa build non aggiunge contenuti. Corregge il game feel del M2.

- movimento ora relativo alla camera;
- W/↑ va sempre verso l'alto dello schermo;
- camera follow a distanza fissa, senza zoom improvvisi vicino ai muri;
- muri occludenti abbassati in modo più aggressivo;
- corridoi principali evidenziati a pavimento;
- soglie porte più larghe e visibili da entrambi i lati;
- banner centrale quando si entra in una nuova stanza;
- velocità player leggermente ridotta per controllo indoor;
- minimappa mantenuta e resa più leggibile.

Obiettivo: prima rendere lo studio comprensibile e piacevole da attraversare,
poi continuare con NPC e gameplay.


# M2.2 — Architecture Rebuild

Rebuild strutturale della navigazione.

Principio fondamentale:
3D, collisione e minimappa ora derivano dagli stessi dati:
- `rooms`
- `corridors`
- `doors`

Correzioni:
- layout ricostruito attorno a corridoi continui;
- tutte le porte sono definite una sola volta e usate sia nel 3D sia nella minimappa;
- la mappa 2D mostra le stesse dimensioni del footprint realmente calpestabile;
- corridoi disegnati sulla minimappa;
- porte disegnate sulla minimappa;
- il player non può uscire dal footprint stanze/corridoi;
- rimosso il sistema di muri che spariscono in modo dinamico;
- pareti temporaneamente a cutaway fisso (altezza petto), quindi zero popping grafico;
- camera fissa in distanza e leggermente più alta;
- ingresso nei reparti aggiorna automaticamente l'obiettivo, senza richiedere E.

Questa build punta alla leggibilità architettonica, non alla grafica finale.


# M2.3 — Floor Seam + Minimap Orientation Fix

Correzioni:
- aggiunti `doorConnectors`, zone comuni tra stanza e corridoio;
- i connector sono usati sia per il pavimento sia per la collisione;
- tolleranza collisione aumentata sui bordi dei corridoi;
- dentro una soglia porta i piccoli bordi dei wall collider non possono bloccare il player;
- pavimenti renderizzati con un leggero bleed per eliminare crepe nere raster;
- minimappa ruotata nello stesso sistema di riferimento della camera:
  - alto schermo = alto minimappa;
  - destra schermo = destra minimappa;
- stanze/corridoi disegnati come poligoni ruotati;
- freccia del player sempre orientata verso l'alto della minimappa;
- porte e connector visibili anche sulla minimappa.

Nessun nuovo contenuto: è un fix puro di navigazione.


# M2.4 — Walkable Floor / Peripheral Doors Fix

Fix strutturale della pianta calpestabile, senza aggiungere gameplay o contenuti.

- corridoi ricostruiti come spine reali che non attraversano piu i collider delle stanze;
- aggiunto corridoio sud continuo davanti all'intera fila periferica;
- CUCINA e BAGNI ora hanno porta sul lato realmente raggiungibile dal corridoio;
- colonna est spostata per creare un vero corridoio fisico tra reparti centrali e periferici;
- `doorLinks` generati dai dati porta collegano automaticamente ogni soglia al corridoio piu vicino;
- pavimento renderizzato, collisione, classificazione stanza e minimappa usano lo stesso footprint;
- eliminato il caso in cui una posizione fosse calpestabile ma mostrasse `FUORI MAPPA`;
- validazione collisioni/topologia: 17/17 reparti raggiungibili dallo spawn con raggio player reale.

Obiettivo della build: validare una volta per tutte la navigazione prima di lavorare su horror, eventi e storia.


## M2.4 — CORE GAMEPLAY

Questa build mantiene invariata la pianta M2.3.2 e aggiunge il primo loop giocabile:

1. raggiungi REPARTO IT;
2. avvicinati al PC e premi E;
3. leggi il ticket;
4. raggiungi SERVER / MAGAZZINO IT;
5. interagisci con RACK SERVER 02;
6. chiudi il ticket.

Aggiunti: orologio narrativo, prompt contestuale, oggetti interagibili, dialoghi PC/mobile, missione data-driven e trigger stanza.


## M2.6 // MORNING SHIFT

Secondo blocco della mattina costruito sopra la base stabile M2.5.

Sequenza: primo intervento rack -> Alice/Editoria -> stampante principale -> chiusura ticket -> ticket RENDER_04 -> prima anomalia narrativa.

La prima anomalia resta volutamente sottile: il ticket RENDER_04 risulta aperto alle 10:02 dalla stessa postazione, ma la macchina e spenta e l'ultimo arresto registrato risale alla sera precedente. Nessun jumpscare o effetto horror esplicito in questa milestone.

La geometria della mappa, le porte e la pianta calpestabile M2.3.2 non sono state modificate.


## M2.7 // LIGHT ESCALATION

Continua la base stabile M2.6 senza modificare pianta, porte, collisioni o camera.

Sequenza aggiunta:
- Manager -> Marino / Interior
- PC INTERIOR_03: ripristino mapping SMB
- ritorno in IT e chiusura ticket
- log PBX anomalo dalla Sala Meet Capo
- telefono che squilla
- controllo fisico: cavo rete scollegato, ultimo link PBX registrato il giorno precedente
- ritorno dal Manager: l'anomalia non viene piu liquidata come semplice bug

Orario narrativo finale: 10:58.
