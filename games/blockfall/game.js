// LOKALER SPEICHER (Fallback)
function loadData(){try{return JSON.parse(localStorage.getItem('blockfall_data')||'null')||{coins:0,owned:[0],sel:0};}catch(e){return{coins:0,owned:[0],sel:0};}}
function saveData(d){try{localStorage.setItem('blockfall_data',JSON.stringify(d));}catch(e){}}

// SPIELERDATEN AUS SUPABASE LADEN
async function initPlayer(){
  try{
    var data=await PZ.loadScore('blockfall');
    if(data&&data.extra_daten){
      pdata.coins=data.extra_daten.coins||0;
      pdata.owned=data.extra_daten.owned||[0];
      pdata.sel  =data.extra_daten.sel  ||0;
    }
  }catch(e){}
  updateCoinDisplay();
}

var THEMES=[
  {name:'Neon',price:0,colors:['#22d3ee','#f472b6','#fbbf24','#4ade80','#f97316','#a78bfa','#f0f0f4']},
  {name:'Pastell',price:30,colors:['#bae6fd','#fbcfe8','#fef08a','#bbf7d0','#fed7aa','#ddd6fe','#ffffff']},
  {name:'Feuer',price:50,colors:['#ef4444','#f97316','#fbbf24','#dc2626','#ea580c','#ca8a04','#fde047']},
  {name:'Ozean',price:40,colors:['#0ea5e9','#06b6d4','#3b82f6','#0284c7','#0891b2','#2563eb','#38bdf8']},
  {name:'Candy',price:60,colors:['#ec4899','#a855f7','#f43f5e','#8b5cf6','#db2777','#7c3aed','#e879f9']},
  {name:'Matrix',price:80,colors:['#16a34a','#15803d','#22c55e','#14532d','#166534','#4ade80','#86efac']},
];

var PIECES=[
  {shape:[[1,1,1,1]],idx:0},
  {shape:[[1,1],[1,1]],idx:1},
  {shape:[[0,1,0],[1,1,1]],idx:2},
  {shape:[[1,0,0],[1,1,1]],idx:3},
  {shape:[[0,0,1],[1,1,1]],idx:4},
  {shape:[[0,1,1],[1,1,0]],idx:5},
  {shape:[[1,1,0],[0,1,1]],idx:6},
];

var COLS=10,ROWS=20,CELL=28;
var board,cur,curX,curY,held,heldUsed,bag,nextPieces;
var score,level,lines,gameCoins,running,dropTimer,dropInterval;
var pdata=loadData();
var comboCount=0,btbTetris=false;

function updateCoinDisplay(){document.getElementById('coin-total').textContent=pdata.coins;}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));document.getElementById(id).classList.remove('hidden');}
function showLB(){showScreen('lb-screen');document.getElementById('lb-content').innerHTML='<div style="color:var(--text3);font-size:0.85rem;padding:20px;text-align:center;">Lade...</div>';PZ.getLeaderboard('blockfall').then(renderLB).catch(()=>renderLB([]));}
function showShop(){showScreen('shop-screen');renderShopUI();}

function emptyBoard(){return Array.from({length:ROWS},()=>Array(COLS).fill(0));}

function startGame(){
  showScreen('game-screen');
  var bw=document.getElementById('board');
  bw.width=COLS*CELL;bw.height=ROWS*CELL;
  board=emptyBoard();
  score=0;level=1;lines=0;gameCoins=0;
  held=null;heldUsed=false;running=true;comboCount=0;btbTetris=false;
  bag=[];nextPieces=[];
  while(nextPieces.length<3)nextPieces.push(randomPiece());
  spawnPiece();
  if(dropTimer)clearInterval(dropTimer);
  dropInterval=getDropInterval();
  dropTimer=setInterval(()=>{if(running)drop();},dropInterval);
  updateHUD();drawAll();
}

function getDropInterval(){return Math.max(80,600-level*50);}

function randomPiece(){
  if(!bag.length){bag=[0,1,2,3,4,5,6];for(let i=bag.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}
  return JSON.parse(JSON.stringify(PIECES[bag.pop()]));
}

function spawnPiece(){
  cur=nextPieces.shift();
  nextPieces.push(randomPiece());
  curX=Math.floor((COLS-cur.shape[0].length)/2);
  curY=0;heldUsed=false;
  if(collides(cur.shape,curX,curY)){endGame();}
  drawAll();
}

function collides(shape,ox,oy){
  for(var r=0;r<shape.length;r++)for(var c=0;c<shape[r].length;c++){
    if(!shape[r][c])continue;
    var nx=ox+c,ny=oy+r;
    if(nx<0||nx>=COLS||ny>=ROWS)return true;
    if(ny>=0&&board[ny][nx])return true;
  }
  return false;
}

function drop(){
  if(!running)return;
  curY++;
  if(collides(cur.shape,curX,curY)){curY--;lock();}
  else drawAll();
}

function hardDrop(){
  var y=curY;
  while(!collides(cur.shape,curX,y+1))y++;
  score+=2*(y-curY);curY=y;lock();
}

function lock(){
  for(var r=0;r<cur.shape.length;r++)for(var c=0;c<cur.shape[r].length;c++){
    if(cur.shape[r][c]&&curY+r>=0)board[curY+r][curX+c]=cur.idx+1;
  }
  var cleared=clearLines();
  if(cleared>0){
    comboCount++;
    var pts=0;
    if(cleared===1)pts=100;
    else if(cleared===2)pts=300;
    else if(cleared===3)pts=500;
    else{pts=800;announce(btbTetris?'BACK-TO-BACK!':'TETRIS!');btbTetris=true;}
    if(cleared<4)btbTetris=false;
    pts*=level;
    if(comboCount>1){pts=Math.floor(pts*(1+comboCount*0.3));if(comboCount>=2)announce('COMBO x'+comboCount+'!');}
    score+=pts;lines+=cleared;
    var newLevel=Math.floor(lines/10)+1;
    if(newLevel>level){level=newLevel;clearInterval(dropTimer);dropTimer=setInterval(()=>{if(running)drop();},getDropInterval());}
    gameCoins=Math.floor(score/500);
  } else{comboCount=0;}
  updateHUD();spawnPiece();
}

function clearLines(){
  var count=0;
  for(var r=ROWS-1;r>=0;r--){
    if(board[r].every(c=>c)){board.splice(r,1);board.unshift(Array(COLS).fill(0));count++;r++;}
  }
  return count;
}

function rotateCW(shape){
  var rows=shape.length,cols=shape[0].length;
  var out=Array.from({length:cols},()=>Array(rows).fill(0));
  for(var r=0;r<rows;r++)for(var c=0;c<cols;c++)out[c][rows-1-r]=shape[r][c];
  return out;
}

function tryRotate(){
  var rot=rotateCW(cur.shape);
  var kicks=[0,-1,1,-2,2];
  for(var k of kicks){if(!collides(rot,curX+k,curY)){cur.shape=rot;curX+=k;drawAll();return;}}
}

function holdPiece(){
  if(heldUsed)return;heldUsed=true;
  if(held){var tmp=held;held=cur;cur=tmp;}
  else{held=cur;spawnPiece();return;}
  curX=Math.floor((COLS-cur.shape[0].length)/2);curY=0;
  if(collides(cur.shape,curX,curY)){endGame();}
  drawAll();
}

function getGhostY(){var gy=curY;while(!collides(cur.shape,curX,gy+1))gy++;return gy;}

var boardCanvas=null,bctx=null;
function drawAll(){
  if(!boardCanvas)boardCanvas=document.getElementById('board');
  if(!bctx)bctx=boardCanvas.getContext('2d');
  var theme=THEMES[pdata.sel];
  bctx.fillStyle='#09090c';bctx.fillRect(0,0,boardCanvas.width,boardCanvas.height);
  bctx.strokeStyle='rgba(255,255,255,0.03)';bctx.lineWidth=1;
  for(var x=0;x<=COLS;x++){bctx.beginPath();bctx.moveTo(x*CELL,0);bctx.lineTo(x*CELL,ROWS*CELL);bctx.stroke();}
  for(var y=0;y<=ROWS;y++){bctx.beginPath();bctx.moveTo(0,y*CELL);bctx.lineTo(COLS*CELL,y*CELL);bctx.stroke();}
  for(var r=0;r<ROWS;r++)for(var c=0;c<COLS;c++){
    if(board[r][c])drawBlock(bctx,c*CELL,r*CELL,theme.colors[(board[r][c]-1)%theme.colors.length],0.85);
  }
  if(!running)return;
  var gy=getGhostY();
  for(var r=0;r<cur.shape.length;r++)for(var c=0;c<cur.shape[r].length;c++){
    if(cur.shape[r][c]){
      bctx.fillStyle='rgba(255,255,255,0.06)';
      bctx.strokeStyle=theme.colors[cur.idx%theme.colors.length];
      bctx.lineWidth=1;bctx.globalAlpha=0.5;
      bctx.fillRect(curX*CELL+c*CELL+1,(gy+r)*CELL+1,CELL-2,CELL-2);
      bctx.strokeRect(curX*CELL+c*CELL+1,(gy+r)*CELL+1,CELL-2,CELL-2);
      bctx.globalAlpha=1;
    }
  }
  for(var r=0;r<cur.shape.length;r++)for(var c=0;c<cur.shape[r].length;c++){
    if(cur.shape[r][c])drawBlock(bctx,(curX+c)*CELL,(curY+r)*CELL,theme.colors[cur.idx%theme.colors.length],1);
  }
  drawPreview('preview-hold',held);
  drawPreviewList();
}

function drawBlock(ctx,x,y,color,alpha){
  ctx.save();ctx.globalAlpha=alpha;
  ctx.fillStyle=color;
  ctx.fillRect(x+1,y+1,CELL-2,CELL-2);
  ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fillRect(x+2,y+2,CELL-4,4);
  ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(x+1,y+CELL-4,CELL-2,3);
  ctx.restore();
}

function drawPreview(id,piece){
  var c=document.getElementById(id);if(!c)return;
  var ctx=c.getContext('2d');
  ctx.fillStyle='#09090c';ctx.fillRect(0,0,c.width,c.height);
  if(!piece)return;
  var theme=THEMES[pdata.sel];
  var sz=12,offX=Math.floor((c.width-piece.shape[0].length*sz)/2),offY=Math.floor((c.height-piece.shape.length*sz)/2);
  for(var r=0;r<piece.shape.length;r++)for(var col=0;col<piece.shape[r].length;col++){
    if(piece.shape[r][col]){ctx.fillStyle=theme.colors[piece.idx%theme.colors.length];ctx.fillRect(offX+col*sz+1,offY+r*sz+1,sz-2,sz-2);}
  }
}

function drawPreviewList(){
  var c=document.getElementById('preview-next');if(!c)return;
  var ctx=c.getContext('2d');
  ctx.fillStyle='#09090c';ctx.fillRect(0,0,c.width,c.height);
  var theme=THEMES[pdata.sel];
  var sz=11,yOff=4;
  nextPieces.slice(0,3).forEach(function(piece){
    var offX=Math.floor((c.width-piece.shape[0].length*sz)/2);
    for(var r=0;r<piece.shape.length;r++)for(var col=0;col<piece.shape[r].length;col++){
      if(piece.shape[r][col]){ctx.fillStyle=theme.colors[piece.idx%theme.colors.length];ctx.fillRect(offX+col*sz+1,yOff+r*sz+1,sz-2,sz-2);}
    }
    yOff+=piece.shape.length*sz+10;
  });
}

function updateHUD(){
  document.getElementById('hud-score').textContent=score;
  document.getElementById('hud-level').textContent=level;
  document.getElementById('hud-lines').textContent=lines;
  document.getElementById('hud-coins').textContent=gameCoins;
}

var announceTO=null;
function announce(text){
  var el=document.getElementById('announce');
  el.textContent=text;el.style.opacity='1';
  if(announceTO)clearTimeout(announceTO);
  announceTO=setTimeout(()=>{el.style.opacity='0';},1200);
}

function endGame(){
  running=false;clearInterval(dropTimer);
  pdata.coins+=gameCoins;saveData(pdata);updateCoinDisplay();
  // Supabase speichern (asynchron)
  if(typeof PZ!=='undefined'){
    PZ.saveGameData('blockfall',score,level,{coins:pdata.coins,owned:pdata.owned,sel:pdata.sel}).catch(()=>{});
    PZ.getUser().then(u=>{var h=document.getElementById('login-hint');if(h)h.style.display=u?'none':'flex';}).catch(()=>{});
  }
  document.getElementById('res-score').textContent=score;
  document.getElementById('res-level').textContent=level;
  document.getElementById('res-lines').textContent=lines;
  document.getElementById('res-coins').textContent=gameCoins;
  showScreen('gameover-screen');
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
  THEMES.forEach(function(t,i){
    var owned=pdata.owned.includes(i),sel=pdata.sel===i;
    h+='<div class="theme-card'+(sel?' selected':'')+(owned?'':' locked')+'" onclick="buyTheme('+i+')">';
    h+='<div class="theme-preview">';
    t.colors.slice(0,4).forEach(c=>{h+='<div class="theme-block" style="background:'+c+'"></div>';});
    h+='</div>';
    h+='<div class="theme-name">'+t.name+'</div>';
    h+='<div class="theme-price '+(sel?'owned':owned?'owned':'cost')+'">'+(sel?'Aktiv':owned?'✓ Wählen':'🪙 '+t.price)+'</div>';
    h+='</div>';
  });
  document.getElementById('themes-grid').innerHTML=h;
}

function buyTheme(i){
  if(pdata.owned.includes(i)){pdata.sel=i;saveData(pdata);renderShopUI();return;}
  if(pdata.coins>=THEMES[i].price){pdata.coins-=THEMES[i].price;pdata.owned.push(i);pdata.sel=i;saveData(pdata);renderShopUI();updateCoinDisplay();}
}

var dasKey=null,dasTimer=null,dasRepeat=null;
document.addEventListener('keydown',function(e){
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();
  if(e.key==='ArrowLeft'){move(-1);}
  else if(e.key==='ArrowRight'){move(1);}
  else if(e.key==='ArrowUp'||e.key==='x'||e.key==='X'){tryRotate();}
  else if(e.key==='ArrowDown'){drop();}
  else if(e.key===' '){hardDrop();}
  else if(e.key==='Shift'||e.key==='c'||e.key==='C'){holdPiece();}
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
    if(dasKey!==e.key){dasKey=e.key;clearTimeout(dasTimer);clearInterval(dasRepeat);dasTimer=setTimeout(()=>{dasRepeat=setInterval(()=>{move(e.key==='ArrowLeft'?-1:1);},50);},160);}
  }
});
document.addEventListener('keyup',function(e){if(e.key===dasKey){dasKey=null;clearTimeout(dasTimer);clearInterval(dasRepeat);}});

function move(dx){if(!running)return;if(!collides(cur.shape,curX+dx,curY)){curX+=dx;drawAll();}}

updateCoinDisplay();
if(typeof PZ!=='undefined')initPlayer();
