<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
<title>Shithead 💩</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.6.1/socket.io.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet"/>
<style>
:root{--bg:#0a0a0f;--sur:#13131a;--cbg:#f5f0e8;--red:#c0392b;--blk:#1a1a2e;--acc:#f0a500;--txt:#f0ebe0;--mut:#7a7590;--grn:#27ae60;--bdr:#2a2a3a;--pile:#16213e}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{background:var(--bg);color:var(--txt);font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden}
.screen{display:none;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.screen.active{display:flex}
#homeScreen{background:radial-gradient(ellipse at 30% 20%,#1a1230,#0a0a0f 70%)}
.btn{display:block;width:100%;max-width:320px;padding:16px 24px;border-radius:14px;border:none;font-family:'DM Sans',sans-serif;font-size:16px;font-weight:600;cursor:pointer;transition:all .12s;margin-bottom:12px}
.btn-pri{background:var(--acc);color:#0a0a0f}.btn-pri:active{transform:scale(.97)}
.btn-sec{background:var(--sur);color:var(--txt);border:1.5px solid var(--bdr)}
.btn-grn{background:var(--grn);color:#fff}
.btn:disabled{opacity:.4}
input,select{width:100%;max-width:320px;padding:14px 16px;background:var(--sur);border:1.5px solid var(--bdr);border-radius:12px;color:var(--txt);font-size:16px;font-family:'DM Sans',sans-serif;margin-bottom:12px;outline:none}
input:focus,select:focus{border-color:var(--acc)}
select option{background:var(--sur)}
label{font-size:12px;color:var(--mut);margin-bottom:5px;display:block;text-transform:uppercase;letter-spacing:1px}
.field{width:100%;max-width:320px;margin-bottom:4px}
.back{position:absolute;top:18px;left:14px;background:none;border:none;color:var(--mut);font-size:22px;cursor:pointer}
.codebox{background:var(--sur);border:1.5px solid var(--bdr);border-radius:16px;padding:18px 28px;text-align:center;margin-bottom:20px;width:100%;max-width:320px}
.bigcode{font-family:'Abril Fatface',serif;font-size:52px;color:var(--acc);letter-spacing:8px}
.ppill{background:var(--sur);border:1.5px solid var(--bdr);border-radius:10px;padding:11px 14px;margin-bottom:7px;display:flex;align-items:center;gap:10px;font-size:14px;width:100%;max-width:320px}
.dot{width:9px;height:9px;border-radius:50%;background:var(--bdr);flex-shrink:0}
.dot.on{background:var(--grn)}.dot.rdy{background:var(--acc)}
#gameScreen{justify-content:flex-start;padding:0;background:#0d1117}
.gwrap{width:100%;max-width:480px;margin:0 auto;padding:10px 10px 130px}
.card{width:54px;height:78px;background:var(--cbg);border-radius:7px;display:inline-flex;flex-direction:column;justify-content:space-between;padding:4px 5px;font-weight:700;cursor:pointer;border:2.5px solid transparent;transition:transform .1s,border-color .1s,box-shadow .1s;position:relative;user-select:none;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.5)}
.card.r{color:var(--red)}.card.b{color:var(--blk)}
.corner{position:absolute;top:3px;left:4px;font-size:14px;font-weight:800;line-height:1}
.card.sel{border-color:var(--acc);transform:translateY(-10px);box-shadow:0 10px 24px rgba(240,165,0,.45)}
.card.fd{background:linear-gradient(135deg,#1e2a4a,#0f3460);border-color:#2a4a8a;cursor:default}
.card.fd>*{display:none}
.card.fd::after{content:"🂠";font-size:32px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:block}
.card.blind-tap{cursor:pointer!important}
.card.blind-tap:active{transform:scale(.95)}
.card.dim{opacity:.4;cursor:default}
.cs{font-size:20px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
.sp{position:absolute;top:-7px;right:-7px;background:var(--acc);border-radius:50%;width:16px;height:16px;font-size:9px;display:flex;align-items:center;justify-content:center;color:#000;font-weight:700;z-index:2}
.flip-stage{perspective:600px;width:54px;height:78px;display:inline-block}
.flip-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;animation:doFlip 1.8s ease-in-out forwards}
@keyframes doFlip{0%{transform:rotateY(0)}50%{transform:rotateY(90deg)}100%{transform:rotateY(0)}}
.flip-front,.flip-back{position:absolute;inset:0;backface-visibility:hidden;border-radius:7px}
.flip-front{background:linear-gradient(135deg,#1e2a4a,#0f3460);display:flex;align-items:center;justify-content:center;font-size:32px}
.flip-back{background:var(--cbg)}
#blindReveal{display:none;text-align:center;padding:10px 0;background:rgba(22,33,62,.7);border-radius:12px;margin-bottom:8px}
#blindLabel{font-size:13px;color:var(--mut);margin-bottom:8px}
.pile-area{background:var(--pile);border:1.5px solid var(--bdr);border-radius:14px;padding:12px;margin-bottom:8px;text-align:center;min-height:110px;display:flex;flex-direction:column;align-items:center;justify-content:center}
.pile-fan-wrap{position:relative;width:116px;height:88px;margin:0 auto}
.pile-fan-wrap .pfc{position:absolute;bottom:0}
.pile-fan-wrap .pfc:nth-child(1){left:0;transform:rotate(-8deg);z-index:1;filter:brightness(.85)}
.pile-fan-wrap .pfc:nth-child(2){left:31px;transform:rotate(-3deg);z-index:2;filter:brightness(.93)}
.pile-fan-wrap .pfc:nth-child(3){left:62px;transform:rotate(0deg);z-index:3}
.pile-fan-wrap.fan2 .pfc:nth-child(1){left:8px;transform:rotate(-6deg);z-index:1;filter:brightness(.88)}
.pile-fan-wrap.fan2 .pfc:nth-child(2){left:46px;transform:rotate(0deg);z-index:2}
.pile-lbl{font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:1.5px;margin-top:6px}
.opp-area{background:var(--sur);border:1.5px solid var(--bdr);border-radius:14px;padding:10px 12px;margin-bottom:8px}
.oppname{font-size:13px;font-weight:600;margin-bottom:6px;display:flex;align-items:center;gap:6px}
.slbl{font-size:10px;color:var(--mut);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;margin-top:8px}
.slbl:first-child{margin-top:0}
.cards-row{display:flex;gap:5px;flex-wrap:wrap;min-height:20px}
.myarea{background:var(--sur);border:1.5px solid var(--bdr);border-radius:14px;padding:12px}
.myname{font-family:'Abril Fatface',serif;font-size:20px;color:var(--acc);margin-bottom:10px}
.toast{background:var(--sur);border:1.5px solid var(--bdr);border-radius:10px;padding:9px 12px;margin-bottom:10px;font-size:13px;text-align:center;min-height:36px;display:flex;align-items:center;justify-content:center}
.tbdg{display:inline-block;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
.tbdg.mine{background:var(--acc);color:#0a0a0f}
.tbdg.wait{background:var(--sur);color:var(--mut);border:1.5px solid var(--bdr)}
.abar{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:linear-gradient(to top,var(--bg) 75%,transparent);padding:12px 12px 28px;display:flex;gap:8px}
.abar .btn{max-width:none;flex:1;margin:0;padding:13px 10px;font-size:14px}
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:200;overflow-y:auto;padding:20px 16px 40px}
.overlay.open{display:block}
.rcard{background:var(--sur);border:1.5px solid var(--bdr);border-radius:12px;padding:14px;margin-bottom:12px}
.rh{font-weight:600;color:var(--acc);margin-bottom:6px;font-size:14px}
.rb{font-size:13px;line-height:1.7;color:var(--txt)}
.rbadge{display:inline-block;background:var(--cbg);color:var(--blk);border-radius:4px;padding:1px 6px;font-weight:700;font-size:13px;margin-right:3px}
#endScreen{text-align:center}
#jerr,#cerr{color:#e74c3c;font-size:13px;margin-top:6px;text-align:center}
@keyframes shake{0%,100%{transform:translateX(0)}15%,45%,75%{transform:translateX(-16px)}30%,60%,90%{transform:translateX(16px)}}
.shaking{animation:shake 0.45s ease-in-out 4}
@keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-240px) scale(2.2) rotate(25deg)}}
@keyframes floatUpLeft{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translate(-160px,-210px) scale(2.0) rotate(-40deg)}}
@keyframes floatUpRight{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translate(160px,-210px) scale(2.0) rotate(40deg)}}
@keyframes spinOut{0%{opacity:1;transform:scale(1) rotate(0)}100%{opacity:0;transform:scale(3.5) rotate(900deg)}}
@keyframes fireRise{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-300px) scale(2.8) rotate(20deg)}}
@keyframes posFloat{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-180px) scale(1.8)}}
@keyframes flashWord{0%{opacity:0;transform:translate(-50%,-50%) scale(0.2) rotate(-12deg)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.25) rotate(-4deg)}75%{opacity:1;transform:translate(-50%,-50%) scale(1.05) rotate(2deg)}100%{opacity:0;transform:translate(-50%,-50%) scale(0.7) rotate(8deg)}}
@keyframes celebIn{0%{opacity:0;transform:scale(0.4)}60%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
@keyframes confettiFall{0%{opacity:1;transform:translateY(-10px) rotate(0)}100%{opacity:0;transform:translateY(100vh) rotate(720deg)}}
@keyframes diceRollAnim{0%{transform:rotate(0) scale(1)}25%{transform:rotate(20deg) scale(1.3)}75%{transform:rotate(-20deg) scale(1.3)}100%{transform:rotate(0) scale(1)}}
.emoji-burst{position:fixed;pointer-events:none;z-index:999}
.emoji-burst.up{animation:floatUp 1.8s ease-out forwards}
.emoji-burst.left{animation:floatUpLeft 1.8s ease-out forwards}
.emoji-burst.right{animation:floatUpRight 1.8s ease-out forwards}
.emoji-burst.spin{animation:spinOut 2.0s ease-out forwards}
.emoji-burst.fire{animation:fireRise 1.4s ease-out forwards}
.emoji-burst.pos{animation:posFloat 1.5s ease-out forwards}
.flash-word{position:fixed;pointer-events:none;z-index:1000;font-family:'Abril Fatface',serif;left:50%;text-align:center;text-shadow:0 0 40px currentColor,0 4px 0 rgba(0,0,0,.9);animation:flashWord 1.2s ease-in-out forwards}
.celeb-overlay{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.93);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:30px 16px 40px;overflow-y:auto;animation:celebIn .5s ease-out}
.celeb-title{font-family:'Abril Fatface',serif;font-size:46px;color:var(--acc);text-align:center;text-shadow:0 0 50px var(--acc);margin-bottom:6px;line-height:1.1}
.celeb-sub{font-size:17px;text-align:center;color:var(--mut);margin-bottom:22px}
.celeb-section{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:var(--mut);margin-bottom:10px;text-align:center}
.celeb-player-row{background:var(--sur);border:1.5px solid var(--bdr);border-radius:12px;padding:12px 16px;margin-bottom:8px;width:100%;max-width:380px}
.celeb-player-name{font-weight:700;font-size:15px;margin-bottom:8px}
.celeb-btn-row{display:flex;gap:10px;width:100%;max-width:380px;margin-top:10px}
.celeb-btn{flex:1;padding:14px;border-radius:12px;border:none;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;cursor:pointer}
.dice-modal{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;z-index:400;background:var(--sur);border-radius:20px 20px 0 0;border-top:2px solid var(--acc);padding:20px 16px 32px;animation:slideUp .4s ease-out}
@keyframes slideUp{from{transform:translateX(-50%) translateY(100%)}to{transform:translateX(-50%) translateY(0)}}
.dice-title{font-family:'Abril Fatface',serif;font-size:24px;color:var(--acc);text-align:center;margin-bottom:16px}
.dice-row{display:flex;gap:16px;flex-wrap:wrap;justify-content:center}
.die-wrap{display:flex;flex-direction:column;align-items:center;gap:6px}
.die-emoji{font-size:48px}
.die-rolling{animation:diceRollAnim .3s ease-in-out infinite}
.die-name{font-size:12px;color:var(--mut)}
.die-winner-tag{font-size:11px;color:var(--acc);font-weight:700}
.confetti-piece{position:fixed;pointer-events:none;z-index:499;animation:confettiFall linear forwards}
</style>
</head>
<body>

<!-- HOME -->
<div id="homeScreen" class="screen active">
  <div style="font-size:80px;margin-bottom:4px">💩</div>
  <h1 style="font-family:'Abril Fatface',serif;font-size:56px;color:var(--acc);letter-spacing:-2px">Shithead</h1>
  <div style="color:var(--mut);font-size:13px;margin-bottom:32px;letter-spacing:3px;text-transform:uppercase">Zweeds Pesten</div>
  <button class="btn btn-pri" onclick="show('createScreen')">&#127918; Maak Spel</button>
  <button class="btn btn-grn" onclick="startVsBot()">&#129302; Speel vs Bot</button>
  <button class="btn btn-sec" onclick="show('joinScreen')">&#128279; Join Game</button>
  <button class="btn btn-sec" style="margin-top:4px;opacity:.7" onclick="openRules()">&#128214; Regels</button>
</div>

<!-- CREATE -->
<div id="createScreen" class="screen">
  <button class="back" onclick="show('homeScreen')">&#8592;</button>
  <h2 style="font-family:'Abril Fatface',serif;font-size:28px;margin-bottom:22px">Nieuw Spel</h2>
  <div class="field"><label>Jouw naam</label><input id="cname" type="text" placeholder="bv. Lars" maxlength="16"/></div>
  <div class="field"><label>Aantal spelers</label>
    <select id="ccount">
      <option value="2">2 spelers</option>
      <option value="3">3 spelers</option>
      <option value="4">4 spelers</option>
    </select>
  </div>
  <button class="btn btn-pri" onclick="createRoom()">&#128640; Maak Room</button>
  <div id="cerr"></div>
</div>

<!-- JOIN -->
<div id="joinScreen" class="screen">
  <button class="back" onclick="show('homeScreen')">&#8592;</button>
  <h2 style="font-family:'Abril Fatface',serif;font-size:28px;margin-bottom:22px">Join Spel</h2>
  <div class="field"><label>Jouw naam</label><input id="jname" type="text" placeholder="bv. Lars" maxlength="16"/></div>
  <div class="field"><label>Room Code</label><input id="jcode" type="text" placeholder="XXXX" maxlength="4" style="text-transform:uppercase;font-size:28px;letter-spacing:8px;text-align:center"/></div>
  <button class="btn btn-pri" onclick="joinRoom()">&#128279; Join</button>
  <div id="jerr"></div>
</div>

<!-- LOBBY -->
<div id="lobbyScreen" class="screen" style="justify-content:flex-start;padding-top:50px">
  <button class="back" onclick="leaveGame()">&#8592;</button>
  <h2 style="font-family:'Abril Fatface',serif;font-size:28px;margin-bottom:16px">Lobby</h2>
  <div class="codebox">
    <div style="font-size:11px;color:var(--mut);text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">Room Code</div>
    <div class="bigcode" id="lobbyCode">----</div>
  </div>
  <div id="lobbyPlayers" style="width:100%;max-width:320px"></div>
  <div id="lobbyMsg" style="color:var(--mut);font-size:13px;text-align:center;margin-top:12px"></div>
</div>

<!-- SWAP -->
<div id="swapScreen" class="screen" style="justify-content:flex-start;padding-top:40px">
  <h2 style="font-family:'Abril Fatface',serif;font-size:26px;margin-bottom:6px">Kies Face-Up Kaarten</h2>
  <div style="color:var(--mut);font-size:13px;margin-bottom:18px">Klik op 3 handkaarten om ze face-up te leggen</div>
  <div style="width:100%;max-width:380px;margin-bottom:10px">
    <div class="slbl">Face-Up (klik om terug)</div>
    <div id="swapFaceUp" class="cards-row" style="min-height:88px;gap:6px"></div>
  </div>
  <div style="width:100%;max-width:380px;margin-bottom:16px">
    <div class="slbl">Hand (klik om face-up te zetten)</div>
    <div id="swapHand" class="cards-row" style="gap:6px"></div>
  </div>
  <button class="btn btn-pri" id="readyBtn" onclick="readyUp()" disabled>&#9989; Ready!</button>
  <div id="swapMsg" style="color:var(--mut);font-size:13px;text-align:center;margin-top:8px"></div>
</div>

<!-- GAME -->
<div id="gameScreen" class="screen">
  <div class="gwrap">
    <div style="display:flex;justify-content:flex-end;margin-bottom:6px">
      <button onclick="leaveGame()" style="background:none;border:1.5px solid var(--bdr);color:var(--mut);border-radius:8px;padding:5px 12px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif">&#10005; Leave</button>
    </div>
    <div id="others"></div>
    <div id="blindReveal">
      <div id="blindLabel">Blind flip...</div>
      <div id="blindFlipCard"></div>
    </div>
    <div class="pile-area" id="pileArea">
      <div id="pileFan"></div>
      <div class="pile-lbl" id="pileLbl">Stapel leeg</div>
    </div>
    <div class="toast" id="toastMsg">Welkom!</div>
    <div id="tbdg" class="tbdg wait">Wachten...</div>
    <div class="myarea" id="myArea">
      <div class="myname" id="myName">Jij</div>
      <div class="slbl">Face-Down</div>
      <div class="cards-row" id="myFaceDown"></div>
      <div class="slbl">Face-Up</div>
      <div class="cards-row" id="myFaceUp"></div>
      <div class="slbl">Hand</div>
      <div class="cards-row" id="myHand"></div>
    </div>
  </div>
  <div class="abar">
    <button class="btn btn-pri" id="btnPlay" onclick="playSel()" disabled>Speel</button>
    <button class="btn btn-sec" id="btnPickup" onclick="pickUpPile()" disabled>Pak stapel</button>
    <button class="btn btn-sec" id="btnRules" onclick="openRules()" style="max-width:60px;flex:0">&#128214;</button>
  </div>
</div>

<!-- END -->
<div id="endScreen" class="screen">
  <div style="font-size:80px;margin-bottom:10px">&#127942;</div>
  <div style="font-family:'Abril Fatface',serif;font-size:38px;color:var(--acc);margin-bottom:8px" id="endTitle">Game Over!</div>
  <div id="endResults" style="width:100%;max-width:320px;margin-bottom:20px"></div>
  <button class="btn btn-pri" id="rematchBtn" style="display:none" onclick="sendRematch()">&#128260; Rematch!</button>
  <button class="btn btn-sec" onclick="location.reload()">&#127968; Nieuw Spel</button>
</div>

<!-- RULES -->
<div class="overlay" id="rulesOverlay">
  <div style="max-width:420px;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div style="font-family:'Abril Fatface',serif;font-size:28px;color:var(--acc)">Regels</div>
      <button onclick="closeRules()" style="background:none;border:none;color:var(--mut);font-size:22px;cursor:pointer">&#10005;</button>
    </div>
    <div class="rcard"><div class="rh">Doel</div><div class="rb">Wees niet de laatste met kaarten. De laatste speler = de Shithead 💩</div></div>
    <div class="rcard"><div class="rh">Speelbeurt</div><div class="rb">Speel een kaart die hoger is dan de bovenste kaart. Meerdere kaarten van dezelfde rang mag. Kun je niet? Pak de hele stapel.</div></div>
    <div class="rcard"><div class="rh">Bijzondere kaarten</div>
      <div class="rb">
        <span class="rbadge">2</span> Altijd speelbaar, volgende speler mag alles behalve 2/Aas<br>
        <span class="rbadge">3</span> Transparant, verandert effectieve top niet<br>
        <span class="rbadge">7</span> Volgende speler speelt 7 of lager<br>
        <span class="rbadge">10</span> Altijd speelbaar, verbrandt stapel 🔥 speel opnieuw<br>
        <span class="rbadge">4x</span> Vier gelijke verbrandt stapel 🔥 speel opnieuw<br>
        <span class="rbadge">A</span> Alleen op een K speelbaar
      </div>
    </div>
    <div class="rcard"><div class="rh">Fases</div><div class="rb">1. Speel handkaarten (3 bijvullen)<br>2. Trekstapel leeg: speel face-up kaarten<br>3. Face-up leeg: speel blind face-down kaarten</div></div>
    <div class="rcard"><div class="rh">Dobbelstenen</div><div class="rb">Bij start en rematch wordt gegooid voor wie begint. Hoogste gooi gaat eerst.</div></div>
  </div>
</div>

<script>
var socket = io();
var myCode = null, myIndex = null, state = null, sel = [], lastBlindId = null, blindAnimating = false;

function saveSession(code, idx) { try { sessionStorage.setItem('sh_code', code); sessionStorage.setItem('sh_idx', idx); } catch(e){} }
function clearSession() { try { sessionStorage.removeItem('sh_code'); sessionStorage.removeItem('sh_idx'); } catch(e){} }
function loadSession() { try { return { code: sessionStorage.getItem('sh_code'), idx: sessionStorage.getItem('sh_idx') }; } catch(e){ return {}; } }

function show(id) {
  document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
}

function leaveGame() {
  if (confirm('Spel verlaten?')) { clearSession(); location.reload(); }
}

(function() {
  var sess = loadSession();
  if (sess.code && sess.idx !== null) {
    socket.emit('rejoinRoom', { code: sess.code, playerIndex: parseInt(sess.idx) });
  }
})();

socket.on('roomCreated', function(data) {
  myCode = data.code; myIndex = data.playerIndex;
  saveSession(myCode, myIndex);
  document.getElementById('lobbyCode').textContent = myCode;
  show('lobbyScreen');
});

socket.on('roomJoined', function(data) {
  myCode = data.code; myIndex = data.playerIndex;
  saveSession(myCode, myIndex);
  document.getElementById('lobbyCode').textContent = myCode;
  show('lobbyScreen');
});

socket.on('error', function(msg) {
  document.getElementById('jerr').textContent = msg;
  document.getElementById('cerr').textContent = msg;
});

// ── Dice roll modal (slides up from bottom, non-blocking) ─────────────────────
var diceModalEl = null;
var diceTimers = [];

function showDiceModal(gs) {
  if (diceModalEl) { diceModalEl.remove(); diceModalEl = null; }
  diceTimers.forEach(clearInterval);
  diceTimers = [];

  var modal = document.createElement('div');
  modal.className = 'dice-modal';

  var title = document.createElement('div');
  title.className = 'dice-title';
  title.textContent = '🎲 Wie begint?';
  modal.appendChild(title);

  var row = document.createElement('div');
  row.className = 'dice-row';
  var FACES = ['⚀','⚁','⚂','⚃','⚄','⚅'];

  gs.players.forEach(function(p, i) {
    var wrap = document.createElement('div'); wrap.className = 'die-wrap';
    var die = document.createElement('div'); die.className = 'die-emoji die-rolling';

    var rollCount = 0;
    var maxRolls = 10 + Math.floor(Math.random() * 8);
    var interval = setInterval(function() {
      die.textContent = FACES[Math.floor(Math.random() * 6)];
      rollCount++;
      if (rollCount >= maxRolls) {
        clearInterval(interval);
        if (gs.diceRolls && gs.diceRolls[i] !== undefined) {
          die.textContent = FACES[gs.diceRolls[i] - 1];
          die.classList.remove('die-rolling');
        }
      }
    }, 80 + i * 25);
    diceTimers.push(interval);

    var name = document.createElement('div'); name.className = 'die-name';
    name.textContent = p.name;
    wrap.appendChild(die); wrap.appendChild(name);
    if (gs.diceWinner === i || gs.diceWinner === String(i)) {
      var tag = document.createElement('div'); tag.className = 'die-winner-tag';
      tag.textContent = '🏆 Begint!';
      wrap.appendChild(tag);
    }
    row.appendChild(wrap);
  });

  modal.appendChild(row);
  document.body.appendChild(modal);
  diceModalEl = modal;
}

function hideDiceModal() {
  diceTimers.forEach(clearInterval); diceTimers = [];
  if (diceModalEl) {
    diceModalEl.style.transition = 'transform .4s ease-in, opacity .4s';
    diceModalEl.style.transform = 'translateX(-50%) translateY(100%)';
    diceModalEl.style.opacity = '0';
    setTimeout(function() { if (diceModalEl) { diceModalEl.remove(); diceModalEl = null; } }, 450);
  }
}

// ── Win celebration overlay ───────────────────────────────────────────────────
var celebOverlayEl = null;

function showWinCelebration(gs) {
  if (celebOverlayEl) return;
  spawnConfetti(60);

  var overlay = document.createElement('div');
  overlay.className = 'celeb-overlay';

  var shitheadName = gs.shithead;
  var winnerPlayer = gs.players.filter(function(p){ return p.finishOrder === 1; })[0];
  var winnerName = winnerPlayer ? winnerPlayer.name : '';

  var emoji = document.createElement('div');
  emoji.style.cssText = 'font-size:72px;text-align:center;margin-bottom:6px';
  emoji.textContent = '🏆';
  overlay.appendChild(emoji);

  var title = document.createElement('div');
  title.className = 'celeb-title';
  title.textContent = winnerName + ' wint!';
  overlay.appendChild(title);

  var sub = document.createElement('div');
  sub.className = 'celeb-sub';
  sub.textContent = '💩 ' + shitheadName + ' is de Shithead!';
  overlay.appendChild(sub);

  var secLabel = document.createElement('div');
  secLabel.className = 'celeb-section';
  secLabel.textContent = 'Verborgen kaarten van iedereen';
  overlay.appendChild(secLabel);

  gs.players.forEach(function(p) {
    var row = document.createElement('div'); row.className = 'celeb-player-row';
    var icon = p.name === shitheadName ? '💩' : (p.finishOrder === 1 ? '🥇' : (p.finishOrder === 2 ? '🥈' : '🥉'));
    var nameEl = document.createElement('div'); nameEl.className = 'celeb-player-name';
    nameEl.textContent = icon + ' ' + p.name;
    row.appendChild(nameEl);
    var cards = p.faceDown && p.faceDown.length ? p.faceDown : [];
    if (cards.length > 0 && cards[0].rank !== '?') {
      var cardRow = document.createElement('div');
      cardRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px';
      cards.forEach(function(card) { cardRow.appendChild(makeCard(card, {})); });
      row.appendChild(cardRow);
    } else {
      var none = document.createElement('div');
      none.style.cssText = 'font-size:12px;color:var(--mut)';
      none.textContent = 'Geen verborgen kaarten';
      row.appendChild(none);
    }
    overlay.appendChild(row);
  });

  var btnRow = document.createElement('div'); btnRow.className = 'celeb-btn-row';
  if (myCode) {
    var remBtn = document.createElement('button'); remBtn.className = 'celeb-btn';
    remBtn.style.cssText = 'background:var(--acc);color:#0a0a0f';
    remBtn.textContent = '🔄 Rematch!';
    remBtn.onclick = function() { sendRematch(); overlay.remove(); celebOverlayEl = null; };
    btnRow.appendChild(remBtn);
  }
  var newBtn = document.createElement('button'); newBtn.className = 'celeb-btn';
  newBtn.style.cssText = 'background:var(--sur);color:var(--txt);border:1.5px solid var(--bdr)';
  newBtn.textContent = '🏠 Nieuw Spel';
  newBtn.onclick = function() { location.reload(); };
  btnRow.appendChild(newBtn);
  overlay.appendChild(btnRow);
  document.body.appendChild(overlay);
  celebOverlayEl = overlay;

  setTimeout(function() { flashBigWord(winnerName + '!!!', '#f0a500', '64px', '38%'); }, 300);
  setTimeout(function() { flashBigWord('WINNAAR! 🏆', '#00ffaa', '52px', '55%'); }, 900);
}

function spawnConfetti(count) {
  var items = ['🎊','🎉','⭐','✨','🌟','💫'];
  for (var i = 0; i < count; i++) {
    (function(delay) {
      setTimeout(function() {
        var el = document.createElement('div'); el.className = 'confetti-piece';
        el.textContent = items[Math.floor(Math.random() * items.length)];
        el.style.left = (Math.random() * 100) + 'vw';
        el.style.top = '-30px';
        el.style.fontSize = (14 + Math.random() * 18) + 'px';
        el.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        document.body.appendChild(el);
        setTimeout(function() { el.remove(); }, 3800);
      }, delay);
    })(i * 60);
  }
}

function showFireEffect() {
  var flames = ['🔥','🔥','💥','🔥','🔥','💥','🔥','🌋'];
  flames.forEach(function(emoji, i) {
    setTimeout(function() {
      var el = document.createElement('div'); el.className = 'emoji-burst fire';
      el.textContent = emoji;
      el.style.left = (5 + Math.random() * 80) + 'vw';
      el.style.top = (20 + Math.random() * 50) + 'vh';
      el.style.fontSize = (40 + Math.random() * 44) + 'px';
      el.style.animationDuration = (1.0 + Math.random() * 0.8) + 's';
      document.body.appendChild(el);
      setTimeout(function() { el.remove(); }, 2200);
    }, i * 110);
  });
  flashBigWord('🔥 BURN! 🔥', '#ff4400', '68px', '42%');
}

function triggerBlindSuccess() {
  var emojis = ['🎉','⭐','😎','✅','🙌','💪','🎯','🔥','😍','🥳'];
  emojis.forEach(function(emoji, i) {
    setTimeout(function() {
      var el = document.createElement('div'); el.className = 'emoji-burst pos';
      el.textContent = emoji;
      el.style.left = (5 + Math.random() * 85) + 'vw';
      el.style.top = (20 + Math.random() * 55) + 'vh';
      el.style.fontSize = (36 + Math.random() * 32) + 'px';
      el.style.animationDuration = (1.0 + Math.random() * 0.8) + 's';
      document.body.appendChild(el);
      setTimeout(function() { el.remove(); }, 2200);
    }, i * 120);
  });
  flashBigWord('NICE! 🎉', '#00ffaa', '60px', '38%');
}

function triggerBlindFail() {
  var wrap = document.querySelector('.gwrap');
  if (wrap) { wrap.classList.add('shaking'); setTimeout(function() { wrap.classList.remove('shaking'); }, 2000); }
  var words = [
    { t: 'NOOOOOB!', c: '#ff2222', size: '76px', top: '32%' },
    { t: 'LMAOOOO 😂', c: '#f0a500', size: '58px', top: '58%' },
    { t: 'UNLUCKY 💀', c: '#cc44ff', size: '52px', top: '42%' },
    { t: 'RIP 😂', c: '#ff4488', size: '66px', top: '50%' },
    { t: 'GG EZ', c: '#00ffaa', size: '60px', top: '36%' },
    { t: 'HAHAHA 😈', c: '#ff2222', size: '62px', top: '55%' },
  ];
  words.forEach(function(w, i) { setTimeout(function() { flashBigWord(w.t, w.c, w.size, w.top); }, i * 380); });
  var emojiData = [
    ['😂','up'],['😈','left'],['😂','right'],
    ['💩','spin'],['😈','up'],['😂','left'],
    ['💩','right'],['😈','spin'],['😂','up'],
    ['🤡','left'],['💩','spin'],['😈','right'],
    ['😂','up'],['🤡','spin'],['😈','left'],
    ['😂','right'],['💩','up'],['😈','spin'],
  ];
  emojiData.forEach(function(item, i) {
    setTimeout(function() {
      var el = document.createElement('div'); el.className = 'emoji-burst ' + item[1];
      el.textContent = item[0];
      el.style.left = (3 + Math.random() * 88) + 'vw';
      el.style.top = (10 + Math.random() * 65) + 'vh';
      el.style.fontSize = (52 + Math.random() * 52) + 'px';
      el.style.animationDuration = (1.3 + Math.random() * 0.9) + 's';
      document.body.appendChild(el);
      setTimeout(function() { el.remove(); }, 2800);
    }, i * 120);
  });
}

function flashBigWord(text, color, size, top) {
  var el = document.createElement('div'); el.className = 'flash-word';
  el.textContent = text; el.style.color = color;
  el.style.fontSize = size || '60px'; el.style.top = top || '45%';
  document.body.appendChild(el);
  setTimeout(function() { el.remove(); }, 1300);
}

// ── Card rendering ─────────────────────────────────────────────────────────────
function makeCard(card, opts) {
  opts = opts || {};
  var el = document.createElement('div');
  var isRed = card.suit === '♥' || card.suit === '♦';
  el.className = 'card ' + (isRed ? 'r' : 'b') + (opts.sel ? ' sel' : '') + (opts.dim ? ' dim' : '');
  var badges = { '2': '↑', '3': '👻', '7': '↓', '10': '🔥' };
  var badge = badges[card.rank] ? '<div class="sp">' + badges[card.rank] + '</div>' : '';
  el.innerHTML = '<div class="corner">' + card.rank + '</div><div class="cs">' + card.suit + '</div>' + badge;
  return el;
}

// ── Pile fan ──────────────────────────────────────────────────────────────────
function renderPileFan(pile) {
  var fan = document.getElementById('pileFan');
  var lbl = document.getElementById('pileLbl');
  fan.innerHTML = '';
  if (!pile || !pile.length) { lbl.textContent = 'Stapel leeg'; return; }
  var show = pile.slice(-3);
  var wrap = document.createElement('div');
  wrap.className = 'pile-fan-wrap' + (show.length < 3 ? ' fan2' : '');
  show.forEach(function(card) {
    var div = document.createElement('div'); div.className = 'pfc';
    div.appendChild(makeCard(card, {})); wrap.appendChild(div);
  });
  fan.appendChild(wrap);
  lbl.textContent = pile.length + ' kaart' + (pile.length !== 1 ? 'en' : '');
}

// ── Blind flip ────────────────────────────────────────────────────────────────
function showBlindFlip(card, playerName, success) {
  blindAnimating = true;
  var area = document.getElementById('blindReveal');
  var label = document.getElementById('blindLabel');
  var slot = document.getElementById('blindFlipCard');
  label.textContent = (playerName || 'Iemand') + ' flipt blind...';
  slot.innerHTML = '';
  var stage = document.createElement('div'); stage.className = 'flip-stage';
  var inner = document.createElement('div'); inner.className = 'flip-inner';
  var front = document.createElement('div'); front.className = 'flip-front';
  front.textContent = '🂠';
  var back = document.createElement('div'); back.className = 'flip-back';
  var revealed = makeCard(card, {}); revealed.style.cursor = 'default';
  back.appendChild(revealed);
  inner.appendChild(front); inner.appendChild(back);
  stage.appendChild(inner); slot.appendChild(stage);
  area.style.display = 'block';
  clearTimeout(area._hideTimer);
  setTimeout(function() {
    blindAnimating = false;
    if (state) renderPileFan(success === false ? (state.pileWithoutBlind || []) : state.pile);
    if (success === true) triggerBlindSuccess();
    else if (success === false) triggerBlindFail();
    area._hideTimer = setTimeout(function() { area.style.display = 'none'; }, 2600);
  }, 2100);
}

// ── Lobby / swap ──────────────────────────────────────────────────────────────
function renderLobby(gs) {
  if (!gs) return;
  document.getElementById('lobbyCode').textContent = gs.roomCode || '----';
  var lp = document.getElementById('lobbyPlayers');
  if (!lp) return;
  lp.innerHTML = '';
  gs.players.forEach(function(p) {
    var div = document.createElement('div'); div.className = 'ppill';
    var dot = document.createElement('div'); dot.className = 'dot' + (p.connected ? (p.ready ? ' rdy' : ' on') : '');
    var name = document.createElement('span'); name.textContent = p.name + (p.isBot ? ' 🤖' : '');
    var status = document.createElement('span'); status.style.cssText = 'margin-left:auto;font-size:11px;color:var(--mut)';
    status.textContent = p.ready ? '✅ Ready' : (p.connected ? 'Verbonden' : 'Wachten...');
    div.appendChild(dot); div.appendChild(name); div.appendChild(status);
    lp.appendChild(div);
  });
  var lm = document.getElementById('lobbyMsg');
  if (lm) lm.textContent = gs.message || '';
}

function renderSwap(gs) {
  if (!gs || myIndex === null) return;
  var me = gs.players[myIndex];
  if (!me) return;
  var fu = document.getElementById('swapFaceUp');
  var hand = document.getElementById('swapHand');
  fu.innerHTML = ''; hand.innerHTML = '';
  me.faceUp.forEach(function(card) {
    var c = makeCard(card, {});
    c.onclick = function() { socket.emit('returnToHand', { code: myCode, playerIndex: myIndex, faceUpCardId: card.id }); };
    fu.appendChild(c);
  });
  if (me.hand) {
    var sorted = me.hand.slice().sort(function(a, b) {
      var rv = {"A":1,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"2":15};
      return (rv[a.rank]||50) - (rv[b.rank]||50);
    });
    sorted.forEach(function(card) {
      var c = makeCard(card, {});
      c.onclick = function() { if (me.faceUp.length < 3) socket.emit('placeFaceUp', { code: myCode, playerIndex: myIndex, handCardId: card.id }); };
      hand.appendChild(c);
    });
  }
  document.getElementById('readyBtn').disabled = me.faceUp.length !== 3;
  document.getElementById('swapMsg').textContent = gs.message || '';
}

// ── End screen ────────────────────────────────────────────────────────────────
function renderEnd(gs) {
  document.getElementById('endTitle').textContent = '💩 ' + gs.shithead + ' is de Shithead!';
  var res = document.getElementById('endResults'); res.innerHTML = '';
  var sorted = gs.players.slice().sort(function(a, b) { return (a.finishOrder||99) - (b.finishOrder||99); });
  sorted.forEach(function(p, i) {
    var isShit = p.name === gs.shithead;
    var div = document.createElement('div');
    div.style.cssText = 'background:var(--sur);border:1.5px solid var(--bdr);border-radius:10px;padding:10px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px;font-size:14px';
    var icon = isShit ? '💩' : (i === 0 ? '🥇' : (i === 1 ? '🥈' : '🥉'));
    var tag = isShit ? 'SHITHEAD 😭' : (p.finishOrder ? '#' + p.finishOrder : '');
    div.innerHTML = '<span style="font-size:20px">' + icon + '</span><span style="flex:1;font-weight:600">' + p.name + '</span><span style="color:var(--mut)">' + tag + '</span>';
    res.appendChild(div);
  });
  var rb = document.getElementById('rematchBtn');
  if (rb && myCode) rb.style.display = 'block';
}

function sendRematch() { if (myCode) socket.emit('rematch', { code: myCode }); }

// ── Game rendering ────────────────────────────────────────────────────────────
function clearSel() { sel = []; }

function renderGame(gs) {
  if (!gs) return;
  var me = gs.players[myIndex];
  if (!me) return;
  var myTurn = gs.currentPlayer === myIndex && gs.phase === 'play';

  // Blind flip
  if (gs.lastBlind && gs.lastBlind.id !== lastBlindId) {
    lastBlindId = gs.lastBlind.id;
    showBlindFlip(gs.lastBlind, gs.lastBlindPlayerName, gs.lastBlindSuccess);
  } else if (!gs.lastBlind) { lastBlindId = null; }

  // Turn badge
  var b = document.getElementById('tbdg');
  b.className = 'tbdg ' + (myTurn ? 'mine' : 'wait');
  b.textContent = myTurn ? 'Jij bent aan de beurt!' : ('Wacht op ' + (gs.players[gs.currentPlayer] ? gs.players[gs.currentPlayer].name : '...'));

  document.getElementById('toastMsg').textContent = gs.message || '';
  if (!blindAnimating) renderPileFan(gs.pile);

  // Fire effect for 10-burn
  if (gs.tenBurn && !document.querySelector('.tenburn-marker')) {
    var m = document.createElement('div'); m.className = 'tenburn-marker'; m.style.display='none'; document.body.appendChild(m);
    showFireEffect();
    setTimeout(function() { var x=document.querySelector('.tenburn-marker'); if(x) x.remove(); }, 3000);
  }
  if (!gs.tenBurn) { var tm=document.querySelector('.tenburn-marker'); if(tm) tm.remove(); }

  // Four burn effect
  if (gs.fourBurn && !document.querySelector('.fourburn-marker')) {
    var m4 = document.createElement('div'); m4.className = 'fourburn-marker'; m4.style.display='none'; document.body.appendChild(m4);
    showFireEffect();
    flashBigWord('VIER GELIJKE! 💥', '#ff6600', '56px', '34%');
    setTimeout(function() { var x=document.querySelector('.fourburn-marker'); if(x) x.remove(); }, 3000);
  }
  if (!gs.fourBurn) { var fm=document.querySelector('.fourburn-marker'); if(fm) fm.remove(); }

  // Opponents
  var others = document.getElementById('others');
  others.innerHTML = '';
  gs.players.forEach(function(p, i) {
    if (i === myIndex) return;
    var div = document.createElement('div'); div.className = 'opp-area';

    // Name + turn badge
    var nameDiv = document.createElement('div'); nameDiv.className = 'oppname';
    var isOppTurn = gs.currentPlayer === i;
    nameDiv.innerHTML = '<span style="font-weight:700;color:' + (isOppTurn ? 'var(--acc)' : 'var(--txt)') + '">' + p.name + (p.isBot ? ' 🤖' : '') + '</span>';
    if (isOppTurn) {
      var badge = document.createElement('span');
      badge.style.cssText = 'background:var(--acc);color:#000;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;margin-left:4px';
      badge.textContent = 'AAN BEURT';
      nameDiv.appendChild(badge);
    }
    div.appendChild(nameDiv);

    // Face-down section
    if (p.faceDownCount > 0 || (p.faceDown && p.faceDown.some(function(c){return c.rank !== '?';}))) {
      var fdLbl = document.createElement('div'); fdLbl.className = 'slbl'; fdLbl.textContent = 'Face-Down';
      div.appendChild(fdLbl);
      var fdRow = document.createElement('div'); fdRow.className = 'cards-row';
      p.faceDown.forEach(function(card) {
        if (card.rank === '?') {
          var fd = document.createElement('div'); fd.className = 'card fd'; fdRow.appendChild(fd);
        } else {
          fdRow.appendChild(makeCard(card, {}));
        }
      });
      div.appendChild(fdRow);
    }

    // Face-up section
    if (p.faceUp && p.faceUp.length > 0) {
      var fuLbl = document.createElement('div'); fuLbl.className = 'slbl'; fuLbl.textContent = 'Face-Up';
      div.appendChild(fuLbl);
      var fuRow = document.createElement('div'); fuRow.className = 'cards-row';
      p.faceUp.forEach(function(card) { fuRow.appendChild(makeCard(card, {})); });
      div.appendChild(fuRow);
    }

    // Hand (face-down)
    if (p.handCount > 0) {
      var hLbl = document.createElement('div'); hLbl.className = 'slbl'; hLbl.textContent = 'Hand (' + p.handCount + ')';
      div.appendChild(hLbl);
      var hRow = document.createElement('div'); hRow.className = 'cards-row';
      for (var k = 0; k < Math.min(p.handCount, 8); k++) {
        var hc = document.createElement('div'); hc.className = 'card fd'; hRow.appendChild(hc);
      }
      div.appendChild(hRow);
    }

    // Jump-in banner
    if (gs.fourWindow) {
      var myCards = (me.hand && me.hand.length > 0) ? me.hand : ((me.faceUp && me.faceUp.length > 0) ? me.faceUp : []);
      var needed = 4 - gs.fourWindow.count;
      var matchCnt = myCards.filter(function(c){ return c.rank === gs.fourWindow.rank; }).length;
      if (matchCnt >= needed && myIndex !== gs.currentPlayer) {
        var banner = document.createElement('div');
        banner.style.cssText = 'background:var(--acc);color:#000;font-size:12px;font-weight:700;padding:6px 10px;border-radius:6px;margin-top:8px;text-align:center';
        banner.textContent = '🎯 Jump-in met ' + gs.fourWindow.rank + '! Selecteer en speel.';
        div.appendChild(banner);
      }
    }

    others.appendChild(div);
  });

  // My name + face-down
  document.getElementById('myName').textContent = me.name;
  var myFD = document.getElementById('myFaceDown');
  myFD.innerHTML = '';
  var isBlindPhase = me.hand && me.hand.length === 0 && me.faceUp && me.faceUp.length === 0 && myTurn;
  me.faceDown.forEach(function(card, idx) {
    if (card.rank !== '?') {
      myFD.appendChild(makeCard(card, {}));
    } else {
      var el = document.createElement('div'); el.className = 'card fd';
      if (isBlindPhase) {
        el.classList.add('blind-tap');
        el.onclick = (function(pos){ return function(){ socket.emit('playCards', { code: myCode, playerIndex: myIndex, cardIds: ['__fd__' + pos] }); }; })(idx);
      }
      myFD.appendChild(el);
    }
  });

  // My face-up
  var myFU = document.getElementById('myFaceUp');
  myFU.innerHTML = '';
  me.faceUp.forEach(function(card) {
    var inSel = sel.some(function(k){ return k.split('~')[1] && k.split('~')[1].split('|')[0] === card.id; });
    var el = makeCard(card, { sel: inSel });
    if (myTurn && me.hand && me.hand.length === 0) el.onclick = function(){ toggleSel(card, 'fu'); };
    myFU.appendChild(el);
  });

  // My hand
  var myH = document.getElementById('myHand');
  myH.innerHTML = '';
  if (me.hand) {
    var sorted = me.hand.slice().sort(function(a, b) {
      var rv = {"A":1,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"2":15};
      return (rv[a.rank]||50) - (rv[b.rank]||50);
    });
    sorted.forEach(function(card) {
      var inSel = sel.some(function(k){ return k.split('~')[1] && k.split('~')[1].split('|')[0] === card.id; });
      var playable = myTurn && canPlayClient(card, gs.pile);
      var el = makeCard(card, { sel: inSel, dim: myTurn && !playable && sel.length === 0 && !inSel });
      if (myTurn) el.onclick = function(){ toggleSel(card, 'h'); };
      myH.appendChild(el);
    });
  }

  // My jump banner
  if (gs.fourWindow && gs.currentPlayer !== myIndex) {
    var myC = (me.hand && me.hand.length > 0) ? me.hand : ((me.faceUp && me.faceUp.length > 0) ? me.faceUp : []);
    var need = 4 - gs.fourWindow.count;
    var cnt = myC.filter(function(c){ return c.rank === gs.fourWindow.rank; }).length;
    if (cnt >= need && !document.getElementById('jumpBanner')) {
      var jb = document.createElement('div'); jb.id = 'jumpBanner';
      jb.style.cssText = 'background:var(--acc);color:#000;padding:10px;border-radius:10px;text-align:center;font-weight:700;font-size:14px;margin-bottom:8px;cursor:pointer';
      jb.textContent = '🎯 Jump-in met ' + gs.fourWindow.rank + '! Selecteer en speel.';
      var myArea = document.getElementById('myArea');
      myArea.insertBefore(jb, myArea.firstChild);
    }
  } else {
    var jb2 = document.getElementById('jumpBanner'); if (jb2) jb2.remove();
  }

  document.getElementById('btnPlay').disabled = sel.length === 0;
  document.getElementById('btnPickup').disabled = !myTurn || !gs.pile.length;
}

function toggleSel(card, src) {
  // key format: rank~id|src  so we can check rank and source separately
  var key = card.rank + '~' + card.id + '|' + src;
  var idx = sel.indexOf(key);
  if (idx !== -1) { sel.splice(idx, 1); }
  else {
    if (sel.length > 0) {
      var firstRank = sel[0].split('~')[0];
      var firstSrc  = sel[0].split('|')[1];
      if (firstRank !== card.rank || firstSrc !== src) sel = [];
    }
    sel.push(key);
  }
  if (state) renderGame(state);
}

function canPlayClient(card, pile) {
  if (!pile || !pile.length) return true;
  if (card.rank === pile[pile.length-1].rank) return false;
  if (card.rank === '10' || card.rank === '3' || card.rank === '2') return true;
  var rv = {"A":1,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"2":15};
  var nt = pile.filter(function(c){ return c.rank !== '3'; });
  if (!nt.length) return true;
  var top = nt[nt.length-1];
  if (top.rank === '2') return card.rank !== 'A';
  if (top.rank === '7') return rv[card.rank] < rv['7'];
  if (card.rank === 'A' && top.rank === 'K') return true;
  return rv[card.rank] > rv[top.rank];
}

function playSel() {
  if (!sel.length) return;
  // key format: rank~id|src  -> extract id = part between ~ and |
  var ids = sel.map(function(k){ return k.split('~')[1].split('|')[0]; });
  sel = [];
  socket.emit('playCards', { code: myCode, playerIndex: myIndex, cardIds: ids });
}

function pickUpPile() { socket.emit('pickUpPile', { code: myCode, playerIndex: myIndex }); }
function createRoom() {
  var name = document.getElementById('cname').value.trim();
  if (!name) { document.getElementById('cerr').textContent = 'Vul een naam in'; return; }
  socket.emit('createRoom', { playerName: name, playerCount: parseInt(document.getElementById('ccount').value) });
}
function joinRoom() {
  var name = document.getElementById('jname').value.trim();
  var code = document.getElementById('jcode').value.trim().toUpperCase();
  if (!name) { document.getElementById('jerr').textContent = 'Vul een naam in'; return; }
  if (code.length !== 4) { document.getElementById('jerr').textContent = 'Code moet 4 letters zijn'; return; }
  socket.emit('joinRoom', { playerName: name, code: code });
}
function startVsBot() {
  var name = prompt('Jouw naam?', 'Speler');
  if (!name) return;
  socket.emit('createRoom', { playerName: name.trim(), vsBot: true });
}
function readyUp() { socket.emit('readyToPlay', { code: myCode, playerIndex: myIndex }); }
function openRules() { document.getElementById('rulesOverlay').classList.add('open'); }
function closeRules() { document.getElementById('rulesOverlay').classList.remove('open'); }

// ── Main socket handler ───────────────────────────────────────────────────────
var prevDiceRolls = null, prevWinReveal = false;

socket.on('gameState', function(gs) {
  if (state && state.currentPlayer === myIndex && gs.currentPlayer !== myIndex) clearSel();
  state = gs;

  // Dice modal
  if (gs.diceRolls && !prevDiceRolls) showDiceModal(gs);
  else if (!gs.diceRolls && prevDiceRolls) hideDiceModal();
  prevDiceRolls = gs.diceRolls;

  if (gs.phase === 'ended') {
    if (celebOverlayEl) { celebOverlayEl.remove(); celebOverlayEl = null; }
    clearSession(); renderEnd(gs); show('endScreen'); return;
  }
  if (gs.phase === 'winReveal' && !prevWinReveal) {
    prevWinReveal = true;
    show('gameScreen'); renderGame(gs); showWinCelebration(gs); return;
  }
  if (gs.phase === 'winReveal') return;
  prevWinReveal = false;

  renderLobby(gs);
  if (gs.phase === 'lobby') { show('lobbyScreen'); return; }
  if (gs.phase === 'swap') { show('swapScreen'); renderSwap(gs); return; }
  show('gameScreen');
  renderGame(gs);
});
</script>
</body>
</html>
