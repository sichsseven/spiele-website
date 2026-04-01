// LOKALER SPEICHER (Fallback)
function loadData(){try{return JSON.parse(localStorage.getItem('nr_data')||'null')||{coins:0,owned:[0],sel:0,bestDist:0};}catch(e){return{coins:0,owned:[0],sel:0,bestDist:0};}}
function saveData(d){try{localStorage.setItem('nr_data',JSON.stringify(d));}catch(e){}}

// SPIELERDATEN AUS SUPABASE LADEN
async function initPlayer(){
  try{
    var data=await PZ.loadScore('neon-runner');
    if(data&&data.extra_daten){
      pdata.coins   =data.extra_daten.coins   ||0;
      pdata.owned   =data.extra_daten.owned   ||[0];
      pdata.sel     =data.extra_daten.sel     ||0;
      pdata.bestDist=data.extra_daten.bestDist||0;
    }
  }catch(e){}
  updateCoinDisplay();
}

var CHARS=[
  {name:'Standard',price:0,color:'#22d3ee',trail:'rgba(34,211,238,0.3)'},
  {name:'Schatten',price:30,color:'#a78bfa',trail:'rgba(167,139,250,0.3)'},
  {name:'Blaze',price:50,color:'#f97316',trail:'rgba(249,115,22,0.3)'},
  {name:'Specter',price:45,color:'#f0f0f4',trail:'rgba(240,240,244,0.25)'},
  {name:'Chrome',price:70,color:'#94a3b8',trail:'rgba(148,163,184,0.3)'},
  {name:'Phantom',price:90,color:'rainbow',trail:'rgba(255,255,255,0.2)'},
];

var pdata=loadData();
var canvas,ctx,CW,CH;
var player,obstacles,coins,particles,trailParts;
var score,dist,gameCoins,speed,running,frame,streak,streakTimer;
var gameLoop,finalScore;
var GROUND_Y;

function updateCoinDisplay(){document.getElementById('coin-total').textContent=pdata.coins;}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));document.getElementById(id).classList.remove('hidden');}
function showLB(){showScreen('lb-screen');document.getElementById('lb-content').innerHTML='<div style="color:var(--text3);font-size:0.85rem;padding:20px;text-align:center;">Lade...</div>';PZ.getLeaderboard('neon-runner').then(renderLB).catch(()=>renderLB([]));}

function showShop(){showScreen('shop-screen');renderShopUI();}

function startGame(){
  showScreen('game-screen');
  canvas=document.getElementById('c');
  CW=Math.min(600,window.innerWidth-20);
  CH=Math.min(320,window.innerHeight-120);
  canvas.width=CW;canvas.height=CH;
  ctx=canvas.getContext('2d');
  GROUND_Y=CH-50;
  player={x:80,y:GROUND_Y,w:22,h:28,vy:0,jumps:0,maxJumps:2,ducking:false,coyote:0};
  obstacles=[];coins=[];particles=[];trailParts=[];
  score=0;dist=0;gameCoins=0;speed=4;running=true;frame=0;streak=0;streakTimer=0;
  updateHUD();
  if(gameLoop)cancelAnimationFrame(gameLoop);
  tick();
  // spawn initial coins/obstacles
  setTimeout(spawnLoop,1200);
}

function spawnLoop(){
  if(!running)return;
  spawnObstacle();
  setTimeout(spawnLoop,Math.max(800,1800-dist*0.5));
}

function spawnObstacle(){
  var t=Math.random();
  var patterns=[
    [{type:'low',h:24,gap:0}],
    [{type:'mid',h:40,gap:0}],
    [{type:'high',h:56,gap:0}],
    [{type:'hover',h:28,gap:80}],
    [{type:'low',h:20,gap:0},{type:'hover',h:24,gap:110}],
  ];
  var pat=patterns[Math.floor(Math.random()*Math.min(patterns.length,2+Math.floor(dist/200)))];
  pat.forEach(function(ob,i){
    var w=18+Math.random()*10;
    var h=ob.h;
    var y=ob.type==='hover'?GROUND_Y-ob.gap-h:GROUND_Y-h;
    obstacles.push({x:CW+20+i*80,y,w,h,type:ob.type,passed:false});
  });
  // spawn coin cluster
  if(Math.random()<0.5){
    var cx=CW+60+Math.random()*80;
    var cy=GROUND_Y-50-Math.random()*60;
    for(var i=0;i<3+Math.floor(Math.random()*4);i++)coins.push({x:cx+i*22,y:cy,r:7,collected:false});
  }
}

function tick(){
  if(!running)return;
  gameLoop=requestAnimationFrame(tick);
  frame++;
  update();
  draw();
}

function update(){
  speed=4+dist*0.003;
  dist+=speed/60;
  score=Math.floor(dist*10)+gameCoins*5;

  // streak
  streakTimer++;
  if(streakTimer>360)streak=Math.min(streak+1,4);
  else if(streakTimer>180)streak=Math.min(streak,2);

  // player physics
  if(!player.ducking){player.h=28;}
  else{player.h=16;}
  player.vy+=0.55;
  player.y+=player.vy;
  var gy=GROUND_Y-(player.ducking?16:28);
  if(player.y>=gy){player.y=gy;player.vy=0;player.jumps=0;player.coyote=6;}
  if(player.coyote>0)player.coyote--;

  // trail
  var ch=CHARS[pdata.sel];
  if(frame%3===0)trailParts.push({x:player.x,y:player.y,w:player.w,h:player.h,life:1,color:ch.color});
  for(var i=trailParts.length-1;i>=0;i--){trailParts[i].life-=0.15;if(trailParts[i].life<=0)trailParts.splice(i,1);}

  // obstacles
  for(var i=obstacles.length-1;i>=0;i--){
    var ob=obstacles[i];
    ob.x-=speed;
    if(ob.x+ob.w<0){obstacles.splice(i,1);continue;}
    // collision
    if(player.x+player.w-4>ob.x&&player.x+4<ob.x+ob.w&&player.y+player.h-2>ob.y&&player.y+2<ob.y+ob.h){
      endGame();return;
    }
    // passed — streak
    if(!ob.passed&&ob.x+ob.w<player.x){ob.passed=true;streakTimer=0;}
  }

  // coins
  for(var i=coins.length-1;i>=0;i--){
    var c=coins[i];
    c.x-=speed;
    if(!c.collected&&Math.abs(c.x-player.x-player.w/2)<c.r+player.w/2&&Math.abs(c.y-player.y-player.h/2)<c.r+player.h/2){
      c.collected=true;gameCoins++;
      spawnParts(c.x,c.y,'#fbbf24',5);
    }
    if(c.x<-20)coins.splice(i,1);
  }

  // particles
  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.15;p.life-=0.06;
    if(p.life<=0)particles.splice(i,1);
  }

  updateHUD();
}

function spawnParts(x,y,color,n){
  for(var i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-0.5)*3,vy:-2-Math.random()*2,life:1,color});
}

function draw(){
  // sky gradient
  var grad=ctx.createLinearGradient(0,0,0,CH);
  grad.addColorStop(0,'#0a0a12');grad.addColorStop(1,'#0e0e18');
  ctx.fillStyle=grad;ctx.fillRect(0,0,CW,CH);

  // background city silhouette
  ctx.fillStyle='#13131c';
  var bldgs=[[0,80,60,120],[70,50,50,150],[130,90,70,110],[210,40,40,160],[260,70,80,130],[350,30,50,170],[410,60,60,140],[480,85,55,115],[545,45,55,155]];
  bldgs.forEach(function(b){
    ctx.fillRect(b[0],CH-50-b[3],b[1],b[3]);
    // windows
    ctx.fillStyle='rgba(255,220,100,0.15)';
    for(var r=0;r<5;r++)for(var cc=0;cc<3;cc++){if(Math.random()>0.4)ctx.fillRect(b[0]+4+cc*16,CH-50-b[3]+8+r*18,8,10);}
    ctx.fillStyle='#13131c';
  });

  // perspective grid floor
  ctx.strokeStyle='rgba(34,211,238,0.08)';ctx.lineWidth=1;
  for(var i=0;i<12;i++){
    var x=((i/12)*CW+frame*speed*0.5)%CW;
    ctx.beginPath();ctx.moveTo(x,GROUND_Y);ctx.lineTo(CW/2,CH-10);ctx.stroke();
  }
  for(var y=GROUND_Y;y<CH;y+=10){
    var pr=(y-GROUND_Y)/(CH-GROUND_Y);
    ctx.beginPath();ctx.moveTo(CW/2-pr*CW*0.6,y);ctx.lineTo(CW/2+pr*CW*0.6,y);ctx.stroke();
  }

  // ground line
  ctx.strokeStyle='rgba(34,211,238,0.25)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,GROUND_Y);ctx.lineTo(CW,GROUND_Y);ctx.stroke();

  // coins
  coins.filter(c=>!c.collected).forEach(c=>{
    ctx.fillStyle='#fbbf24';ctx.shadowColor='#fbbf24';ctx.shadowBlur=8;
    ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
  });

  // obstacles
  obstacles.forEach(ob=>{
    var obColors={low:'#ef4444',mid:'#f97316',high:'#8b5cf6',hover:'#3b82f6'};
    ctx.fillStyle=obColors[ob.type]||'#ef4444';
    ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=6;
    ctx.fillRect(ob.x,ob.y,ob.w,ob.h);
    ctx.shadowBlur=0;
  });

  // trail
  trailParts.forEach(function(t){
    var ch=CHARS[pdata.sel];
    ctx.globalAlpha=t.life*0.35;
    ctx.fillStyle=ch.color==='rainbow'?('hsl('+(Date.now()/8%360)+',80%,60%)'):ch.color;
    ctx.fillRect(t.x,t.y,t.w,t.h);
    ctx.globalAlpha=1;
  });

  // particles
  particles.forEach(p=>{ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-2,p.y-2,4,4);});
  ctx.globalAlpha=1;

  // player
  var ch=CHARS[pdata.sel];
  var pc=ch.color==='rainbow'?('hsl('+(Date.now()/5%360)+',80%,60%)'):ch.color;
  ctx.fillStyle=pc;
  ctx.shadowColor=pc;ctx.shadowBlur=10;
  ctx.fillRect(player.x,player.y,player.w,player.h);
  ctx.shadowBlur=0;
  // eyes
  ctx.fillStyle='#080810';
  ctx.fillRect(player.x+player.w-8,player.y+4,4,4);
  ctx.fillRect(player.x+player.w-8,player.y+11,4,4);

  // streak indicator
  if(streak>1){
    ctx.fillStyle='rgba(251,140,58,'+(0.6+streak*0.1)+')';
    ctx.font='bold 11px Syne,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
    ctx.fillText('STREAK x'+streak,10,10);
  }

  // new record flash
  if(dist>pdata.bestDist&&pdata.bestDist>0&&frame%60<30){
    ctx.fillStyle='rgba(232,93,4,0.7)';
    ctx.font='bold 12px Syne,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText('NEUER REKORD!',CW/2,10);
  }
}

function updateHUD(){
  document.getElementById('hud-score').textContent=score;
  document.getElementById('hud-dist').textContent=Math.floor(dist)+'m';
  document.getElementById('hud-coins').textContent=gameCoins;
  document.getElementById('hud-streak').textContent='x'+Math.max(1,streak);
}

function endGame(){
  running=false;cancelAnimationFrame(gameLoop);
  finalScore=score;
  pdata.coins+=gameCoins;
  if(Math.floor(dist)>pdata.bestDist)pdata.bestDist=Math.floor(dist);
  saveData(pdata);updateCoinDisplay();
  // Supabase speichern (asynchron)
  if(typeof PZ!=='undefined'){
    PZ.saveGameData('neon-runner',score,1,{coins:pdata.coins,owned:pdata.owned,sel:pdata.sel,bestDist:pdata.bestDist}).catch(()=>{});
    PZ.getUser().then(u=>{var h=document.getElementById('login-hint');if(h)h.style.display=u?'none':'flex';}).catch(()=>{});
  }
  document.getElementById('res-score').textContent=score;
  document.getElementById('res-dist').textContent=Math.floor(dist)+'m';
  document.getElementById('res-coins').textContent=gameCoins;
  showScreen('gameover');
}

function jump(){
  if(player.jumps<player.maxJumps||(player.coyote>0&&player.jumps===0)){
    player.vy=-11;player.jumps++;player.coyote=0;
    spawnParts(player.x+player.w/2,player.y+player.h,CHARS[pdata.sel].color,4);
  }
}

function renderLB(lb){
  var m=['🥇','🥈','🥉'];
  var h='<table class="lb-table"><thead><tr><th>#</th><th>Name</th><th>Punkte</th></tr></thead><tbody>';
  if(!lb||!lb.length)h+='<tr><td colspan="3" class="lb-empty">Noch keine Einträge</td></tr>';
  else lb.forEach((e,i)=>{h+='<tr><td class="lb-rank '+(i<3?['g','s','b'][i]:'')+'">'+(m[i]||i+1)+'</td><td class="lb-name">'+(e.benutzername||e.name||'?')+'</td><td class="lb-score">'+(e.punkte||0)+'</td></tr>';});
  h+='</tbody></table>';document.getElementById('lb-content').innerHTML=h;
}

function renderShopUI(){
  document.getElementById('shop-coins').textContent=pdata.coins;
  var h='';
  CHARS.forEach((c,i)=>{
    var owned=pdata.owned.includes(i),sel=pdata.sel===i;
    var previewColor=c.color==='rainbow'?'linear-gradient(135deg,#f00,#ff0,#0f0,#0ff,#00f)':c.color;
    h+='<div class="char-card'+(sel?' sel':'')+(owned?'':' locked')+'" onclick="buyChar('+i+')">';
    h+='<div class="char-preview" style="background:'+previewColor+'"></div>';
    h+='<div class="char-name">'+c.name+'</div>';
    h+='<div class="char-price '+(sel?'owned':owned?'owned':'cost')+'">'+(sel?'Aktiv':owned?'✓ Wählen':'🪙 '+c.price)+'</div>';
    h+='</div>';
  });
  document.getElementById('chars-grid').innerHTML=h;
}

function buyChar(i){
  if(pdata.owned.includes(i)){pdata.sel=i;saveData(pdata);renderShopUI();return;}
  if(pdata.coins>=CHARS[i].price){pdata.coins-=CHARS[i].price;pdata.owned.push(i);pdata.sel=i;saveData(pdata);renderShopUI();updateCoinDisplay();}
}

document.addEventListener('keydown',function(e){
  if(e.key===' '||e.key==='ArrowUp'||e.key==='w'){e.preventDefault();if(running)jump();}
  if(e.key==='ArrowDown'||e.key==='s'){if(running)player.ducking=true;}
});
document.addEventListener('keyup',function(e){if(e.key==='ArrowDown'||e.key==='s')player.ducking=false;});
document.addEventListener('click',function(e){if(running&&e.target===canvas)jump();});

updateCoinDisplay();
if(typeof PZ!=='undefined')initPlayer();
