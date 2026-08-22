(() => {
"use strict";
const c=document.getElementById("c"), gl=c.getContext("webgl",{antialias:false,alpha:false});
if(!gl){document.body.innerHTML="<pre>WebGL non disponibile.</pre>";return} gl.clearColor(.025,.035,.03,1);
const roomEl=document.getElementById("room"),objEl=document.getElementById("objText"),toastEl=document.getElementById("toast"),clockEl=document.getElementById("clock"),promptEl=document.getElementById("interactionPrompt");
const dialogueEl=document.getElementById("dialogue"),dialogueNameEl=document.getElementById("dialogueName"),dialogueTextEl=document.getElementById("dialogueText");
let tt=0;function toast(t){toastEl.textContent=t;toastEl.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>toastEl.classList.remove("on"),1400)}
const VS=`attribute vec3 aPos;attribute vec3 aCol;uniform mat4 uMVP;varying vec3 vCol;void main(){vCol=aCol;gl_Position=uMVP*vec4(aPos,1.);}`;
const FS=`precision mediump float;varying vec3 vCol;void main(){float q=mod(floor(gl_FragCoord.x+gl_FragCoord.y),2.)*.025;gl_FragColor=vec4(max(vCol-q,0.),1.);}`;
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
function floorR(x,z,w,d,col){
 const bleed=.035;
 w+=bleed*2;d+=bleed*2;
 quad([x-w/2,0,z-d/2],[x+w/2,0,z-d/2],[x+w/2,0,z+d/2],[x-w/2,0,z+d/2],col);
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
 // NORTH
 {name:"INGRESSO / SEGRETERIA",x:0,z:9.2,w:5.0,d:3.2,col:[.18,.22,.18]},
 {name:"HR",x:-5.0,z:6.6,w:4.0,d:3.4,col:[.23,.20,.22]},
 {name:"REPARTO IT",x:-5.0,z:2.8,w:4.0,d:3.6,col:[.16,.23,.18]},
 {name:"SALA MEET",x:4.7,z:6.6,w:4.2,d:3.4,col:[.29,.29,.22]},
 {name:"SALA MEET CAPO",x:10.0,z:6.6,w:3.4,d:3.4,col:[.27,.24,.20]},

 // CENTER
 {name:"SERVER / MAGAZZINO IT",x:-5.0,z:-1.4,w:4.0,d:3.6,col:[.19,.25,.22]},
 {name:"CENTRALE",x:4.7,z:2.0,w:4.2,d:5.0,col:[.22,.24,.20]},
 {name:"INTERIOR",x:10.0,z:2.0,w:3.4,d:5.0,col:[.26,.22,.20]},
 {name:"BIM",x:-5.0,z:-5.4,w:4.0,d:3.6,col:[.18,.22,.24]},
 {name:"EDITORIA",x:4.7,z:-3.1,w:4.2,d:3.6,col:[.25,.22,.18]},
 {name:"RENDERISTI",x:10.0,z:-3.1,w:3.4,d:3.6,col:[.20,.22,.26]},

 // SOUTH
 {name:"CUCINA",x:-8.7,z:-10.0,w:3.4,d:3.2,col:[.25,.22,.18]},
 {name:"BAGNI",x:-5.0,z:-10.0,w:2.8,d:3.2,col:[.18,.22,.21]},
 {name:"RIFUGIO DIGITALE",x:-1.2,z:-10.0,w:4.2,d:3.2,col:[.18,.20,.26]},
 {name:"SPAZIO A",x:3.8,z:-10.0,w:4.2,d:3.2,col:[.20,.25,.22]},
 {name:"STAMPANTI",x:7.4,z:-9.7,w:2.4,d:2.6,col:[.23,.23,.20]},
 {name:"STAMPA 3D",x:10.0,z:-9.7,w:2.4,d:2.6,col:[.19,.23,.23]}
];

const corridors=[
 // Two clean vertical spines plus one south hallway. They sit BETWEEN rooms
 // instead of cutting through their wall colliders.
 {name:"CORRIDOIO CENTRALE",x:0,z:0.0,w:3.4,d:15.8,col:[.28,.31,.28]},
 {name:"CORRIDOIO EST",x:7.55,z:0.0,w:1.7,d:15.8,col:[.28,.31,.28]},
 {name:"CORRIDOIO SUD",x:0,z:-7.90,w:22.4,d:1.7,col:[.28,.31,.28]}
];

const doors=[
 // room, center x/z, axis: x = opening on vertical wall, z = opening on horizontal wall
 {room:"INGRESSO / SEGRETERIA",x:0,z:7.6,axis:"z"},
 {room:"HR",x:-3.0,z:6.6,axis:"x"},
 {room:"REPARTO IT",x:-3.0,z:2.8,axis:"x"},
 {room:"SERVER / MAGAZZINO IT",x:-3.0,z:-1.4,axis:"x"},
 {room:"BIM",x:-3.0,z:-5.4,axis:"x"},
 {room:"SALA MEET",x:2.6,z:6.6,axis:"x"},
 {room:"SALA MEET CAPO",x:8.3,z:6.6,axis:"x"},
 {room:"CENTRALE",x:2.6,z:2.0,axis:"x"},
 {room:"INTERIOR",x:8.3,z:2.0,axis:"x"},
 {room:"EDITORIA",x:2.6,z:-3.1,axis:"x"},
 {room:"RENDERISTI",x:8.3,z:-3.1,axis:"x"},
 {room:"CUCINA",x:-8.7,z:-8.4,axis:"z"},
 {room:"BAGNI",x:-5.0,z:-8.4,axis:"z"},
 {room:"RIFUGIO DIGITALE",x:-1.2,z:-8.4,axis:"z"},
 {room:"SPAZIO A",x:3.8,z:-8.4,axis:"z"},
 {room:"STAMPANTI",x:7.4,z:-8.4,axis:"z"},
 {room:"STAMPA 3D",x:10.0,z:-8.4,axis:"z"}
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


rooms.forEach(r=>floorR(r.x,r.z,r.w,r.d,r.col));
corridors.forEach(r=>floorR(r.x,r.z,r.w,r.d,r.col));
doorLinks.forEach(r=>floorR(r.x,r.z,r.w,r.d,[.28,.31,.28]));
doorConnectors.forEach(r=>floorR(r.x,r.z,r.w,r.d,[.30,.32,.27]));

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

// Outer safety shell only, well outside playable architecture.
wall(-11.3,-.4,.15,22.8); wall(12.2,-.4,.15,22.8);
wall(.45,11.0,23.5,.15); wall(.45,-11.9,23.5,.15);

// Door visualization derived from the SAME door data.
doors.forEach(d=>{
 doorFrame(d.x,d.z,d.axis);
 if(d.axis==="x")box(d.x,.012,d.z,.72,.024,1.45,[.72,.58,.18]);
 else box(d.x,.012,d.z,1.45,.024,.72,[.72,.58,.18]);
});

// Furniture: sparse blockout. Keep circulation lanes wide.
desk(-5.4,2.8,1.4,.6); desk(-4.4,2.0,1.2,.55);
rack(-5.7,-1.4);rack(-4.8,-1.4);desk(-4.8,-2.2,1.8,.55);
desk(4.0,2.8,1.3,.6);desk(5.4,2.8,1.3,.6);desk(4.0,1.2,1.3,.6);desk(5.4,1.2,1.3,.6);
desk(-5.4,-5.4,1.3,.6);desk(-4.4,-5.4,1.3,.6);
desk(4.2,-3.1,1.3,.6);desk(5.3,-3.1,1.3,.6);
desk(9.6,2.3,1.2,.6);desk(10.4,1.2,1.2,.6);
desk(9.6,-3.1,1.2,.6);desk(10.5,-3.1,1.2,.6);
desk(4.7,6.6,2.0,.85);desk(10.0,6.6,1.7,.8);
desk(-1.2,-10.0,1.7,.6);desk(3.8,-10.0,1.8,.65);desk(-8.7,-10.0,1.8,.7);

// M2.7 keeps the stable M2.3.2 footprint untouched: all new NPCs/devices
// are visual-only and interaction-based, never new collision blockers.
box(-5.45,.78,2.80,.60,.42,.11,[.08,.13,.10]);
box(-5.45,.83,2.73,.48,.27,.04,[.18,.48,.24]);
box(-4.80,.72,-1.40,.18,.18,.06,[.72,.58,.18]);

function npcFigure(x,z,bodyCol,headCol=[.69,.52,.40]){
 box(x,0,z,.43,.82,.38,bodyCol);
 box(x,.82,z,.36,.34,.34,headCol);
}
// Opening cast.
npcFigure(-1.25,9.15,[.30,.20,.28]);       // Zia Ale
npcFigure(-4.05,4.00,[.20,.27,.34]);       // IT Manager
npcFigure(4.55,-4.05,[.31,.25,.20]);       // Alice / Editoria
npcFigure(9.15,3.45,[.26,.28,.20]);        // Marino / Interior

// Printer in STAMPANTI and an intentionally dark workstation in RENDERISTI.
box(7.42,.05,-9.72,.72,.70,.66,[.36,.39,.36]);
box(7.42,.65,-9.72,.58,.18,.54,[.17,.19,.17]);
box(7.42,.80,-9.72,.44,.08,.40,[.49,.50,.45]);
box(10.50,.78,-3.10,.58,.40,.10,[.06,.08,.07]);
box(10.50,.84,-3.15,.46,.27,.035,[.015,.018,.016]);

// M2.7: Interior workstation + meeting-room desk phone. Visual-only: no new solids.
box(10.38,.78,1.22,.56,.40,.10,[.08,.12,.10]);
box(10.38,.84,1.17,.44,.27,.035,[.16,.42,.22]);
box(10.48,.76,6.58,.44,.14,.30,[.12,.14,.12]);
box(10.48,.88,6.58,.28,.08,.18,[.22,.24,.20]);

const interactables=[
 {id:"zia_ale",label:"ZIA ALE",x:-1.25,z:9.15,range:1.35,type:"npc"},
 {id:"it_manager",label:"IT MANAGER",x:-4.05,z:4.00,range:1.32,type:"npc"},
 {id:"pc_it",label:"PC REPARTO IT",x:-5.45,z:2.80,range:1.28,type:"device"},
 {id:"server_rack_02",label:"RACK SERVER 02",x:-4.80,z:-1.40,range:1.25,type:"device"},
 {id:"alice_editoria",label:"ALICE",x:4.55,z:-4.05,range:1.35,type:"npc"},
 {id:"printer_main",label:"STAMPANTE PRINCIPALE",x:7.42,z:-9.72,range:1.35,type:"device"},
 {id:"render_04",label:"POSTAZIONE RENDER_04",x:10.50,z:-3.10,range:1.40,type:"device"},
 {id:"marino_interior",label:"MARINO",x:9.15,z:3.45,range:1.35,type:"npc"},
 {id:"interior_pc_03",label:"PC INTERIOR_03",x:10.38,z:1.22,range:1.35,type:"device"},
 {id:"meet_phone",label:"TELEFONO SALA MEET CAPO",x:10.48,z:6.58,range:1.40,type:"device"}
];

const staticV=new Float32Array(V);

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
function buildWallMesh(cx,cz){
 const saved=V.slice();
 V.length=0;

 // Stable architectural cutaway: no wall appears/disappears while moving.
 // Full-height wall posts remain implied by door frames.
 for(const w of wallDefs){
   const h=.92;
   box(w.x,0,w.z,w.w,h,w.d,[.22,.28,.24]);
 }

 const arr=new Float32Array(V);
 V.length=0;V.push(...saved);
 return arr;
}

const player={x:0,z:9.6,r:.22,speed:2.15};
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

 {id:"reach_editoria",time:"09:24",objective:"VAI DA ALICE IN EDITORIA",targetRoom:"EDITORIA"},
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
 {id:"complete_m26",time:"10:10",objective:"M2.6 COMPLETATO // MATTINA OPERATIVA",targetRoom:null},

 // M2.7 // ESCALATION LEGGERA
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
 {id:"complete",time:"10:58",objective:"M2.7 COMPLETATO // NON ERA UN BUG",targetRoom:null}
];
function setStoryStep(i,msg){
 storyStep=Math.max(0,Math.min(i,storySteps.length-1));
 const step=storySteps[storyStep];
 objEl.textContent=step.objective;
 clockEl.textContent=step.time;
 if(msg)toast(msg);
}
setStoryStep(0);
const cameraState={
 x:player.x,
 z:player.z,
 yaw:-.72,
 dist:7.0,
 height:3.65,
 lookAhead:1.20
};
function smoothTo(a,b,k,dt){
 return a+(b-a)*(1-Math.exp(-k*dt));
}

function insideZone(x,z,r,pad=.03){
 return Math.abs(x-r.x)<=r.w/2+pad&&Math.abs(z-r.z)<=r.d/2+pad;
}
function onWalkableFloor(x,z){
 return rooms.some(r=>insideZone(x,z,r,.08))||
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
const keys={};
addEventListener("keydown",e=>{
 const k=e.key.toLowerCase();
 if(dialogueOpen&&(k==="e"||k==="enter"||k===" ")){
   e.preventDefault();if(!e.repeat)advanceDialogue();return;
 }
 if(e.key==="Tab"){
   e.preventDefault();
   if(!e.repeat)toggleBigMap();
   return;
 }
 keys[k]=1;
 if(k==="e"&&!e.repeat)interact();
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
 dialogueOpen=true;dialogueLines=lines;dialogueIndex=0;dialogueDone=onDone||null;
 dialogueNameEl.textContent=name;dialogueTextEl.textContent=dialogueLines[0]||"";
 dialogueEl.classList.add("on");
 promptEl.classList.remove("on");
}
function advanceDialogue(){
 if(!dialogueOpen)return false;
 dialogueIndex++;
 if(dialogueIndex<dialogueLines.length){
   dialogueTextEl.textContent=dialogueLines[dialogueIndex];
   return true;
 }
 dialogueOpen=false;dialogueEl.classList.remove("on");
 const done=dialogueDone;dialogueDone=null;
 if(done)done();
 return true;
}
dialogueEl?.addEventListener("pointerdown",e=>{e.preventDefault();advanceDialogue()},{passive:false});

function nearestInteractable(){
 let best=null,bestD=Infinity;
 for(const it of interactables){
   const d=Math.hypot(player.x-it.x,player.z-it.z);
   if(d<=it.range&&d<bestD){best=it;bestD=d;}
 }
 return best;
}
function updateInteractionPrompt(){
 if(dialogueOpen){promptEl.classList.remove("on");return;}
 const it=nearestInteractable();
 if(!it){promptEl.classList.remove("on");return;}
 const step=storySteps[storyStep];
 const active=step.targetInteractable===it.id;
 promptEl.innerHTML=`<b>[E]</b> ${active?"INTERAGISCI":"ESAMINA"} — ${it.label}`;
 promptEl.classList.add("on");
}
function interact(){
 if(dialogueOpen){advanceDialogue();return;}
 const it=nearestInteractable();
 if(!it){toast(roomAt(player.x,player.z)+" // NIENTE DA INTERAGIRE");return;}

 if(it.id==="zia_ale"){
   if(storyStep===0){
     openDialogue("ZIA ALE",[
       "Buongiorno. Sei appena arrivato e ti stanno gia cercando.",
       "Passa dal reparto IT: il Manager vuole parlarti prima che inizi il giro.",
       "E magari dopo riesci anche a prendere un caffe. Magari."
     ],()=>setStoryStep(1,"INIZIO TURNO // VAI IN IT"));
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
     ],()=>setStoryStep(20,"ANOMALIA ARCHIVIATA"));
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
   }else if(storyStep>=32){
     openDialogue("IT MANAGER",["Lascia stare quella sala. Se succede ancora, vieni direttamente da me."],null);
   }else{
     openDialogue("IT MANAGER",["Per ora tutto tranquillo. Tieni d'occhio i ticket."],null);
   }
   return;
 }

 if(it.id==="pc_it"){
   if(storyStep===3){
     openDialogue("PC REPARTO IT",[
       "LOGIN ARCHEA // SESSIONE APERTA.",
       "TICKET PRIORITARIO: SERVER RACK 02 NON RAGGIUNGIBILE.",
       "VERIFICA DIRETTAMENTE NEL SERVER / MAGAZZINO IT."
     ],()=>setStoryStep(4,"NUOVO TICKET // SERVER RACK 02"));
   }else if(storyStep<3){
     toast("PRIMA PARLA CON L'IT MANAGER");
   }else if(storyStep===15){
     openDialogue("PC REPARTO IT",[
       "TICKET STAMPANTE // RISOLTO.",
       "CODA PRIORITARIA: 1.",
       "NUOVO TICKET: RENDER_04 // NESSUN SEGNALE VIDEO.",
       "APERTURA TICKET: 10:02 // SORGENTE: RENDER_04."
     ],()=>setStoryStep(16,"NUOVO TICKET // RENDER_04"));
   }else if(storyStep===26){
     openDialogue("PC REPARTO IT",[
       "TICKET INTERIOR_03 // RISOLTO.",
       "MAPPING PROGETTO RIPRISTINATO // SMB OK.",
       "LOG PBX // CHIAMATA INTERNA ATTIVA.",
       "DESTINAZIONE: SALA MEET CAPO // INTERNO 281."
     ],()=>setStoryStep(27,"PBX // CHIAMATA IN SALA MEET CAPO"));
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
     openDialogue("RACK SERVER 02",[
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
   if(storyStep===9){
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

 if(it.id==="printer_main"){
   if(storyStep===11){
     openDialogue("STAMPANTE PRINCIPALE",[
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
   if(storyStep===22){
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
     openDialogue("PC INTERIOR_03",[
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
let jx=0,jy=0;const st=document.getElementById("stick"),nub=st?.querySelector("i");
if(st){const set=e=>{const t=e.touches?.[0]||e,r=st.getBoundingClientRect();let x=(t.clientX-r.left-r.width/2)/(r.width*.32),y=(t.clientY-r.top-r.height/2)/(r.height*.32),l=Math.hypot(x,y);if(l>1){x/=l;y/=l}jx=x;jy=y;nub.style.transform=`translate(${x*31}px,${y*31}px)`;e.preventDefault()};
const stop=e=>{jx=jy=0;nub.style.transform="";e.preventDefault()};st.addEventListener("pointerdown",set,{passive:false});st.addEventListener("pointermove",e=>{if(e.buttons||e.pointerType==="touch")set(e)},{passive:false});st.addEventListener("pointerup",stop,{passive:false});st.addEventListener("touchstart",set,{passive:false});st.addEventListener("touchmove",set,{passive:false});st.addEventListener("touchend",stop,{passive:false})}
document.getElementById("act")?.addEventListener("pointerdown",e=>{e.preventDefault();dialogueOpen?advanceDialogue():interact()});
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

const mapBounds={minX:-11.5,maxX:12.4,minZ:-12.1,maxZ:11.2};

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

function resize(){const d=Math.min(1.3,devicePixelRatio||1),w=Math.max(320,Math.floor(innerWidth*d*.72)),h=Math.max(180,Math.floor(innerHeight*d*.72));if(c.width!==w||c.height!==h){c.width=w;c.height=h}}
let last=performance.now();function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;const mapOpen=bigMap&&!bigMap.classList.contains("hidden");let sx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+jx;
let sy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)+jy;
let sl=Math.hypot(sx,sy);if(sl>1){sx/=sl;sy/=sl}

// Camera-relative controls: UP always moves toward the top of the screen.
const forwardX=-Math.sin(cameraState.yaw);
const forwardZ=-Math.cos(cameraState.yaw);
const rightX=Math.cos(cameraState.yaw);
const rightZ=-Math.sin(cameraState.yaw);

let dx=rightX*sx + forwardX*(-sy);
let dz=rightZ*sx + forwardZ*(-sy);

if(mapOpen||dialogueOpen){dx=0;dz=0;}
let nx=player.x+dx*player.speed*dt,nz=player.z+dz*player.speed*dt;if(can(nx,player.z))player.x=nx;if(can(player.x,nz))player.z=nz;const currentRoom=roomAt(player.x,player.z);
roomEl.textContent=currentRoom;
if(!player._lastRoom)player._lastRoom=currentRoom;
if(currentRoom!==player._lastRoom){
 player._lastRoom=currentRoom;
 roomTransitionBanner(currentRoom);
 toast("ENTRI // "+currentRoom);

 // Story triggers only advance a travel step into its explicit interaction.
 // No mission is ever solved merely by crossing a room threshold.
 if(currentRoom==="REPARTO IT"&&storyStep===1){
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
}
updateInteractionPrompt();
refreshMaps();
resize();gl.viewport(0,0,c.width,c.height);gl.clearColor(.025,.035,.03,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
cameraState.x=smoothTo(cameraState.x,player.x,7.5,dt);
cameraState.z=smoothTo(cameraState.z,player.z,7.5,dt);

const proj=persp(55*Math.PI/180,c.width/c.height,.1,60);
const yaw=cameraState.yaw;

// Stable follow: fixed distance. Occlusion is handled by lowering walls,
// avoiding sudden zoom-in / zoom-out when crossing doorways.
const camX=cameraState.x+Math.sin(yaw)*cameraState.dist;
const camZ=cameraState.z+Math.cos(yaw)*cameraState.dist;
const targetX=cameraState.x-Math.sin(yaw)*cameraState.lookAhead;
const targetZ=cameraState.z-Math.cos(yaw)*cameraState.lookAhead;
const view=look(camX,cameraState.height,camZ,targetX,.72,targetZ);
const vp=mul(proj,view);
gl.bindBuffer(gl.ARRAY_BUFFER,buf);
gl.vertexAttribPointer(aP,3,gl.FLOAT,false,24,0);
gl.vertexAttribPointer(aC,3,gl.FLOAT,false,24,12);

// Floors, furniture, door frames
gl.bufferData(gl.ARRAY_BUFFER,staticV,gl.STATIC_DRAW);
gl.uniformMatrix4fv(uM,false,vp);
gl.drawArrays(gl.TRIANGLES,0,staticV.length/6);

// Walls: any wall between camera and player is lowered to a parapet.
const wallV=buildWallMesh(camX,camZ);
gl.bufferData(gl.ARRAY_BUFFER,wallV,gl.DYNAMIC_DRAW);
gl.uniformMatrix4fv(uM,false,vp);
gl.drawArrays(gl.TRIANGLES,0,wallV.length/6);

// Player
gl.bufferData(gl.ARRAY_BUFFER,pV,gl.DYNAMIC_DRAW);
gl.uniformMatrix4fv(uM,false,mul(vp,trans(player.x,0,player.z)));
gl.drawArrays(gl.TRIANGLES,0,pV.length/6);

requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();