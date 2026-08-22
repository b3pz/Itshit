(() => {
"use strict";
const c=document.getElementById("c"), gl=c.getContext("webgl",{antialias:false,alpha:false});
if(!gl){document.body.innerHTML="<pre>WebGL non disponibile.</pre>";return} gl.clearColor(.025,.035,.03,1);
const roomEl=document.getElementById("room"),objEl=document.getElementById("objText"),toastEl=document.getElementById("toast"),clockEl=document.getElementById("clock"),dayEl=document.getElementById("day"),dayBannerEl=document.getElementById("dayBanner"),promptEl=document.getElementById("interactionPrompt");
const dialogueEl=document.getElementById("dialogue"),dialogueNameEl=document.getElementById("dialogueName"),dialogueTextEl=document.getElementById("dialogueText");
const atmoOverlay=document.getElementById("atmoOverlay"),flickerOverlay=document.getElementById("flickerOverlay"),psxNoise=document.getElementById("psxNoise");
const devMenu=document.getElementById("devMenu"),devButton=document.getElementById("devButton"),devStatusText=document.getElementById("devStatusText");
let tt=0;function toast(t){toastEl.textContent=t;toastEl.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>toastEl.classList.remove("on"),1400)}
const VS=`attribute vec3 aPos;attribute vec3 aCol;uniform mat4 uMVP;varying vec3 vCol;void main(){vCol=aCol;gl_Position=uMVP*vec4(aPos,1.);}`;
const FS=`precision mediump float;varying vec3 vCol;void main(){float q=mod(floor(gl_FragCoord.x+gl_FragCoord.y),2.)*.022;vec3 c=max(vCol-q,0.);c=floor(c*31.0)/31.0;gl_FragColor=vec4(c,1.);}`;
function sh(t,s){const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(x));return x}
const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
const aP=gl.getAttribLocation(pr,"aPos"),aC=gl.getAttribLocation(pr,"aCol"),uM=gl.getUniformLocation(pr,"uMVP"),buf=gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(aP);gl.enableVertexAttribArray(aC);gl.vertexAttribPointer(aP,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(aC,3,gl.FLOAT,false,24,12);
const V=[];
function tri(a,b,c,col){for(const v of[a,b,c])V.push(v[0],v[1],v[2],...col)}
function quad(a,b,c,d,col){tri(a,b,c,col);tri(a,c,d,col)}
function box(x,y,z,w,h,d,col){const x0=x-w/2,x1=x+w/2,y0=y,y1=y+h,z0=z-d/2,z1=z+d/2;
quad([x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],col);quad([x1,y0,z1],[x0,y0,z1],[x0,y1,z1],[x1,y1,z1],col);
quad([x0,y0,z1],[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],col);quad([x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0],col);
quad([x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],col)}
function floorR(x,z,w,d,col,y=-.02){
 const bleed=.035;
 w+=bleed*2;d+=bleed*2;
 quad([x-w/2,y,z-d/2],[x+w/2,y,z-d/2],[x+w/2,y,z+d/2],[x-w/2,y,z+d/2],col);
}
const solids=[];
const wallDefs=[];
function wall(x,z,w,d,h=2.15){
 const def={x,z,w,d,h};
 solids.push(def);
 wallDefs.push(def);
 // Wall render is built dynamically so occluding walls can be lowered.
}
function desk(x,z,w=1.7,d=.65){solids.push({x,z,w,d});box(x,0,z,w,.68,d,[.34,.23,.15]);box(x,.68,z,w,.08,d,[.49,.32,.20])}
function rack(x,z){solids.push({x,z,w:.7,d:.65});box(x,0,z,.7,1.75,.65,[.1,.15,.12])}


// -----------------------------------------------------------------------------
// M3.5 // PSX VISUAL BASE + THE OTHER OFFICE
// A small near-release art-language test covering REPARTO IT + HR + their corridor.
// IMPORTANT: these are visual-only props; no new solids/collisions are introduced.
// The frozen M2.9.2 architecture and all M3.4 gameplay remain unchanged.
// -----------------------------------------------------------------------------
function floorPlate(x,z,w,d,col,y=-.001){
 quad([x-w/2,y,z-d/2],[x+w/2,y,z-d/2],[x+w/2,y,z+d/2],[x-w/2,y,z+d/2],col);
}
function psxTilePatch(cx,cz,w,d,size=.52){
 const x0=cx-w/2,z0=cz-d/2;
 const nx=Math.max(1,Math.floor(w/size)),nz=Math.max(1,Math.floor(d/size));
 const tw=w/nx,td=d/nz;
 for(let iz=0;iz<nz;iz++)for(let ix=0;ix<nx;ix++){
   const col=((ix+iz)&1)?[.245,.252,.235]:[.205,.214,.201];
   floorPlate(x0+tw*(ix+.5),z0+td*(iz+.5),tw-.025,td-.025,col,-.0015);
 }
}
function psxCrtShell(x,z,w=.48){
 // Thick beige CRT casing around the live M3.0 screen.
 box(x,.735,z+.045,w+.13,.40,.19,[.43,.42,.36]);
 box(x,.715,z+.105,w+.18,.27,.13,[.34,.34,.30]);
 box(x,.695,z+.095,.30,.075,.23,[.39,.38,.33]);
 // keyboard + small mouse on the desk, both visual-only
 box(x,.767,z-.32,.58,.025,.17,[.44,.43,.38]);
 box(x+.38,.768,z-.31,.10,.025,.14,[.34,.34,.31]);
}
function psxFilingCabinet(x,z,w=.62,d=.42,h=1.02){
 box(x,0,z,w,h,d,[.34,.35,.32]);
 for(let i=0;i<3;i++){
   box(x+.001,.18+i*.27,z-d/2-.012,w*.74,.018,.018,[.23,.24,.22]);
   box(x,.25+i*.27,z-d/2-.024,.12,.035,.018,[.12,.13,.12]);
 }
}
function psxPlant(x,z){
 box(x,0,z,.34,.34,.34,[.28,.20,.13]);
 box(x-.10,.30,z,.08,.48,.08,[.12,.28,.15]);
 box(x+.08,.38,z+.03,.07,.42,.07,[.15,.34,.18]);
 box(x,.49,z-.05,.08,.34,.08,[.11,.30,.14]);
}
function psxPosterX(x,z,base=[.42,.30,.26],accent=[.66,.55,.30]){
 box(x,.96,z,.025,.62,.72,base);
 box(x-.014,1.08,z,.012,.13,.52,accent);
 box(x-.015,1.34,z+.12,.012,.10,.24,[.72,.70,.58]);
}
function psxWallTrimX(x,z,d){box(x,.015,z,.045,.16,d,[.20,.14,.10]);}
function psxWallTrimZ(x,z,w){box(x,.015,z,w,.16,.045,[.20,.14,.10]);}
function psxFluorescent(x,z,w=1.05){
 box(x,2.105,z,w,.045,.30,[.30,.31,.27]);
 box(x,2.145,z,w*.84,.018,.17,[.72,.72,.60]);
}

function doorFrame(x,z,axis="z",col=[.34,.22,.12]){
 if(axis==="z"){
   box(x-.52,0,z,.12,1.9,.14,col);
   box(x+.52,0,z,.12,1.9,.14,col);
   box(x,1.78,z,1.16,.12,.14,col);
 }else{
   box(x,0,z-.52,.14,1.9,.12,col);
   box(x,0,z+.52,.14,1.9,.12,col);
   box(x,1.78,z,.14,.12,1.16,col);
 }
}

const rooms=[
 // NORTH // dimensioned for final NPC / workstation capacity
 {name:"INGRESSO / SEGRETERIA",x:0,z:10.6,w:5.2,d:4.0,col:[.18,.22,.18],capacity:4},
 {name:"HR",x:-5.0,z:7.0,w:4.0,d:3.6,col:[.23,.20,.22],capacity:1},
 {name:"REPARTO IT",x:-5.0,z:2.9,w:4.0,d:3.8,col:[.16,.23,.18],capacity:2},
 {name:"SALA MEET",x:5.35,z:7.7,w:5.5,d:4.4,col:[.29,.29,.22],capacity:7},
 {name:"SALA MEET CAPO",x:11.9,z:7.7,w:4.4,d:4.4,col:[.27,.24,.20],capacity:5},

 // CENTER
 {name:"SERVER / MAGAZZINO IT",x:-5.0,z:-1.4,w:4.0,d:3.8,col:[.19,.25,.22],capacity:2},
 {name:"CENTRALE",x:5.35,z:2.1,w:5.5,d:6.0,col:[.22,.24,.20],capacity:6},
 {name:"INTERIOR",x:11.7,z:2.1,w:4.0,d:6.0,col:[.26,.22,.20],capacity:2},
 {name:"BIM",x:-5.0,z:-5.7,w:4.0,d:4.0,col:[.18,.22,.24],capacity:2},
 {name:"EDITORIA",x:5.35,z:-3.6,w:5.5,d:4.0,col:[.25,.22,.18],capacity:2},
 {name:"RENDERISTI",x:11.7,z:-3.6,w:4.0,d:4.0,col:[.20,.22,.26],capacity:2},

 // SOUTH // larger shared / social rooms before M3.0 props are mounted
 {name:"CUCINA",x:-9.65,z:-11.0,w:5.0,d:4.6,col:[.25,.22,.18],capacity:6},
 {name:"BAGNI",x:-5.45,z:-11.0,w:2.6,d:4.6,col:[.18,.22,.21],capacity:2},
 {name:"RIFUGIO DIGITALE",x:-1.6,z:-11.0,w:4.4,d:4.6,col:[.18,.20,.26],capacity:3},
 {name:"SPAZIO A",x:3.7,z:-11.0,w:5.2,d:4.6,col:[.20,.25,.22],capacity:6},
 {name:"STAMPANTI",x:8.1,z:-11.0,w:2.6,d:4.6,col:[.23,.23,.20],capacity:2},
 {name:"STAMPA 3D",x:11.1,z:-11.0,w:2.8,d:4.6,col:[.19,.23,.23],capacity:2}
];

const corridors=[
 // Main circulation. Room-facing edges stay aligned with the proven doorway system.
 {name:"CORRIDOIO CENTRALE",x:0,z:0.0,w:3.4,d:17.4,col:[.28,.31,.28]},
 {name:"CORRIDOIO EST",x:8.9,z:0.6,w:1.6,d:18.6,col:[.28,.31,.28]},
 {name:"CORRIDOIO SUD",x:0.2,z:-7.9,w:24.6,d:1.6,col:[.28,.31,.28]}
];

const doors=[
 // room, center x/z, axis: x = opening on vertical wall, z = opening on horizontal wall
 {room:"INGRESSO / SEGRETERIA",x:0,z:8.6,axis:"z"},
 {room:"HR",x:-3.0,z:7.0,axis:"x"},
 {room:"REPARTO IT",x:-3.0,z:2.9,axis:"x"},
 {room:"SERVER / MAGAZZINO IT",x:-3.0,z:-1.4,axis:"x"},
 {room:"BIM",x:-3.0,z:-5.7,axis:"x"},
 {room:"SALA MEET",x:2.6,z:7.7,axis:"x"},
 {room:"SALA MEET CAPO",x:9.7,z:7.7,axis:"x"},
 {room:"CENTRALE",x:2.6,z:2.1,axis:"x"},
 {room:"INTERIOR",x:9.7,z:2.1,axis:"x"},
 {room:"EDITORIA",x:2.6,z:-3.6,axis:"x"},
 {room:"RENDERISTI",x:9.7,z:-3.6,axis:"x"},
 {room:"CUCINA",x:-9.65,z:-8.7,axis:"z"},
 {room:"BAGNI",x:-5.45,z:-8.7,axis:"z"},
 {room:"RIFUGIO DIGITALE",x:-1.6,z:-8.7,axis:"z"},
 {room:"SPAZIO A",x:3.7,z:-8.7,axis:"z"},
 {room:"STAMPANTI",x:8.1,z:-8.7,axis:"z"},
 {room:"STAMPA 3D",x:11.1,z:-8.7,axis:"z"}
];

const doorConnectors=doors.map(d=>({
 name:"PORTA // "+d.room,
 x:d.x,
 z:d.z,
 // Wider, more forgiving doorway footprint so the visible opening and
 // the playable opening finally coincide.
 w:d.axis==="x"?1.55:2.05,
 d:d.axis==="x"?2.15:1.55
}));

function rectsOverlap(a,b,pad=0){
 return Math.abs(a.x-b.x)<=a.w/2+b.w/2+pad &&
        Math.abs(a.z-b.z)<=a.d/2+b.d/2+pad;
}

// Build generous walkable aprons from each doorway to the nearest corridor.
// Even when a door already barely touches a corridor, we still create a short
// bridge to remove thin black seams and micro-gaps in the walkable floor.
const doorLinks=doors.map((d)=>{
 const room=rooms.find(r=>r.name===d.room);
 if(!room)return null;

 if(d.axis==="x"){
   const dir=Math.sign(d.x-room.x)||1;
   let best=null;
   for(const c of corridors){
     const parallelOverlap=Math.min(d.z+.95,c.z+c.d/2)-Math.max(d.z-.95,c.z-c.d/2);
     if(parallelOverlap<=0)continue;
     const edge=dir>0?c.x-c.w/2:c.x+c.w/2;
     const gap=(edge-d.x)*dir;
     if(gap<-0.35||gap>4.4)continue;
     if(!best||Math.abs(gap)<Math.abs(best.gap))best={c,edge,gap};
   }
   if(!best)return null;
   const start=d.x-dir*.34;
   const rawEnd=best.edge+dir*.34;
   let span=Math.abs(rawEnd-start);
   if(span<0.72)span=0.72;
   const mid=(start+rawEnd)/2;
   return {
     name:"ACCESSO // "+d.room,
     x:mid,z:d.z,
     w:span,d:1.80
   };
 }

 const dir=Math.sign(d.z-room.z)||1;
 let best=null;
 for(const c of corridors){
   const parallelOverlap=Math.min(d.x+.95,c.x+c.w/2)-Math.max(d.x-.95,c.x-c.w/2);
   if(parallelOverlap<=0)continue;
   const edge=dir>0?c.z-c.d/2:c.z+c.d/2;
   const gap=(edge-d.z)*dir;
   if(gap<-0.35||gap>4.4)continue;
   if(!best||Math.abs(gap)<Math.abs(best.gap))best={c,edge,gap};
 }
 if(!best)return null;
 const start=d.z-dir*.34;
 const rawEnd=best.edge+dir*.34;
 let span=Math.abs(rawEnd-start);
 if(span<0.72)span=0.72;
 const mid=(start+rawEnd)/2;
 return {
   name:"ACCESSO // "+d.room,
   x:d.x,z:mid,
   w:1.80,d:span
 };
}).filter(Boolean);

const doorClearZones=[...doorConnectors,...doorLinks].map(r=>({
 x:r.x,z:r.z,w:r.w+.34,d:r.d+.34
}));

function pointInsideRect(x,z,r,pad=0){
 return Math.abs(x-r.x)<=r.w/2+pad && Math.abs(z-r.z)<=r.d/2+pad;
}

// M2.9.1 // CONTINUOUS OFFICE FLOOR (geometry preserved in M2.9.2)
// The old black seams were gaps between independent room/corridor rectangles.
// These plates fill the real office footprint underneath them. Walls and doors,
// not missing floor, now define where the player may enter a room.
const commonFloorZones=[
 {name:"AREA COMUNE OVEST",x:-5.0,z:.05,w:4.0,d:17.5,col:[.255,.285,.26]},
 {name:"AREA COMUNE CENTRALE",x:-.2,z:0,w:5.6,d:17.4,col:[.255,.285,.26]},
 {name:"AREA COMUNE EST",x:5.35,z:.6,w:5.5,d:18.6,col:[.255,.285,.26]},
 {name:"PASSAGGIO EST",x:8.9,z:.6,w:1.6,d:18.6,col:[.255,.285,.26]},
 {name:"AREA COMUNE DESTRA",x:11.9,z:.6,w:4.4,d:18.6,col:[.255,.285,.26]},
 {name:"AREA COMUNE NORD",x:0,z:10.6,w:5.2,d:4.0,col:[.255,.285,.26]},
 {name:"AREA COMUNE SUD",x:.2,z:-11.0,w:24.7,d:4.6,col:[.255,.285,.26]}
];

// M2.9.2 // FLOOR STABILITY
// Visual floor layers use tiny, fixed vertical offsets. Collision data is unchanged.
// This removes coplanar polygons (z-fighting / shimmering) while preserving the
// room/corridor colour coding and continuous office floor.
commonFloorZones.forEach(r=>floorR(r.x,r.z,r.w,r.d,r.col,-.050));
rooms.forEach(r=>floorR(r.x,r.z,r.w,r.d,r.col,-.038));
corridors.forEach(r=>floorR(r.x,r.z,r.w,r.d,r.col,-.026));
doorLinks.forEach(r=>floorR(r.x,r.z,r.w,r.d,[.28,.31,.28],-.014));
doorConnectors.forEach(r=>floorR(r.x,r.z,r.w,r.d,[.30,.32,.27],-.006));

function doorFor(roomName){
 return doors.find(d=>d.room===roomName);
}
function wallSegmentForRoom(r){
 const d=doorFor(r.name);
 const t=.14, gap=1.80, h=2.15;
 // top/bottom walls
 if(d && d.axis==="z"){
   const sideZ=d.z<r.z ? r.z-r.d/2 : r.z+r.d/2;
   const leftEdge=r.x-r.w/2,rightEdge=r.x+r.w/2;
   const gapL=d.x-gap/2,gapR=d.x+gap/2;
   if(gapL>leftEdge)wall((leftEdge+gapL)/2,sideZ,gapL-leftEdge,t,h);
   if(gapR<rightEdge)wall((gapR+rightEdge)/2,sideZ,rightEdge-gapR,t,h);
   const otherZ=sideZ===r.z-r.d/2?r.z+r.d/2:r.z-r.d/2;
   wall(r.x,otherZ,r.w,t,h);
   wall(r.x-r.w/2,r.z,t,r.d,h);
   wall(r.x+r.w/2,r.z,t,r.d,h);
 }else if(d && d.axis==="x"){
   const sideX=d.x<r.x ? r.x-r.w/2 : r.x+r.w/2;
   const topEdge=r.z-r.d/2,bottomEdge=r.z+r.d/2;
   const gapA=d.z-gap/2,gapB=d.z+gap/2;
   if(gapA>topEdge)wall(sideX,(topEdge+gapA)/2,t,gapA-topEdge,h);
   if(gapB<bottomEdge)wall(sideX,(gapB+bottomEdge)/2,t,bottomEdge-gapB,h);
   const otherX=sideX===r.x-r.w/2?r.x+r.w/2:r.x-r.w/2;
   wall(otherX,r.z,t,r.d,h);
   wall(r.x,r.z-r.d/2,r.w,t,h);
   wall(r.x,r.z+r.d/2,r.w,t,h);
 }else{
   wall(r.x-r.w/2,r.z,t,r.d,h);wall(r.x+r.w/2,r.z,t,r.d,h);
   wall(r.x,r.z-r.d/2,r.w,t,h);wall(r.x,r.z+r.d/2,r.w,t,h);
 }
}
rooms.forEach(wallSegmentForRoom);

// Outer safety shell follows the enlarged architecture but remains outside the playable floor.
wall(-12.65,-.45,.15,26.5); wall(14.65,-.45,.15,26.5);
wall(1.0,12.85,27.4,.15); wall(1.0,-13.75,27.4,.15);

// Door visualization derived from the SAME door data.
doors.forEach(d=>{
 doorFrame(d.x,d.z,d.axis);
 if(d.axis==="x")box(d.x,.012,d.z,.72,.024,1.45,[.72,.58,.18]);
 else box(d.x,.012,d.z,1.45,.024,.72,[.72,.58,.18]);
});

// M2.9.1 // ROOM SCALE BLOCKOUT
// Furniture is deliberately simple but now represents the intended capacity.
// Main movement aisles remain open for the current player radius.
// M3.0 // REPARTO IT CANONICO: due sole postazioni.
// Una postazione giocatore + una seconda postazione IT. Nessuna terza scrivania.
desk(-5.45,2.85,1.35,.58); desk(-4.20,1.85,1.20,.55);

// SERVER / MAGAZZINO IT
rack(-5.70,-1.35); rack(-4.80,-1.35); desk(-4.75,-2.35,1.75,.55);

// HR // one workstation
desk(-5.10,7.05,1.45,.60);

// CENTRALE // six real workstation footprints, 3 + 3 with a clear central aisle.
desk(3.75,4.15,1.10,.52); desk(5.35,4.15,1.10,.52); desk(6.95,4.15,1.10,.52);
desk(3.75,.05,1.10,.52); desk(5.35,.05,1.10,.52); desk(6.95,.05,1.10,.52);

// BIM // two workstations
desk(-5.55,-5.75,1.25,.56); desk(-4.15,-5.75,1.25,.56);

// EDITORIA // two workstations
desk(4.25,-3.55,1.35,.58); desk(6.35,-3.55,1.35,.58);

// INTERIOR // two workstations, keeping the doorway axis clear
desk(11.65,3.75,1.30,.58); desk(11.65,.45,1.30,.58);

// RENDERISTI // two workstations
desk(11.55,-2.75,1.25,.58); desk(12.35,-4.45,1.25,.58);

// Meeting rooms: larger tables make the new scale readable immediately.
desk(5.45,7.70,3.25,1.05); desk(11.90,7.70,2.60,.95);

// Shared south rooms: intentionally generous before M3.0 props/NPC population.
desk(-9.65,-11.10,2.80,.85);               // cucina table / island
 desk(-1.60,-11.00,2.00,.65);               // rifugio digitale
 desk(3.70,-11.00,2.80,.82);                 // spazio A main table

// M3.4.2 // FINAL-STYLE SAMPLE: REPARTO IT + HR + short central corridor.
// Tile language inspired by late-90s office games: deliberately low-frequency,
// low-resolution forms rather than modern PBR detail.
psxTilePatch(-5.0,2.90,3.72,3.52,.50);
psxTilePatch(-5.0,7.00,3.72,3.30,.50);
psxTilePatch(0,4.85,3.12,4.85,.52);

// Dark wooden/rubber skirting makes rooms read as real interiors in first person.
psxWallTrimX(-6.92,2.90,3.45);psxWallTrimZ(-5.0,1.08,3.72);psxWallTrimZ(-5.0,4.72,3.72);
psxWallTrimX(-6.92,7.00,3.28);psxWallTrimZ(-5.0,5.25,3.72);psxWallTrimZ(-5.0,8.74,3.72);

// Chunky CRT workstations: live screen colours still come from officeState.
psxCrtShell(-5.45,2.85,.48);psxCrtShell(-4.20,1.85,.44);psxCrtShell(-5.10,7.05,.46);

// Non-blocking dressing: filing, plants, wall print and fluorescent panels.
psxFilingCabinet(-6.48,4.28,.58,.38,.95);
psxFilingCabinet(-6.48,8.20,.62,.40,1.02);
psxPlant(-3.55,4.28);psxPlant(-3.55,8.15);
psxPosterX(-6.91,2.30,[.31,.26,.22],[.58,.49,.25]);
psxPosterX(-6.91,7.35,[.28,.31,.30],[.38,.57,.49]);
psxFluorescent(-5.0,2.90,1.10);psxFluorescent(-5.0,7.0,1.10);psxFluorescent(0,4.8,1.25);

// Tiny desk clutter: phone-sized block, mug and paper stacks. Purely cosmetic.
box(-4.92,.765,2.55,.22,.055,.16,[.16,.17,.15]);
box(-5.95,.765,2.72,.09,.11,.09,[.46,.43,.34]);
box(-4.67,.765,1.73,.26,.025,.18,[.66,.64,.54]);
box(-5.62,.765,7.00,.24,.025,.18,[.68,.66,.56]);

// Story devices. Monitor bodies/screens are now rendered by the M3.0 live-office layer.
box(-4.80,.72,-1.35,.18,.18,.06,[.72,.58,.18]);
// M3.5 // Old inventory terminal: visually present from the start, but it only
// becomes relevant on Wednesday. It sits on the existing server workbench and
// introduces no new collision geometry.
psxCrtShell(-4.22,-2.22,.46);

function npcFigure(x,z,bodyCol,headCol=[.69,.52,.40]){
 box(x,0,z,.43,.82,.38,bodyCol);
 box(x,.82,z,.36,.34,.34,headCol);
}
// M2.9 sprites remain the active cast; npcFigure is retained only as fallback/debug.

// Printer in the enlarged STAMPANTI room.
box(8.10,.05,-11.00,.72,.70,.66,[.36,.39,.36]);
box(8.10,.65,-11.00,.58,.18,.54,[.17,.19,.17]);
box(8.10,.80,-11.00,.44,.08,.40,[.49,.50,.45]);

// RENDER_04, INTERIOR_03 and the meeting-room PBX phone are rendered by
// the M3.0 live-office device layer so their state can change at runtime.
// M3.4 // DIREZIONE access reader + electrical panel. Pure visual props;
// frozen architecture/collisions remain untouched.
box(9.58,.90,7.05,.06,.24,.15,[.14,.18,.15]);
box(9.55,.58,8.72,.08,.72,.46,[.22,.24,.21]);
box(9.50,.76,8.72,.025,.10,.28,[.50,.42,.16]);


const interactables=[
 {id:"zia_ale",label:"ZIA ALE",x:-1.55,z:10.55,range:1.35,type:"npc"},
 {id:"it_manager",label:"IT MANAGER",x:-4.05,z:4.00,range:1.32,type:"npc"},
 {id:"pc_it",label:"PC REPARTO IT",x:-5.45,z:2.85,range:1.28,type:"device"},
 {id:"server_rack_02",label:"RACK SERVER 02",x:-4.80,z:-1.35,range:1.25,type:"device"},
 {id:"alice_editoria",label:"ALICE",x:4.55,z:-4.45,range:1.35,type:"npc"},
 {id:"printer_main",label:"STAMPANTE PRINCIPALE",x:8.10,z:-11.00,range:1.35,type:"device"},
 {id:"render_04",label:"POSTAZIONE RENDER_04",x:12.35,z:-4.45,range:1.40,type:"device"},
 {id:"marino_interior",label:"MARINO",x:10.55,z:3.25,range:1.35,type:"npc"},
 {id:"interior_pc_03",label:"PC INTERIOR_03",x:11.65,z:.45,range:1.35,type:"device"},
 {id:"meet_phone",label:"TELEFONO SALA MEET CAPO",x:12.65,z:7.70,range:1.40,type:"device"},
 {id:"bim_02",label:"BIM 02",x:-4.15,z:-5.05,range:1.35,type:"npc"},
 {id:"bim_pc_02",label:"PC BIM 02",x:-4.15,z:-5.75,range:1.28,type:"device"},
 // M3.4 // Tuesday lore/NPC interactables
 {id:"hr_01",label:"BETTY",x:-5.10,z:6.35,range:1.38,type:"npc"},
 {id:"lorenzo",label:"LORENZO",x:-.75,z:9.95,range:1.45,type:"npc"},
 {id:"capo",label:"CAPO",x:9.05,z:7.70,range:1.55,type:"npc"},
 {id:"direzione_door",label:"PORTA DIREZIONE",x:9.34,z:7.70,range:1.35,type:"device"},
 {id:"direzione_panel",label:"QUADRO ELETTRICO DIREZIONE",x:9.28,z:8.72,range:1.35,type:"device"},
 // M3.5 // Wednesday lore devices
 {id:"legacy_terminal",label:"TERMINALE INVENTARIO LEGACY",x:-4.22,z:-2.22,range:1.42,type:"device"},
 {id:"hr_archive_box",label:"ARCHIVIO HR",x:-6.48,z:8.20,range:1.28,type:"device"}
];

// -----------------------------------------------------------------------------
// M3.0 // UFFICIO VIVO — reusable world-state layer
// Geometry stays frozen from M2.9.2. This layer gives devices, lights and doors
// explicit states that future missions/horror events can change without rebuilding
// the map. All doors start OPEN, so current navigation/collision is unchanged.
// -----------------------------------------------------------------------------
const officeState={
 lights:Object.fromEntries(rooms.map(r=>[r.name,"on"])),
 doors:Object.fromEntries(doors.map(d=>[d.room,"open"])),
 devices:{
   pc_it:"on", it_pc_02:"on",
   server_rack_02:"online",
   printer_main:"idle",
   render_04:"off",
   interior_pc_03:"on",
   meet_phone:"idle"
 }
};
function setRoomLight(roomName,state="on"){if(roomName in officeState.lights)officeState.lights[roomName]=state;}
function setDoorState(roomName,state="open"){if(roomName in officeState.doors)officeState.doors[roomName]=state;}
function setDeviceState(id,state){officeState.devices[id]=state;}

// Workstation screens. These match the intended room capacities and are purely
// visual: desks remain the frozen collision geometry. REPARTO IT is exactly 2.
const officeScreens=[
 {id:"pc_it",room:"REPARTO IT",x:-5.45,z:2.85,w:.48},
 {id:"it_pc_02",room:"REPARTO IT",x:-4.20,z:1.85,w:.44},
 {id:"hr_pc_01",room:"HR",x:-5.10,z:7.05,w:.46},
 {id:"bim_pc_01",room:"BIM",x:-5.55,z:-5.75,w:.42},{id:"bim_pc_02",room:"BIM",x:-4.15,z:-5.75,w:.42},
 {id:"central_pc_01",room:"CENTRALE",x:3.75,z:4.15,w:.38},{id:"central_pc_02",room:"CENTRALE",x:5.35,z:4.15,w:.38},{id:"central_pc_03",room:"CENTRALE",x:6.95,z:4.15,w:.38},
 {id:"central_pc_04",room:"CENTRALE",x:3.75,z:.05,w:.38},{id:"central_pc_05",room:"CENTRALE",x:5.35,z:.05,w:.38},{id:"central_pc_06",room:"CENTRALE",x:6.95,z:.05,w:.38},
 {id:"editoria_pc_01",room:"EDITORIA",x:4.25,z:-3.55,w:.44},{id:"editoria_pc_02",room:"EDITORIA",x:6.35,z:-3.55,w:.44},
 {id:"interior_pc_01",room:"INTERIOR",x:11.65,z:3.75,w:.43},{id:"interior_pc_03",room:"INTERIOR",x:11.65,z:.45,w:.43},
 {id:"render_pc_01",room:"RENDERISTI",x:11.55,z:-2.75,w:.42},{id:"render_04",room:"RENDERISTI",x:12.35,z:-4.45,w:.42},
 {id:"legacy_terminal",room:"SERVER / MAGAZZINO IT",x:-4.22,z:-2.22,w:.46}
];
for(const sc of officeScreens){if(!(sc.id in officeState.devices))officeState.devices[sc.id]="on";}

// Small desk phones give the office a working-day feel. Only meet_phone is a
// story interactable for now; the others are already addressable for later acts.
const officePhones=[
 {id:"phone_segreteria",room:"INGRESSO / SEGRETERIA",x:-.70,z:10.30},
 {id:"phone_it",room:"REPARTO IT",x:-5.85,z:2.55},
 {id:"phone_centrale",room:"CENTRALE",x:5.35,z:2.20},
 {id:"meet_phone",room:"SALA MEET CAPO",x:12.65,z:7.70}
];
for(const ph of officePhones){if(!(ph.id in officeState.devices))officeState.devices[ph.id]="idle";}

function deviceScreenColor(state){
 if(state==="off")return [.025,.035,.03];
 if(state==="error"||state==="warn")return [.58,.16,.10];
 if(state==="busy"||state==="printing")return [.66,.50,.10];
 if(state==="online"||state==="ready")return [.12,.55,.22];
 return [.12,.34,.22];
}
function syncOfficeStateFromStory(){
 // M3.4 // Weekday-specific runtime states. Monday keeps the proven legacy path;
 // Tuesday starts clean and only changes the Direzione door/light states.
 if(currentDay===1){
   for(const r of rooms)setRoomLight(r.name,"on");
   for(const d of doors)setDoorState(d.room,"open");
   for(const sc of officeScreens)setDeviceState(sc.id,"on");
   for(const ph of officePhones)setDeviceState(ph.id,"idle");
   setDeviceState("server_rack_02","online");setDeviceState("printer_main","ready");
   setDeviceState("render_04","off");setDeviceState("interior_pc_03","ready");setDeviceState("bim_pc_02","ready");
   // Direzione is deliberately inaccessible until the Capo opens it himself.
   setDoorState("SALA MEET CAPO",storyStep===55?"open":"closed");
   if(storyStep>=53&&storyStep<=55)setRoomLight("SALA MEET CAPO","flicker");
   return;
 }
 if(currentDay===2){
   for(const r of rooms)setRoomLight(r.name,"on");
   for(const d of doors)setDoorState(d.room,"open");
   for(const sc of officeScreens)setDeviceState(sc.id,"on");
   for(const ph of officePhones)setDeviceState(ph.id,"idle");
   setDeviceState("server_rack_02","online");setDeviceState("printer_main","ready");
   setDeviceState("render_04","off");setDeviceState("interior_pc_03","ready");setDeviceState("bim_pc_02","ready");
   setDeviceState("legacy_terminal",storyStep>=62?"warn":"on");
   // During THE OTHER OFFICE the geometry is identical but the living-office
   // layer drops away: lights fail, phones die and most screens go black.
   if(storyStep===63){
     for(const r of rooms)setRoomLight(r.name,((Math.floor(Math.abs(r.x*3+r.z*5))%4)===0)?"flicker":"off");
     for(const sc of officeScreens)setDeviceState(sc.id,sc.id==="legacy_terminal"?"error":"off");
     for(const ph of officePhones)setDeviceState(ph.id,"offline");
   }
   return;
 }
 if(currentDay>=3){
   for(const r of rooms)setRoomLight(r.name,"on");
   for(const d of doors)setDoorState(d.room,"open");
   for(const sc of officeScreens)setDeviceState(sc.id,"on");
   for(const ph of officePhones)setDeviceState(ph.id,"idle");
   setDeviceState("server_rack_02","online");setDeviceState("printer_main","ready");
   setDeviceState("render_04","off");setDeviceState("interior_pc_03","ready");setDeviceState("bim_pc_02","ready");
   return;
 }
 // Monday story drives visible device state, but never changes geometry.
 setDeviceState("server_rack_02",storyStep>=6?"online":(storyStep>=4?"warn":"online"));
 setDeviceState("printer_main",storyStep>=12?"ready":(storyStep>=10?"error":"idle"));
 setDeviceState("render_04","off");
 setDeviceState("interior_pc_03",storyStep>=24?"ready":(storyStep>=21&&storyStep<24?"error":"on"));
 setDeviceState("bim_pc_02",storyStep>=41?"ready":(storyStep>=38&&storyStep<41?"error":"on"));
 setDeviceState("meet_phone",storyStep===27||storyStep===28?"ringing":(storyStep>=29?"offline":"idle"));
 setRoomLight("RENDERISTI",storyStep>=16?"flicker":"on");
 setRoomLight("SALA MEET CAPO",storyStep>=27?"flicker":"on");
 if(storyStep>=35){setRoomLight("SALA MEET","off");setRoomLight("STAMPA 3D","off");}
}

function buildOfficeLiveMesh(now,showDevLightProxies=true){
 const saved=V.slice();V.length=0;
 // Legacy ceiling-light proxies are useful from the 3/4 DEV camera, but in
 // first person they looked like floating boards below the real PSX fixtures.
 if(showDevLightProxies)for(const r of rooms){
   const st=officeState.lights[r.name]||"on";
   let on=st!=="off";
   if(st==="flicker")on=((Math.floor(now/95)+Math.floor(r.x*7+r.z*3))%9)!==0;
   const col=on?[.62,.66,.52]:[.10,.12,.10];
   const lw=Math.min(1.15,Math.max(.62,r.w*.22));
   box(r.x,1.92,r.z,lw,.035,.18,col);
 }
 // Workstation monitors and screen-state LEDs.
 for(const sc of officeScreens){
   const state=officeState.devices[sc.id]||"on";
   box(sc.x,.77,sc.z,sc.w,.34,.09,[.055,.065,.06]);
   const col=deviceScreenColor(state);
   box(sc.x,.82,sc.z-.052,Math.max(.24,sc.w-.08),.22,.018,col);
 }
 // Rack activity LEDs.
 const rackState=officeState.devices.server_rack_02;
 const rackCol=deviceScreenColor(rackState);
 for(let i=0;i<4;i++)box(-4.55+i*.10,.72+i*.18,-1.675,.045,.045,.018,rackCol);
 // Printer status LED.
 const pc=deviceScreenColor(officeState.devices.printer_main);
 box(8.10,.78,-11.335,.10,.06,.018,pc);
 // Phones: a compact base + state LED.
 for(const ph of officePhones){
   const st=officeState.devices[ph.id]||"idle";
   box(ph.x,.71,ph.z,.30,.11,.22,[.13,.15,.13]);
   const col=st==="ringing"?[.72,.56,.12]:(st==="offline"?[.42,.09,.08]:[.11,.34,.18]);
   box(ph.x+.10,.805,ph.z-.115,.055,.04,.018,col);
 }
 // Closed doors are rendered as real leaves. Current story keeps them open.
 for(const d of doors){
   if(officeState.doors[d.room]!=="closed")continue;
   if(d.axis==="x")box(d.x,0,d.z,.10,1.72,1.10,[.30,.19,.11]);
   else box(d.x,0,d.z,1.10,1.72,.10,[.30,.19,.11]);
 }
 const arr=new Float32Array(V);V.length=0;V.push(...saved);return arr;
}

function closedDoorBarrier(d){
 // The architectural doorway cutout is ~1.80 units wide. A closed leaf must
 // seal the WHOLE cutout (plus a small jamb overlap), otherwise the player can
 // squeeze around the visual door in first person.
 return d.axis==="x"
   ?{x:d.x,z:d.z,w:.34,d:2.02}
   :{x:d.x,z:d.z,w:2.02,d:.34};
}
function closedDoorBlocks(x,z){
 for(const d of doors){
   if(officeState.doors[d.room]!=="closed")continue;
   if(hit(x,z,player.r,closedDoorBarrier(d)))return true;
 }
 return false;
}


// -----------------------------------------------------------------------------
// M2.9 // NPC + PSX BILLBOARD SPRITE SYSTEM
// Runtime-generated 32x48 pixel sprites keep the build self-contained while
// giving us a real billboard pipeline. Later PNG sprite sheets can replace
// these textures without changing missions, positions or interaction logic.
// -----------------------------------------------------------------------------
const SPRITE_VS=`attribute vec3 aPos;attribute vec2 aUV;uniform mat4 uMVP;varying vec2 vUV;void main(){vUV=aUV;gl_Position=uMVP*vec4(aPos,1.);}`;
const SPRITE_FS=`precision mediump float;varying vec2 vUV;uniform sampler2D uTex;void main(){vec4 c=texture2D(uTex,vUV);if(c.a<.08)discard;c.rgb=floor(c.rgb*7.0+.5)/7.0;gl_FragColor=c;}`;
const spritePr=gl.createProgram();
gl.attachShader(spritePr,sh(gl.VERTEX_SHADER,SPRITE_VS));
gl.attachShader(spritePr,sh(gl.FRAGMENT_SHADER,SPRITE_FS));
gl.linkProgram(spritePr);
if(!gl.getProgramParameter(spritePr,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(spritePr));
const spPos=gl.getAttribLocation(spritePr,"aPos"),spUV=gl.getAttribLocation(spritePr,"aUV");
const spMVP=gl.getUniformLocation(spritePr,"uMVP"),spTex=gl.getUniformLocation(spritePr,"uTex");
const spriteBuf=gl.createBuffer();

function spriteTexture(pal,state="idle"){
 const cv=document.createElement("canvas");cv.width=32;cv.height=48;
 const x=cv.getContext("2d");x.imageSmoothingEnabled=false;
 const px=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(a,b,w,h)};
 // shadow / shoes / legs
 px("rgba(0,0,0,.35)",7,44,18,3);
 px(pal.legs,10,31,5,12);px(pal.legs,17,31,5,12);
 px("#171817",9,41,7,3);px("#171817",17,41,7,3);
 // torso + collar
 px(pal.body,8,17,16,16);px(pal.accent,12,17,8,3);
 // arms. Talk state raises one hand, making dialogue immediately readable.
 if(state==="talk"){
   px(pal.body,4,18,5,12);px(pal.skin,3,15,5,5);
   px(pal.body,23,20,5,11);px(pal.skin,24,29,4,4);
 }else{
   px(pal.body,4,20,5,11);px(pal.body,23,20,5,11);
   px(pal.skin,4,29,4,4);px(pal.skin,24,29,4,4);
 }
 // head, ears, hair
 px(pal.skin,10,6,12,12);px(pal.skin,8,9,3,6);px(pal.skin,21,9,3,6);
 px(pal.hair,10,4,12,5);px(pal.hair,9,6,3,5);px(pal.hair,20,6,3,5);
 // face pixels
 px("#161817",12,11,2,2);px("#161817",18,11,2,2);
 px(state==="talk"?"#5b2625":"#8b5d4c",14,15,4,state==="talk"?2:1);
 // one bright PSX highlight and outline-ish shoulders
 px(pal.light,9,18,2,9);px("rgba(0,0,0,.28)",22,18,2,13);
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 return tex;
}

// M3.1.1 // FULL OFFICE POPULATION
// Canonical fixed staff: 17 NPCs + the player = 18 people in the studio at peak activity.
// Every fixed NPC exists from 09:00; story missions activate interactions, not existence.
const npcSprites=[
 {id:"zia_ale",name:"ZIA ALE",role:"SEGRETERIA",kind:"staff",x:-1.55,z:10.55,w:.72,h:1.36,from:0,to:999,pal:{body:"#65465f",accent:"#ba8aaf",legs:"#34303a",skin:"#c88f70",hair:"#493126",light:"#d6abc9"}},
 {id:"it_manager",name:"IT MANAGER",role:"IT",kind:"staff",x:-4.05,z:4.00,w:.74,h:1.40,from:0,to:999,pal:{body:"#36546b",accent:"#7394a5",legs:"#252d35",skin:"#bd856a",hair:"#44362f",light:"#8ab5ca"}},
 {id:"hr_01",name:"BETTY",role:"HR",kind:"staff",x:-5.10,z:6.35,w:.70,h:1.35,from:0,to:999,pal:{body:"#6b4c55",accent:"#a97b86",legs:"#332b30",skin:"#cb9475",hair:"#49332f",light:"#c79aa4"}},
 {id:"bim_01",name:"BIM 01",role:"BIM",kind:"staff",x:-5.55,z:-5.05,w:.72,h:1.36,from:0,to:999,pal:{body:"#435f68",accent:"#7999a1",legs:"#293239",skin:"#c89072",hair:"#3c322e",light:"#94adb3"}},
 {id:"bim_02",name:"BIM 02",role:"BIM",kind:"staff",x:-4.15,z:-5.05,w:.72,h:1.36,from:0,to:999,pal:{body:"#5c4f72",accent:"#8d7ba7",legs:"#302c3d",skin:"#c68d70",hair:"#3f3028",light:"#aa97bd"}},
 {id:"central_01",name:"CENTRALE 01",role:"CENTRALE",kind:"staff",x:3.75,z:3.48,w:.70,h:1.35,from:0,to:999,pal:{body:"#4d5668",accent:"#8b97a9",legs:"#2b3038",skin:"#c58e70",hair:"#49372d",light:"#aab4c2"}},
 {id:"central_02",name:"CENTRALE 02",role:"CENTRALE",kind:"staff",x:5.35,z:3.48,w:.70,h:1.35,from:0,to:999,pal:{body:"#665b43",accent:"#a18d63",legs:"#332f27",skin:"#c99173",hair:"#3c3028",light:"#b9a476"}},
 {id:"central_03",name:"CENTRALE 03",role:"CENTRALE",kind:"staff",x:6.95,z:3.48,w:.70,h:1.35,from:0,to:999,pal:{body:"#4b6254",accent:"#7f9b87",legs:"#29342d",skin:"#c58d70",hair:"#342c28",light:"#96b19c"}},
 {id:"central_04",name:"CENTRALE 04",role:"CENTRALE",kind:"staff",x:3.75,z:.72,w:.70,h:1.35,from:0,to:999,pal:{body:"#66505b",accent:"#9d7b88",legs:"#352d32",skin:"#d09a78",hair:"#53382c",light:"#b8939e"}},
 {id:"central_05",name:"CENTRALE 05",role:"CENTRALE",kind:"staff",x:5.35,z:.72,w:.70,h:1.35,from:0,to:999,pal:{body:"#4d5f72",accent:"#8199ac",legs:"#2b323d",skin:"#c88f70",hair:"#3e332e",light:"#98afc0"}},
 {id:"central_06",name:"CENTRALE 06",role:"CENTRALE",kind:"staff",x:6.95,z:.72,w:.70,h:1.35,from:0,to:999,pal:{body:"#625747",accent:"#9f8e6f",legs:"#342f28",skin:"#c88e70",hair:"#453429",light:"#b4a17d"}},
 {id:"alice_editoria",name:"ALICE",role:"EDITORIA",kind:"staff",x:4.55,z:-4.45,w:.70,h:1.35,from:0,to:999,pal:{body:"#72563d",accent:"#bf9564",legs:"#393026",skin:"#d09a77",hair:"#553727",light:"#d9ad78"}},
 {id:"editoria_02",name:"EDITORIA 02",role:"EDITORIA",kind:"staff",x:6.35,z:-4.45,w:.70,h:1.35,from:0,to:999,pal:{body:"#5f5268",accent:"#9784a1",legs:"#322d38",skin:"#c99172",hair:"#49342d",light:"#ad9ab6"}},
 {id:"marino_interior",name:"MARINO",role:"INTERIOR",kind:"staff",x:10.55,z:3.25,w:.73,h:1.39,from:0,to:999,pal:{body:"#4b5942",accent:"#84926f",legs:"#2d3229",skin:"#c28b6d",hair:"#3f332c",light:"#9fad88"}},
 {id:"interior_02",name:"INTERIOR 02",role:"INTERIOR",kind:"staff",x:10.85,z:.45,w:.72,h:1.36,from:0,to:999,pal:{body:"#635346",accent:"#9d856f",legs:"#342e29",skin:"#cb9474",hair:"#46332c",light:"#b49b82"}},
 {id:"render_01",name:"RENDER 01",role:"RENDERISTI",kind:"staff",x:10.85,z:-2.75,w:.72,h:1.36,from:0,to:999,pal:{body:"#49566b",accent:"#7f8fa7",legs:"#29303b",skin:"#c78e70",hair:"#3c302b",light:"#98a6ba"}},
 {id:"render_02",name:"RENDER 02",role:"RENDERISTI",kind:"staff",x:11.55,z:-5.00,w:.72,h:1.36,from:0,to:999,pal:{body:"#5f4c48",accent:"#987974",legs:"#332b2a",skin:"#ce9675",hair:"#4c342d",light:"#ae8d87"}},
 // M3.4 // Tuesday dynamic cast. These do not change the canonical 17 fixed staff.
 {id:"lorenzo",name:"LORENZO",role:"ELETTRICISTA",kind:"dynamic",day:1,x:-.75,z:9.95,w:.74,h:1.40,from:51,to:55,pal:{body:"#7a6335",accent:"#d3a84c",legs:"#333127",skin:"#c99170",hair:"#3b3029",light:"#e0bd67"}},
 {id:"capo",name:"CAPO",role:"DIREZIONE",kind:"dynamic",day:1,x:9.05,z:7.70,w:.76,h:1.44,from:55,to:55,pal:{body:"#282d35",accent:"#6c7280",legs:"#171a1f",skin:"#d0a083",hair:"#5a5149",light:"#a5acb8"}},
 // M3.2 // first visible manifestation. Dynamic: never counted as office staff,
 // never shown on the development map and never directly interactable.
 {id:"corridor_figure",name:"...",role:"ANOMALIA",kind:"dynamic",x:-.25,z:.65,w:.70,h:1.52,from:43,to:43,pal:{body:"#141715",accent:"#252a26",legs:"#0c0e0d",skin:"#6f756d",hair:"#080908",light:"#384039"}},
 // M3.5 // A silhouette that exists only inside THE OTHER OFFICE.
 {id:"other_office_figure",name:"...",role:"ALTRO UFFICIO",kind:"dynamic",day:2,x:-.55,z:4.55,w:.68,h:1.56,from:63,to:63,pal:{body:"#28251f",accent:"#494238",legs:"#141310",skin:"#827969",hair:"#11100e",light:"#5c5549"}}
];
for(const n of npcSprites){n.texIdle=spriteTexture(n.pal,"idle");n.texTalk=spriteTexture(n.pal,"talk");}

// M3.3 // Narrative role registry. This is metadata only: it does not alter
// collision, rendering or current Monday missions. Dynamic characters are
// reserved here so later weekday chapters can spawn them without changing the
// canonical 17 fixed members of staff.
const narrativeRoles={
 zia_ale:{alignment:"neutral_positive",fixed:true},
 hr_01:{alignment:"adept_conflicted",fixed:true,displayName:"BETTY"},
 it_manager:{alignment:"adept_pure",fixed:true},
 capo:{alignment:"demon_leader",fixed:false},
 lorenzo:{alignment:"apparent_ally_hidden_rival",fixed:false,role:"ELETTRICISTA"},
 don:{alignment:"ally",fixed:false,role:"MANUTENTORE"}
};

// Player uses the exact same billboard scale as the NPC cast so room capacity
// can be judged correctly during the architecture pass.
const playerSprite={
 w:.72,h:1.36,
 pal:{body:"#5d7561",accent:"#9ab29d",legs:"#2d352f",skin:"#c99170",hair:"#49372c",light:"#b3c6b4"}
};
playerSprite.tex=spriteTexture(playerSprite.pal,"idle");
let activeTalkingNpcId=null;
const dialogueNpcMap={"ZIA ALE":"zia_ale","IT MANAGER":"it_manager","ALICE":"alice_editoria","MARINO":"marino_interior","BIM 02":"bim_02","BETTY":"hr_01","LORENZO":"lorenzo","CAPO":"capo"};
for(const n of npcSprites)dialogueNpcMap[n.name]=n.id;
function npcById(id){return npcSprites.find(n=>n.id===id)||null;}
function isNpcVisible(id){
 const n=npcById(id);if(!n)return false;
 // Lorenzo is a recurring dynamic character: Tuesday's electrical visit and a
 // short Wednesday maintenance stop use the same sprite/entity.
 if(id==="lorenzo")return (currentDay===1&&storyStep>=51&&storyStep<=55)||(currentDay===2&&storyStep===65);
 if(id==="other_office_figure"&&otherOfficeFigureGone)return false;
 // The shock of the first reality shift is that the populated office is suddenly empty.
 if(currentDay===2&&storyStep===63&&n.kind==="staff")return false;
 if(Number.isInteger(n.day)&&n.day!==currentDay)return false;
 return storyStep>=n.from&&storyStep<=n.to;
}
function setNpcVisibleWindow(id,from=0,to=999){const n=npcById(id);if(n){n.from=from;n.to=to;}}
function fixedStaffCount(){return npcSprites.filter(n=>n.kind==="staff").length;}
// M3.4 // Every fixed colleague is now examinable/talkable. Key story NPCs keep
// their authored mission dialogue; the rest supply optional corridor lore.
for(const n of npcSprites){
 if(n.kind!=="staff"||interactables.some(it=>it.id===n.id))continue;
 interactables.push({id:n.id,label:n.name,x:n.x,z:n.z,range:1.30,type:"npc"});
}
// Reserved for later: Capo, manutentori and visitors will use kind="dynamic"
// and will NOT change the canonical 17-person fixed staff count.
const npcHomePositions={
 zia_ale:{x:-1.55,z:10.55},
 it_manager:{x:-4.05,z:4.00},
 hr_01:{x:-5.10,z:6.35},
 bim_01:{x:-5.55,z:-5.05},bim_02:{x:-4.15,z:-5.05},
 central_01:{x:3.75,z:3.48},central_02:{x:5.35,z:3.48},central_03:{x:6.95,z:3.48},
 central_04:{x:3.75,z:.72},central_05:{x:5.35,z:.72},central_06:{x:6.95,z:.72},
 alice_editoria:{x:4.55,z:-4.45},editoria_02:{x:6.35,z:-4.45},
 marino_interior:{x:10.55,z:3.25},interior_02:{x:10.85,z:.45},
 render_01:{x:10.85,z:-2.75},render_02:{x:11.55,z:-5.00}
};
const npcLunchPositions={
 // CUCINA // 6
 zia_ale:{x:-11.35,z:-9.80},alice_editoria:{x:-10.15,z:-9.75},marino_interior:{x:-8.85,z:-9.80},
 hr_01:{x:-11.25,z:-12.05},bim_01:{x:-10.05,z:-12.10},bim_02:{x:-8.80,z:-12.05},
 // SPAZIO A // 6 — all six Centrale colleagues
 central_01:{x:2.10,z:-9.75},central_02:{x:3.70,z:-9.70},central_03:{x:5.25,z:-9.75},
 central_04:{x:2.10,z:-12.10},central_05:{x:3.70,z:-12.15},central_06:{x:5.25,z:-12.10},
 // SALA MEET // 5
 it_manager:{x:3.65,z:6.55},editoria_02:{x:5.30,z:6.50},interior_02:{x:7.00,z:6.55},
 render_01:{x:4.35,z:8.85},render_02:{x:6.45,z:8.85}
};
function setNpcWorldPosition(id,x,z){
 const n=npcById(id);if(n){n.x=x;n.z=z;}
 const it=interactables.find(v=>v.id===id);if(it){it.x=x;it.z=z;}
}
function applyNpcSceneFromStory(){
 // Fixed staff always exists. Story state only changes where people are.
 for(const [id,pos] of Object.entries(npcHomePositions))setNpcWorldPosition(id,pos.x,pos.z);
 // Lunch scene: relocate the SAME 17 fixed NPCs instead of spawning lunch extras.
 // 6 CUCINA + 6 SPAZIO A + 5 SALA MEET = 17.
 if(currentDay===0&&(storyStep===33||storyStep===34)){
   for(const [id,pos] of Object.entries(npcLunchPositions))setNpcWorldPosition(id,pos.x,pos.z);
 }
 // Tuesday dynamic staging: Lorenzo arrives at reception, then relocates to the
 // Direzione electrical panel so the player actually escorts him through the studio.
 if(currentDay===1){
   if(storyStep===51)setNpcWorldPosition("lorenzo",-.75,9.95);
   else if(storyStep>=52&&storyStep<=55)setNpcWorldPosition("lorenzo",8.45,8.55);
   if(storyStep===55)setNpcWorldPosition("capo",9.05,7.70);
 }
 if(currentDay===2&&storyStep===65)setNpcWorldPosition("lorenzo",-.65,10.05);
}
function renderNpcSprites(vp,camX,camZ){
 gl.useProgram(spritePr);gl.bindBuffer(gl.ARRAY_BUFFER,spriteBuf);
 gl.enableVertexAttribArray(spPos);gl.enableVertexAttribArray(spUV);
 gl.vertexAttribPointer(spPos,3,gl.FLOAT,false,20,0);gl.vertexAttribPointer(spUV,2,gl.FLOAT,false,20,12);
 gl.uniformMatrix4fv(spMVP,false,vp);gl.uniform1i(spTex,0);
 gl.activeTexture(gl.TEXTURE0);
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
 for(const n of npcSprites){
   if(!isNpcVisible(n.id))continue;
   let dx=camX-n.x,dz=camZ-n.z,len=Math.hypot(dx,dz)||1;
   const rx=dz/len,rz=-dx/len,hw=n.w/2,y0=.025,y1=y0+n.h;
   const lx=n.x-rx*hw,lz=n.z-rz*hw,rrx=n.x+rx*hw,rrz=n.z+rz*hw;
   // UV is flipped vertically because canvas uploads top-left first.
   const d=new Float32Array([
     lx,y0,lz, 0,1,  rrx,y0,rrz, 1,1,  rrx,y1,rrz, 1,0,
     lx,y0,lz, 0,1,  rrx,y1,rrz, 1,0,  lx,y1,lz, 0,0
   ]);
   gl.bufferData(gl.ARRAY_BUFFER,d,gl.DYNAMIC_DRAW);
   gl.bindTexture(gl.TEXTURE_2D,activeTalkingNpcId===n.id?n.texTalk:n.texIdle);
   gl.drawArrays(gl.TRIANGLES,0,6);
 }
 gl.depthMask(true);gl.disable(gl.BLEND);
 // Restore the stable world program/buffer for player rendering.
 gl.useProgram(pr);gl.bindBuffer(gl.ARRAY_BUFFER,buf);
 gl.enableVertexAttribArray(aP);gl.enableVertexAttribArray(aC);
 gl.vertexAttribPointer(aP,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(aC,3,gl.FLOAT,false,24,12);
}

function renderPlayerSprite(vp,camX,camZ){
 gl.useProgram(spritePr);gl.bindBuffer(gl.ARRAY_BUFFER,spriteBuf);
 gl.enableVertexAttribArray(spPos);gl.enableVertexAttribArray(spUV);
 gl.vertexAttribPointer(spPos,3,gl.FLOAT,false,20,0);gl.vertexAttribPointer(spUV,2,gl.FLOAT,false,20,12);
 gl.uniformMatrix4fv(spMVP,false,vp);gl.uniform1i(spTex,0);
 gl.activeTexture(gl.TEXTURE0);
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
 let dx=camX-player.x,dz=camZ-player.z,len=Math.hypot(dx,dz)||1;
 const rx=dz/len,rz=-dx/len,hw=playerSprite.w/2,y0=.025,y1=y0+playerSprite.h;
 const lx=player.x-rx*hw,lz=player.z-rz*hw,rrx=player.x+rx*hw,rrz=player.z+rz*hw;
 const d=new Float32Array([
   lx,y0,lz, 0,1,  rrx,y0,rrz, 1,1,  rrx,y1,rrz, 1,0,
   lx,y0,lz, 0,1,  rrx,y1,rrz, 1,0,  lx,y1,lz, 0,0
 ]);
 gl.bufferData(gl.ARRAY_BUFFER,d,gl.DYNAMIC_DRAW);
 gl.bindTexture(gl.TEXTURE_2D,playerSprite.tex);
 gl.drawArrays(gl.TRIANGLES,0,6);
 gl.depthMask(true);gl.disable(gl.BLEND);
 gl.useProgram(pr);gl.bindBuffer(gl.ARRAY_BUFFER,buf);
 gl.enableVertexAttribArray(aP);gl.enableVertexAttribArray(aC);
 gl.vertexAttribPointer(aP,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(aC,3,gl.FLOAT,false,24,12);
}

const staticV=new Float32Array(V);

// M3.3.2 // Ceiling is a separate mesh: rendered only in first person so the
// 3/4 development camera can still see the whole office from above.
const FP_CEILING_Y=2.20;
const _ceilingSaved=V.slice();V.length=0;
quad([-12.55,FP_CEILING_Y,-13.65],[14.55,FP_CEILING_Y,-13.65],[14.55,FP_CEILING_Y,12.75],[-12.55,FP_CEILING_Y,12.75],[.145,.165,.145]);
const ceilingV=new Float32Array(V);V.length=0;V.push(..._ceilingSaved);

function segPointDist(ax,az,bx,bz,px,pz){
 const abx=bx-ax,abz=bz-az;
 const den=abx*abx+abz*abz||1;
 let t=((px-ax)*abx+(pz-az)*abz)/den;
 t=Math.max(0,Math.min(1,t));
 const qx=ax+abx*t,qz=az+abz*t;
 return Math.hypot(px-qx,pz-qz);
}
function wallOccludesPlayer(w,cx,cz){
 const camDist=Math.hypot(player.x-cx,player.z-cz);
 const wallDist=Math.hypot(w.x-cx,w.z-cz);
 const nearPlayer=Math.hypot(player.x-w.x,player.z-w.z)<1.55;

 // Generous corridor around the camera-player sight line.
 const radius=Math.max(.48,Math.max(w.w,w.d)*.68);
 const onSightLine=wallDist<camDist+.15 &&
   segPointDist(cx,cz,player.x,player.z,w.x,w.z)<radius;

 return nearPlayer||onSightLine;
}
function buildRealityOverlayMesh(now,mode){
 if(mode==="normal")return new Float32Array(0);
 const saved=V.slice();V.length=0;
 const glitch=mode==="glitch",floorCol=glitch?[.20,.18,.15]:[.115,.105,.088];
 // Same footprint, different skin: no collision or room data is duplicated.
 for(const r of commonFloorZones)floorR(r.x,r.z,r.w,r.d,floorCol,.010);
 for(const r of rooms)floorR(r.x,r.z,r.w,r.d,glitch?[.24,.20,.17]:[.135,.118,.098],.013);
 for(const r of corridors)floorR(r.x,r.z,r.w,r.d,glitch?[.18,.20,.17]:[.095,.105,.090],.016);
 // Dirty seams / stains / abandoned fragments. Purely visual.
 const stains=[[-1.0,1.3,2.8,.13],[-4.9,-4.1,1.8,.11],[5.4,2.8,2.2,.12],[10.8,-1.8,1.4,.10],[-5.3,6.9,1.3,.10],[3.8,-10.6,2.5,.12]];
 for(const [x,z,w,d] of stains)box(x,.018,z,w,.012,d,[.075,.060,.047]);
 // Broken ceiling panels and old hanging cable trays.
 box(-.30,1.91,2.10,1.35,.055,.50,[.19,.17,.14]);
 box(5.55,1.97,1.65,.75,.05,.42,[.16,.15,.13]);
 box(-4.85,1.84,-4.2,.95,.05,.36,[.14,.13,.11]);
 box(10.9,1.90,2.6,1.10,.05,.32,[.16,.14,.12]);
 // A darker skin immediately below the normal ceiling.
 quad([-12.54,2.192,-13.64],[14.54,2.192,-13.64],[14.54,2.192,12.74],[-12.54,2.192,12.74],glitch?[.18,.18,.15]:[.095,.092,.080]);
 const arr=new Float32Array(V);V.length=0;V.push(...saved);return arr;
}

function buildWallMesh(cx,cz,fullHeight=false,mode="normal"){
 const saved=V.slice();
 V.length=0;

 // GAME/FP: true architectural walls. DEV/3/4: low cutaway walls so the whole
 // office remains readable while positioning NPCs, triggers and props.
 const wallCol=mode==="normal"?[.22,.28,.24]:(mode==="glitch"?[.29,.25,.20]:[.145,.135,.112]);
 for(const w of wallDefs){
   const h=fullHeight?(w.h||2.15):.92;
   box(w.x,0,w.z,w.w,h,w.d,wallCol);
 }

 const arr=new Float32Array(V);
 V.length=0;V.push(...saved);
 return arr;
}

const player={x:0,z:9.6,r:.22,speed:2.15};
// M2.7.3 HOTFIX: audio state must exist before the initial story step is set.
// In M2.7.2 setStoryStep(0) referenced audioCtx while it was still in the
// temporal dead zone, stopping JavaScript before the first render frame.
let audioCtx=null,masterGain=null,ambientGain=null,serverHumGain=null,fluoroGain=null,printerHumGain=null,pbxWhineGain=null;
let phoneRingLast=0,footstepLast=0,footstepSide=0,audioMuted=false,ambientOneShotLast=0;
let flickerTimer=0,sceneTint=0;
// M3.5 // Reality-layer runtime. The same collision map and room geometry are
// always used; only the visual/audio/world-state layer changes.
let realityGlitchUntil=0,otherOfficeFigureGone=false;
function realityMode(now=performance.now()){
 if(currentDay===2&&storyStep===63){
   if(now<realityGlitchUntil)return (Math.floor(now/72)%2)?"glitch":"decayed";
   return "decayed";
 }
 return "normal";
}
function beginOtherOfficeShift(){
 realityGlitchUntil=performance.now()+760;otherOfficeFigureGone=false;
 visualFlicker(.48,90);
 setTimeout(()=>visualFlicker(.20,70),130);
 setTimeout(()=>visualFlicker(.38,95),260);
 tone(72,.42,.034,'triangle',34);
 setTimeout(()=>tone(131,.18,.018,'square',52),130);
}
let storyStep=0;
const storySteps=[
 {id:"talk_zia",time:"09:00",objective:"PARLA CON ZIA ALE",targetRoom:"INGRESSO / SEGRETERIA",targetInteractable:"zia_ale"},
 {id:"reach_it",time:"09:02",objective:"RAGGIUNGI IL REPARTO IT",targetRoom:"REPARTO IT"},
 {id:"talk_manager",time:"09:05",objective:"PARLA CON L'IT MANAGER",targetRoom:"REPARTO IT",targetInteractable:"it_manager"},
 {id:"use_pc",time:"09:07",objective:"ACCEDI AL PC DEL REPARTO IT",targetRoom:"REPARTO IT",targetInteractable:"pc_it"},
 {id:"reach_server",time:"09:10",objective:"RAGGIUNGI IL SERVER / MAGAZZINO IT",targetRoom:"SERVER / MAGAZZINO IT"},
 {id:"check_rack",time:"09:14",objective:"CONTROLLA IL RACK SERVER 02",targetRoom:"SERVER / MAGAZZINO IT",targetInteractable:"server_rack_02"},
 {id:"return_it",time:"09:18",objective:"TORNA NEL REPARTO IT",targetRoom:"REPARTO IT"},
 {id:"report_manager",time:"09:20",objective:"AGGIORNA L'IT MANAGER",targetRoom:"REPARTO IT",targetInteractable:"it_manager"},

 {id:"reach_editoria",time:"09:22",objective:"VAI DA ALICE IN EDITORIA",targetRoom:"EDITORIA"},
 {id:"talk_alice",time:"09:29",objective:"PARLA CON ALICE",targetRoom:"EDITORIA",targetInteractable:"alice_editoria"},
 {id:"reach_stampanti",time:"09:34",objective:"VAI ALLE STAMPANTI",targetRoom:"STAMPANTI"},
 {id:"fix_printer",time:"09:39",objective:"CONTROLLA LA STAMPANTE PRINCIPALE",targetRoom:"STAMPANTI",targetInteractable:"printer_main"},
 {id:"return_editoria",time:"09:44",objective:"TORNA DA ALICE",targetRoom:"EDITORIA"},
 {id:"report_alice",time:"09:47",objective:"CONFERMA IL RIPRISTINO AD ALICE",targetRoom:"EDITORIA",targetInteractable:"alice_editoria"},
 {id:"return_it_pc",time:"09:51",objective:"TORNA IN IT E CHIUDI IL TICKET",targetRoom:"REPARTO IT"},
 {id:"close_ticket_pc",time:"09:56",objective:"CHIUDI IL TICKET DAL PC IT",targetRoom:"REPARTO IT",targetInteractable:"pc_it"},

 {id:"reach_renderisti",time:"10:01",objective:"VERIFICA LA POSTAZIONE RENDER_04",targetRoom:"RENDERISTI"},
 {id:"inspect_render04",time:"10:04",objective:"CONTROLLA RENDER_04",targetRoom:"RENDERISTI",targetInteractable:"render_04"},
 {id:"return_it_anomaly",time:"10:06",objective:"TORNA IN IT",targetRoom:"REPARTO IT"},
 {id:"report_anomaly",time:"10:08",objective:"PARLA CON L'IT MANAGER",targetRoom:"REPARTO IT",targetInteractable:"it_manager"},
 {id:"continue_after_m26",time:"10:10",objective:"PARLA CON L'IT MANAGER // NUOVA RICHIESTA",targetRoom:"REPARTO IT",targetInteractable:"it_manager"},

 // M2.7.1 // ESCALATION LEGGERA
 {id:"reach_interior",time:"10:12",objective:"VAI DA MARINO IN INTERIOR",targetRoom:"INTERIOR"},
 {id:"talk_marino",time:"10:16",objective:"PARLA CON MARINO",targetRoom:"INTERIOR",targetInteractable:"marino_interior"},
 {id:"inspect_interior_pc",time:"10:20",objective:"CONTROLLA IL PC INTERIOR_03",targetRoom:"INTERIOR",targetInteractable:"interior_pc_03"},
 {id:"report_marino",time:"10:25",objective:"CONFERMA IL RIPRISTINO A MARINO",targetRoom:"INTERIOR",targetInteractable:"marino_interior"},
 {id:"return_it_interior",time:"10:29",objective:"TORNA IN IT E CHIUDI IL TICKET",targetRoom:"REPARTO IT"},
 {id:"close_interior_ticket",time:"10:33",objective:"CHIUDI IL TICKET DAL PC IT",targetRoom:"REPARTO IT",targetInteractable:"pc_it"},
 {id:"reach_meet_phone",time:"10:38",objective:"VAI IN SALA MEET CAPO",targetRoom:"SALA MEET CAPO"},
 {id:"answer_meet_phone",time:"10:42",objective:"RISPONDI AL TELEFONO",targetRoom:"SALA MEET CAPO",targetInteractable:"meet_phone"},
 {id:"inspect_meet_phone",time:"10:45",objective:"CONTROLLA IL COLLEGAMENTO DEL TELEFONO",targetRoom:"SALA MEET CAPO",targetInteractable:"meet_phone"},
 {id:"return_it_phone",time:"10:49",objective:"TORNA NEL REPARTO IT",targetRoom:"REPARTO IT"},
 {id:"report_phone",time:"10:54",objective:"PARLA CON L'IT MANAGER",targetRoom:"REPARTO IT",targetInteractable:"it_manager"},
 {id:"morning_complete",time:"10:58",objective:"PARLA CON L'IT MANAGER // POI PRANZO",targetRoom:"REPARTO IT",targetInteractable:"it_manager"},

 // M3.1 // PRANZO + POST PRANZO
 {id:"reach_lunch",time:"12:58",objective:"RAGGIUNGI LA CUCINA",targetRoom:"CUCINA"},
 {id:"lunch_break",time:"13:00",objective:"PARLA CON ZIA ALE",targetRoom:"CUCINA",targetInteractable:"zia_ale"},
 {id:"return_it_after_lunch",time:"13:24",objective:"TORNA NEL REPARTO IT",targetRoom:"REPARTO IT"},
 {id:"post_lunch_pc",time:"13:30",objective:"RIPRENDI DALLA TUA POSTAZIONE",targetRoom:"REPARTO IT",targetInteractable:"pc_it"},

 // M3.2 // FIRST MANIFESTATION
 {id:"m32_start",time:"13:32",objective:"CONTROLLA IL PC IT // NUOVA RICHIESTA",targetRoom:"REPARTO IT",targetInteractable:"pc_it"},
 {id:"reach_bim",time:"13:35",objective:"VAI DA BIM 02",targetRoom:"BIM"},
 {id:"talk_bim_02",time:"13:39",objective:"PARLA CON BIM 02",targetRoom:"BIM",targetInteractable:"bim_02"},
 {id:"inspect_bim_pc_02",time:"13:43",objective:"CONTROLLA IL PC BIM 02",targetRoom:"BIM",targetInteractable:"bim_pc_02"},
 {id:"report_bim_02",time:"13:48",objective:"CONFERMA IL RIPRISTINO A BIM 02",targetRoom:"BIM",targetInteractable:"bim_02"},
 {id:"return_it_bim",time:"13:51",objective:"TORNA IN IT E CHIUDI IL TICKET",targetRoom:"REPARTO IT"},
 {id:"corridor_manifestation",time:"13:52",objective:"TORNA IN IT",targetRoom:"REPARTO IT"},
 {id:"figure_gone",time:"13:53",objective:"TORNA IN IT // NON C'ERA NESSUNO",targetRoom:"REPARTO IT"},
 {id:"close_bim_ticket",time:"13:56",objective:"CHIUDI IL TICKET DAL PC IT",targetRoom:"REPARTO IT",targetInteractable:"pc_it"},
 {id:"report_figure",time:"13:59",objective:"PARLA CON L'IT MANAGER",targetRoom:"REPARTO IT",targetInteractable:"it_manager"},
 {id:"m32_complete",time:"14:02",objective:"M3.2 // QUALCOSA ERA NEL CORRIDOIO",targetRoom:null},

 // M3.4 // MARTEDI — VOCI DI CORRIDOIO
 {id:"tuesday_reach_it",time:"09:05",objective:"MARTEDI // RAGGIUNGI IL REPARTO IT",targetRoom:"REPARTO IT"},
 {id:"tuesday_manager",time:"09:07",objective:"PARLA CON L'IT MANAGER",targetRoom:"REPARTO IT",targetInteractable:"it_manager"},
 {id:"tuesday_betty_badge",time:"09:12",objective:"VAI DA BETTY IN HR",targetRoom:"HR",targetInteractable:"hr_01"},
 {id:"tuesday_lorenzo",time:"09:18",objective:"LORENZO E ARRIVATO // TORNA IN SEGRETERIA",targetRoom:"INGRESSO / SEGRETERIA",targetInteractable:"lorenzo"},
 {id:"tuesday_reserved_door",time:"09:23",objective:"ACCOMPAGNA LORENZO ALLA PORTA DIREZIONE",targetRoom:"CORRIDOIO",targetInteractable:"direzione_door"},
 {id:"tuesday_panel",time:"09:26",objective:"CONTROLLA IL QUADRO ELETTRICO DIREZIONE",targetRoom:"CORRIDOIO",targetInteractable:"direzione_panel"},
 {id:"tuesday_lorenzo_panel",time:"09:30",objective:"PARLA CON LORENZO",targetRoom:"CORRIDOIO",targetInteractable:"lorenzo"},
 {id:"tuesday_capo",time:"09:33",objective:"...",targetRoom:"CORRIDOIO",targetInteractable:"capo"},
 {id:"tuesday_betty_after",time:"09:36",objective:"PASSA DA BETTY",targetRoom:"HR",targetInteractable:"hr_01"},
 {id:"tuesday_manager_end",time:"09:42",objective:"TORNA DALL'IT MANAGER",targetRoom:"REPARTO IT",targetInteractable:"it_manager"},
 {id:"tuesday_complete",time:"09:47",objective:"MARTEDI // VOCI DI CORRIDOIO",targetRoom:null},

 // M3.5 // MERCOLEDI — THE OTHER OFFICE
 {id:"wednesday_start",time:"09:05",objective:"MERCOLEDI // RAGGIUNGI IL REPARTO IT",targetRoom:"REPARTO IT"},
 {id:"wednesday_manager",time:"09:07",objective:"PARLA CON L'IT MANAGER",targetRoom:"REPARTO IT",targetInteractable:"it_manager"},
 {id:"wednesday_reach_server",time:"09:12",objective:"VAI NEL SERVER / MAGAZZINO IT",targetRoom:"SERVER / MAGAZZINO IT"},
 {id:"wednesday_legacy_terminal",time:"09:16",objective:"CONTROLLA IL TERMINALE INVENTARIO LEGACY",targetRoom:"SERVER / MAGAZZINO IT",targetInteractable:"legacy_terminal"},
 {id:"wednesday_other_office",time:"09:17",objective:"TORNA DA BETTY // QUALCOSA NON VA",targetRoom:"HR"},
 {id:"wednesday_betty",time:"09:19",objective:"PARLA CON BETTY",targetRoom:"HR",targetInteractable:"hr_01"},
 {id:"wednesday_lorenzo",time:"09:24",objective:"LORENZO E IN SEGRETERIA // PARLAGLI",targetRoom:"INGRESSO / SEGRETERIA",targetInteractable:"lorenzo"},
 {id:"wednesday_manager_end",time:"09:31",objective:"TORNA DALL'IT MANAGER",targetRoom:"REPARTO IT",targetInteractable:"it_manager"},
 {id:"wednesday_complete",time:"09:36",objective:"MERCOLEDI // HAI VISTO L'ALTRO UFFICIO",targetRoom:null},

 // Future weekday chapter entry snapshots.
 {id:"thursday_start",time:"09:05",objective:"GIOVEDI // RAGGIUNGI IL REPARTO IT",targetRoom:"REPARTO IT",devOnly:true},
 {id:"friday_start",time:"09:05",objective:"VENERDI // RAGGIUNGI IL REPARTO IT",targetRoom:"REPARTO IT",devOnly:true}
];
const TUESDAY_START_STEP=48,TUESDAY_END_STEP=58,WEDNESDAY_START_STEP=59,WEDNESDAY_END_STEP=67,THURSDAY_START_STEP=68,FRIDAY_START_STEP=69;

// M3.3 // WEEK / CHAPTER RUNTIME
const WEEK_DAYS=[
 {id:"monday",label:"LUNEDI",chapter:"PRIMO TURNO",baseAtmosphere:null},
 {id:"tuesday",label:"MARTEDI",chapter:"VOCI DI CORRIDOIO",baseAtmosphere:.10},
 {id:"wednesday",label:"MERCOLEDI",chapter:"THE OTHER OFFICE",baseAtmosphere:.16},
 {id:"thursday",label:"GIOVEDI",chapter:"I PRECEDENTI STAGISTI",baseAtmosphere:.22},
 {id:"friday",label:"VENERDI",chapter:"THE LAST DAY",baseAtmosphere:.28}
];
let currentDay=0;
const weekRuntime={day:0,completedDays:[],profile:"NORMAL"};
let dayBannerTimer=0;
function currentDayDef(){return WEEK_DAYS[currentDay]||WEEK_DAYS[0];}
function showDayBanner(){
 if(!dayBannerEl)return;
 const d=currentDayDef();
 dayBannerEl.innerHTML=`<strong>${d.label}</strong><span>${d.chapter}</span>`;
 dayBannerEl.classList.add("on");
 clearTimeout(dayBannerTimer);
 dayBannerTimer=setTimeout(()=>dayBannerEl.classList.remove("on"),1250);
}
function setWeekDay(index,announce=false){
 currentDay=Math.max(0,Math.min(WEEK_DAYS.length-1,index|0));
 weekRuntime.day=currentDay;
 weekRuntime.completedDays=WEEK_DAYS.slice(0,currentDay).map(d=>d.id);
 weekRuntime.profile=currentDay===0?"MONDAY_RUNTIME":"DAY_START";
 if(dayEl)dayEl.textContent=currentDayDef().label;
 if(announce)showDayBanner();
}

// M2.8 // ATMOSPHERE & TENSION
// Visual mood is layered over the stable renderer so geometry/collisions remain untouched.
function atmosphereLevel(){
 if(currentDay===2&&storyStep===63)return 1.58;
 if(currentDay>0 && storyStep>=48)return currentDayDef().baseAtmosphere||0;
 if(storyStep>=29)return 1.0;
 if(storyStep>=27)return .78;
 if(storyStep>=18)return .48;
 if(storyStep>=16)return .25;
 return 0;
}
function visualFlicker(strength=.28,duration=130){
 if(!flickerOverlay)return;
 clearTimeout(flickerTimer);
 flickerOverlay.style.opacity=String(Math.max(0,Math.min(.72,strength)));
 flickerTimer=setTimeout(()=>{flickerOverlay.style.opacity='0';},duration);
}
function updateAtmosphereVisuals(now){
 const level=atmosphereLevel(),mode=realityMode(now);
 sceneTint+=(level-sceneTint)*.035;
 if(atmoOverlay){
   const darkness=.10+sceneTint*.16;
   const cold=.035+sceneTint*.055;
   if(mode!=="normal")atmoOverlay.style.background=`radial-gradient(circle at 50% 42%, rgba(40,16,10,.04) 18%, rgba(8,6,5,.42) 100%), linear-gradient(rgba(62,35,26,.16), rgba(8,14,10,.28))`;
   else atmoOverlay.style.background=`radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 34%, rgba(0,0,0,${darkness.toFixed(3)}) 100%), linear-gradient(rgba(18,34,28,${cold.toFixed(3)}), rgba(0,8,7,${(cold*.72).toFixed(3)}))`;
 }
 if(psxNoise)psxNoise.style.opacity=String(mode!=="normal"?.090:(.025+sceneTint*.018));
 if(miniMap)miniMap.style.filter=mode!=="normal"?"contrast(1.7) brightness(.46) saturate(.4)":"";
 // Rare fluorescent dip only after the first impossible ticket. It is visual noise,
 // not a gameplay event, and never blocks controls.
 if(level>.4 && !dialogueOpen && Math.random()<dtForAtmosphere*.012*level){
   visualFlicker(.05+level*.05,45+Math.random()*55);
 }
}
function triggerStoryAtmosphere(prev,next){
 if(next===18 && prev!==18){visualFlicker(.16,105);setTimeout(()=>visualFlicker(.07,70),180);}
 if(next===27 && prev!==27){visualFlicker(.11,80);}
 if(next===29 && prev!==29){visualFlicker(.22,120);setTimeout(()=>visualFlicker(.08,65),235);}
 if(next===43 && prev!==43){visualFlicker(.10,70);tone(74,.14,.018,'triangle',52);}
 if(next===44 && prev!==44){visualFlicker(.30,120);setTimeout(()=>visualFlicker(.07,55),190);tone(58,.16,.024,'triangle',38);}
 if(currentDay===1&&next===53&&prev!==53){visualFlicker(.08,70);tone(118,.055,.010,'square',82);}
 if(currentDay===1&&next===55&&prev!==55){visualFlicker(.13,90);tone(82,.08,.014,'triangle',62);setTimeout(()=>tone(164,.035,.008,'square',118),105);}
 if(currentDay===2&&next===63&&prev!==63){visualFlicker(.42,105);tone(64,.34,.030,'triangle',32);setTimeout(()=>tone(117,.11,.016,'square',51),110);}
 if(currentDay===2&&next===64&&prev!==64){visualFlicker(.50,115);setTimeout(()=>visualFlicker(.04,45),160);tone(280,.08,.014,'square',620);}
}
let dtForAtmosphere=0;

function setStoryStep(i,msg){
 const prev=storyStep;
 storyStep=Math.max(0,Math.min(i,storySteps.length-1));
 const step=storySteps[storyStep];
 objEl.textContent=step.objective;
 clockEl.textContent=step.time;
 if(dayEl)dayEl.textContent=currentDayDef().label;
 if(msg)toast(msg);
 if(audioCtx&&storyStep!==prev)objectiveChime();
 if(storyStep!==prev)triggerStoryAtmosphere(prev,storyStep);
 syncOfficeStateFromStory();
 applyNpcSceneFromStory();
 updateDevStatus();
}
// M3.3.2 // GAME MODE defaults to first person; F3 instantly switches to the
// original 3/4 development camera without changing story/player state.
const FP_DEFAULT_YAW=-.72;
const DEV_DEFAULT_YAW=-.72;
let viewMode="fp"; // "fp" = gameplay, "dev" = 3/4 development view
let savedFpYaw=FP_DEFAULT_YAW;
const cameraState={
 x:player.x,
 z:player.z,
 yaw:FP_DEFAULT_YAW,
 dist:0,
 height:1.20,
 lookAhead:1.0
};
const FP_TURN_SPEED=1.85;
function applyCameraMode(showToast=true){
 if(viewMode==="fp"){
   cameraState.yaw=savedFpYaw;
   cameraState.dist=0;cameraState.height=1.20;cameraState.lookAhead=1.0;
   document.getElementById("fpCrosshair")?.classList.remove("hidden");
   const badge=document.getElementById("fpBadge");if(badge){badge.textContent="GAME // FIRST PERSON";badge.classList.remove("dev");}
   if(showToast)toast("GAME MODE // FIRST PERSON");
 }else{
   cameraState.yaw=DEV_DEFAULT_YAW;
   cameraState.dist=7.0;cameraState.height=3.65;cameraState.lookAhead=1.20;
   document.getElementById("fpCrosshair")?.classList.add("hidden");
   const badge=document.getElementById("fpBadge");if(badge){badge.textContent="DEV // 3/4 CAMERA";badge.classList.add("dev");}
   if(showToast)toast("DEV CAMERA // 3/4");
 }
 cameraState.x=player.x;cameraState.z=player.z;
 updateDevStatus();
}
function toggleCameraMode(){
 if(viewMode==="fp"){savedFpYaw=cameraState.yaw;viewMode="dev";}else viewMode="fp";
 applyCameraMode(true);
}
function smoothTo(a,b,k,dt){
 return a+(b-a)*(1-Math.exp(-k*dt));
}

// -----------------------------------------------------------------------------
// M3.1 // DEVELOPMENT CHECKPOINT SYSTEM
// Loads a coherent story snapshot: step, player spawn, devices, lights, NPC scene
// and previously-triggered anomalies are all derived from the selected story step.
// ----------------------------------------------------------------------------
const DEV_MODE=true;
const devCheckpoints={
 // WEEK STARTS // the main M3.3 development entry points
 monday:{label:"LUNEDI — 09:00",day:0,step:0,x:-.45,z:10.35,kind:"week"},
 tuesday:{label:"MARTEDI — 09:05",day:1,step:TUESDAY_START_STEP,x:-.45,z:10.35,kind:"week"},
 wednesday:{label:"MERCOLEDI — 09:05",day:2,step:WEDNESDAY_START_STEP,x:-.45,z:10.35,kind:"week"},
 thursday:{label:"GIOVEDI — 09:05",day:3,step:THURSDAY_START_STEP,x:-.45,z:10.35,kind:"week"},
 friday:{label:"VENERDI — 09:05",day:4,step:FRIDAY_START_STEP,x:-.45,z:10.35,kind:"week"},

 // MONDAY QUICK TESTS // preserved from M3.2
 start:{label:"09:00 — INIZIO TURNO",day:0,step:0,x:-.45,z:10.35},
 first_done:{label:"09:22 — PRIMO INTERVENTO",day:0,step:8,x:-2.25,z:2.90},
 first_anomaly:{label:"10:10 — PRIMA ANOMALIA",day:0,step:20,x:-4.15,z:3.55},
 morning_end:{label:"10:58 — FINE MATTINA",day:0,step:32,x:-4.15,z:3.55},
 lunch:{label:"13:00 — PRANZO",day:0,step:34,x:-9.65,z:-9.25},
 post_lunch:{label:"13:30 — POST PRANZO",day:0,step:36,x:-4.35,z:2.70},
 m32_start:{label:"13:32 — M3.2 INIZIO",day:0,step:37,x:-4.35,z:2.70},
 manifestation:{label:"13:52 — APPARIZIONE",day:0,step:43,x:-1.35,z:-3.55},
 // MARTEDI QUICK TESTS // M3.4 lore + dynamic NPCs
 tue_betty:{label:"MARTEDI 09:12 — BETTY",day:1,step:50,x:-2.35,z:7.05},
 tue_lorenzo:{label:"MARTEDI 09:18 — LORENZO",day:1,step:51,x:-.35,z:9.55},
 tue_direzione:{label:"MARTEDI 09:23 — PORTA DIREZIONE",day:1,step:52,x:8.55,z:7.70},
 tue_capo:{label:"MARTEDI 09:33 — CAPO",day:1,step:55,x:8.45,z:7.70},
 visual_slice:{label:"PSX VISUAL SLICE — IT / HR",day:1,step:50,x:-5.85,z:4.15},
 // MERCOLEDI QUICK TESTS // M3.5 THE OTHER OFFICE
 wed_terminal:{label:"MERCOLEDI 09:16 — TERMINALE LEGACY",day:2,step:62,x:-3.45,z:-1.75},
 wed_other:{label:"MERCOLEDI 09:17 — THE OTHER OFFICE",day:2,step:63,x:-2.35,z:-1.35},
 wed_betty:{label:"MERCOLEDI 09:19 — BETTY",day:2,step:64,x:-3.35,z:6.55},
 wed_lorenzo:{label:"MERCOLEDI 09:24 — LORENZO",day:2,step:65,x:-.25,z:9.55}
};
function resetOfficeForCheckpoint(){
 realityGlitchUntil=0;otherOfficeFigureGone=false;
 for(const r of rooms)officeState.lights[r.name]="on";
 for(const d of doors)officeState.doors[d.room]="open";
 for(const sc of officeScreens)officeState.devices[sc.id]="on";
 for(const ph of officePhones)officeState.devices[ph.id]="idle";
 officeState.devices.server_rack_02="online";
 officeState.devices.printer_main="idle";
 officeState.devices.render_04="off";
 officeState.devices.interior_pc_03="on";
 officeState.devices.meet_phone="idle";
}
function applyWeekStartProfile(){
 // Future days begin from a clean office snapshot. Story-specific changes for
 // each day will be layered here by M3.4/M3.5/M3.6/M3.7.
 if(currentDay===0)return;
 resetOfficeForCheckpoint();
 weekRuntime.profile="DAY_START";
 // Keep the stable architecture completely untouched. Only runtime states live here.
 for(const [id,pos] of Object.entries(npcHomePositions))setNpcWorldPosition(id,pos.x,pos.z);
 syncOfficeStateFromStory();
}
function closeDialogueForCheckpoint(){
 dialogueOpen=false;dialogueLines=[];dialogueIndex=0;dialogueDone=null;activeTalkingNpcId=null;
 dialogueEl.classList.remove("on");promptEl.classList.remove("on");
}
function anomalyCountForStep(step=storyStep){
 if(currentDay===1 && step>=TUESDAY_START_STEP)return 4; // Tuesday is suspicion/lore, not a new hard manifestation.
 if(currentDay===2 && step>=63)return 5;
 if(currentDay===2 && step>=WEDNESDAY_START_STEP)return 4;
 if(currentDay>=3)return 5;
 return (step>=18?1:0)+(step>=29?1:0)+(step>=35?1:0)+(step>=43?1:0);
}
function updateDevStatus(){
 if(!DEV_MODE||!devStatusText)return;
 const st=storySteps[storyStep],d=currentDayDef();
 const activeStaff=npcSprites.filter(n=>n.kind==="staff"&&isNpcVisible(n.id)).length;
 const activeDynamic=npcSprites.filter(n=>n.kind==="dynamic"&&isNpcVisible(n.id)).length;
 devStatusText.innerHTML=`${d.label} // ${d.chapter}<br>STEP ${storyStep} // ${st?.id||"?"} · ORA ${st?.time||"--:--"}<br>CAM ${viewMode==="fp"?"FP GAME":"3/4 DEV"} · REALTA ${realityMode().toUpperCase()} · NPC ${activeStaff}/${fixedStaffCount()} + PLAYER${activeDynamic?` · DYNAMIC ${activeDynamic}`:""} · ANOMALIE ${anomalyCountForStep()}`;
}
function openDevMenu(){
 if(!DEV_MODE||!devMenu)return;
 keys.w=keys.a=keys.s=keys.d=keys.q=keys.e=keys.arrowup=keys.arrowdown=keys.arrowleft=keys.arrowright=0;
 jx=jy=0;mobileTurn=0;if(nub)nub.style.transform="";
 closeDialogueForCheckpoint();
 devMenu.classList.remove("hidden");
}
function closeDevMenu(){if(devMenu)devMenu.classList.add("hidden");}
function loadDevCheckpoint(key){
 const cp=devCheckpoints[key];if(!cp)return;
 setWeekDay(cp.day??0,false);
 resetOfficeForCheckpoint();
 closeDialogueForCheckpoint();
 storyStep=0;
 setStoryStep(cp.step);
 applyWeekStartProfile();
 // Re-apply NPC scene after profile reset; Monday lunch/checkpoint relocation remains intact.
 applyNpcSceneFromStory();
 player.x=cp.x;player.z=cp.z;player._lastRoom=roomAt(player.x,player.z);
 savedFpYaw=FP_DEFAULT_YAW;cameraState.x=player.x;cameraState.z=player.z;cameraState.yaw=viewMode==="fp"?savedFpYaw:DEV_DEFAULT_YAW;
 phoneRingLast=performance.now();ambientOneShotLast=performance.now();sceneTint=atmosphereLevel();
 closeDevMenu();
 showDayBanner();
 toast("CHECKPOINT // "+cp.label);
 updateDevStatus();
}
if(!DEV_MODE){devMenu?.classList.add("hidden");devButton?.remove();document.getElementById("devStatus")?.remove();}
else{
 devButton?.addEventListener("click",openDevMenu);
 document.querySelectorAll(".devCheckpoint").forEach(b=>b.addEventListener("click",()=>{ensureAudio();loadDevCheckpoint(b.dataset.cp);}));
}

// Safe initial week + story state.
setWeekDay(0,false);
setStoryStep(0);
applyCameraMode(false);

function insideZone(x,z,r,pad=.03){
 return Math.abs(x-r.x)<=r.w/2+pad&&Math.abs(z-r.z)<=r.d/2+pad;
}
function onWalkableFloor(x,z){
 return commonFloorZones.some(r=>insideZone(x,z,r,.06))||
        rooms.some(r=>insideZone(x,z,r,.08))||
        corridors.some(r=>insideZone(x,z,r,.12))||
        doorLinks.some(r=>insideZone(x,z,r,.22))||
        doorConnectors.some(r=>insideZone(x,z,r,.26));
}
function roomAt(x,z){
 for(const r of rooms){
   if(Math.abs(x-r.x)<=r.w/2&&Math.abs(z-r.z)<=r.d/2)return r.name;
 }
 for(const r of corridors){
   if(Math.abs(x-r.x)<=r.w/2&&Math.abs(z-r.z)<=r.d/2)return r.name;
 }
 // Any center position the movement system accepts is still part of the map.
 // This guarantees there are no thin "FUORI MAPPA" bands at floor seams.
 if(onWalkableFloor(x,z))return "CORRIDOIO";
 return "FUORI MAPPA";
}
function hit(x,z,r,s){const nx=Math.max(s.x-s.w/2,Math.min(x,s.x+s.w/2)),nz=Math.max(s.z-s.d/2,Math.min(z,s.z+s.d/2)),dx=x-nx,dz=z-nz;return dx*dx+dz*dz<r*r}
function can(x,z){
 // One single footprint is shared by movement and room classification.
 if(!onWalkableFloor(x,z))return false;
 // M3.0 dynamic doors. All start open, so legacy navigation remains identical.
 if(closedDoorBlocks(x,z))return false;

 // Door areas are intentionally forgiving: if the player is inside the visual
 // doorway / access apron, wall seams must not block traversal.
 const inDoorArea=doorClearZones.some(d=>pointInsideRect(x,z,d,0));
 if(inDoorArea){
   return !solids.some(s=>{
     const isWall=wallDefs.includes(s);
     return !isWall && hit(x,z,player.r,s);
   });
 }
 return !solids.some(s=>hit(x,z,player.r,s));
}
// M2.7.2 // FIRST AUDIO PASS
// Self-contained WebAudio: no external assets, so the GitHub build stays portable.
function ensureAudio(){
 try{
   if(!audioCtx){
     audioCtx=new (window.AudioContext||window.webkitAudioContext)();
     masterGain=audioCtx.createGain();
     masterGain.gain.value=.72;
     masterGain.connect(audioCtx.destination);

     // Low office electrical/HVAC bed. Intentionally subtle.
     ambientGain=audioCtx.createGain();
     ambientGain.gain.value=.012;
     ambientGain.connect(masterGain);
     for(const [f,g] of [[50,.42],[100,.18],[150,.08]]){
       const o=audioCtx.createOscillator(),og=audioCtx.createGain();
       o.type='sine';o.frequency.value=f;og.gain.value=g;
       o.connect(og);og.connect(ambientGain);o.start();
     }

     // Server rack layer; volume is updated from player distance every frame.
     serverHumGain=audioCtx.createGain();
     serverHumGain.gain.value=0;
     serverHumGain.connect(masterGain);
     for(const [f,g] of [[72,.55],[144,.20]]){
       const o=audioCtx.createOscillator(),og=audioCtx.createGain();
       o.type='sine';o.frequency.value=f;og.gain.value=g;
       o.connect(og);og.connect(serverHumGain);o.start();
     }

     // Fluorescent/electrical layer. It becomes slightly more noticeable as the
     // morning grows stranger, but remains below dialogue and device sounds.
     fluoroGain=audioCtx.createGain();
     fluoroGain.gain.value=.0035;
     fluoroGain.connect(masterGain);
     for(const [f,g] of [[60,.45],[120,.18],[240,.05]]){
       const o=audioCtx.createOscillator(),og=audioCtx.createGain();
       o.type='sine';o.frequency.value=f;og.gain.value=g;
       o.connect(og);og.connect(fluoroGain);o.start();
     }

     // Local standby tones for two recognizable office landmarks.
     printerHumGain=audioCtx.createGain();printerHumGain.gain.value=0;printerHumGain.connect(masterGain);
     {const o=audioCtx.createOscillator();o.type='triangle';o.frequency.value=186;o.connect(printerHumGain);o.start();}
     pbxWhineGain=audioCtx.createGain();pbxWhineGain.gain.value=0;pbxWhineGain.connect(masterGain);
     {const o=audioCtx.createOscillator();o.type='sine';o.frequency.value=410;o.connect(pbxWhineGain);o.start();}
   }
   if(audioCtx.state==='suspended')audioCtx.resume();
 }catch(_e){}
}
function audioOut(){return masterGain||audioCtx?.destination||null}
function setAudioMuted(v){
 audioMuted=!!v;ensureAudio();
 if(masterGain&&audioCtx)masterGain.gain.setTargetAtTime(audioMuted?0:.72,audioCtx.currentTime,.025);
 toast(audioMuted?'AUDIO // OFF':'AUDIO // ON');
}
function tone(freq=700,dur=.08,vol=.02,type='square',endFreq=null){
 ensureAudio();if(!audioCtx||audioMuted)return;
 const now=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();
 o.type=type;o.frequency.setValueAtTime(freq,now);
 if(endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),now+dur);
 g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(vol,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+dur);
 o.connect(g);g.connect(audioOut());o.start(now);o.stop(now+dur+.02);
}
function uiBlip(){tone(760,.055,.014,'square',620)}
function objectiveChime(){
 tone(520,.07,.018,'square',620);
 setTimeout(()=>tone(780,.09,.016,'square',900),70);
}
function footstepSound(){
 footstepSide^=1;
 tone(footstepSide?92:82,.075,.022,'triangle',52);
}
function deviceBeep(){tone(980,.09,.018,'square',760)}
function rackConfirmSound(){
 tone(430,.10,.018,'square',520);
 setTimeout(()=>tone(720,.12,.018,'square',850),105);
}
function printerSound(){
 [0,115,230,345].forEach((ms,i)=>setTimeout(()=>tone(i%2?150:175,.07,.018,'square',105),ms));
}
function knockSound(){
 [0,180,360].forEach(ms=>setTimeout(()=>tone(88,.10,.032,'triangle',48),ms));
}
function phoneRingSound(){
 ensureAudio();if(!audioCtx||audioMuted)return;
 const now=audioCtx.currentTime;
 const gain=audioCtx.createGain();
 gain.gain.setValueAtTime(.0001,now);
 gain.gain.exponentialRampToValueAtTime(.055,now+.015);
 gain.gain.exponentialRampToValueAtTime(.0001,now+.22);
 gain.gain.setValueAtTime(.0001,now+.34);
 gain.gain.exponentialRampToValueAtTime(.05,now+.36);
 gain.gain.exponentialRampToValueAtTime(.0001,now+.58);
 gain.connect(audioOut());
 for(const f of[720,880]){
   const o=audioCtx.createOscillator();
   o.type='square';o.frequency.value=f;o.connect(gain);o.start(now);o.stop(now+.62);
 }
}
function updateAmbientAudio(){
 if(!audioCtx)return;
 const level=atmosphereLevel();
 if(ambientGain)ambientGain.gain.setTargetAtTime(audioMuted?0:.012+level*.0025,audioCtx.currentTime,.18);
 if(fluoroGain)fluoroGain.gain.setTargetAtTime(audioMuted?0:.0035+level*.0055,audioCtx.currentTime,.22);

 const rack=interactables.find(i=>i.id==='server_rack_02');
 if(rack&&serverHumGain){
   const dist=Math.hypot(player.x-rack.x,player.z-rack.z);
   const target=audioMuted?0:Math.max(0,Math.min(.032,(6.2-dist)*.006));
   serverHumGain.gain.setTargetAtTime(target,audioCtx.currentTime,.12);
 }
 const printer=interactables.find(i=>i.id==='printer_main');
 if(printer&&printerHumGain){
   const dist=Math.hypot(player.x-printer.x,player.z-printer.z);
   const target=audioMuted?0:Math.max(0,Math.min(.008,(4.3-dist)*.0024));
   printerHumGain.gain.setTargetAtTime(target,audioCtx.currentTime,.16);
 }
 const phone=interactables.find(i=>i.id==='meet_phone');
 if(phone&&pbxWhineGain){
   const dist=Math.hypot(player.x-phone.x,player.z-phone.z);
   const active=storyStep>=27;
   const target=(audioMuted||!active)?0:Math.max(0,Math.min(.006,(4.8-dist)*.0019));
   pbxWhineGain.gain.setTargetAtTime(target,audioCtx.currentTime,.18);
 }
}
function ambientRelayClick(now){
 if(!audioCtx||audioMuted||dialogueOpen||storyStep<18)return;
 if(now-ambientOneShotLast<8500)return;
 const chance=storyStep>=29?.0040:storyStep>=27?.0024:.0013;
 if(Math.random()<chance){
   ambientOneShotLast=now;
   tone(118,.035,.010,'square',74);
   if(storyStep>=29&&Math.random()<.35)setTimeout(()=>tone(92,.028,.007,'square',58),95);
 }
}
function updateFootsteps(now,dx,dz,oldX,oldZ){
 if(!audioCtx||audioMuted||dialogueOpen)return;
 const actuallyMoved=Math.hypot(player.x-oldX,player.z-oldZ)>.002;
 if(actuallyMoved&&Math.hypot(dx,dz)>.08&&now-footstepLast>330){
   footstepLast=now;footstepSound();
 }
}
function updatePhoneEvent(now,currentRoom){
 // Ring only while the impossible call is active. It becomes clearly audible
 // as soon as the player reaches the eastern/meeting-room side of the studio.
 if(storyStep!==27&&storyStep!==28)return;
 const phone=interactables.find(i=>i.id==='meet_phone');
 if(!phone)return;
 const dist=Math.hypot(player.x-phone.x,player.z-phone.z);
 if(dist<8.0 && now-phoneRingLast>1450){
   phoneRingLast=now;
   phoneRingSound();
   if(currentRoom==='SALA MEET CAPO')toast('DRR... DRR... // TELEFONO');
 }
}

const keys={};
addEventListener("keydown",e=>{
 const k=e.key.toLowerCase();
 if(["w","a","s","d","q","e","arrowup","arrowdown","arrowleft","arrowright","enter"," "].includes(k))ensureAudio();
 if(k==="m"&&!e.repeat){e.preventDefault();setAudioMuted(!audioMuted);return;}
 if(k==="f2"&&!e.repeat){e.preventDefault();openDevMenu();return;}
 if(k==="f3"&&!e.repeat){e.preventDefault();toggleCameraMode();return;}
 if(devMenu&&!devMenu.classList.contains("hidden")){
   if(k==="escape"&&!e.repeat)closeDevMenu();
   e.preventDefault();return;
 }
 if(dialogueOpen&&(k==="enter"||k===" ")){
   e.preventDefault();if(!e.repeat)advanceDialogue();return;
 }
 if(e.key==="Tab"){
   e.preventDefault();
   if(!e.repeat)toggleBigMap();
   return;
 }
 // SPACE is the canonical interaction key in both modes. E is reserved for
 // right-turn in FP; legacy E interaction remains available only in 3/4 DEV.
 if(k===" "&&!e.repeat){e.preventDefault();interact();return;}
 if(viewMode==="dev"&&k==="e"&&!e.repeat){interact();return;}
 keys[k]=1;
});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=0);

let roomBannerTimer=0;
function roomTransitionBanner(name){
 let el=document.getElementById("roomTransition");
 if(!el){
   el=document.createElement("div");
   el.id="roomTransition";
   document.getElementById("app")?.appendChild(el);
 }
 el.textContent=name;
 el.classList.add("on");
 clearTimeout(roomBannerTimer);
 roomBannerTimer=setTimeout(()=>el.classList.remove("on"),900);
}

let dialogueOpen=false,dialogueLines=[],dialogueIndex=0,dialogueDone=null;
function openDialogue(name,lines,onDone){
 ensureAudio();uiBlip();
 dialogueOpen=true;dialogueLines=lines;dialogueIndex=0;dialogueDone=onDone||null;
 activeTalkingNpcId=dialogueNpcMap[name]||null;
 dialogueNameEl.textContent=name;dialogueTextEl.textContent=dialogueLines[0]||"";
 dialogueEl.classList.add("on");
 promptEl.classList.remove("on");
}
function advanceDialogue(){
 if(!dialogueOpen)return false;
 dialogueIndex++;
 if(dialogueIndex<dialogueLines.length){
   dialogueTextEl.textContent=dialogueLines[dialogueIndex];
   uiBlip();
   if(dialogueLines[dialogueIndex].includes("TOC. TOC. TOC.")){knockSound();visualFlicker(.12,85);}
   return true;
 }
 dialogueOpen=false;dialogueEl.classList.remove("on");activeTalkingNpcId=null;
 const done=dialogueDone;dialogueDone=null;
 if(done)done();
 return true;
}
dialogueEl?.addEventListener("pointerdown",e=>{e.preventDefault();ensureAudio();advanceDialogue()},{passive:false});

function effectiveInteractionRange(it){
 // Natural first-person conversation distance. Devices remain a little closer
 // than people so nearby NPC + panel/door triggers do not collapse together.
 if(it.type==="npc")return Math.max(it.range||0,2.05);
 if(it.id==="direzione_door")return Math.max(it.range||0,1.58);
 return Math.max(it.range||0,1.68);
}
function interactionWallBlocked(it){
 // Prevent generous ranges from allowing interaction through walls/closed doors.
 for(const w of wallDefs){
   const t=segmentHitsRect(player.x,player.z,it.x,it.z,w,.025);
   if(t!==null&&t>.025&&t<.965)return true;
 }
 for(const d of doors){
   if(officeState.doors[d.room]!=="closed")continue;
   const t=segmentHitsRect(player.x,player.z,it.x,it.z,closedDoorBarrier(d),.015);
   if(t!==null&&t>.025&&t<.965)return true;
 }
 return false;
}
function nearestInteractable(){
 let best=null,bestScore=Infinity;
 const step=storySteps[storyStep]||{};
 const fx=-Math.sin(cameraState.yaw),fz=-Math.cos(cameraState.yaw);
 for(const it of interactables){
   if(it.type==="npc"&&!isNpcVisible(it.id))continue;
   const vx=it.x-player.x,vz=it.z-player.z;
   const d=Math.hypot(vx,vz);
   const range=effectiveInteractionRange(it);
   if(d>range)continue;

   // DEV camera keeps the old forgiving proximity behaviour. GAME/FP uses a
   // front cone so SPACE selects what the crosshair is actually facing.
   let dot=1;
   if(viewMode==="fp"&&d>.001){
     dot=(vx*fx+vz*fz)/d;
     const minDot=it.type==="npc"?.30:(it.id==="direzione_door"?.54:.42);
     if(dot<minDot)continue;
   }
   if(interactionWallBlocked(it))continue;

   // Distance + aim determine selection. The current mission target receives a
   // modest priority only when it is actually in view, avoiding Lorenzo/Q-DIR
   // trigger overlap while still making objectives pleasant to use.
   let score=d+(1-dot)*1.55;
   if(step.targetInteractable===it.id)score-=.32;
   if(score<bestScore){best=it;bestScore=score;}
 }
 return best;
}
function updateInteractionPrompt(){
 if(dialogueOpen){promptEl.classList.remove("on");return;}
 const it=nearestInteractable();
 if(!it){promptEl.classList.remove("on");return;}
 const step=storySteps[storyStep];
 const active=step.targetInteractable===it.id;
 promptEl.innerHTML=`<b>[SPAZIO]</b> ${active?"INTERAGISCI":"ESAMINA"} — ${it.label}`;
 promptEl.classList.add("on");
}
const tuesdayAmbientDialogue={
 zia_ale:["Secondo giorno e sei ancora qui. Direi che e un ottimo inizio.","Non farti mettere fretta dal Manager: qui sembrano tutti nati gia sapendo dove andare."],
 alice_editoria:["Hai una faccia da secondo giorno.","Quello prima di te al secondo giorno aveva gia imparato a ignorare meta delle richieste. Poi non l'ho piu visto in giro."],
 bim_01:["Ieri verso le due ho sentito passi nel corridoio BIM.","Pensavo fossi tu, ma quando sono uscito non c'era nessuno."],
 bim_02:["Desktop Connector oggi collabora. Non dirlo troppo forte."],
 central_01:["Ti hanno gia dato un badge temporaneo? A me per averne uno ci sono volute settimane."],
 central_02:["Se senti storie sui tirocinanti, ignorale. Qui la gente si annoia."],
 central_03:["Direzione oggi ha chiesto di non lasciare porte aperte. Non so perche."],
 central_04:["Il martedi e il giorno piu normale. Di solito."],
 central_05:["Hai gia conosciuto il Capo? No? Meglio... cioe, prima o poi capita."],
 central_06:["Qua sopra tutti sanno tutto di tutti. Tranne le cose importanti."],
 editoria_02:["Alice parla troppo. Pero sul vecchio stagista non si inventa tutto."],
 marino_interior:["Oggi il server va. Segnatelo sul calendario."],
 interior_02:["La Sala Meet Capo? Io ci entro solo se mi chiamano per nome."],
 render_01:["Render_04 stamattina si e acceso per qualche secondo. Nessuno ha fatto login."],
 render_02:["Quello prima di te restava spesso fino a tardi. Almeno credo. Qui gli orari si confondono."],
 hr_01:["Sei venuto a trovare HR senza che ti abbia chiamato? Cosi mi abitui male."],
 it_manager:["Se non hai un ticket aperto, goditi il momento. Dura poco."]
};
function handleTuesdayInteraction(it){
 if(currentDay!==1||storyStep<TUESDAY_START_STEP||storyStep>TUESDAY_END_STEP)return false;
 if(it.id==="it_manager"){
   if(storyStep===49){
     openDialogue("IT MANAGER",[
       "Secondo giorno. Bene. Non e scontato.",
       "Direzione ha segnalato uno sbalzo sulla linea della Sala Meet Capo.",
       "Sta arrivando Lorenzo, l'elettricista. Prima passa da Betty in HR: ti serve un badge temporaneo per quella zona.",
       "E limita l'intervento a quello che ti viene chiesto. Le aree Direzione non sono un posto dove curiosare."
     ],()=>setStoryStep(50,"MARTEDI // PASSA DA BETTY"));
   }else if(storyStep===57){
     openDialogue("IT MANAGER",[
       "Intervento chiuso? Perfetto.",
       "Se Direzione dice che e a posto, e a posto.",
       "Un consiglio: qui non serve capire tutto. Serve che funzioni.",
       "E non perdere quel badge. Venerdi potresti averne ancora bisogno."
     ],()=>setStoryStep(58,"MARTEDI COMPLETATO // VOCI DI CORRIDOIO"));
   }else openDialogue("IT MANAGER",tuesdayAmbientDialogue.it_manager,null);
   return true;
 }
 if(it.id==="hr_01"){
   if(storyStep===50){
     openDialogue("BETTY",[
       "Secondo giorno e gia ti mandano ai piani alti? Ti stanno prendendo in simpatia.",
       "Questo badge e temporaneo. Vale solo oggi e solo dove decidono loro.",
       "Quello prima di te ne aveva uno uguale...",
       "Lascia stare. Se la porta non si apre, non insistere. Torna da me."
     ],()=>setStoryStep(51,"LORENZO E ARRIVATO // TORNA IN SEGRETERIA"));
   }else if(storyStep===56){
     openDialogue("BETTY",[
       "L'hai incontrato.",
       "Non serve che mi rispondi, si vede.",
       "Il badge non doveva aprire quella porta. E infatti non l'ha aperta.",
       "Se venerdi ti chiedono di restare oltre l'orario... passa da me prima.",
       "Sto facendo terrorismo aziendale, niente di piu. Vai, prima che il Manager ti cerchi."
     ],()=>setStoryStep(57,"TORNA DALL'IT MANAGER"));
   }else openDialogue("BETTY",tuesdayAmbientDialogue.hr_01,null);
   return true;
 }
 if(it.id==="lorenzo"){
   if(storyStep===51){
     openDialogue("LORENZO",[
       "Tu devi essere il nuovo IT. Lorenzo. Elettricista, rompiscatole professionista.",
       "Mi hanno chiamato per la linea della Sala Meet Capo. Salta senza sovraccarico.",
       "La cosa divertente e che quando arrivo io funziona sempre tutto.",
       "Andiamo a vedere prima che qualcuno decida che e colpa del Wi-Fi."
     ],()=>setStoryStep(52,"ACCOMPAGNA LORENZO // DIREZIONE"));
   }else if(storyStep===54){
     openDialogue("LORENZO",[
       "Due kilowatt con la stanza vuota? Non sono quattro faretti.",
       "Guarda il sigillo: la targhetta e vecchia, il sigillo e nuovo.",
       "Ogni volta che provo a staccare quella linea compare qualcuno a dirmi di lasciarla stare.",
       "Facciamo finta di non aver visto niente. E una tecnica di manutenzione molto usata."
     ],()=>setStoryStep(55,"CLACK // LA PORTA SI APRE"));
   }else openDialogue("LORENZO",["Io resto qui ancora un minuto. Se senti un botto, non era il Wi-Fi."],null);
   return true;
 }
 if(it.id==="direzione_door"){
   if(storyStep===52){
     deviceBeep();openDialogue("PORTA DIREZIONE",[
       "BADGE TEMPORANEO // LETTURA...",
       "ACCESSO NEGATO // PROFILO NON AUTORIZZATO.",
       "ULTIMO ACCESSO REGISTRATO: 06:12 // DIREZIONE.",
       "PORTA BLOCCATA."
     ],()=>setStoryStep(53,"ACCESSO NEGATO // CONTROLLA IL QUADRO"));
   }else if(storyStep<55)openDialogue("PORTA DIREZIONE",["ACCESSO RISERVATO // BADGE NON AUTORIZZATO."],null);
   else openDialogue("PORTA DIREZIONE",["ACCESSO DIREZIONE."],null);
   return true;
 }
 if(it.id==="direzione_panel"){
   if(storyStep===53){
     deviceBeep();openDialogue("QUADRO ELETTRICO DIREZIONE",[
       "Q-DIR // LINEA 4.",
       "STATO: ATTIVA // PROTEZIONE: OK.",
       "ASSORBIMENTO ISTANTANEO: 2.1 kW.",
       "OCCUPAZIONE SALA: 0.",
       "ETICHETTA MANUALE: NON DISALIMENTARE."
     ],()=>setStoryStep(54,"PARLA CON LORENZO"));
   }else openDialogue("QUADRO ELETTRICO DIREZIONE",["Q-DIR // LINEA 4 ATTIVA.","ETICHETTA: NON DISALIMENTARE."],null);
   return true;
 }
 if(it.id==="capo"){
   if(storyStep===55){
     openDialogue("CAPO",[
       "Ah. Tu devi essere il nuovo stagista IT.",
       "Benvenuto. Spero che il primo giorno non ti abbia spaventato.",
       "Qui all'inizio sembra tutto piu complicato di quanto sia.",
       "Venerdi facciamo sempre un piccolo punto con i nuovi. Ci vediamo allora."
     ],()=>setStoryStep(56,"PASSA DA BETTY"));
   }
   return true;
 }
 // Optional conversations make Tuesday feel populated and reward exploration.
 if(it.type==="npc"&&tuesdayAmbientDialogue[it.id]){
   openDialogue(it.label,tuesdayAmbientDialogue[it.id],null);return true;
 }
 if(it.type==="device"){
   openDialogue(it.label,["MARTEDI // NESSUN INTERVENTO ASSEGNATO SU QUESTO DISPOSITIVO."],null);return true;
 }
 return false;
}

const wednesdayAmbientDialogue={
 zia_ale:["Mercoledi. Meta settimana.","Se continui a guardare i corridoi come se dovesse uscire qualcuno dal muro, ti offro un caffe doppio."],
 alice_editoria:["Stamattina per un secondo i miei monitor sono diventati tutti neri.","Poi hanno ripreso. Il Manager dice aggiornamenti."],
 bim_01:["Ti giuro che la luce del corridoio ieri era diversa. O forse devo dormire."],
 bim_02:["Oggi Desktop Connector va. Questo e gia inquietante."],
 central_01:["Hai presente quando entri in una stanza e per mezzo secondo non la riconosci? No? Lascia stare."],
 central_02:["Da quando sei arrivato qui si parla molto piu del solito."],
 central_03:["Direzione ha chiesto un controllo dei log accessi. Nessuno mi ha detto perche."],
 central_04:["Se senti odore di umido, viene dal condizionamento. Almeno credo."],
 central_05:["Il Capo oggi non si e ancora visto. Meglio cosi."],
 central_06:["Qui hanno rifatto tutto anni fa. Sotto, pero, e rimasto mezzo edificio vecchio."],
 editoria_02:["Alice dice che hai visto qualcuno lunedi. Qui le storie corrono veloci."],
 marino_interior:["Se ti serve un consiglio: non fare domande a cui nessuno vuole rispondere."],
 interior_02:["Ogni tanto il mio telefono mostra un interno che non esiste. Riavvio e passa."],
 render_01:["Render_04 oggi non si e acceso. Per ora."],
 render_02:["Quello prima di te diceva che lo studio cambiava faccia. Pensavo scherzasse."],
 hr_01:["Sei pallido. E siamo solo a mercoledi."],
 it_manager:["Hai un ticket aperto. Concentrati su quello."]
};
function handleWednesdayInteraction(it){
 if(currentDay!==2||storyStep<WEDNESDAY_START_STEP||storyStep>WEDNESDAY_END_STEP)return false;
 if(it.id==="it_manager"){
   if(storyStep===60){
     openDialogue("IT MANAGER",[
       "Inventario asset ha segnalato una macchina duplicata nel magazzino IT.",
       "E un terminale vecchio, probabilmente rimasto nel database dopo l'ultima ristrutturazione.",
       "Vai nel server, controlla il terminale legacy e chiudi la segnalazione.",
       "E no, non serve coinvolgere HR. E solo inventario."
     ],()=>setStoryStep(61,"MERCOLEDI // SERVER / MAGAZZINO IT"));
   }else if(storyStep===66){
     openDialogue("IT MANAGER",[
       "Un ufficio vecchio? Nel server?",
       "Hai fissato un CRT per troppo tempo. Succede.",
       "Quel terminale non dovrebbe neanche essere alimentato. Lo faccio rimuovere.",
       "E se Betty ti ha raccontato altre storie, ignorale. Qui la gente adora creare misteri.",
       "Chiudiamo questa cosa e lavoriamo."
     ],()=>setStoryStep(67,"MERCOLEDI COMPLETATO // THE OTHER OFFICE"));
   }else openDialogue("IT MANAGER",wednesdayAmbientDialogue.it_manager,null);
   return true;
 }
 if(it.id==="legacy_terminal"){
   if(storyStep===62){
     deviceBeep();openDialogue("TERMINALE INVENTARIO LEGACY",[
       "ASSET INVENTORY // NODE LEGACY-07.",
       "HARDWARE ID: NON PRESENTE NEL DATABASE CORRENTE.",
       "ULTIMA SINCRONIZZAZIONE: 17/09/2009 // 03:11.",
       "SESSIONE LOCALE: ATTIVA.",
       "UTENTE: IT_TRAINEE_07.",
       "PERCORSO PROFILO: HR\\ARCHIVIO\\TIROCINANTI.",
       "...",
       "VIDEO SIGNAL LOST."
     ],()=>{beginOtherOfficeShift();setStoryStep(63,"... DOVE SONO TUTTI?");});
   }else openDialogue("TERMINALE INVENTARIO LEGACY",["LEGACY-07 // NESSUNA SESSIONE DISPONIBILE."],null);
   return true;
 }
 if(it.id==="hr_01"){
   if(storyStep===64){
     openDialogue("BETTY",[
       "Fermati un secondo. Sei bianco.",
       "Cos'hai visto?",
       "...no. Non dirmelo qui.",
       "Dimmi soltanto una cosa: sembrava lo stesso studio, ma vecchio?",
       "Lascia stare. Non avrei dovuto chiedertelo.",
       "Lorenzo e in Segreteria per una plafoniera. Parlaci. E soprattutto non raccontare questa cosa al Manager come l'hai raccontata a me."
     ],()=>setStoryStep(65,"LORENZO E IN SEGRETERIA"));
   }else openDialogue("BETTY",wednesdayAmbientDialogue.hr_01,null);
   return true;
 }
 if(it.id==="lorenzo"){
   if(storyStep===65){
     openDialogue("LORENZO",[
       "Hai la faccia di uno che ha visto un impianto fuori norma.",
       "Quando hanno rifatto questo posto hanno costruito sopra la struttura vecchia. Cavi, canaline, pezzi di controsoffitto: non hanno tolto quasi niente.",
       "Le planimetrie nuove e quelle vecchie non coincidono. In alcuni punti manca perfino una porta.",
       "Se ti ricapita una cosa strana, conta le porte. Le luci possono mentire. I muri molto meno.",
       "Comunque io non ti ho detto niente. Ho ancora delle fatture da farmi pagare."
     ],()=>setStoryStep(66,"TORNA DALL'IT MANAGER"));
   }else openDialogue("LORENZO",["Oggi sono qui solo per una plafoniera. Almeno ufficialmente."],null);
   return true;
 }
 if(it.id==="hr_archive_box"){
   if(storyStep>=64){
     openDialogue("ARCHIVIO HR",[
       "SCATOLA PERSONALE // ACCESSO HR.",
       "ETICHETTA: TIROCINANTI IT // 2022–2026.",
       "QUATTRO CARTELLE. UN ALLOGGIAMENTO VUOTO.",
       "Sul bordo, a matita: NON ARCHIVIARE IN DIGITALE."
     ],null);
   }else openDialogue("ARCHIVIO HR",["ARCHIVIO PERSONALE // ACCESSO RISERVATO HR."],null);
   return true;
 }
 if(it.type==="npc"&&wednesdayAmbientDialogue[it.id]){openDialogue(it.label,wednesdayAmbientDialogue[it.id],null);return true;}
 if(it.type==="device"){
   openDialogue(it.label,["MERCOLEDI // NESSUN ALTRO INTERVENTO ASSEGNATO SU QUESTO DISPOSITIVO."],null);return true;
 }
 return false;
}

function interact(){
 if(dialogueOpen){advanceDialogue();return;}
 const it=nearestInteractable();
 if(!it){toast(roomAt(player.x,player.z)+" // NIENTE DA INTERAGIRE");return;}

 if(handleTuesdayInteraction(it))return;
 if(handleWednesdayInteraction(it))return;

 // Thursday/Friday remain structural checkpoints until their chapters are authored.
 if(currentDay>=3 && storyStep>=THURSDAY_START_STEP){
   const d=currentDayDef();
   if(it.type==="npc")openDialogue(it.label,[`${d.label} // ${d.chapter}.`,`CAPITOLO PRONTO PER LO SVILUPPO NEL PROSSIMO MILESTONE.`],null);
   else openDialogue(it.label,[`${d.label} // STATO DI TEST.`,`QUESTO OGGETTO E PRONTO PER LE MISSIONI DEL CAPITOLO.`],null);
   return;
 }

 if(it.id==="zia_ale"){
   if(storyStep===0){
     openDialogue("ZIA ALE",[
       "Buongiorno. Sei appena arrivato e ti stanno gia cercando.",
       "Passa dal reparto IT: il Manager vuole parlarti prima che inizi il giro.",
       "E magari dopo riesci anche a prendere un caffe. Magari."
     ],()=>setStoryStep(1,"INIZIO TURNO // VAI IN IT"));
   }else if(storyStep===34){
     openDialogue("ZIA ALE",[
       "Finalmente cinque minuti senza qualcuno che ti chiama per una password.",
       "Prima, mentre venivo qui, ho sentito tre colpi dal corridoio delle sale meeting.",
       "Probabilmente era qualche porta. Questo posto fa rumori strani anche quando e pieno.",
       "Mangia qualcosa. Dopo pranzo si ricomincia."
     ],()=>setStoryStep(35,"FINE PAUSA // TORNA IN IT"));
   }else{
     openDialogue("ZIA ALE",["Tutto bene? Io non ho visto niente. Come sempre."],null);
   }
   return;
 }

 if(it.id==="it_manager"){
   if(storyStep===2){
     openDialogue("IT MANAGER",[
       "Eccoti. Stamattina proviamo a partire senza emergenze.",
       "Accendi la tua postazione e controlla subito i ticket prioritari.",
       "Se c'e qualcosa sul server, vai direttamente tu."
     ],()=>setStoryStep(3,"POSTAZIONE IT // CONTROLLA I TICKET"));
   }else if(storyStep===7){
     openDialogue("IT MANAGER",[
       "Risolto il problema al rack?",
       "Bene. Segna l'intervento come chiuso dopo.",
       "Prima passa da Alice in Editoria: ha una stampa bloccata e la vuole subito."
     ],()=>setStoryStep(8,"NUOVA RICHIESTA // EDITORIA"));
   }else if(storyStep===19){
     openDialogue("IT MANAGER",[
       "Render_04 e spenta?",
       "Allora sara un ticket automatico rimasto in coda.",
       "Chiudilo come anomalia e vai avanti. Abbiamo gia perso abbastanza tempo."
     ],()=>setStoryStep(20,"M2.6 COMPLETATO // IL TURNO CONTINUA"));
   }else if(storyStep===20){
     openDialogue("IT MANAGER",[
       "Gia che ci sei: Marino in Interior non apre la cartella di progetto.",
       "Probabile mapping saltato. Vai, sistemalo e chiudiamo almeno una cosa normale.",
       "Poi torna qui."
     ],()=>setStoryStep(21,"NUOVA RICHIESTA // INTERIOR"));
   }else if(storyStep===31){
     openDialogue("IT MANAGER",[
       "Aspetta. Il telefono ha squillato davvero con il cavo rete staccato?",
       "No. Quello non puo arrivare dal centralino.",
       "Non aprire un ticket. Per ora non scrivere niente e lascia stare quella sala."
     ],()=>setStoryStep(32,"ANOMALIA CONFERMATA"));
   }else if(storyStep<2){
     openDialogue("IT MANAGER",["Prima passa dalla segreteria. Poi ne parliamo."],null);
   }else if(storyStep<7){
     openDialogue("IT MANAGER",["Finisci prima l'intervento che ti ho assegnato."],null);
   }else if(storyStep<19){
     openDialogue("IT MANAGER",["Hai ancora una richiesta aperta. Chiudila prima."],null);
   }else if(storyStep>20&&storyStep<31){
     openDialogue("IT MANAGER",["Finisci prima la richiesta che ti ho dato. Poi ne parliamo."],null);
   }else if(storyStep===32){
     openDialogue("IT MANAGER",[
       "Per ora lascia stare quella sala. Se ricapita, vieni direttamente da me.",
       "Sono quasi le tredici. Vai a mangiare qualcosa e stacca dieci minuti.",
       "Alle 13:30 ripartiamo. Sperando con problemi normali."
     ],()=>setStoryStep(33,"PAUSA PRANZO // VAI IN CUCINA"));
   }else if(storyStep===46){
     openDialogue("IT MANAGER",[
       "Una persona ferma in mezzo al corridoio?",
       "No. Non ho mandato nessuno e da qui non e passato nessuno.",
       "Se era uno dei ragazzi lo ritrovi alla sua postazione.",
       "Lascia stare per adesso. Se la rivedi, non seguirla."
     ],()=>setStoryStep(47,"M3.2 COMPLETATO // QUALCOSA ERA NEL CORRIDOIO"));
   }else if(storyStep>32){
     openDialogue("IT MANAGER",["Per ora niente di nuovo. Tieni d'occhio i ticket."],null);
   }else{
     openDialogue("IT MANAGER",["Per ora tutto tranquillo. Tieni d'occhio i ticket."],null);
   }
   return;
 }

 if(it.id==="pc_it"){
   if(storyStep===3){deviceBeep();
     openDialogue("PC REPARTO IT",[
       "LOGIN ARCHEA // SESSIONE APERTA.",
       "TICKET PRIORITARIO: SERVER RACK 02 NON RAGGIUNGIBILE.",
       "VERIFICA DIRETTAMENTE NEL SERVER / MAGAZZINO IT."
     ],()=>setStoryStep(4,"NUOVO TICKET // SERVER RACK 02"));
   }else if(storyStep<3){
     toast("PRIMA PARLA CON L'IT MANAGER");
   }else if(storyStep===15){
     deviceBeep();openDialogue("PC REPARTO IT",[
       "TICKET STAMPANTE // RISOLTO.",
       "CODA PRIORITARIA: 1.",
       "NUOVO TICKET: RENDER_04 // NESSUN SEGNALE VIDEO.",
       "APERTURA TICKET: 10:02 // SORGENTE: RENDER_04."
     ],()=>setStoryStep(16,"NUOVO TICKET // RENDER_04"));
   }else if(storyStep===26){
     deviceBeep();openDialogue("PC REPARTO IT",[
       "TICKET INTERIOR_03 // RISOLTO.",
       "MAPPING PROGETTO RIPRISTINATO // SMB OK.",
       "LOG PBX // CHIAMATA INTERNA ATTIVA.",
       "DESTINAZIONE: SALA MEET CAPO // INTERNO 281.",
       "IL TELEFONO STA SQUILLANDO ADESSO."
     ],()=>setStoryStep(27,"PBX // CHIAMATA IN SALA MEET CAPO"));
   }else if(storyStep===36){
     deviceBeep();openDialogue("PC REPARTO IT",[
       "SESSIONE RIPRESA // 13:30.",
       "TICKET PRIORITARI: 0.",
       "SISTEMI PRINCIPALI: ONLINE.",
       "EVENTI NON CLASSIFICATI: 1."
     ],()=>setStoryStep(37,"M3.2 // NUOVA RICHIESTA IN ARRIVO"));
   }else if(storyStep===37){
     deviceBeep();openDialogue("PC REPARTO IT",[
       "NUOVO TICKET // BIM 02.",
       "AUTODESK DESKTOP CONNECTOR: PROGETTO CLOUD NON SINCRONIZZATO.",
       "RETE: ONLINE // ACCOUNT: CONNESSO.",
       "RICHIESTA UTENTE: VERIFICA POSTAZIONE."
     ],()=>setStoryStep(38,"NUOVA RICHIESTA // BIM 02"));
   }else if(storyStep===45){
     deviceBeep();openDialogue("PC REPARTO IT",[
       "TICKET BIM 02 // RISOLTO.",
       "SYNC PROGETTO: OK // CACHE AGGIORNATA.",
       "CODA PRIORITARIA: 0.",
       "NESSUN EVENTO DI SISTEMA REGISTRATO NEL CORRIDOIO."
     ],()=>setStoryStep(46,"PARLA CON IL MANAGER"));
   }else if(storyStep>=47){
     openDialogue("PC REPARTO IT",[
       "TICKET PRIORITARI: 0.",
       "SISTEMI PRINCIPALI: ONLINE.",
       "EVENTI NON CLASSIFICATI: 1."
     ],null);
   }else if(storyStep>=27){
     openDialogue("PC REPARTO IT",[
       "TICKET INTERIOR_03 // CHIUSO.",
       "LOG PBX // NESSUN EVENTO ATTIVO."
     ],null);
   }else if(storyStep>=16){
     openDialogue("PC REPARTO IT",[
       "TICKET STAMPANTE // CHIUSO.",
       "TICKET RENDER_04 // ARCHIVIATO COME ANOMALIA."
     ],null);
   }else if(storyStep>=8){
     openDialogue("PC REPARTO IT",["TICKET STAMPANTE // IN LAVORAZIONE."],null);
   }else{
     openDialogue("PC REPARTO IT",["TICKET RACK 02 // IN LAVORAZIONE."],null);
   }
   return;
 }

 if(it.id==="server_rack_02"){
   if(storyStep===5){
     rackConfirmSound();openDialogue("RACK SERVER 02",[
       "LINK DOWN // PORTA DI RETE NON ATTIVA.",
       "RILASCIO / RINNOVO CONNESSIONE...",
       "LINK RIPRISTINATO. PING OK."
     ],()=>setStoryStep(6,"TICKET RISOLTO // TORNA IN IT"));
   }else if(storyStep<5){
     toast("NESSUN INTERVENTO ASSEGNATO SU QUESTO RACK");
   }else{
     openDialogue("RACK SERVER 02",["STATO: ONLINE // PING OK."],null);
   }
   return;
 }

 if(it.id==="alice_editoria"){
   if(storyStep===33||storyStep===34){
     openDialogue("ALICE",["Io mangio in fretta: se la stampante si blocca anche durante pranzo, faccio finta di non conoscerla."],null);
   }else if(storyStep===9){
     openDialogue("ALICE",[
       "Meno male. Ho mandato tre volte lo stesso PDF e non esce niente.",
       "La coda dice 'in stampa', ma la macchina non si muove.",
       "Puoi controllare? Mi serve prima della riunione."
     ],()=>setStoryStep(10,"TICKET STAMPANTE // VAI ALLE STAMPANTI"));
   }else if(storyStep===13){
     openDialogue("ALICE",[
       "Eccola. E partita adesso.",
       "Perfetto, grazie. Ti devo un caffe.",
       "Sempre che oggi la macchinetta decida di collaborare."
     ],()=>setStoryStep(14,"TICKET RISOLTO // TORNA IN IT"));
   }else if(storyStep<9){
     openDialogue("ALICE",["Hai un minuto? La stampante continua a ignorarmi."],null);
   }else{
     openDialogue("ALICE",["Qui ora stampa tutto. Per il momento."],null);
   }
   return;
 }

 if(it.id==="bim_02"){
   if(storyStep===39){
     openDialogue("BIM 02",[
       "Il progetto cloud c'e, ma qui non si aggiorna piu.",
       "Desktop Connector dice connesso e poi resta fermo.",
       "Sul portatile dello stesso account invece vedo tutto."
     ],()=>setStoryStep(40,"BIM // CONTROLLA LA POSTAZIONE"));
   }else if(storyStep===41){
     openDialogue("BIM 02",[
       "Adesso e tornato. Vedo anche le ultime cartelle.",
       "Perfetto. Grazie."
     ],()=>setStoryStep(42,"TICKET RISOLTO // TORNA IN IT"));
   }else if(storyStep<39){
     openDialogue("BIM 02",["Per ora sto lavorando. Se si blocca qualcosa ti chiamo."],null);
   }else{
     openDialogue("BIM 02",["La sincronizzazione ora e regolare."],null);
   }
   return;
 }

 if(it.id==="bim_pc_02"){
   if(storyStep===40){
     deviceBeep();openDialogue("PC BIM 02",[
       "DESKTOP CONNECTOR // SESSIONE ATTIVA.",
       "PROGETTO CLOUD // STATO: SINCRONIZZAZIONE BLOCCATA.",
       "ARRESTO PROCESSO CACHE... RIAVVIO CONNETTORE...",
       "RILETTURA WORKSPACE...",
       "PROGETTO CLOUD // SINCRONIZZATO."
     ],()=>setStoryStep(41,"BIM RIPRISTINATO // AVVISA BIM 02"));
   }else if(storyStep<40){
     openDialogue("PC BIM 02",["DESKTOP CONNECTOR // ONLINE."],null);
   }else{
     openDialogue("PC BIM 02",["PROGETTO CLOUD // SINCRONIZZATO."],null);
   }
   return;
 }

 if(it.id==="printer_main"){
   if(storyStep===11){
     printerSound();openDialogue("STAMPANTE PRINCIPALE",[
       "CODA BLOCCATA // 7 PROCESSI IN ATTESA.",
       "ARRESTO SPOOLER... SVUOTAMENTO CODA...",
       "RIAVVIO SERVIZIO...",
       "STATO: PRONTA // JOB 1 IN USCITA."
     ],()=>setStoryStep(12,"STAMPANTE RIPRISTINATA // TORNA DA ALICE"));
   }else if(storyStep<11){
     toast("NESSUN INTERVENTO ASSEGNATO SU QUESTA STAMPANTE");
   }else{
     openDialogue("STAMPANTE PRINCIPALE",["STATO: PRONTA // CODA REGOLARE."],null);
   }
   return;
 }

 if(it.id==="render_04"){
   if(storyStep===17){
     openDialogue("POSTAZIONE RENDER_04",[
       "POWER: OFF.",
       "NESSUNA SESSIONE UTENTE ATTIVA.",
       "ULTIMO ARRESTO REGISTRATO: 18:41 // IERI.",
       "TICKET APERTO: 10:02 // SORGENTE: RENDER_04."
     ],()=>setStoryStep(18,"POSTAZIONE SPENTA // TORNA IN IT"));
   }else if(storyStep<17){
     openDialogue("POSTAZIONE RENDER_04",["SCHERMO SPENTO. NESSUNA ATTIVITA VISIBILE."],null);
   }else{
     openDialogue("POSTAZIONE RENDER_04",["POWER: OFF // NESSUNA SESSIONE."],null);
   }
   return;
 }

 if(it.id==="marino_interior"){
   if(storyStep===33||storyStep===34){
     openDialogue("MARINO",["Se arriva una richiesta adesso, per i prossimi dieci minuti non sono tecnicamente in edificio."],null);
   }else if(storyStep===22){
     openDialogue("MARINO",[
       "La cartella del progetto e sparita da Esplora File.",
       "Internet va, Revit va, ma il server non me lo apre piu.",
       "E ovviamente mi serve adesso."
     ],()=>setStoryStep(23,"INTERIOR // CONTROLLA IL PC"));
   }else if(storyStep===24){
     openDialogue("MARINO",[
       "E tornata. Vedo di nuovo tutto.",
       "Perfetto, grazie. Ora faccio finta che non sia mai successo."
     ],()=>setStoryStep(25,"TICKET RISOLTO // TORNA IN IT"));
   }else if(storyStep<22){
     openDialogue("MARINO",["Quando puoi avrei un problema con la cartella di progetto."],null);
   }else{
     openDialogue("MARINO",["Il server ora e raggiungibile. Tutto a posto."],null);
   }
   return;
 }

 if(it.id==="interior_pc_03"){
   if(storyStep===23){
     deviceBeep();openDialogue("PC INTERIOR_03",[
       "UNITA PROGETTO // NON DISPONIBILE.",
       "RETE LOCALE: OK // DNS: OK.",
       "RINNOVO SESSIONE DI RETE...",
       "RIMAPPATURA CONDIVISIONE SMB...",
       "UNITA PROGETTO // CONNESSA."
     ],()=>setStoryStep(24,"ACCESSO RIPRISTINATO // AVVISA MARINO"));
   }else if(storyStep<23){
     openDialogue("PC INTERIOR_03",["DESKTOP ATTIVO // NESSUN INTERVENTO ASSEGNATO."],null);
   }else{
     openDialogue("PC INTERIOR_03",["UNITA PROGETTO // CONNESSA."],null);
   }
   return;
 }

 if(it.id==="meet_phone"){
   if(storyStep===28){
     openDialogue("TELEFONO SALA MEET CAPO",[
       "DRR... DRR...",
       "DISPLAY: CHIAMATA INTERNA // 281.",
       "RISPOSTA...",
       "NESSUNA VOCE.",
       "TOC. TOC. TOC.",
       "CHIAMATA TERMINATA."
     ],()=>setStoryStep(29,"QUALCOSA NON TORNA // CONTROLLA IL TELEFONO"));
   }else if(storyStep===29){
     openDialogue("TELEFONO SALA MEET CAPO",[
       "ALIMENTAZIONE LOCALE: PRESENTE.",
       "CAVO RETE: DISCONNESSO.",
       "ULTIMO LINK PBX: 18:44 // IERI.",
       "CHIAMATA RICEVUTA: 10:42 // OGGI."
     ],()=>setStoryStep(30,"IL TELEFONO NON POTEVA SQUILLARE // TORNA IN IT"));
   }else if(storyStep<28){
     openDialogue("TELEFONO SALA MEET CAPO",["NESSUNA CHIAMATA ATTIVA."],null);
   }else{
     openDialogue("TELEFONO SALA MEET CAPO",["CAVO RETE: DISCONNESSO // NESSUNA LINEA PBX."],null);
   }
   return;
 }
}
let jx=0,jy=0,mobileTurn=0;const st=document.getElementById("stick"),nub=st?.querySelector("i");
if(st){const set=e=>{ensureAudio();const t=e.touches?.[0]||e,r=st.getBoundingClientRect();let x=(t.clientX-r.left-r.width/2)/(r.width*.32),y=(t.clientY-r.top-r.height/2)/(r.height*.32),l=Math.hypot(x,y);if(l>1){x/=l;y/=l}jx=x;jy=y;nub.style.transform=`translate(${x*31}px,${y*31}px)`;e.preventDefault()};
const stop=e=>{jx=jy=0;nub.style.transform="";e.preventDefault()};st.addEventListener("pointerdown",set,{passive:false});st.addEventListener("pointermove",e=>{if(e.buttons||e.pointerType==="touch")set(e)},{passive:false});st.addEventListener("pointerup",stop,{passive:false});st.addEventListener("touchstart",set,{passive:false});st.addEventListener("touchmove",set,{passive:false});st.addEventListener("touchend",stop,{passive:false})}
document.getElementById("act")?.addEventListener("pointerdown",e=>{e.preventDefault();ensureAudio();dialogueOpen?advanceDialogue():interact()});
for(const [id,val] of [["turnL",1],["turnR",-1]]){
 const b=document.getElementById(id);if(!b)continue;
 const on=e=>{e.preventDefault();ensureAudio();mobileTurn=val;};
 const off=e=>{e.preventDefault();if(mobileTurn===val)mobileTurn=0;};
 b.addEventListener("pointerdown",on,{passive:false});b.addEventListener("pointerup",off,{passive:false});b.addEventListener("pointercancel",off,{passive:false});b.addEventListener("pointerleave",off,{passive:false});
}
function mul(a,b){
 const o=new Float32Array(16);
 const a00=a[0],a01=a[1],a02=a[2],a03=a[3];
 const a10=a[4],a11=a[5],a12=a[6],a13=a[7];
 const a20=a[8],a21=a[9],a22=a[10],a23=a[11];
 const a30=a[12],a31=a[13],a32=a[14],a33=a[15];

 let b0=b[0],b1=b[1],b2=b[2],b3=b[3];
 o[0]=b0*a00+b1*a10+b2*a20+b3*a30;
 o[1]=b0*a01+b1*a11+b2*a21+b3*a31;
 o[2]=b0*a02+b1*a12+b2*a22+b3*a32;
 o[3]=b0*a03+b1*a13+b2*a23+b3*a33;

 b0=b[4];b1=b[5];b2=b[6];b3=b[7];
 o[4]=b0*a00+b1*a10+b2*a20+b3*a30;
 o[5]=b0*a01+b1*a11+b2*a21+b3*a31;
 o[6]=b0*a02+b1*a12+b2*a22+b3*a32;
 o[7]=b0*a03+b1*a13+b2*a23+b3*a33;

 b0=b[8];b1=b[9];b2=b[10];b3=b[11];
 o[8]=b0*a00+b1*a10+b2*a20+b3*a30;
 o[9]=b0*a01+b1*a11+b2*a21+b3*a31;
 o[10]=b0*a02+b1*a12+b2*a22+b3*a32;
 o[11]=b0*a03+b1*a13+b2*a23+b3*a33;

 b0=b[12];b1=b[13];b2=b[14];b3=b[15];
 o[12]=b0*a00+b1*a10+b2*a20+b3*a30;
 o[13]=b0*a01+b1*a11+b2*a21+b3*a31;
 o[14]=b0*a02+b1*a12+b2*a22+b3*a32;
 o[15]=b0*a03+b1*a13+b2*a23+b3*a33;
 return o;
}
function persp(fov,aspect,near,far){
 const f=1/Math.tan(fov/2);
 const nf=1/(near-far);
 const o=new Float32Array(16);
 o[0]=f/aspect;
 o[5]=f;
 o[10]=(far+near)*nf;
 o[11]=-1;
 o[14]=2*far*near*nf;
 return o;
}
function look(ex,ey,ez,cx,cy,cz){
 // Standard right-handed WebGL lookAt.
 // z = camera backward axis, x = cross(worldUp,z), y = cross(z,x).
 let zx=ex-cx,zy=ey-cy,zz=ez-cz;
 let len=Math.hypot(zx,zy,zz)||1;
 zx/=len;zy/=len;zz/=len;

 let xx=zz,xy=0,xz=-zx;
 len=Math.hypot(xx,xy,xz)||1;
 xx/=len;xy/=len;xz/=len;

 const yx=zy*xz-zz*xy;
 const yy=zz*xx-zx*xz;
 const yz=zx*xy-zy*xx;

 const o=new Float32Array(16);
 o[0]=xx; o[1]=yx; o[2]=zx; o[3]=0;
 o[4]=xy; o[5]=yy; o[6]=zy; o[7]=0;
 o[8]=xz; o[9]=yz; o[10]=zz; o[11]=0;
 o[12]=-(xx*ex+xy*ey+xz*ez);
 o[13]=-(yx*ex+yy*ey+yz*ez);
 o[14]=-(zx*ex+zy*ey+zz*ez);
 o[15]=1;
 return o;
}
function trans(x,y,z){
 const o=new Float32Array(16);
 o[0]=1;o[5]=1;o[10]=1;o[15]=1;
 o[12]=x;o[13]=y;o[14]=z;
 return o;
}
const saved=V.slice();V.length=0;box(0,0,0,.42,.78,.38,[.34,.41,.33]);box(0,.78,0,.38,.34,.35,[.68,.51,.38]);const pV=new Float32Array(V);V.length=0;V.push(...saved);


const miniMap=document.getElementById("miniMap");
const miniCtx=miniMap?.getContext("2d");
const bigMap=document.getElementById("bigMap");
const bigMapCanvas=document.getElementById("bigMapCanvas");
const bigCtx=bigMapCanvas?.getContext("2d");

const mapBounds={minX:-12.8,maxX:14.8,minZ:-13.9,maxZ:13.0};

function objectiveRoom(){
 return storySteps[storyStep]?.targetRoom||null;
}
function mapTransform(canvas,x,z){
 const pad=16;
 const cx=(mapBounds.minX+mapBounds.maxX)/2;
 const cz=(mapBounds.minZ+mapBounds.maxZ)/2;

 // Rotate world coordinates into camera space.
 // Map "up" = same direction as screen "up".
 const dx=x-cx,dz=z-cz;
 const yaw=cameraState.yaw;
 const rightX=Math.cos(yaw), rightZ=-Math.sin(yaw);
 const forwardX=-Math.sin(yaw), forwardZ=-Math.cos(yaw);

 const mx=dx*rightX + dz*rightZ;
 const my=dx*forwardX + dz*forwardZ;

 const halfW=(mapBounds.maxX-mapBounds.minX)/2;
 const halfH=(mapBounds.maxZ-mapBounds.minZ)/2;
 const extent=Math.max(halfW,halfH)*1.12;
 const sx=(canvas.width-pad*2)/(extent*2);
 const sy=(canvas.height-pad*2)/(extent*2);

 return {
   x:canvas.width/2 + mx*sx,
   y:canvas.height/2 - my*sy,
   sx,sy
 };
}
function drawStudioMap(ctx,canvas,labels=false){
 if(!ctx)return;
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle="#050706";ctx.fillRect(0,0,canvas.width,canvas.height);

 const current=roomAt(player.x,player.z);
 const obj=objectiveRoom();

 function polyForRect(r){
   return [
     mapTransform(canvas,r.x-r.w/2,r.z-r.d/2),
     mapTransform(canvas,r.x+r.w/2,r.z-r.d/2),
     mapTransform(canvas,r.x+r.w/2,r.z+r.d/2),
     mapTransform(canvas,r.x-r.w/2,r.z+r.d/2)
   ];
 }
 function drawPoly(poly,fill,stroke,width=1){
   ctx.beginPath();
   ctx.moveTo(poly[0].x,poly[0].y);
   for(let i=1;i<poly.length;i++)ctx.lineTo(poly[i].x,poly[i].y);
   ctx.closePath();
   ctx.fillStyle=fill;ctx.fill();
   ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();
 }
 function drawZone(r,isCorridor=false){
   const poly=polyForRect(r);
   drawPoly(
     poly,
     r.name===current?"#304535":(isCorridor?"#202a23":"#151d18"),
     r.name===obj?"#ffc857":(isCorridor?"#435447":"#53665a"),
     r.name===obj?3:1
   );

   if(labels&&!isCorridor){
     const p=mapTransform(canvas,r.x,r.z);
     ctx.fillStyle=r.name===obj?"#ffe08a":"#b9c7bc";
     ctx.font="700 11px Consolas,monospace";
     ctx.textAlign="center";
     const words=r.name.split(" ");
     let line="",lines=[];
     for(const word of words){
       if((line+" "+word).trim().length>14){lines.push(line);line=word}
       else line=(line+" "+word).trim();
     }
     if(line)lines.push(line);
     lines.slice(0,3).forEach((txt,i)=>ctx.fillText(txt,p.x,p.y+(i-(Math.min(lines.length,3)-1)/2)*12));
   }
 }

 commonFloorZones.forEach(r=>drawZone(r,true));
 corridors.forEach(r=>drawZone(r,true));
 doorLinks.forEach(r=>drawZone(r,true));
 rooms.forEach(r=>drawZone(r,false));

 // Connector floors make door continuity visible in the map as well.
 for(const r of doorConnectors){
   drawPoly(polyForRect(r),"#2c2d20","#7a6926",1);
 }

 // Doors share exact same coordinate data as 3D gaps.
 for(const d of doors){
   const p=mapTransform(canvas,d.x,d.z);
   const size=labels?7:4;
   ctx.strokeStyle="#d8b83f";ctx.lineWidth=labels?4:2;
   ctx.beginPath();
   ctx.arc(p.x,p.y,size,0,Math.PI*2);
   ctx.stroke();
 }

 // Development map: visible NPC positions. Kept off the minimap to avoid clutter.
 if(labels){
   for(const n of npcSprites){
     if(!isNpcVisible(n.id)||n.kind==="dynamic")continue;
     const np=mapTransform(canvas,n.x,n.z);
     ctx.fillStyle="#d487ff";ctx.fillRect(np.x-4,np.y-4,8,8);
     ctx.fillStyle="#d9c3e5";ctx.font="700 9px Consolas,monospace";ctx.textAlign="center";
     ctx.fillText(n.name,np.x,np.y-8);
   }
 }

 // Player
 const pp=mapTransform(canvas,player.x,player.z);
 ctx.fillStyle="#b7ff4a";
 ctx.beginPath();ctx.arc(pp.x,pp.y,labels?8:4,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle="#071009";ctx.lineWidth=2;ctx.stroke();

 // Facing indicator: screen-forward direction is up on this map.
 ctx.strokeStyle="#dfffa8";ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(pp.x,pp.y);ctx.lineTo(pp.x,pp.y-(labels?18:10));ctx.stroke();

 if(obj){
   const rr=rooms.find(r=>r.name===obj);
   if(rr){
     const op=mapTransform(canvas,rr.x,rr.z);
     ctx.strokeStyle="#ffc857";ctx.lineWidth=labels?4:2;
     ctx.beginPath();ctx.arc(op.x,op.y,labels?14:7,0,Math.PI*2);ctx.stroke();
   }
 }
}
function refreshMaps(){
 drawStudioMap(miniCtx,miniMap,false);
 if(bigMap&&!bigMap.classList.contains("hidden"))drawStudioMap(bigCtx,bigMapCanvas,true);
}
function toggleBigMap(force){
 const open=force===undefined?bigMap.classList.contains("hidden"):!!force;
 bigMap.classList.toggle("hidden",!open);
 if(open){
   drawStudioMap(bigCtx,bigMapCanvas,true);
 }
}

function segmentHitsRect(ax,az,bx,bz,s,pad=.12){
 const minX=s.x-s.w/2-pad,maxX=s.x+s.w/2+pad;
 const minZ=s.z-s.d/2-pad,maxZ=s.z+s.d/2+pad;
 const steps=28;
 for(let i=1;i<steps;i++){
   const t=i/steps;
   const x=ax+(bx-ax)*t,z=az+(bz-az)*t;
   if(x>=minX&&x<=maxX&&z>=minZ&&z<=maxZ)return t;
 }
 return null;
}
function cameraSafeDistance(targetX,targetZ,yaw,wantedDist){
 const dx=Math.sin(yaw),dz=Math.cos(yaw);
 const camX=targetX+dx*wantedDist;
 const camZ=targetZ+dz*wantedDist;
 let nearest=1;
 for(const w of wallDefs){
   const t=segmentHitsRect(targetX,targetZ,camX,camZ,w,.18);
   if(t!==null)nearest=Math.min(nearest,t);
 }
 if(nearest<1){
   return Math.max(2.65,wantedDist*nearest-.55);
 }
 return wantedDist;
}

function resize(){const d=Math.min(1.25,devicePixelRatio||1),w=Math.max(320,Math.floor(innerWidth*d*.64)),h=Math.max(180,Math.floor(innerHeight*d*.64));if(c.width!==w||c.height!==h){c.width=w;c.height=h}}
let last=performance.now();function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;dtForAtmosphere=dt;const mapOpen=bigMap&&!bigMap.classList.contains("hidden");const devOpen=devMenu&&!devMenu.classList.contains("hidden");

// M3.3.2 // Dual controls.
// FP GAME: W/S forward-back, A/D strafe, diagonals work naturally, Q/E rotate.
// Arrow left/right also rotate; arrow up/down move. Mouse is not required.
// DEV 3/4: original camera-relative WASD movement is preserved.
let dx=0,dz=0;
if(viewMode==="fp"){
 let strafe=((keys.d)?1:0)-((keys.a)?1:0)+jx;
 let move=((keys.w||keys.arrowup)?1:0)-((keys.s||keys.arrowdown)?1:0)-jy;
 let turn=((keys.q||keys.arrowleft)?1:0)-((keys.e||keys.arrowright)?1:0)+mobileTurn;
 const ml=Math.hypot(strafe,move);if(ml>1){strafe/=ml;move/=ml;}
 turn=Math.max(-1,Math.min(1,turn));
 if(mapOpen||dialogueOpen||devOpen){turn=0;move=0;strafe=0;}
 cameraState.yaw+=turn*FP_TURN_SPEED*dt;savedFpYaw=cameraState.yaw;
 const forwardX=-Math.sin(cameraState.yaw),forwardZ=-Math.cos(cameraState.yaw);
 const rightX=Math.cos(cameraState.yaw),rightZ=-Math.sin(cameraState.yaw);
 dx=forwardX*move+rightX*strafe;
 dz=forwardZ*move+rightZ*strafe;
}else{
 let sx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+jx;
 let sy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+jy;
 let sl=Math.hypot(sx,sy);if(sl>1){sx/=sl;sy/=sl;}
 if(mapOpen||dialogueOpen||devOpen){sx=0;sy=0;}
 const forwardX=-Math.sin(cameraState.yaw),forwardZ=-Math.cos(cameraState.yaw);
 const rightX=Math.cos(cameraState.yaw),rightZ=-Math.sin(cameraState.yaw);
 dx=rightX*sx+forwardX*(-sy);
 dz=rightZ*sx+forwardZ*(-sy);
}
const oldPX=player.x,oldPZ=player.z;
let nx=player.x+dx*player.speed*dt,nz=player.z+dz*player.speed*dt;if(can(nx,player.z))player.x=nx;if(can(player.x,nz))player.z=nz;const currentRoom=roomAt(player.x,player.z);
const worldMode=realityMode(now);
roomEl.textContent=worldMode==="decayed"?"ALTRO UFFICIO":currentRoom;
updateDevStatus();
updateAmbientAudio();
ambientRelayClick(now);
updateFootsteps(now,dx,dz,oldPX,oldPZ);
updatePhoneEvent(now,currentRoom);
updateAtmosphereVisuals(now);
// M3.5 // The figure in the decayed corridor disappears before the player can
// reach it. This does not advance the mission; it simply reinforces the shift.
if(currentDay===2&&storyStep===63&&!otherOfficeFigureGone){
 const fig=npcById("other_office_figure");
 if(fig&&Math.hypot(player.x-fig.x,player.z-fig.z)<2.35){
   otherOfficeFigureGone=true;visualFlicker(.28,75);tone(49,.13,.018,'triangle',29);
 }
}
// M3.2: arm the first visible manifestation only after the resolved BIM job.
// It appears when the player leaves BIM into a corridor and vanishes as the
// player gets close. It has no collision, no prompt and no map marker.
if(storyStep===42 && currentRoom.startsWith("CORRIDOIO")){
 setStoryStep(43,"...");
}
if(storyStep===43){
 const fig=npcById("corridor_figure");
 const fd=fig?Math.hypot(player.x-fig.x,player.z-fig.z):999;
 if(fd<3.05 || (player.z>-.35 && currentRoom.startsWith("CORRIDOIO"))){
   setStoryStep(44,"NON C'ERA NESSUNO");
 }
}
if(!player._lastRoom)player._lastRoom=currentRoom;
if(currentRoom!==player._lastRoom){
 player._lastRoom=currentRoom;
 roomTransitionBanner(currentRoom);
 toast("ENTRI // "+currentRoom);

 // Story triggers only advance a travel step into its explicit interaction.
 // No mission is ever solved merely by crossing a room threshold.
 if(currentDay===2&&currentRoom==="REPARTO IT"&&storyStep===59){
   setStoryStep(60,"MERCOLEDI // PARLA CON IL MANAGER");
 }
 else if(currentDay===2&&currentRoom==="SERVER / MAGAZZINO IT"&&storyStep===61){
   setStoryStep(62,"SERVER // TERMINALE LEGACY");
 }
 else if(currentDay===2&&currentRoom==="HR"&&storyStep===63){
   setStoryStep(64,"... TUTTO E TORNATO NORMALE");
 }
 else if(currentDay===1&&currentRoom==="REPARTO IT"&&storyStep===48){
   setStoryStep(49,"MARTEDI // PARLA CON IL MANAGER");
 }
 else if(currentRoom==="REPARTO IT"&&storyStep===1){
   setStoryStep(2,"REPARTO IT // CERCA IL MANAGER");
 }
 else if(currentRoom==="SERVER / MAGAZZINO IT"&&storyStep===4){
   setStoryStep(5,"SERVER // CERCA RACK 02");
 }
 else if(currentRoom==="REPARTO IT"&&storyStep===6){
   setStoryStep(7,"REPARTO IT // AGGIORNA IL MANAGER");
 }
 else if(currentRoom==="EDITORIA"&&storyStep===8){
   setStoryStep(9,"EDITORIA // CERCA ALICE");
 }
 else if(currentRoom==="STAMPANTI"&&storyStep===10){
   setStoryStep(11,"STAMPANTI // CONTROLLA LA MACCHINA");
 }
 else if(currentRoom==="EDITORIA"&&storyStep===12){
   setStoryStep(13,"EDITORIA // CONFERMA AD ALICE");
 }
 else if(currentRoom==="REPARTO IT"&&storyStep===14){
   setStoryStep(15,"REPARTO IT // CHIUDI IL TICKET");
 }
 else if(currentRoom==="RENDERISTI"&&storyStep===16){
   setStoryStep(17,"RENDERISTI // CERCA RENDER_04");
 }
 else if(currentRoom==="REPARTO IT"&&storyStep===18){
   setStoryStep(19,"REPARTO IT // PARLA CON IL MANAGER");
 }
 else if(currentRoom==="INTERIOR"&&storyStep===21){
   setStoryStep(22,"INTERIOR // CERCA MARINO");
 }
 else if(currentRoom==="REPARTO IT"&&storyStep===25){
   setStoryStep(26,"REPARTO IT // CHIUDI IL TICKET");
 }
 else if(currentRoom==="SALA MEET CAPO"&&storyStep===27){
   setStoryStep(28,"DRR... DRR... // RISPONDI AL TELEFONO");
 }
 else if(currentRoom==="REPARTO IT"&&storyStep===30){
   setStoryStep(31,"REPARTO IT // PARLA CON IL MANAGER");
 }
 else if(currentRoom==="CUCINA"&&storyStep===33){
   setStoryStep(34,"13:00 // PAUSA PRANZO");
 }
 else if(currentRoom==="REPARTO IT"&&storyStep===35){
   setStoryStep(36,"13:30 // RIPRENDI IL TURNO");
 }
 else if(currentRoom==="BIM"&&storyStep===38){
   setStoryStep(39,"BIM // PARLA CON BIM 02");
 }
 else if(currentRoom==="REPARTO IT"&&storyStep===44){
   setStoryStep(45,"REPARTO IT // CHIUDI IL TICKET");
 }
}
updateInteractionPrompt();
refreshMaps();
resize();gl.viewport(0,0,c.width,c.height);
const mood=atmosphereLevel();
if(worldMode!=="normal")gl.clearColor(.020,.014,.010,1);
else gl.clearColor(.025-mood*.010,.035-mood*.014,.03-mood*.010,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
let proj,yaw,camX,camZ,targetX,targetZ,view;
if(viewMode==="fp"){
 // True eye-level camera: camera and collision body occupy the same position.
 cameraState.x=player.x;cameraState.z=player.z;
 proj=persp(62*Math.PI/180,c.width/c.height,.075,60);
 yaw=cameraState.yaw;camX=player.x;camZ=player.z;
 const forwardCamX=-Math.sin(yaw),forwardCamZ=-Math.cos(yaw);
 targetX=camX+forwardCamX*cameraState.lookAhead;
 targetZ=camZ+forwardCamZ*cameraState.lookAhead;
 view=look(camX,cameraState.height,camZ,targetX,cameraState.height-.03,targetZ);
}else{
 // Original stable 3/4 development camera.
 cameraState.x=smoothTo(cameraState.x,player.x,7.5,dt);
 cameraState.z=smoothTo(cameraState.z,player.z,7.5,dt);
 proj=persp(55*Math.PI/180,c.width/c.height,.1,60);
 yaw=cameraState.yaw;
 camX=cameraState.x+Math.sin(yaw)*cameraState.dist;
 camZ=cameraState.z+Math.cos(yaw)*cameraState.dist;
 targetX=cameraState.x-Math.sin(yaw)*cameraState.lookAhead;
 targetZ=cameraState.z-Math.cos(yaw)*cameraState.lookAhead;
 view=look(camX,cameraState.height,camZ,targetX,.72,targetZ);
}
const vp=mul(proj,view);
gl.bindBuffer(gl.ARRAY_BUFFER,buf);
gl.vertexAttribPointer(aP,3,gl.FLOAT,false,24,0);
gl.vertexAttribPointer(aC,3,gl.FLOAT,false,24,12);

// Floors, furniture, door frames
gl.bufferData(gl.ARRAY_BUFFER,staticV,gl.STATIC_DRAW);
gl.uniformMatrix4fv(uM,false,vp);
gl.drawArrays(gl.TRIANGLES,0,staticV.length/6);

// M3.5 // Same architecture, decayed skin layered above the normal office.
const realityV=buildRealityOverlayMesh(now,worldMode);
if(realityV.length){
 gl.bufferData(gl.ARRAY_BUFFER,realityV,gl.DYNAMIC_DRAW);
 gl.uniformMatrix4fv(uM,false,vp);
 gl.drawArrays(gl.TRIANGLES,0,realityV.length/6);
}

if(viewMode==="fp"){
 gl.bufferData(gl.ARRAY_BUFFER,ceilingV,gl.STATIC_DRAW);
 gl.uniformMatrix4fv(uM,false,vp);
 gl.drawArrays(gl.TRIANGLES,0,ceilingV.length/6);
}

// M3.0 live-office layer: device screens, light states, phones and dynamic doors.
const liveV=buildOfficeLiveMesh(now,viewMode==="dev");
gl.bufferData(gl.ARRAY_BUFFER,liveV,gl.DYNAMIC_DRAW);
gl.uniformMatrix4fv(uM,false,vp);
gl.drawArrays(gl.TRIANGLES,0,liveV.length/6);

// M3.3-FP // full-height walls: no development cutaway in this branch.
const wallV=buildWallMesh(camX,camZ,viewMode==="fp",worldMode);
gl.bufferData(gl.ARRAY_BUFFER,wallV,gl.DYNAMIC_DRAW);
gl.uniformMatrix4fv(uM,false,vp);
gl.drawArrays(gl.TRIANGLES,0,wallV.length/6);

// M2.9 NPC billboard layer: depth-tested against the world, transparent pixels discarded.
renderNpcSprites(vp,camX,camZ);

// Player is visible only in the 3/4 development camera.
if(viewMode==="dev")renderPlayerSprite(vp,camX,camZ);

requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();