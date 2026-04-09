// LOKALER SPEICHER (Fallback)
function loadData(){try{return JSON.parse(localStorage.getItem('ark_data')||'null')||{coins:0,owned:[0],sel:0};}catch(e){return{coins:0,owned:[0],sel:0};}}
function saveData(d){try{localStorage.setItem('ark_data',JSON.stringify(d));}catch(e){}}

// SPIELERDATEN AUS SUPABASE LADEN
var adminModus=false;
async function initPlayer(){
  adminModus=await PZ.adminPanelErstellen([
    {label:'💰 +5000 Münzen',onClick:function(){pdata.coins+=5000;saveData(pdata);updateCoinDisplay();}},
    {label:'🎨 Alle Skins',   onClick:function(){pdata.owned=PADDLES.map(function(_,i){return i;});saveData(pdata);renderShopUI();}},
  ]);
  if(adminModus){
    pdata.coins=9999;pdata.owned=PADDLES.map(function(_,i){return i;});
    saveData(pdata);updateCoinDisplay();return;
  }
  try{
    var data=await PZ.loadScore('arkanoid');
    if(data&&data.extra_daten){
      pdata.coins=data.extra_daten.coins||0;
      pdata.owned=data.extra_daten.owned||[0];
      pdata.sel  =data.extra_daten.sel  ||0;
    }
  }catch(e){}
  updateCoinDisplay();
}

var PADDLES=[
  {name:'Standard',price:0,color:'#5eead4'},
  {name:'Neon',price:35,color:'#e879f9'},
  {name:'Gold',price:60,color:'#fbbf24'},
  {name:'Kristall',price:80,color:'#93c5fd'},
  {name:'Feuer',price:50,color:'#f97316'},
];

var pdata=loadData();
var canvas,ctx,CW,CH;
var paddle,balls,bricks,particles,powerups;
var score,level,lives,gameCoins,running,gameLoop,waitingLaunch;
var pwType=null,pwTimer=0,laserTimer=0;
var finalScore=0;
var LEVELS=20;

var BRICK_COLORS=['#f87171','#fb923c','#fbbf24','#4ade80','#22d3ee','#818cf8','#e879f9','#94a3b8'];

function updateCoinDisplay(){document.getElementById('coin-total').textContent=pdata.coins;}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));document.getElementById(id).classList.remove('hidden');}
function showLB(){showScreen('lb-screen');document.getElementById('lb-content').innerHTML='<div style="color:var(--text3);font-size:0.85rem;padding:20px;text-align:center;">Lade...</div>';PZ.getLeaderboard('arkanoid').then(renderLB).catch(()=>renderLB([]));}
function showShop(){showScreen('shop-screen');renderShopUI();}

function startGame(){
  showScreen('game-screen');
  canvas=document.getElementById('c');
  CW=Math.min(440,window.innerWidth-20);
  CH=Math.min(620,window.innerHeight-120);
  canvas.width=CW;canvas.height=CH;
  ctx=canvas.getContext('2d');
  score=0;level=1;lives=3;gameCoins=0;running=true;pwType=null;pwTimer=0;laserTimer=0;
  initLevel();
  updateHUD();
  if(gameLoop)cancelAnimationFrame(gameLoop);
  tick();
}

function initLevel(){
  var PW=Math.min(90,CW*0.22),PH=10;
  paddle={x:CW/2,y:CH-32,w:PW,h:PH,speed:5};
  balls=[{x:CW/2,y:CH-48,r:7,vx:3*(Math.random()>0.5?1:-1),vy:-4}];
  particles=[];powerups=[];
  waitingLaunch=true;
  bricks=buildLevel(level);
}

function buildLevel(lv){
  var rows=4+Math.floor(lv/3),cols=8;
  var bw=Math.floor((CW-20)/cols)-4,bh=14;
  var arr=[];
  for(var r=0;r<rows;r++){
    for(var c=0;c<cols;c++){
      var x=10+c*(bw+4);
      var y=40+r*(bh+4);
      var t=Math.random()<0.08?'unbreakable':Math.random()<0.1?'explosive':Math.random()<0.2&&lv>2?'strong':'normal';
      arr.push({x,y,w:bw,h:bh,type:t,hp:t==='strong'?2:1,color:t==='unbreakable'?'#475569':t==='explosive'?'#f97316':BRICK_COLORS[(r+c*2)%BRICK_COLORS.length]});
    }
  }
  return arr;
}

function tick(){
  if(!running)return;
  gameLoop=requestAnimationFrame(tick);
  if(!waitingLaunch)update();
  draw();
}

function update(){
  // paddle mouse
  if(mouseX!==null){var t=mouseX-paddle.w/2;paddle.x=Math.max(0,Math.min(CW-paddle.w,t));}
  // paddle keys
  if(keys['ArrowLeft'])paddle.x=Math.max(0,paddle.x-paddle.speed*2);
  if(keys['ArrowRight'])paddle.x=Math.min(CW-paddle.w,paddle.x+paddle.speed*2);

  // pw timer
  if(pwType&&pwType!=='extra'){pwTimer--;if(pwTimer<=0){pwType=null;paddle.w=Math.min(90,CW*0.22);}}

  // laser
  if(pwType==='laser'){laserTimer++;if(laserTimer%20===0){laserBullets.push({x:paddle.x+8,y:paddle.y-10,vy:-7},{x:paddle.x+paddle.w-8,y:paddle.y-10,vy:-7});}}

  // laser bullets hit bricks
  for(var i=laserBullets.length-1;i>=0;i--){
    laserBullets[i].y+=laserBullets[i].vy;
    if(laserBullets[i].y<0){laserBullets.splice(i,1);continue;}
    var hit=false;
    for(var j=bricks.length-1;j>=0;j--){
      var b=bricks[j];
      if(laserBullets[i]&&laserBullets[i].x>b.x&&laserBullets[i].x<b.x+b.w&&laserBullets[i].y>b.y&&laserBullets[i].y<b.y+b.h){
        if(b.type!=='unbreakable')hitBrick(j,laserBullets[i].x,laserBullets[i].y);
        laserBullets.splice(i,1);hit=true;break;
      }
    }
  }

  // balls
  for(var bi=balls.length-1;bi>=0;bi--){
    var ball=balls[bi];
    ball.x+=ball.vx*(pwType==='slow'?0.5:1);
    ball.y+=ball.vy*(pwType==='slow'?0.5:1);
    // walls
    if(ball.x-ball.r<0){ball.x=ball.r;ball.vx*=-1;}
    if(ball.x+ball.r>CW){ball.x=CW-ball.r;ball.vx*=-1;}
    if(ball.y-ball.r<0){ball.y=ball.r;ball.vy*=-1;}
    // paddle
    if(ball.vy>0&&ball.y+ball.r>=paddle.y&&ball.y-ball.r<=paddle.y+paddle.h&&ball.x>=paddle.x&&ball.x<=paddle.x+paddle.w){
      var rel=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2);
      var spd=Math.sqrt(ball.vx*ball.vx+ball.vy*ball.vy);
      ball.vx=rel*5;
      ball.vy=-Math.max(3,spd);
      ball.y=paddle.y-ball.r;
    }
    // lost
    if(ball.y>CH+20){balls.splice(bi,1);continue;}
    // bricks
    for(var j=bricks.length-1;j>=0;j--){
      var br=bricks[j];
      if(ball.x+ball.r>br.x&&ball.x-ball.r<br.x+br.w&&ball.y+ball.r>br.y&&ball.y-ball.r<br.y+br.h){
        if(br.type==='unbreakable'){ball.vy*=-1;break;}
        if(pwType!=='fireball')ball.vy*=-1;
        hitBrick(j,ball.x,ball.y);
        break;
      }
    }
  }

  // all balls lost
  if(balls.length===0){lives--;updateHUD();if(lives<=0){endGame();return;}initLevel();waitingLaunch=true;return;}

  // level clear
  if(bricks.filter(b=>b.type!=='unbreakable').length===0){nextLevel();return;}

  // particles
  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.1;p.life-=0.05;
    if(p.life<=0)particles.splice(i,1);
  }

  // powerups
  for(var i=powerups.length-1;i>=0;i--){
    var p=powerups[i];p.y+=2;
    if(p.y>paddle.y&&p.y<paddle.y+paddle.h&&p.x>paddle.x&&p.x<paddle.x+paddle.w){
      activatePW(p.type);powerups.splice(i,1);continue;
    }
    if(p.y>CH)powerups.splice(i,1);
  }

  updateHUD();
}

var laserBullets=[];
function hitBrick(j,bx,by){
  var br=bricks[j];
  br.hp--;
  if(br.type==='explosive'){
    // chain
    for(var k=bricks.length-1;k>=0;k--){
      if(k!==j&&Math.abs(bricks[k].x-br.x)<br.w*2&&Math.abs(bricks[k].y-br.y)<br.h*2&&bricks[k].type!=='unbreakable'){
        score+=10;spawnParts(bricks[k].x+bricks[k].w/2,bricks[k].y+bricks[k].h/2,bricks[k].color,5);
        bricks.splice(k,1);if(k<j)j--;
      }
    }
  }
  if(br.hp<=0){
    var pts=br.type==='explosive'?50:br.type==='strong'?25:10;
    score+=pts;gameCoins=Math.floor(score/300);
    spawnParts(bx,by,br.color,6);
    if(Math.random()<0.2)powerups.push({x:br.x+br.w/2,y:br.y,type:['multiball','wide','laser','slow','fireball'][Math.floor(Math.random()*5)]});
    bricks.splice(j,1);
  } else {
    // strong brick color dimmed
    br.color='#64748b';
  }
}

function activatePW(t){
  pwType=t;
  if(t==='multiball'){
    var orig=balls[0]||{x:CW/2,y:CH/2,vx:3,vy:-4,r:7};
    balls.push({x:orig.x,y:orig.y,r:7,vx:-orig.vx,vy:orig.vy});
    balls.push({x:orig.x,y:orig.y,r:7,vx:orig.vy,vy:-orig.vx});
    pwType=null;return;
  }
  if(t==='wide'){paddle.w=Math.min(CW*0.4,140);pwTimer=400;}
  else if(t==='extra'){lives=Math.min(5,lives+1);updateHUD();pwType=null;return;}
  else pwTimer=360;
  laserTimer=0;
}

function spawnParts(x,y,color,n){
  for(var i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-0.5)*5,vy:(Math.random()-2)*4,life:1,color});
}

function nextLevel(){
  running=false;cancelAnimationFrame(gameLoop);
  var bonus=(lives*200);score+=bonus;
  document.getElementById('lc-bonus').textContent='Bonus: +'+bonus;
  showScreen('level-clear');
  setTimeout(()=>{
    level++;
    if(level>LEVELS){showVictory();return;}
    running=true;initLevel();showScreen('game-screen');tick();
  },1600);
}

function showVictory(){
  document.getElementById('res-score').textContent=score;
  document.getElementById('res-level').textContent=LEVELS+' / '+LEVELS+' ✓';
  document.getElementById('res-coins').textContent=gameCoins;
  pdata.coins+=gameCoins;saveData(pdata);updateCoinDisplay();
  if(typeof PZ!=='undefined'){
    if(!adminModus)PZ.saveGameData('arkanoid',score,LEVELS,{coins:pdata.coins,owned:pdata.owned,sel:pdata.sel}).catch(()=>{});
    PZ.getUser().then(u=>{var h=document.getElementById('login-hint');if(h)h.style.display=u?'none':'flex';}).catch(()=>{});
  }
  showScreen('gameover');
}

function endGame(){
  running=false;cancelAnimationFrame(gameLoop);
  finalScore=score;
  pdata.coins+=gameCoins;saveData(pdata);updateCoinDisplay();
  // Supabase speichern (asynchron)
  if(typeof PZ!=='undefined'){
    if(!adminModus)PZ.saveGameData('arkanoid',score,level,{coins:pdata.coins,owned:pdata.owned,sel:pdata.sel}).catch(()=>{});
    PZ.getUser().then(u=>{var h=document.getElementById('login-hint');if(h)h.style.display=u?'none':'flex';}).catch(()=>{});
  }
  document.getElementById('res-score').textContent=score;
  document.getElementById('res-level').textContent=level;
  document.getElementById('res-coins').textContent=gameCoins;
  showScreen('gameover');
}


function draw(){
  ctx.fillStyle='#09090c';ctx.fillRect(0,0,CW,CH);
  // bricks
  bricks.forEach(b=>{
    ctx.fillStyle=b.color;
    ctx.fillRect(b.x,b.y,b.w,b.h);
    ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(b.x,b.y,b.w,3);
    if(b.type==='explosive'){ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',b.x+b.w/2,b.y+b.h/2);}
    if(b.type==='unbreakable'){ctx.fillStyle='rgba(255,255,255,0.1)';ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.strokeRect(b.x+1,b.y+1,b.w-2,b.h-2);}
  });
  // powerups
  var pwColors={multiball:'#38bdf8',wide:'#4ade80',laser:'#f43f5e',slow:'#a78bfa',fireball:'#f97316',extra:'#facc15'};
  var pwSymbols={multiball:'◎',wide:'━',laser:'↑',slow:'◐',fireball:'◆',extra:'♥'};
  powerups.forEach(p=>{
    ctx.fillStyle=pwColors[p.type]||'#888';
    ctx.font='14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(pwSymbols[p.type]||'?',p.x,p.y);
  });
  // laser bullets
  laserBullets.forEach(lb=>{ctx.fillStyle='#f43f5e';ctx.fillRect(lb.x-2,lb.y,4,8);});
  // particles
  particles.forEach(p=>{ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-2,p.y-2,4,4);});ctx.globalAlpha=1;
  // balls
  balls.forEach(ball=>{
    ctx.fillStyle=PADDLES[pdata.sel].color;
    ctx.shadowColor=PADDLES[pdata.sel].color;ctx.shadowBlur=10;
    ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
    if(pwType==='fireball'){ctx.fillStyle='rgba(249,115,22,0.4)';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r+4,0,Math.PI*2);ctx.fill();}
  });
  // paddle
  var pc=PADDLES[pdata.sel];
  ctx.fillStyle=pc.color;
  ctx.shadowColor=pc.color;ctx.shadowBlur=12;
  ctx.beginPath();ctx.roundRect(paddle.x,paddle.y,paddle.w,paddle.h,paddle.h/2);ctx.fill();
  ctx.shadowBlur=0;
  // launch hint
  if(waitingLaunch){
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='12px Figtree,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('KLICK / LEERTASTE zum Starten',CW/2,CH/2);
  }
}

function updateHUD(){
  document.getElementById('hud-score').textContent=score;
  document.getElementById('hud-level').textContent=level+' / '+LEVELS;
  document.getElementById('hud-coins').textContent=gameCoins;
  var h='';for(var i=0;i<3;i++)h+='<div class="ball-icon'+(i>=lives?' lost':'')+'"></div>';
  document.getElementById('hud-balls').innerHTML=h;
  var pl={multiball:'',wide:'━ Breiter Schläger',laser:'↑ Laser',slow:'◐ Slow Ball',fireball:'◆ Feuerball'};
  document.getElementById('pw-bar').textContent=pwType?(pl[pwType]||''):'';
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
  PADDLES.forEach((p,i)=>{
    var owned=pdata.owned.includes(i),sel=pdata.sel===i;
    h+='<div class="paddle-card'+(sel?' sel':'')+(owned?'':' locked')+'" onclick="buyPaddle('+i+')">';
    h+='<div class="paddle-preview"><div class="paddle-bar" style="background:'+p.color+'"></div></div>';
    h+='<div class="paddle-name">'+p.name+'</div>';
    h+='<div class="paddle-price '+(sel?'owned':owned?'owned':'cost')+'">'+(sel?'Aktiv':owned?'✓ Wählen':'🪙 '+p.price)+'</div>';
    h+='</div>';
  });
  document.getElementById('paddles-grid').innerHTML=h;
}

function buyPaddle(i){
  if(pdata.owned.includes(i)){pdata.sel=i;saveData(pdata);renderShopUI();return;}
  if(pdata.coins>=PADDLES[i].price){pdata.coins-=PADDLES[i].price;pdata.owned.push(i);pdata.sel=i;saveData(pdata);renderShopUI();updateCoinDisplay();}
}

var keys={},mouseX=null;
document.addEventListener('keydown',e=>{keys[e.key]=true;if([' '].includes(e.key))e.preventDefault();if(e.key===' '&&waitingLaunch)waitingLaunch=false;});
document.addEventListener('keyup',e=>{keys[e.key]=false;});
document.addEventListener('mousemove',e=>{var r=document.getElementById('c')?.getBoundingClientRect();if(r)mouseX=e.clientX-r.left;});
document.addEventListener('click',e=>{if(waitingLaunch&&running)waitingLaunch=false;});

updateCoinDisplay();
if(typeof PZ!=='undefined')initPlayer();
