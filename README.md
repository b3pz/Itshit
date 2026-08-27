# IT SHIFT — M4.5.1 HOTFIX

Hotfix della M4.5 DENSITY & PSX ENVIRONMENT PASS.

## Per GitHub Pages
Carica direttamente nella root del repository:

- `index.html`
- `game.js`
- `README.md`

## Fix critico
La M4.5 poteva fermarsi sulla schermata iniziale perché il nuovo pass di densità ha aumentato molto il numero di vertici della scena. Alcuni ripristini del buffer usavano `V.push(...saved)`: con un array così grande il browser genera `RangeError: Maximum call stack size exceeded` prima di collegare i pulsanti del menu e prima di nascondere il menu DEV.

M4.5.1 sostituisce tutti quei ripristini con una copia iterativa sicura (`restoreV`).

## Verifiche eseguite
- controllo sintattico JavaScript: OK
- boot senza eccezioni runtime: OK
- menu DEV nascosto in release: OK
- pulsante `NUOVO TURNO`: OK
- schermata iniziale si chiude correttamente: OK
- gioco entra su `INGRESSO / SEGRETERIA` con obiettivo `PARLA CON ZIA ALE`: OK

## Tutto il resto
Restano invariati i contenuti M4.5:
- densità ambientale
- geometrie Server / Magazzino IT
- postazioni raggiungibili
- sale meeting caratterizzate
- subfloor continuo
- HUD minimale PSX
- minimappa permanente rimossa
- prompt contestuali
- trama Lunedi–Venerdi e tre finali

I checkpoint DEV restano disponibili con `?dev=1`.
