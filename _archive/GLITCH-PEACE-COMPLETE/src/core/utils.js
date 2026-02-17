// ═══════════════════════════════════════════════════════════════════════
//  COMPLETE UTILITIES - All helpers from entire thread
// ═══════════════════════════════════════════════════════════════════════

// Random & Math (ultra-compact)
export const rnd=n=>Math.floor(Math.random()*n);
export const pick=a=>a[rnd(a.length)];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const dist=(y1,x1,y2,x2)=>Math.abs(y2-y1)+Math.abs(x2-x1);

// Canvas
export const resizeCanvas=(c,ctx,w,h,dpr=1)=>{
  c.width=w*dpr;c.height=h*dpr;c.style.width=`${Math.min(w,window.innerWidth-16)}px`;
  c.style.height='auto';ctx.setTransform(1,0,0,1,0,0);ctx.scale(dpr,dpr);
};

// Storage with error handling
export const storage={
  get:(k,fb=null)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch(e){return fb;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}},
  clear:k=>{try{localStorage.removeItem(k);return true;}catch(e){return false;}}
};

// Grid helpers
export const inBounds=(y,x,sz)=>y>=0&&y<sz&&x>=0&&x<sz;
export const getNeighbors=(y,x,sz)=>[[-1,0],[1,0],[0,-1],[0,1]]
  .map(([dy,dx])=>[y+dy,x+dx]).filter(([ny,nx])=>inBounds(ny,nx,sz));

// Color utilities
export const hexToRgba=(h,a=1)=>{
  const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};
export const lerpColor=(c1,c2,t)=>{
  const r1=parseInt(c1.slice(1,3),16),g1=parseInt(c1.slice(3,5),16),b1=parseInt(c1.slice(5,7),16);
  const r2=parseInt(c2.slice(1,3),16),g2=parseInt(c2.slice(3,5),16),b2=parseInt(c2.slice(5,7),16);
  const r=Math.round(lerp(r1,r2,t)),g=Math.round(lerp(g1,g2,t)),b=Math.round(lerp(b1,b2,t));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
};

// Pathfinding (A* - compact)
export const findPath=(start,goal,grid,maxSteps=50)=>{
  const open=[{...start,g:0,h:dist(start.y,start.x,goal.y,goal.x),f:0,path:[]}];
  const closed=new Set();
  while(open.length>0&&open[0].path.length<maxSteps){
    open.sort((a,b)=>a.f-b.f);const cur=open.shift();
    if(cur.y===goal.y&&cur.x===goal.x)return cur.path;
    closed.add(`${cur.y},${cur.x}`);
    for(const[ny,nx]of getNeighbors(cur.y,cur.x,grid.length)){
      if(closed.has(`${ny},${nx}`)||grid[ny][nx]===5)continue;
      const g=cur.g+1,h=dist(ny,nx,goal.y,goal.x),f=g+h;
      const ex=open.find(n=>n.y===ny&&n.x===nx);
      if(!ex||g<ex.g){
        if(ex)open.splice(open.indexOf(ex),1);
        open.push({y:ny,x:nx,g,h,f,path:[...cur.path,{y:ny,x:nx}]});
      }
    }
  }
  return[];
};

// Time formatting
export const formatTime=ms=>{
  const s=Math.floor(ms/1000),m=Math.floor(s/60),h=Math.floor(m/60);
  if(h>0)return`${h}h ${m%60}m`;if(m>0)return`${m}m ${s%60}s`;return`${s}s`;
};

// Mobile detection
export const isMobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
export const isTouch='ontouchstart'in window||navigator.maxTouchPoints>0;

// Performance monitor
export class PerfMonitor{
  constructor(){this.frames=[];this.lastTime=performance.now();}
  update(){const now=performance.now(),delta=now-this.lastTime;this.lastTime=now;
    this.frames.push(delta);if(this.frames.length>60)this.frames.shift();}
  getFPS(){if(this.frames.length===0)return 60;
    const avg=this.frames.reduce((a,b)=>a+b,0)/this.frames.length;return Math.round(1000/avg);}
  shouldReduceQuality(){return this.getFPS()<30;}
}

// Deep clone
export const clone=obj=>JSON.parse(JSON.stringify(obj));

// Seeded random (for daily challenges)
export class SeededRandom{
  constructor(seed){this.seed=seed;}
  next(){this.seed=(this.seed*9301+49297)%233280;return this.seed/233280;}
  int(n){return Math.floor(this.next()*n);}
  pick(arr){return arr[this.int(arr.length)];}
}
