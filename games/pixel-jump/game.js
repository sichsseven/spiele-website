window.onerror=function(msg,src,line,col,err){
  console.error('Game error:',msg,'line:',line,err);
  return false;
};
window.onunhandledrejection=function(e){console.warn('Unhandled promise:',e.reason);};
// ── CONFIG ────────────────────────────────────────────────────────────────────
var isTouchDevice=('ontouchstart' in window)||navigator.maxTouchPoints>0;

// ── STORAGE ───────────────────────────────────────────────────────────────────
function loadPD(){try{return JSON.parse(localStorage.getItem('dj2_pd')||'null')||{coins:0,owned:[0],sel:0,name:''};}catch(e){return{coins:0,owned:[0],sel:0,name:''};}}
function savePD(d){try{localStorage.setItem('dj2_pd',JSON.stringify(d));}catch(e){}}

// SPIELERDATEN AUS SUPABASE LADEN
async function initPlayer(){
  try{
    var username=await PZ.currentUsername();
    if(username)playerName=username;
    var data=await PZ.loadScore('pixel-jump');
    if(data&&data.extra_daten){
      pd.coins   =data.extra_daten.coins   ||0;
      pd.owned   =data.extra_daten.owned   ||[0];
      pd.sel     =data.extra_daten.sel     ||0;
      pd.upgrades=data.extra_daten.upgrades||{};
      if(username)pd.name=username;
    }else if(username){
      pd.name=username;
    }
    savePD(pd);
  }catch(e){}
  var sv=document.getElementById('shopcoVal');if(sv)sv.textContent=pd.coins;
}

// ── CANVAS ────────────────────────────────────────────────────────────────────
var canvas=document.getElementById('c');
var ctx=canvas.getContext('2d');
var CW,CH,SC;
function resize(){
  CW=window.innerWidth; CH=window.innerHeight;
  canvas.width=CW; canvas.height=CH;
  // SC: visual scale only - based on height so things look right on tall/wide screens
  SC=Math.min(CH/700, CW/500, 1.8);
}
resize();
window.addEventListener('resize',function(){resize();});

// ── CHARACTERS ────────────────────────────────────────────────────────────────
var CHARS=[
  {name:'Grüni',  price:0,   scoreReq:0,    body:'#7ecf4a',dark:'#2d6e0f',acc:'#ffe066',code:null,img:null},
  {name:'Ozean',  price:50,  scoreReq:0,    body:'#22c5ef',dark:'#0a5a8a',acc:'#ffffff',code:null,img:null},
  {name:'Feuer',  price:80,  scoreReq:0,    body:'#ff5a1a',dark:'#aa1a00',acc:'#ffcc00',code:null,img:null},
  {name:'Neon',   price:100, scoreReq:0,    body:'#b46aef',dark:'#6a1aaa',acc:'#ffaaff',code:null,img:null},
  {name:'Robot',  price:120, scoreReq:0,    body:'#8aaabb',dark:'#334455',acc:'#44ffff',code:null,img:null},
  {name:'Gold',   price:200, scoreReq:0,    body:'#ffd700',dark:'#996600',acc:'#ffffff',code:null,img:null},
  {name:'Geist',  price:150, scoreReq:0,    body:'#dde0ff',dark:'#6677cc',acc:'#ffffff',code:null,img:null},
  {name:'Alien',  price:90,  scoreReq:0,    body:'#4aef8a',dark:'#1a7a3a',acc:'#ffff44',code:null,img:null},
  {name:'Tim',    price:0,   scoreReq:0,    body:'#f0c090',dark:'#8b4513',acc:'#4a90d9',  code:'timgioh', img:'__TIM__'},
];
// inject photo


var SPRITES=[
// 0 Grüni - happy round blob
[[0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,1,1,2,2,1,1,1,1,2,2,1,1,0,0,0],[0,1,1,2,2,1,1,1,1,2,2,1,1,0,0,0],[1,1,1,1,1,3,3,3,3,1,1,1,1,1,0,0],[1,1,1,1,3,3,3,3,3,3,1,1,1,1,0,0],[1,1,1,1,3,3,2,2,3,3,1,1,1,1,0,0],[1,1,1,3,3,3,3,3,3,3,3,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0],[0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0]],
// 1 Ozean - fish-like blue guy
[[0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,1,1,2,1,1,1,1,2,1,1,0,0,0,0],[0,1,1,1,2,1,1,1,1,2,1,1,1,0,0,0],[0,1,1,1,1,3,3,3,3,1,1,1,1,0,0,0],[0,1,1,1,3,3,3,3,3,3,1,1,1,0,0,0],[0,1,1,1,3,3,2,2,3,3,1,1,1,0,0,0],[0,1,1,3,3,3,3,3,3,3,3,1,1,0,0,0],[3,3,1,1,1,1,1,1,1,1,1,1,3,3,0,0],[3,3,1,1,1,2,1,1,1,1,1,1,3,3,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0],[0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0]],
// 2 Feuer - flame character
[[0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],[0,0,0,1,1,2,1,1,1,1,0,0,0,0,0,0],[0,0,1,1,2,2,2,1,1,1,1,0,0,0,0,0],[0,1,1,1,2,2,1,1,1,1,1,1,0,0,0,0],[0,1,1,1,1,1,3,3,1,1,1,1,0,0,0,0],[0,1,1,1,3,3,3,3,3,3,1,1,0,0,0,0],[1,1,1,3,3,3,3,3,3,3,3,1,1,0,0,0],[1,1,1,1,3,3,2,2,3,3,1,1,1,0,0,0],[1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,1,1,1,1,0,0,1,1,1,0,0,0,0,0],[0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0]],
// 3 Neon - spiky purple
[[0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0],[0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[1,1,2,1,1,2,1,1,1,2,1,1,2,1,0,0],[1,1,2,1,1,2,1,1,1,2,1,1,2,1,0,0],[1,1,1,1,3,3,3,3,3,3,1,1,1,1,0,0],[1,1,1,3,3,3,2,2,3,3,3,1,1,1,0,0],[1,1,1,3,3,3,3,3,3,3,3,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0],[0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0]],
// 4 Robot - angular metal
[[0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],[1,1,3,3,3,3,3,3,3,3,3,3,1,0,0,0],[1,3,3,2,3,3,3,3,3,3,2,3,3,0,0,0],[1,3,3,2,3,3,3,3,3,3,2,3,3,0,0,0],[1,3,3,3,3,1,1,1,1,3,3,3,3,0,0,0],[1,1,3,3,3,1,2,2,1,3,3,3,1,0,0,0],[1,1,3,3,1,2,2,2,2,1,3,3,1,0,0,0],[1,1,1,3,3,3,3,3,3,3,3,1,1,0,0,0],[0,1,1,1,3,3,3,3,3,3,1,1,0,0,0,0],[0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,0,1,3,0,0,0,0,3,1,0,0,0,0,0],[0,0,1,1,3,0,0,0,0,3,1,1,0,0,0,0],[0,0,1,3,3,0,0,0,0,3,3,1,0,0,0,0],[0,1,1,3,0,0,0,0,0,0,3,1,1,0,0,0],[0,1,3,3,0,0,0,0,0,0,3,3,1,0,0,0]],
// 5 Gold - shiny crowned blob
[[0,0,0,3,0,3,0,3,0,3,0,0,0,0,0,0],[0,0,0,3,3,3,3,3,3,3,3,0,0,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,1,1,2,2,1,1,1,1,2,2,1,1,0,0,0],[0,1,1,2,2,1,1,1,1,2,2,1,1,0,0,0],[0,1,1,1,1,3,3,3,3,1,1,1,1,0,0,0],[1,1,1,1,3,3,3,3,3,3,1,1,1,1,0,0],[1,1,1,3,3,3,2,2,3,3,3,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0],[0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0]],
// 6 Geist - ghost floaty
[[0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,1,1,2,1,1,1,1,1,2,1,1,0,0,0,0],[0,1,1,2,1,1,1,1,1,2,1,1,0,0,0,0],[1,1,1,1,3,3,3,3,3,1,1,1,1,0,0,0],[1,1,1,3,3,3,3,3,3,3,1,1,1,0,0,0],[1,1,1,3,3,2,2,2,3,3,1,1,1,0,0,0],[1,1,1,1,3,3,3,3,3,1,1,1,1,0,0,0],[1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[1,0,1,0,1,0,1,1,1,0,1,0,1,0,0,0],[1,0,1,0,1,0,1,1,1,0,1,0,1,0,0,0],[0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
// 7 Alien - 3-eyed green
[[0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,1,1,2,1,2,1,1,2,1,2,1,1,0,0,0],[0,1,1,2,1,2,1,1,2,1,2,1,1,0,0,0],[1,1,1,1,3,1,3,3,1,3,1,1,1,1,0,0],[1,1,1,3,3,3,3,3,3,3,3,1,1,1,0,0],[1,1,1,3,3,2,3,3,2,3,3,1,1,1,0,0],[1,1,3,3,3,3,3,3,3,3,3,3,1,1,0,0],[0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],[0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],[0,0,1,0,1,1,0,0,1,1,0,1,0,0,0,0],[0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0],[0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0]],
// 8 Tim - hoodie guy with short hair
[[0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0],[0,0,1,1,3,3,3,3,3,1,1,0,0,0,0,0],[0,1,1,3,3,1,1,1,3,3,1,1,0,0,0,0],[0,1,1,3,2,1,1,1,2,3,1,1,0,0,0,0],[0,1,1,3,3,3,3,3,3,3,1,1,0,0,0,0],[0,0,1,1,3,3,3,3,3,1,1,0,0,0,0,0],[0,0,1,4,4,4,4,4,4,4,1,0,0,0,0,0],[0,1,4,4,4,4,4,4,4,4,4,1,0,0,0,0],[0,1,4,4,4,3,3,4,4,4,4,1,0,0,0,0],[0,1,4,4,3,3,3,3,4,4,4,1,0,0,0,0],[0,0,1,4,4,4,4,4,4,4,1,0,0,0,0,0],[0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0],[0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],[0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0]],
];
function shade(hex,amt){
  var r=Math.max(0,Math.min(255,parseInt(hex.slice(1,3),16)+amt));
  var g=Math.max(0,Math.min(255,parseInt(hex.slice(3,5),16)+amt));
  var b=Math.max(0,Math.min(255,parseInt(hex.slice(5,7),16)+amt));
  return 'rgb('+r+','+g+','+b+')';
}
// Cache for photo skin images
var IMG_CACHE={};
function getCharImg(ci){
  var ch=CHARS[ci];
  if(!ch||!ch.img)return null;
  if(IMG_CACHE[ci])return IMG_CACHE[ci];
  if(ch.img==='__TIM__'){
    // Load from textarea (raw text, no JS string limit issues)
    var ta=document.getElementById('tim-src');
    if(ta&&ta.value){
      var img=new Image();
      img.src='data:image/png;base64,'+ta.value;
      IMG_CACHE[ci]=img;
      return img;
    }
    return null;
  }
  var img=new Image();img.src=ch.img;IMG_CACHE[ci]=img;return img;
}
function drawChar(c2,ci,x,y,sz,flip){
  var ch=CHARS[ci]||CHARS[0];
  // Photo skin: draw image
  if(ch.img){
    var img=getCharImg(ci);
    if(img&&img.complete&&img.naturalWidth>0){
      c2.save();
      c2.beginPath();c2.arc(x+sz/2,y+sz/2,sz/2,0,Math.PI*2);c2.clip();
      c2.drawImage(img,x,y,sz,sz);
      c2.restore();
    } else {
      // Fallback circle while loading
      c2.fillStyle=ch.body;c2.beginPath();c2.arc(x+sz/2,y+sz/2,sz/2,0,Math.PI*2);c2.fill();
    }
    return;
  }
  // Pixel sprite
  var sp=SPRITES[ci]||SPRITES[0];
  var grid=sp.length; // 8 or 16
  var p=sz/grid;
  for(var row=0;row<grid;row++){
    for(var col=0;col<grid;col++){
      var v=sp[row][col];
      if(!v)continue;
      c2.fillStyle=v===1?ch.body:v===2?'#ffffff':v===3?ch.dark:(ch.acc||ch.body);
      var dc=col;
      if(row>=Math.floor(grid*0.7)&&flip)dc=grid-1-col;
      c2.fillRect(Math.floor(x+dc*p),Math.floor(y+row*p),Math.ceil(p),Math.ceil(p));
    }
  }
}

// ── GAME STATE ────────────────────────────────────────────────────────────────
var running=false,raf=null;
var pd=loadPD(),playerName='Spieler';
var player,plats,coins_a,parts_a,enemies,items;
var score,sesCo,camY,tick,diff,lives;
var multActive=false,multTimer=0,multDur=900; // 15s @ 60fps
var jetActive=false,jetTimer=0,jetDur=360;    // 6s
var jumpBoostActive=false,jumpBoostTimer=0;

// ── INIT ──────────────────────────────────────────────────────────────────────
function initGame(){
  pd=loadPD();
  var pSz=Math.round(28*SC);
  var startY=CH-Math.round(160*SC);
  player={
    x:CW/2-pSz/2, y:startY-pSz,
    w:pSz, h:pSz,
    vx:0, vy:0,
    onGround:false, dbl:false,
    ci:pd.sel||0, inv:0,
    animF:0, animT:0,
    facing:1,
    trail:[],
  };
  plats=[];coins_a=[];parts_a=[];enemies=[];items=[];
  score=0;sesCo=0;camY=0;tick=0;diff=0;lives=3;lastTS=0;
  multActive=false;multTimer=0;jetActive=false;jetTimer=0;
  jumpBoostActive=false;jumpBoostTimer=0;
  ['ibar-jet','ibar-jump','ibar-mult'].forEach(function(id){var el=document.getElementById(id);if(el)el.classList.remove('on');});
  document.getElementById('multbar').style.display='none';

  // start platform directly under player
  plats.push(mkPlat(CW/2-Math.round(60*SC), startY, Math.round(120*SC),'normal'));
  // fill screen with platforms - fixed gaps at start for comfort
  for(var i=0;i<18;i++) spawnPlat(startY - Math.round(55*getPSC()) - i*Math.round(50*getPSC()));
  updateHUD();
}

// ── PLATFORM FACTORY ─────────────────────────────────────────────────────────
function mkPlat(x,y,w,type,extra){
  return{x:x,y:y,w:w,h:Math.round(12*SC),type:type||'normal',
    broken:false,breakAnim:0,spring:extra==='spring',
    springC:false,vx:type==='move'?(Math.random()<0.5?1:-1)*SC*1.4:0,
    hit:false};
}
function spawnPlat(y){
  var r=Math.random();
  var type='normal';
  if(diff>=1){
    if(r<0.10) type='move';
    else if(r<0.18) type='fragile';
  }
  if(diff>=3){
    if(r<0.16) type='move';
    else if(r<0.28) type='fragile';
  }
  if(diff>=6){
    if(r<0.22) type='move';
    else if(r<0.38) type='fragile';
  }
  if(diff>=10){
    if(r<0.28) type='move';
    else if(r<0.46) type='fragile';
  }
  var minW=Math.round(Math.max(50,(88-diff*4))*SC);
  var w=minW+Math.round(Math.random()*22*SC);
  var x=Math.random()*(CW-w-Math.round(20*SC))+Math.round(10*SC);
  var hasSpring=(type==='normal'&&Math.random()<0.08);
  var p=mkPlat(x,y,w,type,hasSpring?'spring':null);
  plats.push(p);
  // maybe spawn coin above
  if(Math.random()<0.3) spawnCoin(x+w/2,y-Math.round(35*SC));
  // maybe spawn item
  if(Math.random()<0.07) spawnItem(x+w/2,y-Math.round(40*SC));
}

// ── SPIKES ────────────────────────────────────────────────────────────────────
function drawSpikes(x,y,w){
  var n=Math.max(3,Math.floor(w/Math.round(12*SC)));
  var sw=w/n;
  ctx.fillStyle='#888';
  for(var i=0;i<n;i++){
    ctx.beginPath();
    ctx.moveTo(x+i*sw,y);
    ctx.lineTo(x+i*sw+sw/2,y-Math.round(10*SC));
    ctx.lineTo(x+i*sw+sw,y);
    ctx.fill();
  }
}

// ── COINS ─────────────────────────────────────────────────────────────────────
function spawnCoin(x,y){
  coins_a.push({x:x-Math.round(9*SC),y:y,w:Math.round(18*SC),h:Math.round(18*SC),anim:Math.random()*Math.PI*2});
}

// ── ITEMS ─────────────────────────────────────────────────────────────────────
// types: 'jetpack','jumpboost','multiplier'
var ITEM_TYPES=['jetpack','jumpboost','multiplier','heart'];
function spawnItem(x,y){
  var rnd=Math.random();
  var t=rnd<0.28?'jetpack':rnd<0.54?'jumpboost':rnd<0.78?'multiplier':rnd<0.92?'heart':'heart';
  items.push({x:x-Math.round(14*SC),y:y,w:Math.round(28*SC),h:Math.round(28*SC),type:t,anim:0,collected:false});
}
function drawItem(it){
  var iy=it.y+camY;
  var cx=it.x+it.w/2, cy=iy+it.h/2;
  var bob=Math.sin(it.anim*0.05)*3*SC;
  cy+=bob;
  ctx.save();
  if(it.type==='jetpack'){
    // jetpack: orange box with flame
    ctx.fillStyle='#ff8800';
    ctx.fillRect(cx-it.w*0.3,cy-it.h*0.4,it.w*0.6,it.h*0.7);
    ctx.fillStyle='#ffcc00';
    ctx.fillRect(cx-it.w*0.2,cy-it.h*0.35,it.w*0.4,it.h*0.5);
    ctx.fillStyle='#ff4400';
    ctx.beginPath();ctx.arc(cx,cy+it.h*0.35,it.w*0.15,0,Math.PI*2);ctx.fill();
    // label
    ctx.fillStyle='#fff';ctx.font='bold '+Math.round(7*SC)+'px monospace';ctx.textAlign='center';
    ctx.fillText('JET',cx,cy+it.h*0.1);
  } else if(it.type==='jumpboost'){
    // spring shoe: green
    ctx.fillStyle='#3aef6a';
    ctx.beginPath();ctx.ellipse(cx,cy,it.w*0.4,it.h*0.35,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#1aaa3a';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='bold '+Math.round(7*SC)+'px monospace';ctx.textAlign='center';
    ctx.fillText('x2',cx,cy+Math.round(3*SC));
  } else if(it.type==='multiplier'){
    // multiplier: yellow star
    ctx.fillStyle='#ffd700';
    var r1=it.w*0.42,r2=it.w*0.2,pts=5;
    ctx.beginPath();
    for(var i=0;i<pts*2;i++){
      var angle=i*Math.PI/pts-Math.PI/2;
      var r=i%2===0?r1:r2;
      if(i===0) ctx.moveTo(cx+r*Math.cos(angle),cy+r*Math.sin(angle));
      else ctx.lineTo(cx+r*Math.cos(angle),cy+r*Math.sin(angle));
    }
    ctx.closePath();ctx.fill();
    ctx.strokeStyle='#c8900a';ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle='#7a4400';ctx.font='bold '+Math.round(6*SC)+'px monospace';ctx.textAlign='center';
    ctx.fillText('x2',cx,cy+Math.round(3*SC));
  } else if(it.type==='heart'){
    // Heart shape
    var hs=it.w*0.38;
    ctx.fillStyle='#ff3366';
    ctx.beginPath();
    ctx.moveTo(cx,cy+hs*0.9);
    ctx.bezierCurveTo(cx-hs*1.2,cy,cx-hs*1.2,cy-hs*0.8,cx,cy-hs*0.3);
    ctx.bezierCurveTo(cx+hs*1.2,cy-hs*0.8,cx+hs*1.2,cy,cx,cy+hs*0.9);
    ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.4)';
    ctx.beginPath();ctx.ellipse(cx-hs*0.3,cy-hs*0.1,hs*0.25,hs*0.18,Math.PI*-0.4,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

// ── ENEMIES ───────────────────────────────────────────────────────────────────
function spawnEnemy(){
  var fromLeft=Math.random()<0.5;
  var ew=Math.round(36*SC),eh=Math.round(30*SC);
  var spd=(1.5+diff*0.3)*SC;
  enemies.push({
    x:fromLeft?-ew:CW+ew,
    y:(-camY-Math.round(100*SC)+Math.random()*CH*0.6),
    w:ew,h:eh,
    vx:fromLeft?spd:-spd,
    anim:0,dead:false,deadAnim:0,
  });
}

function drawEnemy(e){
  if(e.dead){
    ctx.globalAlpha=Math.max(0,1-e.deadAnim/20);
    ctx.fillStyle='#ff4444';
    for(var i=0;i<6;i++){
      var angle=i/6*Math.PI*2+e.deadAnim*0.2;
      var dist=e.deadAnim*2*SC;
      ctx.fillRect(e.x+e.w/2+Math.cos(angle)*dist-2,e.y+camY+e.h/2+Math.sin(angle)*dist-2,4,4);
    }
    ctx.globalAlpha=1;
    return;
  }
  var ey=e.y+camY;
  var cx=e.x+e.w/2, cy=ey+e.h/2;
  var bob=Math.sin(e.anim*0.08)*3*SC;
  // body: red/purple blob
  ctx.fillStyle='#cc2244';
  ctx.beginPath();ctx.ellipse(cx,cy+bob,e.w*0.45,e.h*0.4,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#880022';ctx.lineWidth=2;ctx.stroke();
  // eyes
  var ex=e.vx>0?1:-1;
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.ellipse(cx+ex*e.w*0.15,cy-e.h*0.08+bob,e.w*0.12,e.h*0.15,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(cx-ex*e.w*0.05,cy-e.h*0.08+bob,e.w*0.12,e.h*0.15,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#111';
  ctx.beginPath();ctx.ellipse(cx+ex*e.w*0.17,cy-e.h*0.06+bob,e.w*0.06,e.h*0.08,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(cx-ex*e.w*0.03,cy-e.h*0.06+bob,e.w*0.06,e.h*0.08,0,0,Math.PI*2);ctx.fill();
  // antennae
  ctx.strokeStyle='#880022';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx-e.w*0.15,cy-e.h*0.38+bob);ctx.lineTo(cx-e.w*0.25,cy-e.h*0.6+bob);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+e.w*0.15,cy-e.h*0.38+bob);ctx.lineTo(cx+e.w*0.25,cy-e.h*0.6+bob);ctx.stroke();
  ctx.fillStyle='#ff4488';
  ctx.beginPath();ctx.arc(cx-e.w*0.25,cy-e.h*0.6+bob,3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(cx+e.w*0.25,cy-e.h*0.6+bob,3,0,Math.PI*2);ctx.fill();
}

// ── PARTICLES ─────────────────────────────────────────────────────────────────
function addParts(x,y,col,n,spd_m){
  var sm=spd_m||1;
  for(var i=0;i<n;i++){
    parts_a.push({x:x,y:y,vx:(Math.random()-.5)*5*SC*sm,vy:-(Math.random()*3+1)*SC*sm,
      life:25,max:25,col:col,sz:(Math.random()*4+2)*SC});
  }
}

// ── PHYSICS CONSTANTS ────────────────────────────────────────────────────────
// PSC = physics scale: always relative to screen height so jumps feel same on all devices
// max jump height = BASE_JUMP^2 / (2*GRAV) in PSC units
// We want max jump height ≈ 42% of screen height
// => GRAV*PSC * (BASE_JUMP*PSC)^2 / (2*GRAV*PSC) = 0.42*CH
// Simplified: PSC = CH / 700 (same feel on all screens)
function getPSC(){return Math.min(CH/700, 1.6);}
var GRAV=0.30;
var BASE_JUMP=-11.5;
var BOOST_JUMP=-13.5;
var SPRING_JUMP=-19;
var JET_VY=-4.2;

// ── ITEM BANNER ───────────────────────────────────────────────────────────────
var bannerTO=null;
function showBanner(txt){
  var el=document.getElementById('ibanner');
  el.textContent=txt;el.style.opacity='1';
  if(bannerTO)clearTimeout(bannerTO);
  bannerTO=setTimeout(function(){el.style.opacity='0';},1800);
}

// ── MAIN LOOP ─────────────────────────────────────────────────────────────────
var lastTS=0;
function loop(ts){
  if(!running)return;
  try{
  if(lastTS===0)lastTS=ts;
  var rawDt=(ts-lastTS)/16.67;
  if(rawDt>10){lastTS=ts;raf=requestAnimationFrame(loop);return;} // skip frame after long pause (tab switch)
  var dt=Math.min(rawDt,1.5);
  lastTS=ts;
  tick++;

  diff=Math.floor(score/200);

  // ── INPUT ──────────────────────────────────────────────────────────────────
  var hspd=(2.8+Math.min(diff,15)*0.5)*getPSC()*1.8;
  var inputLeft=keys['ArrowLeft']||keys['a']||keys['A']||touchDir===-1;
  var inputRight=keys['ArrowRight']||keys['d']||keys['D']||touchDir===1;
  // Tilt input (only if no touch button is pressed)
  if(!inputLeft&&!inputRight&&tiltEnabled&&Math.abs(tiltX)>0.08){
    if(tiltX<0){inputLeft=true;}else{inputRight=true;}
    // Scale speed by tilt amount for analog feel
    hspd*=Math.min(1,Math.abs(tiltX)*1.5);
  }
  if(inputLeft){
    player.vx=Math.max(player.vx-hspd*0.4,-hspd); player.facing=-1;
  } else if(inputRight){
    player.vx=Math.min(player.vx+hspd*0.4, hspd); player.facing=1;
  } else {
    player.vx*=0.65;
  }

  // ── PHYSICS + MOVE + CAMERA + COLLISION ───────────────────────────────────
  var psc=getPSC();

  // Gravity or jetpack
  if(jetActive){
    player.vy=JET_VY*psc;
    if(tick%3===0) addParts(player.x+player.w/2,player.y+player.h,'#ff8800',2,0.7);
  } else {
    player.vy+=GRAV*psc*dt;
    if(player.vy>psc*15) player.vy=psc*15;
  }

  // Move X
  player.x+=player.vx*dt;
  if(player.x+player.w<0) player.x=CW;
  if(player.x>CW) player.x=-player.w;

  // Move Y: simple single-step with swept collision
  // We move by vy*dt, then check if feet crossed any platform top
  var oldY=player.y;
  player.y+=player.vy*dt;

  // Platform collision — only when falling
  if(player.vy>0&&!jetActive){
    for(var pi=0;pi<plats.length;pi++){
      var p=plats[pi];
      if(p.broken) continue;
      var platY=p.y+camY;
      var oldBottom=oldY+player.h;
      var newBottom=player.y+player.h;
      // Did feet cross platform this frame? Check swept range
      if(oldBottom<=platY+p.h&&newBottom>=platY&&
         player.x+player.w*0.8>p.x+4&&
         player.x+player.w*0.2<p.x+p.w-4){
        player.y=platY-player.h;
        if(p.type==='fragile'){
          if(p.hit){p.broken=true;p.breakAnim=0;addParts(p.x+p.w/2,platY,'#c8883a',8);player.vy=(jumpBoostActive?BOOST_JUMP:BASE_JUMP)*psc;}
          else{p.hit=true;player.vy=(jumpBoostActive?BOOST_JUMP:BASE_JUMP)*psc;addParts(player.x+player.w/2,player.y+player.h,'#c8883a',4);}
        } else if(p.spring){
          player.vy=SPRING_JUMP*psc;
          p.springC=true;setTimeout(function(){p.springC=false;},220);
          addParts(player.x+player.w/2,player.y+player.h,'#ef4a4a',6);
        } else {
          player.vy=(jumpBoostActive?BOOST_JUMP:BASE_JUMP)*psc;
          addParts(player.x+player.w/2,player.y+player.h,'#7ecf4a',4);
        }
        break;
      }
    }
  }

  // Camera: keep player in upper 38% of screen
  var threshold=CH*0.38;
  if(player.y<threshold){
    var camShift=threshold-player.y;
    camY+=camShift;
    player.y=threshold;
    var pts=Math.ceil(camShift/SC*0.12);
    score+=multActive?pts*2:pts;
  }

  // ── ITEM TIMERS ────────────────────────────────────────────────────────────
  if(jetActive){
    jetTimer-=dt;
    var jfEl=document.getElementById('ifill-jet');
    if(jfEl)jfEl.style.width=Math.max(0,jetTimer/getID('jetpack')*100)+'%';
    if(jetTimer<=0){
      jetActive=false;
      var jbEl=document.getElementById('ibar-jet');
      if(jbEl)jbEl.classList.remove('on');
      showBanner('Jetpack vorbei!');
    }
  }
  if(jumpBoostActive){
    jumpBoostTimer-=dt;
    var jEl=document.getElementById('ifill-jump');
    if(jEl)jEl.style.width=Math.max(0,jumpBoostTimer/getID('jumpboost')*100)+'%';
    if(jumpBoostTimer<=0){
      jumpBoostActive=false;
      var jbEl2=document.getElementById('ibar-jump');
      if(jbEl2)jbEl2.classList.remove('on');
      showBanner('Jump Boost vorbei!');
    }
  }
  if(multActive){
    multTimer-=dt;
    var mfEl=document.getElementById('ifill-mult');
    if(mfEl)mfEl.style.width=Math.max(0,multTimer/getID('multiplier')*100)+'%';
    if(multTimer<=0){
      multActive=false;
      var mbEl=document.getElementById('ibar-mult');
      if(mbEl)mbEl.classList.remove('on');
      showBanner('Multiplikator vorbei!');
    }
  }

  // ── MOVING PLATFORMS + BREAK ANIM ──────────────────────────────────────────
  for(var mi=0;mi<plats.length;mi++){
    if(plats[mi].broken){plats[mi].breakAnim+=0.5*dt;continue;}
    if(plats[mi].type!=='move')continue;
    plats[mi].x+=plats[mi].vx*dt;
    if(plats[mi].x<=0||plats[mi].x+plats[mi].w>=CW)plats[mi].vx*=-1;
  }

  // ── ANIM ───────────────────────────────────────────────────────────────────
  player.animT+=dt;if(player.animT>6){player.animF++;player.animT=0;}
  if(player.inv>0)player.inv-=dt;

  // ── COINS ──────────────────────────────────────────────────────────────────
  for(var ci=coins_a.length-1;ci>=0;ci--){
    var co=coins_a[ci];co.anim+=dt*0.1;
    var coY=co.y+camY;
    if(player.x+player.w*0.8>co.x&&player.x+player.w*0.2<co.x+co.w&&
       player.y+player.h*0.8>coY&&player.y<coY+co.h){
      sesCo++;addParts(co.x+co.w/2,coY,'#ffd700',5);coins_a.splice(ci,1);
    } else if(coY>CH+40)coins_a.splice(ci,1);
  }

  // ── ITEMS ──────────────────────────────────────────────────────────────────
  for(var ii=items.length-1;ii>=0;ii--){
    var it=items[ii];it.anim+=dt;
    var itY=it.y+camY;
    if(!it.collected&&
       player.x+player.w*0.8>it.x&&player.x+player.w*0.2<it.x+it.w&&
       player.y+player.h*0.8>itY&&player.y<itY+it.h){
      it.collected=true;
      addParts(it.x+it.w/2,itY,'#ffd700',10,1.5);
      if(it.type==='jetpack'){
        jetActive=true;jetTimer=getID('jetpack');
        var b1=document.getElementById('ibar-jet');if(b1){b1.classList.add('on');document.getElementById('ifill-jet').style.width='100%';}
        showBanner('Jetpack aktiv!');
      } else if(it.type==='jumpboost'){
        jumpBoostActive=true;jumpBoostTimer=getID('jumpboost');
        var b2=document.getElementById('ibar-jump');if(b2){b2.classList.add('on');document.getElementById('ifill-jump').style.width='100%';}
        showBanner('Jump Boost aktiv!');
      } else if(it.type==='heart'){
        if(lives<3){lives++;updateHUD();addParts(it.x+it.w/2,itY,'#ff3366',8);showBanner('+1 Leben!');}
        else{showBanner('Bereits voll!');}
      } else if(it.type==='multiplier'){
        multActive=true;multTimer=getID('multiplier');
        var b3=document.getElementById('ibar-mult');if(b3){b3.classList.add('on');document.getElementById('ifill-mult').style.width='100%';}
        showBanner('x2 Punkte!');
      }
      items.splice(ii,1);
    } else if(itY>CH+40)items.splice(ii,1);
  }

  // ── SPIKE COLLISION ────────────────────────────────────────────────────────
  if(player.inv<=0){
    for(var si=0;si<plats.length;si++){
      var sp=plats[si];
      if(!sp.spikes)continue;
      var spy=sp.y+camY;
      var spikeTop=spy-Math.round(10*SC);
      if(player.y+player.h>spikeTop&&player.y<spy&&
         player.x+player.w*0.7>sp.x&&player.x+player.w*0.3<sp.x+sp.w){
        lives--;player.inv=120;
        addParts(player.x+player.w/2,player.y+player.h/2,'#ff4444',10);
        updateHUD();
        if(lives<=0){endGame();return;}
      }
    }
  }

  // ── ENEMIES ────────────────────────────────────────────────────────────────
  if(diff>=1&&tick%Math.max(120,300-diff*25)===0) spawnEnemy();
  for(var ei=enemies.length-1;ei>=0;ei--){
    var en=enemies[ei];
    en.anim+=dt;
    if(en.dead){en.deadAnim+=dt;if(en.deadAnim>20)enemies.splice(ei,1);continue;}
    en.x+=en.vx*dt;
    if(en.x>CW+60||(en.x+en.w<-60)){enemies.splice(ei,1);continue;}
    var enY=en.y+camY;
    if(player.inv<=0&&
       player.x+player.w*0.7>en.x+en.w*0.2&&player.x+player.w*0.3<en.x+en.w*0.8&&
       player.y+player.h*0.7>enY+en.h*0.2&&player.y+player.h*0.3<enY+en.h*0.8){
      lives--;player.inv=120;
      addParts(player.x+player.w/2,player.y+player.h/2,'#ff4444',12);
      updateHUD();
      if(lives<=0){endGame();return;}
    }
  }

  // ── PARTICLES ──────────────────────────────────────────────────────────────
  for(var pi=parts_a.length-1;pi>=0;pi--){
    var pt=parts_a[pi];
    pt.x+=pt.vx*dt;pt.y+=pt.vy*dt;pt.vy+=0.18*SC*dt;pt.life-=dt;
    if(pt.life<=0)parts_a.splice(pi,1);
  }

  // ── SPAWN PLATFORMS ────────────────────────────────────────────────────────
  var topP=plats.length>0?plats.reduce(function(m,p){return p.y<m?p.y:m;},9999):player.y-100;
  var thresh=-camY-Math.round(80*SC);
  var spawnSafety=0;
  while(topP>thresh&&spawnSafety<30){
    spawnSafety++;
    var spsc=getPSC();
    var baseGap=Math.round((58+Math.min(diff,8)*6)*spsc);
    var gap=Math.min(baseGap+Math.round(Math.random()*18*spsc),Math.round(150*spsc));
    gap=Math.max(gap,Math.round(40*spsc));
    spawnPlat(topP-gap);
    if(diff>=4&&Math.random()<0.08){
      var lastP=plats[plats.length-1];
      if(lastP.w>Math.round(65*SC))lastP.spikes=true;
    }
    topP-=gap;
  }

  // ── REMOVE OFF-SCREEN ──────────────────────────────────────────────────────
  for(var ri=plats.length-1;ri>=0;ri--)if(plats[ri].y+camY>CH+60)plats.splice(ri,1);

  // ── CLOUDS ─────────────────────────────────────────────────────────────────
  for(var cli=0;cli<clouds.length;cli++){
    clouds[cli].x-=clouds[cli].spd*dt;
    if(clouds[cli].x+clouds[cli].w<0)clouds[cli].x=CW+20;
  }

  // ── DEATH ──────────────────────────────────────────────────────────────────
  if(player.y>CH+80){endGame();return;}

  // ── RENDER + SCHEDULE ──────────────────────────────────────────────────────
  render();
  updateHUD();
  }catch(e){console.error('Loop error:',e);}
  raf=requestAnimationFrame(loop);
}

// ── RENDER ────────────────────────────────────────────────────────────────────
var clouds=[];
(function(){for(var i=0;i<7;i++)clouds.push({x:Math.random()*1200,y:Math.random()*600,w:80+Math.random()*80,spd:0.2+Math.random()*0.3});}());
function render(){
  // Sky
  var t=Math.min(1,score/2000);
  var r1=Math.round(200-t*170),g1=Math.round(230-t*180),b1=Math.round(255-t*150);
  var r2=Math.round(240-t*230),g2=Math.round(248-t*220),b2=Math.round(255-t*200);
  var grad=ctx.createLinearGradient(0,0,0,CH);
  grad.addColorStop(0,'rgb('+r1+','+g1+','+b1+')');
  grad.addColorStop(1,'rgb('+r2+','+g2+','+b2+')');
  ctx.fillStyle=grad;ctx.fillRect(0,0,CW,CH);

  // Stars
  if(score>800){
    var sa=Math.min(0.9,(score-800)/1500);
    ctx.fillStyle='rgba(255,255,255,'+sa+')';
    var seed=777;
    for(var si=0;si<40;si++){
      seed=(seed*1664525+1013904223)&0xffffffff;var sx=(seed>>>0)%CW;
      seed=(seed*1664525+1013904223)&0xffffffff;var sy=(seed>>>0)%CH;
      ctx.fillRect(sx,sy,Math.ceil(2*SC),Math.ceil(2*SC));
    }
  }

  // Clouds
  if(score<3000){
    ctx.fillStyle='rgba(255,255,255,0.6)';
    for(var ci2=0;ci2<clouds.length;ci2++){
      var cl=clouds[ci2];
      ctx.beginPath();ctx.ellipse(cl.x,cl.y,cl.w*0.5,cl.w*0.22,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(cl.x+cl.w*0.2,cl.y-cl.w*0.12,cl.w*0.3,cl.w*0.18,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(cl.x-cl.w*0.2,cl.y-cl.w*0.1,cl.w*0.28,cl.w*0.15,0,0,Math.PI*2);ctx.fill();
    }
  }

  // Platforms
  for(var pi=0;pi<plats.length;pi++){
    var p=plats[pi];
    var py=p.y+camY;
    if(py<-20||py>CH+20)continue;
    if(p.broken){
      ctx.globalAlpha=Math.max(0,1-p.breakAnim/14);
      ctx.fillStyle='#c8883a';
      ctx.fillRect(p.x-p.breakAnim*3,py+p.breakAnim*2,p.w/2-2,p.h);
      ctx.fillRect(p.x+p.w/2+2+p.breakAnim*3,py+p.breakAnim*2,p.w/2-2,p.h);
      ctx.globalAlpha=1;continue;
    }
    var col=p.type==='move'?'#4ab4ef':p.type==='fragile'?(p.hit?'#e05500':'#c8883a'):'#7ecf4a';
    var stroke=p.type==='move'?'#1a7abf':p.type==='fragile'?(p.hit?'#aa2200':'#8a5a1a'):'#4a9a1a';
    ctx.fillStyle=col;
    ctx.beginPath();ctx.roundRect(p.x,py,p.w,p.h,6);ctx.fill();
    ctx.strokeStyle=stroke;ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(p.x,py,p.w,p.h,6);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.3)';
    ctx.beginPath();ctx.roundRect(p.x+3,py+2,p.w-6,4,2);ctx.fill();
    // spring
    if(p.spring){
      var sh=p.springC?3:Math.round(8*SC);
      ctx.fillStyle='#ef4a4a';ctx.fillRect(p.x+p.w/2-Math.round(4*SC),py-sh,Math.round(8*SC),sh);
      ctx.fillStyle='#ff8888';ctx.fillRect(p.x+p.w/2-Math.round(6*SC),py-sh-Math.round(4*SC),Math.round(12*SC),Math.round(5*SC));
    }
    // spikes
    if(p.spikes) drawSpikes(p.x,py,p.w);
  }

  // Coins
  for(var ci3=0;ci3<coins_a.length;ci3++){
    var co=coins_a[ci3];
    var coY=co.y+camY;
    if(coY<-20||coY>CH+20)continue;
    var bob=Math.sin(co.anim)*3*SC;
    var cx2=co.x+co.w/2,cy2=coY+co.h/2+bob;
    ctx.fillStyle='#ffd700';ctx.strokeStyle='#c8900a';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.ellipse(cx2,cy2,co.w/2,co.h/2,0,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.beginPath();ctx.ellipse(cx2-co.w*0.15,cy2-co.h*0.15,co.w*0.18,co.h*0.18,0,0,Math.PI*2);ctx.fill();
  }

  // Items
  for(var iti=0;iti<items.length;iti++) drawItem(items[iti]);

  // Particles
  for(var pi2=0;pi2<parts_a.length;pi2++){
    var pt=parts_a[pi2];
    ctx.globalAlpha=Math.max(0,pt.life/pt.max);
    ctx.fillStyle=pt.col;
    ctx.fillRect(Math.floor(pt.x-pt.sz/2),Math.floor(pt.y-pt.sz/2),Math.ceil(pt.sz),Math.ceil(pt.sz));
  }
  ctx.globalAlpha=1;

  // Enemies
  for(var ei2=0;ei2<enemies.length;ei2++) drawEnemy(enemies[ei2]);

  // Player trail
  for(var ti2=0;ti2<player.trail.length;ti2++){
    var tr=player.trail[ti2];
    ctx.globalAlpha=(ti2/player.trail.length)*0.2;
    ctx.fillStyle=CHARS[player.ci].body;
    ctx.beginPath();ctx.arc(tr.x,tr.y,player.w*0.3,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;

  // Player
  if(!(player.inv>0&&Math.floor(player.inv/6)%2===0)){
    // jetpack visual on back
    if(jetActive){
      ctx.fillStyle='#ff8800';
      ctx.fillRect(player.x+player.w*0.7,player.y+player.h*0.1,player.w*0.25,player.h*0.6);
      if(tick%4<2){
        ctx.fillStyle='#ff4400';
        ctx.beginPath();ctx.arc(player.x+player.w*0.82,player.y+player.h*0.75,player.w*0.12,0,Math.PI*2);ctx.fill();
      }
    }
    drawChar(ctx,player.ci,player.x,player.y,player.w,player.animF%2===1&&player.vy!==0);
  }

  // Trail update
  player.trail.push({x:player.x+player.w/2,y:player.y+player.h/2});
  if(player.trail.length>8)player.trail.shift();
}

// ── HUD ───────────────────────────────────────────────────────────────────────
function updateHUD(){
  document.getElementById('hsc').textContent=score;
  var hcoVal=document.getElementById('hcoVal');if(hcoVal)hcoVal.textContent=sesCo;
  var h='';
  for(var i=0;i<3;i++) h+='<span style="font-size:clamp(16px,3.5vw,26px);color:'+(i<lives?'#ff4444':'#ccc')+'">&#9829;</span>';
  document.getElementById('hlives').innerHTML=h;
}

// ── GAME FLOW ─────────────────────────────────────────────────────────────────
function startGame(){
  var n=pd.name||playerName||'Spieler';
  playerName=n;pd=loadPD();pd.name=n;savePD(pd);
  document.querySelectorAll('.scr').forEach(function(s){s.classList.add('h');});
  document.getElementById('hud').classList.remove('h');
  if(isTouchDevice) document.getElementById('tctrls').classList.add('on');
  running=true;initGame();
  if(raf)cancelAnimationFrame(raf);
  lastTS=0; // reset so first frame dt is 0
  raf=requestAnimationFrame(loop);
}

function endGame(){
  running=false;if(raf){cancelAnimationFrame(raf);raf=null;}
  pd=loadPD();pd.coins=(pd.coins||0)+sesCo;savePD(pd);
  document.getElementById('hud').classList.add('h');
  document.getElementById('tctrls').classList.remove('on');
  touchDir=0;
  document.getElementById('nbst').classList.add('h');
  document.getElementById('ovi').innerHTML='Score: <b>'+score+'</b><br>Münzen: <b>+'+sesCo+'</b><br>Gesamt: <b>'+pd.coins+'</b><br>Rang: <b>...</b>';
  goTo('sOver');
  // Supabase speichern + Rang ermitteln
  if(typeof PZ!=='undefined'){
    PZ.saveGameData('pixel-jump',score,1,{coins:pd.coins,owned:pd.owned||[0],sel:pd.sel||0,upgrades:pd.upgrades||{}})
      .then(function(res){if(res&&res.isNewRecord)document.getElementById('nbst').classList.remove('h');})
      .catch(function(){});
    PZ.getLeaderboard('pixel-jump').then(function(lb){
      var rank=0;
      for(var ri=0;ri<lb.length;ri++){if(lb[ri].benutzername===playerName){rank=ri+1;break;}}
      document.getElementById('ovi').innerHTML='Score: <b>'+score+'</b><br>Münzen: <b>+'+sesCo+'</b><br>Gesamt: <b>'+pd.coins+'</b><br>Rang: <b>'+(rank?'#'+rank:'–')+'</b>';
    }).catch(function(){});
    PZ.getUser().then(function(u){
      var hint=document.getElementById('login-hint');
      if(hint)hint.style.display=u?'none':'flex';
    }).catch(function(){});
  }
}

// ── SCREENS ───────────────────────────────────────────────────────────────────
function goTo(id){
  document.querySelectorAll('.scr').forEach(function(s){s.classList.add('h');});
  document.getElementById('hud').classList.add('h');
  document.getElementById('tctrls').classList.remove('on');
  touchDir=0;
  var el=document.getElementById(id);if(el)el.classList.remove('h');
  if(id==='sShop')renderShop();
  if(id==='sLB')renderLB();
  if(id==='sName'){pd=loadPD();document.getElementById('ni').value=pd.name||'';}
}

// ── SHOP ──────────────────────────────────────────────────────────────────────
var UPGRADES=[
  {id:'jetpack',   name:'Jetpack',      icon:'🚀', desc:'Dauer', base:360, perLvl:120, costs:[60,120,200,300], max:4},
  {id:'jumpboost', name:'Jump Boost',   icon:'⬆️', desc:'Dauer', base:300, perLvl:100, costs:[50,100,160,250], max:4},
  {id:'multiplier',name:'x2 Punkte',    icon:'⭐', desc:'Dauer', base:900, perLvl:300, costs:[80,150,250,400], max:4},
];
function getUL(id){pd=loadPD();if(!pd.upgrades)pd.upgrades={};return pd.upgrades[id]||0;}
function getID(id){var u=UPGRADES.find(function(u){return u.id===id;});if(!u)return 300;return u.base+getUL(id)*u.perLvl;}

var CODES={
  'timgioh':{type:'skin',idx:8},
  '67':{type:'coins',amount:67},
};

var curTab='sk';
function shopTab(t){
  curTab=t;
  ['sk','up','cd'].forEach(function(id){
    document.getElementById('tc-'+id).style.display=id===t?'':'none';
    document.getElementById('tab-'+id).classList.toggle('active',id===t);
  });
  if(t==='sk')renderSkins();
  if(t==='up')renderUpgrades();
}
function renderShop(){pd=loadPD();var s=document.getElementById('shopcoVal');if(s)s.textContent=pd.coins;curTab='sk';shopTab('sk');}

function renderSkins(){
  pd=loadPD();var s=document.getElementById('shopcoVal');if(s)s.textContent=pd.coins;
  var grid=document.getElementById('sgrid');grid.innerHTML='';
  CHARS.forEach(function(ch,i){
    var owned=(pd.owned||[0]).indexOf(i)>=0;
    var active=(pd.sel||0)===i;
    var codeLocked=ch.code&&!owned;
    var div=document.createElement('div');
    div.className='sc'+(owned?' own':'')+(active?' act':'');
    if(codeLocked){div.style.opacity='0.55';div.style.background='#f8f8f8';}
    var sz=Math.round(Math.min(CW*0.09,46));
    var mc=document.createElement('canvas');mc.width=sz;mc.height=sz;
    mc.style.width=sz+'px';mc.style.height=sz+'px';mc.style.imageRendering='pixelated';
    drawChar(mc.getContext('2d'),i,0,0,sz,false);
    div.appendChild(mc);
    var nm=document.createElement('div');nm.className='snm';nm.textContent=ch.name;div.appendChild(nm);
    var pr=document.createElement('div');pr.className='spr'+(owned?' own':'');
    if(codeLocked)pr.innerHTML='<span class="lockbg">Code</span>';
    else pr.textContent=owned?(active?'✓ Aktiv':'Besitz'):(ch.price===0?'Gratis':ch.price+' C');
    div.appendChild(pr);
    div.onclick=function(){
      if(codeLocked){document.getElementById('codeMsg').textContent='';shopTab('cd');return;}
      pd=loadPD();
      if((pd.owned||[0]).indexOf(i)>=0){pd.sel=i;savePD(pd);renderSkins();return;}
      if(ch.price===0){if(!pd.owned)pd.owned=[0];pd.owned.push(i);pd.sel=i;savePD(pd);renderSkins();return;}
      if(pd.coins>=ch.price){pd.coins-=ch.price;if(!pd.owned)pd.owned=[0];pd.owned.push(i);pd.sel=i;savePD(pd);renderSkins();}
      else{div.style.borderColor='#bf3a3a';setTimeout(function(){div.style.borderColor='';},500);}
    };
    grid.appendChild(div);
  });
}

function renderUpgrades(){
  pd=loadPD();var s=document.getElementById('shopcoVal');if(s)s.textContent=pd.coins;
  var el=document.getElementById('tc-up');el.innerHTML='';
  var cols={jetpack:'#ff7700',jumpboost:'#22bb55',multiplier:'#ffd700'};
  UPGRADES.forEach(function(u){
    var lvl=getUL(u.id);var isMax=lvl>=u.max;var cost=isMax?0:u.costs[lvl];
    var dur=Math.round((u.base+lvl*u.perLvl)/60);
    var ndur=isMax?null:Math.round((u.base+(lvl+1)*u.perLvl)/60);
    var card=document.createElement('div');card.className='ugcard';
    var ic=document.createElement('div');ic.className='ugicon';
    ic.style.background=(cols[u.id]||'#aaa')+'22';ic.style.border='2px solid '+(cols[u.id]||'#aaa')+'55';
    ic.textContent=u.icon;card.appendChild(ic);
    var info=document.createElement('div');info.className='uginfo';
    info.innerHTML='<div class="ugnm">'+u.name+'</div><div class="ugdesc">'+u.desc+': '+dur+'s'+(ndur?' → '+ndur+'s':'')+'</div>';
    var stars=document.createElement('div');stars.className='ugstars';
    for(var s2=0;s2<u.max;s2++){var st=document.createElement('div');st.className='ugstar'+(s2<lvl?' on':'');stars.appendChild(st);}
    info.appendChild(stars);card.appendChild(info);
    var btn=document.createElement('button');btn.className='ugbtn'+(isMax?' mx':'');
    btn.textContent=isMax?'MAX':'⬆ '+cost+' C';
    (function(uid,c2,mx){btn.onclick=function(){
      if(mx)return;pd=loadPD();
      if(pd.coins>=c2){pd.coins-=c2;if(!pd.upgrades)pd.upgrades={};pd.upgrades[uid]=(pd.upgrades[uid]||0)+1;savePD(pd);renderUpgrades();var sv=document.getElementById('shopcoVal');if(sv)sv.textContent=pd.coins;}
      else{card.style.borderColor='#bf3a3a';setTimeout(function(){card.style.borderColor='';},500);}
    };})(u.id,cost,isMax);
    card.appendChild(btn);el.appendChild(card);
  });
}

function redeemCode(){
  var inp=document.getElementById('codeInp');
  var msg=document.getElementById('codeMsg');
  var code=(inp.value||'').trim().toLowerCase();
  inp.value='';
  if(!code){msg.style.color='#bf3a3a';msg.textContent='Bitte einen Code eingeben.';return;}
  pd=loadPD();
  if(!pd.usedCodes)pd.usedCodes=[];
  if(pd.usedCodes.indexOf(code)>=0){msg.style.color='#bf3a3a';msg.textContent='Dieser Code wurde bereits eingelöst!';return;}
  var c=CODES[code];
  if(!c){msg.style.color='#bf3a3a';msg.textContent='Ungültiger Code.';return;}
  pd.usedCodes.push(code);
  if(c.type==='skin'){
    var idx=c.idx;if(!pd.owned)pd.owned=[0];
    if(pd.owned.indexOf(idx)<0)pd.owned.push(idx);
    pd.sel=idx;savePD(pd);
    msg.style.color='#5a9a3a';msg.textContent='🎉 Skin "'+CHARS[idx].name+'" freigeschaltet!';
    renderSkins();
  } else if(c.type==='coins'){
    pd.coins=(pd.coins||0)+c.amount;savePD(pd);
    msg.style.color='#5a9a3a';msg.textContent='🪙 +'+c.amount+' Münzen!';
    var sv=document.getElementById('shopcoVal');if(sv)sv.textContent=pd.coins;
  }
}

// ── LEADERBOARD ───────────────────────────────────────────────────────────────
function renderLB(){
  var el=document.getElementById('lbl');
  el.innerHTML='<div style="font-family:\'Comic Sans MS\',cursive;color:#aaa;font-size:clamp(11px,2vw,14px);text-align:center;padding:20px;">Wird geladen...</div>';
  PZ.getLeaderboard('pixel-jump').then(function(lb){
    if(!lb||!lb.length){el.innerHTML='<div style="font-family:\'Comic Sans MS\',cursive;color:#aaa;font-size:12px;text-align:center;padding:20px;">Noch keine Einträge</div>';return;}
    var medals=['🥇','🥈','🥉'];
    el.innerHTML=lb.slice(0,15).map(function(e,i){
      var charIdx=0;
      var r=medals[i]||('#'+(i+1));
      var bg=CHARS[charIdx].body;
      return '<div class="lbr"><span class="lbrk">'+r+'</span>'+
        '<span style="display:inline-block;width:clamp(18px,3.5vw,24px);height:clamp(18px,3.5vw,24px);border-radius:50%;background:'+bg+';flex-shrink:0;border:1px solid rgba(0,0,0,0.15)"></span>'+
        '<span class="lbnm">'+(e.benutzername||'???').slice(0,12)+'</span>'+
        '<span class="lbsc">'+(e.punkte||0)+'</span></div>';
    }).join('');
  }).catch(function(){el.innerHTML='<div style="color:#bf3a3a;font-size:12px;text-align:center;padding:20px;">Fehler beim Laden</div>';});
}
function resetLB(){} // Nicht mehr verfügbar mit Supabase

// ── INPUT ─────────────────────────────────────────────────────────────────────
var keys={};
var touchDir=0;
if(isTouchDevice) document.getElementById('tctrls').classList.add('on');

document.addEventListener('keydown',function(e){keys[e.key]=true;if(e.key===' ')e.preventDefault();});
document.addEventListener('keyup',function(e){keys[e.key]=false;});

var tl=document.getElementById('tl');
var tr=document.getElementById('tr');
tl.addEventListener('touchstart',function(e){e.preventDefault();touchDir=-1;tl.classList.add('pr');},{passive:false});
tl.addEventListener('touchend',function(e){e.preventDefault();touchDir=0;tl.classList.remove('pr');},{passive:false});
tl.addEventListener('touchcancel',function(e){e.preventDefault();touchDir=0;tl.classList.remove('pr');},{passive:false});
tr.addEventListener('touchstart',function(e){e.preventDefault();touchDir=1;tr.classList.add('pr');},{passive:false});
tr.addEventListener('touchend',function(e){e.preventDefault();touchDir=0;tr.classList.remove('pr');},{passive:false});
tr.addEventListener('touchcancel',function(e){e.preventDefault();touchDir=0;tr.classList.remove('pr');},{passive:false});

document.getElementById('ni').addEventListener('keydown',function(e){if(e.key==='Enter')startGame();});

// ── TILT / GYROSCOPE (iPad) ──────────────────────────────────────────────
var tiltX=0;
var tiltEnabled=false;
function enableTilt(){
  if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){
    DeviceOrientationEvent.requestPermission().then(function(state){
      if(state==='granted'){tiltEnabled=true;window.addEventListener('deviceorientation',onTilt);}
    }).catch(function(){});
  } else if('DeviceOrientationEvent' in window){
    tiltEnabled=true;window.addEventListener('deviceorientation',onTilt);
  }
}
function onTilt(e){
  if(!running)return;
  var gamma=e.gamma||0; // -90 to 90, left/right tilt
  tiltX=Math.max(-1,Math.min(1,gamma/25)); // normalize to -1..1
}
// Auto-request on first touch (iOS requires user gesture)
if(isTouchDevice){
  document.addEventListener('touchstart',function reqTilt(){
    enableTilt();
    document.removeEventListener('touchstart',reqTilt);
  },{once:true});
}

// ── BOOT ──────────────────────────────────────────────────────────────────────
ctx.fillStyle='#c8e8ff';ctx.fillRect(0,0,CW,CH);
drawChar(ctx,0,CW/2-20,CH/2-60,40,false);
goTo('sMenu');
if(typeof PZ!=='undefined')initPlayer();
