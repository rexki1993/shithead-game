const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(express.static(path.join(__dirname, "../client/public")));

// 10 = always playable (not on 10), burns pile
// 3 = transparent (plays on anything, doesn't change effective top)
// 2 = always playable, next player can play anything except 2 or Ace
// 7 = next player must play 7 or lower
// A = beats King only (wraps top)
const RANK_VALUE = {"A":1,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"2":15};

function createDeck() {
  const suits = ["\u2660","\u2665","\u2666","\u2663"];
  const deck = [];
  for (let s = 0; s < suits.length; s++) {
    const ranks = Object.keys(RANK_VALUE);
    for (let r = 0; r < ranks.length; r++) {
      deck.push({rank:ranks[r],suit:suits[s],id:ranks[r]+suits[s]+Math.random().toString(36).substr(2,4)});
    }
  }
  return deck;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function getPileState(pile) {
  for (let i = pile.length-1; i >= 0; i--) {
    if (pile[i].rank !== "3") return {card:pile[i], sevenActive:pile[i].rank==="7", twoActive:pile[i].rank==="2"};
  }
  return {card:null, sevenActive:false, twoActive:false};
}

function canPlay(card, pile) {
  if (!pile.length) return true;
  const last = pile[pile.length-1];
  if (card.rank === last.rank) return false;
  if (card.rank === "10" || card.rank === "3" || card.rank === "2") return true;
  const st = getPileState(pile);
  if (!st.card) return true;
  if (st.twoActive) return card.rank !== "A";
  if (st.sevenActive) return RANK_VALUE[card.rank] < RANK_VALUE["7"];
  if (card.rank === "A" && st.card.rank === "K") return true;
  return RANK_VALUE[card.rank] > RANK_VALUE[st.card.rank];
}

function countTopRank(pile) {
  const nt = pile.filter(c => c.rank !== "3");
  if (!nt.length) return {rank:null,count:0};
  const top = nt[nt.length-1].rank;
  let count = 0;
  for (let i = nt.length-1; i >= 0 && nt[i].rank === top; i--) count++;
  return {rank:top, count:count};
}

function checkFourOfAKind(pile) { return countTopRank(pile).count >= 4; }

function dealGame(playerCount) {
  const deck = shuffle(createDeck());
  const players = [];
  for (let i = 0; i < playerCount; i++) {
    players.push({
      faceDown: deck.splice(0,3), faceUp: [], hand: deck.splice(0,6),
      name:"Player "+(i+1), socketId:null, connected:false,
      isBot:false, ready:false, finished:false, finishOrder:null
    });
  }
  return {
    players, drawPile:deck, pile:[], burned:[],
    phase:"lobby", currentPlayer:0, startingPlayer:0, finishCount:0,
    lastBlind:null, lastBlindPlayerName:null, lastBlindSuccess:null,
    fourWindow:null, fourBurn:false,
    diceRolls:null, diceWinner:null,
    tenBurn:false, winReveal:false, shithead:null, message:""
  };
}

const rooms = {};

function getRoomState(room, forIdx) {
  const g = room.game;
  const ti = countTopRank(g.pile);
  const revealing = g.phase === "winReveal" || g.phase === "ended";
  return {
    roomCode: room.code, phase: g.phase, currentPlayer: g.currentPlayer,
    players: g.players.map((p,i) => ({
      name:p.name, connected:p.connected, ready:p.ready,
      finished:p.finished, finishOrder:p.finishOrder, isBot:p.isBot,
      handCount:p.hand.length, faceUpCount:p.faceUp.length, faceDownCount:p.faceDown.length,
      faceUp:p.faceUp,
      faceDown: revealing ? p.faceDown : p.faceDown.map(() => ({rank:"?",suit:"?"})),
      hand: i === forIdx ? p.hand : null
    })),
    drawPileCount:g.drawPile.length, pile:g.pile,
    pileWithoutBlind: g.lastBlind ? g.pile.slice(0,-1) : g.pile,
    burned:g.burned.length, message:g.message||"", shithead:g.shithead,
    lastBlind:g.lastBlind||null, lastBlindPlayerName:g.lastBlindPlayerName||null,
    lastBlindSuccess: g.lastBlindSuccess !== undefined ? g.lastBlindSuccess : null,
    fourWindow:g.fourWindow||null, fourBurn:g.fourBurn||false,
    topRank:ti.rank, topCount:ti.count,
    diceRolls:g.diceRolls||null, diceWinner:g.diceWinner !== undefined ? g.diceWinner : null,
    tenBurn:g.tenBurn||false, winReveal:g.winReveal||false
  };
}

function emitToAll(room) {
  room.game.players.forEach((p,i) => {
    if (p.socketId) io.to(p.socketId).emit("gameState", getRoomState(room, i));
  });
}

function nextPlayer(room) {
  const g = room.game;
  let next = (g.currentPlayer+1) % g.players.length;
  for (let t = 0; t < g.players.length && g.players[next].finished; t++) next = (next+1) % g.players.length;
  g.currentPlayer = next;
}

function checkWin(room) {
  const g = room.game;
  const active = g.players.filter(p => !p.finished);
  if (active.length === 1) {
    g.shithead = active[0].name;
    g.message = "\uD83D\uDCA9 " + active[0].name + " is de Shithead!";
    emitToAll(room);
    setTimeout(() => {
      g.winReveal = true; g.phase = "winReveal";
      g.message = "\uD83C\uDF89 Alle verborgen kaarten worden onthuld...";
      emitToAll(room);
      setTimeout(() => { g.phase = "ended"; emitToAll(room); }, 7000);
    }, 1400);
    return true;
  }
  return false;
}

function playerFinished(room, idx) {
  const g = room.game;
  g.players[idx].finished = true;
  g.finishCount = (g.finishCount||0)+1;
  g.players[idx].finishOrder = g.finishCount;
  g.message = "\uD83C\uDF89 " + g.players[idx].name + " klaar! #" + g.finishCount;
  if (!checkWin(room)) nextPlayer(room);
}

function promoteIfNeeded(player, drawPile) {
  if (player.hand.length === 0 && drawPile.length === 0 && player.faceUp.length > 0) {
    player.faceUp.forEach(c => player.hand.push(c));
    player.faceUp = [];
  }
}

function burnPileWithDelay(room, playerIdx, reason, playAgain) {
  const g = room.game;
  const player = g.players[playerIdx];
  if (reason === "ten") {
    g.tenBurn = true;
    g.message += " \uD83D\uDD25 10 gespeeld -- BURN!";
    emitToAll(room);
    setTimeout(() => {
      g.tenBurn = false;
      g.pile.forEach(c => g.burned.push(c));
      g.pile = [];
      // Check if player is finished AFTER the burn
      if (player.hand.length === 0 && player.faceUp.length === 0 && player.faceDown.length === 0) {
        playerFinished(room, playerIdx);
        emitToAll(room);
        scheduleBotTurn(room);
        return;
      }
      g.message = "\uD83D\uDCA5 VERBRAND! Speel weer.";
      promoteIfNeeded(player, g.drawPile);
      emitToAll(room);
      scheduleBotTurn(room);
    }, 2400);
  } else if (reason === "four") {
    g.fourBurn = true;
    g.message += " \uD83D\uDD25 VIER GELIJKE -- BURN!";
    emitToAll(room);
    setTimeout(() => {
      g.fourBurn = false;
      g.pile.forEach(c => g.burned.push(c));
      g.pile = [];
      if (player.hand.length === 0 && player.faceUp.length === 0 && player.faceDown.length === 0) {
        playerFinished(room, playerIdx);
        emitToAll(room);
        scheduleBotTurn(room);
        return;
      }
      g.message = "\uD83D\uDCA5 VERBRAND! Speel weer.";
      promoteIfNeeded(player, g.drawPile);
      emitToAll(room);
      scheduleBotTurn(room);
    }, 2400);
  }
}

function afterPlay(room, playerIdx) {
  const g = room.game;
  const player = g.players[playerIdx];
  g.fourWindow = null;
  while (player.hand.length < 3 && g.drawPile.length > 0) player.hand.push(g.drawPile.pop());
  promoteIfNeeded(player, g.drawPile);

  if (g.pile.length > 0) {
    const topCard = g.pile[g.pile.length-1];
    if (topCard.rank === "10") {
      burnPileWithDelay(room, playerIdx, "ten", true);
      return;
    }
    if (checkFourOfAKind(g.pile)) {
      burnPileWithDelay(room, playerIdx, "four", true);
      return;
    }
  }

  if (player.hand.length === 0 && player.faceUp.length === 0 && player.faceDown.length === 0) {
    playerFinished(room, playerIdx);
    emitToAll(room);
    scheduleBotTurn(room);
    return;
  }

  // 4-of-a-kind window: only show for players who can COMPLETE it
  const ti = countTopRank(g.pile);
  if (ti.rank && ti.count >= 1 && ti.count < 4) {
    const needed = 4 - ti.count;
    let othersCanComplete = false;
    for (let i = 0; i < g.players.length; i++) {
      if (i === playerIdx || g.players[i].finished) continue;
      const src = g.players[i].hand.length > 0 ? g.players[i].hand : (g.players[i].faceUp.length > 0 ? g.players[i].faceUp : []);
      const cnt = src.filter(c => c.rank === ti.rank).length;
      if (cnt >= needed) { othersCanComplete = true; break; }
    }
    if (othersCanComplete) {
      g.fourWindow = {rank:ti.rank, count:ti.count};
      clearTimeout(room._fourWindowTimer);
      room._fourWindowTimer = setTimeout(() => {
        if (room.game.fourWindow) {
          room.game.fourWindow = null;
          nextPlayer(room); emitToAll(room); scheduleBotTurn(room);
        }
      }, 8000);
      emitToAll(room);
      scheduleBotFourOfAKind(room, playerIdx);
      return;
    }
  }

  nextPlayer(room); emitToAll(room); scheduleBotTurn(room);
}

function processPlay(room, playerIdx, cardIds, fromFaceDown) {
  const g = room.game;
  const player = g.players[playerIdx];
  g.lastBlind = null; g.lastBlindPlayerName = null; g.lastBlindSuccess = null;

  if (fromFaceDown) {
    const fdIdx = player.faceDown.findIndex(c => c.id === cardIds[0]);
    if (fdIdx === -1) { g.message = "Ongeldige kaart"; emitToAll(room); return; }
    const card = player.faceDown.splice(fdIdx,1)[0];
    g.lastBlind = card; g.lastBlindPlayerName = player.name;
    if (canPlay(card, g.pile)) {
      g.pile.push(card); g.lastBlindSuccess = true;
      g.message = player.name + " flipte blind: " + card.rank + card.suit + " \u2713";
      afterPlay(room, playerIdx);
    } else {
      g.lastBlindSuccess = false;
      g.message = player.name + " flipte " + card.rank + card.suit + " -- kan niet! \uD83D\uDE08\uD83D\uDE02";
      emitToAll(room);
      setTimeout(() => {
        player.hand.push(card);
        g.pile.forEach(c => player.hand.push(c));
        g.pile = [];
        g.message = player.name + " pakt " + card.rank + card.suit + " + de hele stapel! \uD83D\uDCA9";
        g.lastBlind = null; g.lastBlindPlayerName = null; g.lastBlindSuccess = null;
        nextPlayer(room); emitToAll(room); scheduleBotTurn(room);
      }, 2800);
    }
    return;
  }

  const source = player.hand.length > 0 ? player.hand : player.faceUp;
  const cards = cardIds.map(id => source.find(c => c.id === id)).filter(Boolean);
  if (!cards.length) { g.message = "Kaarten niet gevonden"; emitToAll(room); return; }
  if (!cards.every(c => c.rank === cards[0].rank)) { g.message = "Alle kaarten moeten dezelfde rang hebben"; emitToAll(room); return; }

  const isMyTurn = g.currentPlayer === playerIdx;
  if (!isMyTurn) {
    if (!g.fourWindow || cards[0].rank !== g.fourWindow.rank) {
      if (player.socketId) io.to(player.socketId).emit("gameState", getRoomState(room, playerIdx));
      return;
    }
    const needed = 4 - g.fourWindow.count;
    if (cards.length !== needed) {
      g.message = "Je hebt precies " + needed + " kaart(en) nodig!";
      if (player.socketId) io.to(player.socketId).emit("gameState", getRoomState(room, playerIdx));
      return;
    }
    clearTimeout(room._fourWindowTimer);
  } else {
    if (!canPlay(cards[0], g.pile)) { g.message = "Kan " + cards[0].rank + " niet spelen!"; emitToAll(room); return; }
  }

  cards.forEach(card => {
    const idx = source.findIndex(c => c.id === card.id);
    if (idx !== -1) source.splice(idx,1);
    g.pile.push(card);
  });

  if (!isMyTurn) {
    g.currentPlayer = playerIdx;
    g.message = player.name + " springt erin! \uD83C\uDFAF";
  } else {
    g.message = player.name + " speelt " + cards.map(c => c.rank+c.suit).join(" ");
  }
  afterPlay(room, playerIdx);
}

// ── Bot AI ────────────────────────────────────────────────────────────────────

function botChooseCards(player, pile) {
  const source = player.hand.length > 0 ? player.hand : (player.faceUp.length > 0 ? player.faceUp : []);
  if (!source.length) return null;
  const byRank = {};
  source.forEach(c => { if (!byRank[c.rank]) byRank[c.rank]=[]; byRank[c.rank].push(c); });
  const playable = Object.keys(byRank).filter(r => canPlay({rank:r}, pile));
  if (!playable.length) return null;
  playable.sort((a,b) => (RANK_VALUE[a]||50)-(RANK_VALUE[b]||50));
  const chosen = playable.filter(r => r!=="10"&&r!=="2")[0] || playable[0];
  return byRank[chosen];
}

function scheduleBotTurn(room) {
  const g = room.game;
  if (g.phase !== "play") return;
  const idx = g.currentPlayer;
  const p = g.players[idx];
  if (!p || !p.isBot || p.finished) return;
  setTimeout(() => {
    if (room.game.phase !== "play" || room.game.currentPlayer !== idx) return;
    if (p.hand.length === 0 && p.faceUp.length === 0 && p.faceDown.length > 0) {
      const pos = Math.floor(Math.random()*p.faceDown.length);
      if (p.faceDown[pos]) processPlay(room, idx, [p.faceDown[pos].id], true);
      return;
    }
    const cards = botChooseCards(p, g.pile);
    if (!cards) {
      g.pile.forEach(c => p.hand.push(c));
      g.pile = []; g.fourWindow = null;
      g.message = p.name + " pakt de stapel.";
      nextPlayer(room); emitToAll(room); scheduleBotTurn(room);
      return;
    }
    processPlay(room, idx, cards.map(c => c.id), false);
  }, 1200+Math.floor(Math.random()*800));
}

function scheduleBotFourOfAKind(room, lastPlayerIdx) {
  const g = room.game;
  if (!g.fourWindow) return;
  const rank = g.fourWindow.rank;
  const needed = 4 - g.fourWindow.count;
  g.players.forEach((p, i) => {
    if (!p.isBot || i===lastPlayerIdx || p.finished) return;
    const src = p.hand.length>0 ? p.hand : (p.faceUp.length>0 ? p.faceUp : []);
    const matching = src.filter(c => c.rank===rank);
    if (matching.length < needed || Math.random() > 0.6) return;
    setTimeout(() => {
      if (!room.game.fourWindow || room.game.fourWindow.rank !== rank) return;
      processPlay(room, i, matching.slice(0,needed).map(c=>c.id), false);
    }, 1500+Math.floor(Math.random()*1000));
  });
}

// ── Dice ──────────────────────────────────────────────────────────────────────

function rollDice(room) {
  const g = room.game;
  const rolls = {};
  g.players.forEach((p,i) => { rolls[i] = Math.ceil(Math.random()*6); });
  let maxRoll = 0;
  Object.values(rolls).forEach(r => { if (r > maxRoll) maxRoll = r; });
  const winners = Object.keys(rolls).filter(k => rolls[k] === maxRoll);
  const startIdx = parseInt(winners[Math.floor(Math.random()*winners.length)]);
  g.diceRolls = rolls; g.diceWinner = startIdx;
  g.currentPlayer = startIdx; g.startingPlayer = startIdx;
  g.message = "Gooien om te beginnen!";
  emitToAll(room);
  setTimeout(() => {
    g.diceRolls = null; g.diceWinner = null;
    g.message = g.players[startIdx].name + " begint!";
    emitToAll(room);
    scheduleBotTurn(room);
  }, 3800);
}

// ── Socket handlers ───────────────────────────────────────────────────────────

io.on("connection", socket => {

  socket.on("createRoom", data => {
    const code = Math.random().toString(36).substr(2,4).toUpperCase();
    const count = data.vsBot ? 2 : (data.playerCount||2);
    const game = dealGame(count);
    game.players[0].name = data.playerName || "Player 1";
    game.players[0].socketId = socket.id;
    game.players[0].connected = true;
    if (data.vsBot) {
      game.players[1].name = "Bot";
      game.players[1].isBot = true;
      game.players[1].connected = true;
      game.players[1].ready = true;
      const bh = game.players[1].hand.slice().sort((a,b) => (RANK_VALUE[b.rank]||0)-(RANK_VALUE[a.rank]||0));
      bh.slice(0,3).forEach(card => {
        const hi = game.players[1].hand.findIndex(c => c.id===card.id);
        if (hi !== -1) game.players[1].faceUp.push(game.players[1].hand.splice(hi,1)[0]);
      });
      game.phase = "swap";
      game.message = "Kies 3 kaarten voor face-up, dan Ready!";
    }
    rooms[code] = {code, game};
    socket.join(code);
    socket.emit("roomCreated", {code, playerIndex:0});
    emitToAll(rooms[code]);
  });

  socket.on("joinRoom", data => {
    const room = rooms[data.code.toUpperCase()];
    if (!room) { socket.emit("error","Room niet gevonden"); return; }
    const g = room.game;
    if (g.phase !== "lobby") { socket.emit("error","Spel al begonnen"); return; }
    const slot = g.players.findIndex(p => !p.connected);
    if (slot === -1) { socket.emit("error","Room is vol"); return; }
    g.players[slot].name = data.playerName || ("Player "+(slot+1));
    g.players[slot].socketId = socket.id;
    g.players[slot].connected = true;
    socket.join(data.code.toUpperCase());
    socket.emit("roomJoined", {code:data.code.toUpperCase(), playerIndex:slot});
    if (g.players.every(p => p.connected)) {
      g.phase = "swap";
      g.message = "Verbonden! Kies 3 face-up kaarten.";
    }
    emitToAll(room);
  });

  socket.on("rejoinRoom", data => {
    const room = rooms[data.code];
    if (!room) { socket.emit("error","Room niet gevonden"); return; }
    const player = room.game.players[data.playerIndex];
    if (!player) { socket.emit("error","Ongeldige speler"); return; }
    player.socketId = socket.id; player.connected = true;
    socket.join(data.code);
    room.game.message = player.name + " weer verbonden.";
    socket.emit("gameState", getRoomState(room, data.playerIndex));
    emitToAll(room);
  });

  socket.on("placeFaceUp", data => {
    const room = rooms[data.code];
    if (!room || room.game.phase !== "swap") return;
    const player = room.game.players[data.playerIndex];
    if (player.faceUp.length >= 3) return;
    const hi = player.hand.findIndex(c => c.id===data.handCardId);
    if (hi === -1) return;
    player.faceUp.push(player.hand.splice(hi,1)[0]);
    emitToAll(room);
  });

  socket.on("returnToHand", data => {
    const room = rooms[data.code];
    if (!room || room.game.phase !== "swap") return;
    const player = room.game.players[data.playerIndex];
    const fi = player.faceUp.findIndex(c => c.id===data.faceUpCardId);
    if (fi === -1) return;
    player.hand.push(player.faceUp.splice(fi,1)[0]);
    emitToAll(room);
  });

  socket.on("readyToPlay", data => {
    const room = rooms[data.code];
    if (!room || room.game.phase !== "swap") return;
    const player = room.game.players[data.playerIndex];
    if (player.faceUp.length !== 3) { socket.emit("error","Leg precies 3 kaarten face-up!"); return; }
    if (player.ready) return;
    player.ready = true;
    if (room.game.players.every(p => p.ready)) {
      room.game.phase = "play";
      rollDice(room);
    }
    emitToAll(room);
  });

  socket.on("playCards", data => {
    const room = rooms[data.code];
    if (!room || room.game.phase !== "play") return;
    const g = room.game;
    const pi = data.playerIndex;
    const player = g.players[pi];
    if (g.currentPlayer !== pi && !g.fourWindow) {
      if (player.socketId) io.to(socket.id).emit("gameState", getRoomState(room, pi));
      return;
    }
    const fromFD = player.hand.length === 0 && player.faceUp.length === 0;
    if (fromFD) {
      const ids = data.cardIds.map(id => {
        if (typeof id==="string" && id.startsWith("__fd__")) {
          const pos = parseInt(id.replace("__fd__",""),10);
          return player.faceDown[pos] ? player.faceDown[pos].id : null;
        }
        return id;
      }).filter(Boolean);
      processPlay(room, pi, ids, true);
    } else {
      processPlay(room, pi, data.cardIds, false);
    }
  });

  socket.on("pickUpPile", data => {
    const room = rooms[data.code];
    if (!room || room.game.phase !== "play") return;
    if (room.game.currentPlayer !== data.playerIndex) return;
    const g = room.game;
    const player = g.players[data.playerIndex];
    g.pile.forEach(c => player.hand.push(c));
    g.pile = []; g.fourWindow = null;
    g.message = player.name + " pakt de stapel.";
    nextPlayer(room); emitToAll(room); scheduleBotTurn(room);
  });

  socket.on("rematch", data => {
    const room = rooms[data.code];
    if (!room) { socket.emit("error","Room niet gevonden"); return; }
    const g = room.game;
    const nextStart = ((g.startingPlayer||0)+1) % g.players.length;
    const newGame = dealGame(g.players.length);
    newGame.players.forEach((p, i) => {
      p.name = g.players[i].name;
      p.socketId = g.players[i].socketId;
      p.connected = g.players[i].connected;
      p.isBot = g.players[i].isBot;
      if (p.isBot) {
        p.ready = true;
        const bh = p.hand.slice().sort((a,b)=>(RANK_VALUE[b.rank]||0)-(RANK_VALUE[a.rank]||0));
        bh.slice(0,3).forEach(card => {
          const hi = p.hand.findIndex(c => c.id===card.id);
          if (hi !== -1) p.faceUp.push(p.hand.splice(hi,1)[0]);
        });
      }
    });
    newGame.phase = "swap";
    newGame.startingPlayer = nextStart;
    newGame.message = "Rematch! Kies 3 face-up kaarten!";
    room.game = newGame;
    emitToAll(room);
  });

  socket.on("disconnect", () => {
    Object.keys(rooms).forEach(code => {
      const room = rooms[code];
      const player = room.game.players.find(p => p.socketId===socket.id);
      if (player) { player.connected=false; player.socketId=null; emitToAll(room); }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Shithead server on port " + PORT));
