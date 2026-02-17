// GLITCH·PEACE COMPLETE - Main Game Loop
import {T,TILE_DEF,PLAYER,CELL,GAP,GRID_SIZES,DIFF_CFG,PLAY_MODES,fib} from './core/constants.js';
import {rnd,pick,clamp,resizeCanvas,storage,isMobile,formatTime} from './core/utils.js';

const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');

// Hide loading
const loading=document.getElementById('loading');
if(loading)loading.style.display='none';

const CFG={gridSize:'medium',difficulty:'easy',particles:!isMobile,mode:'classic'};
let game=null,phase='title',keys=new Set(),menuIdx=0;

const W=()=>Math.min(window.innerWidth-16,900);
const H=()=>Math.min(window.innerHeight-16,700);
const SZ=()=>GRID_SIZES[CFG.gridSize]||13;

function makeGrid(sz,level){
  const grid=Array.from({length:sz},()=>new Array(sz).fill(T.VOID));
  for(let i=0;i<sz*sz*0.07;i++){
    const y=rnd(sz),x=rnd(sz);
    if((y>2||x>2)&&grid[y][x]===T.VOID)grid[y][x]=T.WALL;
  }
  const fibSeq=fib(20);
  const peaceCount=Math.min(fibSeq[Math.min(level+3,19)],sz*sz*0.3);
  let placed=0;
  while(placed<peaceCount){
    const y=rnd(sz),x=rnd(sz);
    if(grid[y][x]===T.VOID&&(y>1||x>1)){grid[y][x]=T.PEACE;placed++;}
  }
  const hazTypes=[T.DESPAIR,T.TERROR,T.RAGE];
  for(let i=0;i<sz*sz*0.15;i++){
    const y=rnd(sz),x=rnd(sz);
    if(grid[y][x]===T.VOID&&(y>2||x>2))grid[y][x]=pick(hazTypes);
  }
  return grid;
}

function initGame(){
  const sz=SZ();
  game={grid:makeGrid(sz,1),sz,player:{y:0,x:0},hp:100,maxHp:100,score:0,level:1,peaceLeft:0,messages:[]};
  for(let y=0;y<sz;y++)for(let x=0;x<sz;x++)if(game.grid[y][x]===T.PEACE)game.peaceLeft++;
  phase='playing';
}

function tryMove(dy,dx){
  const g=game,ny=g.player.y+dy,nx=g.player.x+dx;
  if(ny<0||ny>=g.sz||nx<0||nx>=g.sz)return;
  const tile=g.grid[ny][nx];
  if(tile===T.WALL)return;
  g.player.y=ny;g.player.x=nx;
  const def=TILE_DEF[tile];
  if(tile===T.PEACE){
    g.hp=Math.min(g.maxHp,g.hp+20);g.score+=150;g.grid[ny][nx]=T.VOID;g.peaceLeft--;
    if(g.peaceLeft===0){
      g.level++;g.grid=makeGrid(g.sz,g.level);g.player={y:0,x:0};g.peaceLeft=0;
      for(let y=0;y<g.sz;y++)for(let x=0;x<g.sz;x++)if(g.grid[y][x]===T.PEACE)g.peaceLeft++;
    }
  }else if(def?.d>0){g.hp-=def.d;if(g.hp<=0)phase='dead';}
}

function draw(){
  const w=W(),h=H();
  ctx.fillStyle='#02020a';ctx.fillRect(0,0,w,h);
  
  if(phase==='title'){
    ctx.textAlign='center';ctx.fillStyle='#00ff88';ctx.shadowColor='#00ff88';ctx.shadowBlur=32;
    ctx.font='bold 42px Courier New';ctx.fillText('GLITCH·PEACE',w/2,h/2-60);ctx.shadowBlur=0;
    ctx.fillStyle='#334455';ctx.font='12px Courier New';ctx.fillText('COMPLETE Engine',w/2,h/2-30);
    const menu=['▶ START','QUIT'];
    menu.forEach((opt,i)=>{
      const y=h/2+i*40;ctx.fillStyle=i===menuIdx?'#00ff88':'#445566';
      ctx.font=i===menuIdx?'bold 16px Courier New':'14px Courier New';ctx.fillText(opt,w/2,y);
    });
  }
  else if(phase==='playing'){
    const g=game,cs=Math.min((w-40)/(g.sz*44),(h-140)/(g.sz*44));
    const sx=(w-g.sz*44*cs)/2,sy=80;
    for(let y=0;y<g.sz;y++)for(let x=0;x<g.sz;x++){
      const tile=g.grid[y][x],def=TILE_DEF[tile];if(!def)continue;
      const px=sx+x*44*cs,py=sy+y*44*cs;
      ctx.fillStyle=def.bg;ctx.fillRect(px,py,42*cs,42*cs);
      ctx.strokeStyle=def.bd;ctx.strokeRect(px,py,42*cs,42*cs);
      if(def.sy){ctx.fillStyle=def.bd;ctx.font=`${Math.floor(20*cs)}px Courier New`;
        ctx.textAlign='center';ctx.fillText(def.sy,px+21*cs,py+21*cs+6);ctx.textAlign='left';}
    }
    const px=sx+g.player.x*44*cs,py=sy+g.player.y*44*cs;
    ctx.shadowColor=PLAYER.GLOW;ctx.shadowBlur=15;ctx.fillStyle=PLAYER.CORE;
    ctx.beginPath();ctx.arc(px+21*cs,py+21*cs,14*cs,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=PLAYER.OUTLINE;ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(px+21*cs,py+21*cs,14*cs,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#0a0a14';ctx.fillRect(0,0,w,60);
    ctx.fillStyle='#00ff88';ctx.font='bold 14px Courier New';
    ctx.fillText(`HP: ${g.hp}/${g.maxHp}`,20,25);ctx.fillText(`Score: ${g.score}`,20,45);
    ctx.fillText(`Level: ${g.level}`,w/2-50,25);ctx.fillText(`Peace: ${g.peaceLeft}`,w/2-50,45);
  }
  else if(phase==='dead'){
    ctx.textAlign='center';ctx.fillStyle='#ff4444';ctx.font='bold 36px Courier New';
    ctx.fillText('SESSION ENDED',w/2,h/2-40);
    ctx.fillStyle='#667788';ctx.font='18px Courier New';
    ctx.fillText(`Final Score: ${game.score}`,w/2,h/2);
    ctx.fillStyle='#00ff88';ctx.font='14px Courier New';
    ctx.fillText('PRESS ENTER TO RESTART',w/2,h/2+60);
  }
  requestAnimationFrame(draw);
}

window.addEventListener('keydown',e=>{
  keys.add(e.key);
  if(phase==='title'){
    if(e.key==='ArrowUp')menuIdx=0;if(e.key==='ArrowDown')menuIdx=1;
    if(e.key==='Enter'&&menuIdx===0)initGame();
  }else if(phase==='dead'){if(e.key==='Enter')initGame();}
  else if(phase==='playing'){
    if(e.key==='Escape')phase='title';
    if(keys.has('w')||keys.has('ArrowUp'))tryMove(-1,0);
    if(keys.has('s')||keys.has('ArrowDown'))tryMove(1,0);
    if(keys.has('a')||keys.has('ArrowLeft'))tryMove(0,-1);
    if(keys.has('d')||keys.has('ArrowRight'))tryMove(0,1);
  }
});

window.addEventListener('keyup',e=>keys.delete(e.key));
resizeCanvas(canvas,ctx,W(),H(),Math.min(window.devicePixelRatio||1,2));
console.log('GLITCH·PEACE COMPLETE loaded');
draw();
```

Save that file, then run `npm run dev` again!

---

## **MY RECOMMENDATION:**

**Just use the standalone HTML!** It's in:
```
STANDALONE/glitch-peace-COMPLETE.html