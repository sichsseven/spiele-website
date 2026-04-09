// LOKALER SPEICHER (Fallback)
function loadData(){try{return JSON.parse(localStorage.getItem('memory_data')||'null')||{coins:0,owned:[0],sel:0};}catch(e){return{coins:0,owned:[0],sel:0};}}
function saveData(d){try{localStorage.setItem('memory_data',JSON.stringify(d));}catch(e){}}

// SPIELERDATEN AUS SUPABASE LADEN
var adminModus=false;
async function initPlayer(){
  adminModus=await PZ.adminPanelErstellen([
    {label:'💰 +5000 Münzen',onClick:function(){pdata.coins+=5000;saveData(pdata);updateCoinDisplay();}},
    {label:'🎨 Alle Themes',  onClick:function(){pdata.owned=THEMES.map(function(_,i){return i;});saveData(pdata);renderShopUI();}},
  ]);
  if(adminModus){
    pdata.coins=9999;pdata.owned=THEMES.map(function(_,i){return i;});
    saveData(pdata);updateCoinDisplay();return;
  }
  try{
    var data=await PZ.loadScore('memory-match');
    if(data&&data.extra_daten){
      pdata.coins=data.extra_daten.coins||0;
      pdata.owned=data.extra_daten.owned||[0];
      pdata.sel  =data.extra_daten.sel  ||0;
    }
  }catch(e){}
  updateCoinDisplay();
}

var THEMES=[
  {
    name:'Standard',price:0,
    emojis:['🎮','🕹️','🎯','💎','⭐','🔥','🌙','🚀','🎲','🃏','🧩','🪄','🔑','🏆','🎪','🎭','🎨','🎬','🎤','🎸','🦄','🐉','🤖','👾','🛸','🍕','🍦','🎁','🎀','📦','💡','🔮','🌈','⚡','🎊']
  },
  {
    name:'Natur',price:30,
    emojis:['🌸','🌿','🦋','🍀','🌈','🌺','🌴','🌊','🍁','🌻','🌷','🦊','🐻','🐼','🐨','🦁','🐯','🦅','🦉','🐬','🐙','🦈','🌵','🌋','🏔️','🌾','🍄','🐚','🦀','🐠','🐸','🦩','🌍','🌞','❄️']
  },
  {
    name:'Essen',price:35,
    emojis:['🍕','🍔','🌮','🍜','🍣','🍦','🎂','🍩','🍪','🍫','🍿','🧁','🍰','🥧','🍭','🥐','🥨','🧀','🍳','🥞','🌯','🥗','🍱','🍛','🥘','🍲','🫕','🦞','🥩','🍗','🍖','🌽','🧆','🥙','🫔']
  },
  {
    name:'Sport',price:40,
    emojis:['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🥊','🥋','🤸','🏄','🚴','🏊','⛷️','🤺','🏹','🎯','🛹','🏋️','🤼','🧗','🤾','🏇','🥅','🎳','🏌️','🎿','🛷','🥌','🏒','🤿','🏆']
  },
  {
    name:'Reisen',price:45,
    emojis:['✈️','🚂','🚢','🏖️','🗼','🗽','🏯','🗺️','🧳','🌍','🌎','🌏','🏔️','🎡','🎢','🏝️','🛤️','🚁','🚠','🛳️','⛵','🚤','🚵','🏕️','🗻','🏜️','🌉','🏟️','🕌','⛩️','🎠','🌃','🌆','🎑','🛕']
  }
];

var LEVELS=[
  {cols:4,rows:4,pairs:8,time:60},
  {cols:4,rows:5,pairs:10,time:70},
  {cols:5,rows:6,pairs:15,time:90},
  {cols:6,rows:6,pairs:18,time:100},
  {cols:6,rows:6,pairs:18,time:90},
  {cols:6,rows:6,pairs:18,time:80},
  {cols:6,rows:6,pairs:18,time:70},
];

var pdata=loadData();
var cards=[],flipped=[],matched=0,canFlip=true;
var score,level,streak,gameCoins,totalTime,timeLeft,timerInterval;
var running=false;

function updateCoinDisplay(){document.getElementById('coin-total').textContent=pdata.coins;}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));document.getElementById(id).classList.remove('hidden');}
function showLB(){showScreen('lb-screen');document.getElementById('lb-content').innerHTML='<div style="color:var(--text3);font-size:0.85rem;padding:20px;text-align:center;">Lade...</div>';PZ.getLeaderboard('memory-match').then(renderLB).catch(()=>renderLB([]));}
function showShop(){showScreen('shop-screen');renderShopUI();}

function getCardSize(){
  var lv=LEVELS[Math.min(level-1,LEVELS.length-1)];
  var maxW=Math.min(window.innerWidth-40,520);
  var maxH=window.innerHeight-200;
  var sz=Math.min(Math.floor((maxW-lv.cols*8)/lv.cols),Math.floor((maxH-lv.rows*8)/lv.rows),80);
  return Math.max(sz,48);
}

function startGame(){
  score=0;level=1;streak=0;gameCoins=0;running=true;
  showScreen('game-screen');
  startLevel();
}

function startLevel(){
  flipped=[];matched=0;canFlip=true;
  var lv=LEVELS[Math.min(level-1,LEVELS.length-1)];
  totalTime=lv.time;timeLeft=lv.time;
  updateHUD();
  buildGrid(lv);
  startTimer();
}

function buildGrid(lv){
  var theme=THEMES[pdata.sel];
  // Shuffle the full emoji pool and pick unique pairs
  var pool=theme.emojis.slice();
  for(var i=pool.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  pool=pool.slice(0,lv.pairs);
  var arr=[...pool,...pool];
  for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
  cards=arr;
  var grid=document.getElementById('card-grid');
  var sz=getCardSize();
  grid.style.gridTemplateColumns='repeat('+lv.cols+','+sz+'px)';
  grid.innerHTML='';
  arr.forEach(function(emoji,i){
    var el=document.createElement('div');
    el.className='card';
    el.style.width=sz+'px';el.style.height=sz+'px';
    el.innerHTML='<div class="card-inner"><div class="card-back"></div><div class="card-front" style="font-size:'+Math.floor(sz*0.45)+'px">'+emoji+'</div></div>';
    el.dataset.idx=i;el.dataset.emoji=emoji;
    el.addEventListener('click',function(){flipCard(this);});
    grid.appendChild(el);
  });
}

function flipCard(el){
  if(!canFlip||!running)return;
  if(el.classList.contains('flipped')||el.classList.contains('matched'))return;
  if(flipped.length>=2)return;
  el.classList.add('flipped');
  flipped.push(el);
  if(flipped.length===2)checkMatch();
}

function checkMatch(){
  canFlip=false;
  var a=flipped[0],b=flipped[1];
  if(a.dataset.emoji===b.dataset.emoji){
    setTimeout(()=>{
      a.classList.add('matched');b.classList.add('matched');
      streak++;
      var mult=Math.min(streak,4);
      var pts=100*mult;
      score+=pts;
      gameCoins=Math.floor(score/200);
      showCombo(mult);
      matched+=2;
      flipped=[];canFlip=true;
      updateHUD();
      if(matched>=cards.length)levelComplete();
    },300);
  } else {
    streak=0;
    setTimeout(()=>{
      a.classList.remove('flipped');b.classList.remove('flipped');
      a.classList.add('wrong');b.classList.add('wrong');
      setTimeout(()=>{a.classList.remove('wrong');b.classList.remove('wrong');},300);
      flipped=[];canFlip=true;
      updateHUD();
    },700);
  }
}

var comboTO=null;
function showCombo(mult){
  if(mult<=1)return;
  var el=document.getElementById('combo-text');
  el.textContent='COMBO x'+mult+'! +'+100*mult;
  if(comboTO)clearTimeout(comboTO);
  comboTO=setTimeout(()=>{el.textContent='';},1000);
}

function startTimer(){
  if(timerInterval)clearInterval(timerInterval);
  timerInterval=setInterval(()=>{
    if(!running)return;
    timeLeft--;
    var pct=Math.max(0,(timeLeft/totalTime)*100);
    document.getElementById('timer-bar').style.width=pct+'%';
    if(timeLeft<=0){clearInterval(timerInterval);endGame();}
  },1000);
}

function levelComplete(){
  clearInterval(timerInterval);running=false;
  var bonus=timeLeft*10;
  score+=bonus;
  gameCoins=Math.floor(score/200);
  document.getElementById('lc-bonus').textContent='Zeitbonus: +'+bonus;
  document.getElementById('level-complete').classList.remove('hidden');
  setTimeout(()=>{
    document.getElementById('level-complete').classList.add('hidden');
    level++;running=true;
    startLevel();
  },2000);
}

function updateHUD(){
  document.getElementById('hud-score').textContent=score;
  document.getElementById('hud-level').textContent=level;
  document.getElementById('hud-coins').textContent=gameCoins;
  document.getElementById('hud-streak').textContent='x'+Math.min(streak+1,4);
}

function endGame(){
  running=false;
  pdata.coins+=gameCoins;saveData(pdata);updateCoinDisplay();
  // Supabase speichern (asynchron)
  if(typeof PZ!=='undefined'){
    if(!adminModus)PZ.saveGameData('memory-match',score,level,{coins:pdata.coins,owned:pdata.owned,sel:pdata.sel}).catch(()=>{});
    PZ.getUser().then(u=>{var h=document.getElementById('login-hint');if(h)h.style.display=u?'none':'flex';}).catch(()=>{});
  }
  document.getElementById('res-score').textContent=score;
  document.getElementById('res-level').textContent=level;
  document.getElementById('res-coins').textContent=gameCoins;
  showScreen('gameover-screen');
}


function renderLB(lb){
  var m=['🥇','🥈','🥉'];
  var h='<table class="lb-table"><thead><tr><th>#</th><th>Name</th><th>Punkte</th></tr></thead><tbody>';
  if(!lb||!lb.length)h+='<tr><td colspan="3" class="lb-empty">Noch keine Einträge</td></tr>';
  else lb.forEach((e,i)=>{h+='<tr><td class="lb-rank '+(i<3?['gold','silver','bronze'][i]:'')+'">'+(m[i]||i+1)+'</td><td class="lb-name">'+(e.benutzername||e.name||'?')+'</td><td class="lb-score">'+(e.punkte||0)+'</td></tr>';});
  h+='</tbody></table>';
  document.getElementById('lb-content').innerHTML=h;
}

function renderShopUI(){
  document.getElementById('shop-coins').textContent=pdata.coins;
  var h='';
  THEMES.forEach(function(t,i){
    var owned=pdata.owned.includes(i),sel=pdata.sel===i;
    h+='<div class="theme-card'+(sel?' selected':'')+(owned?'':' locked')+'" onclick="buyTheme('+i+')">';
    h+='<div class="theme-preview">'+t.emojis.slice(0,4).join('')+'</div>';
    h+='<div class="theme-name">'+t.name+'</div>';
    h+='<div class="theme-price '+(sel?'owned':owned?'owned':'cost')+'">'+(sel?'✓ Aktiv':owned?'Wählen':'🪙 '+t.price)+'</div>';
    h+='</div>';
  });
  document.getElementById('themes-grid').innerHTML=h;
}

function buyTheme(i){
  var t=THEMES[i];
  if(pdata.owned.includes(i)){pdata.sel=i;saveData(pdata);renderShopUI();return;}
  if(pdata.coins>=t.price){pdata.coins-=t.price;pdata.owned.push(i);pdata.sel=i;saveData(pdata);renderShopUI();updateCoinDisplay();}
}

updateCoinDisplay();
if(typeof PZ!=='undefined')initPlayer();
