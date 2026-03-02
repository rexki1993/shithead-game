const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(express.static(path.join(__dirname, "../client/public")));

// A=1 (lowest, wraps onto K). 2=always playable, stays as value 2 on pile.
// 10=always playable, burns pile. 7=next must play lower.
// Normal order: A(1) < 3 < 4 < 5 < 6 < 7 < 8 < 9 < J < Q < K < 2
const RANK_VALUE = { "A":1,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"J":11,"Q":12,"K":13,"2":15 };
const SUITS = ["♠","♥","♦","♣"];

function createDeck() {
  const deck = [];
  for (const suit of SUITS)
    for (const rank of Object.keys(RANK_VALUE))
      deck.push({ rank, suit, id: `${rank}${suit}${Math.random().toString(36).substr(2,4)}` });
  return deck;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Walk back through pile skipping transparent 3s.
// Returns { card, sevenActive }
// sevenActive = last real non-3 card was a 7 → next must play LOWER than 7
function getPileState(pile) {
  for (let i = pile.length - 1; i >= 0; i--) {
    const r = pile[i].rank;
    if (r === "3") continue; // transparent — skip
    return { card: pile[i], sevenActive: r === "7" };
  }
  return { card: null, sevenActive: false };
}

function canPlay(card, pile) {
  if (!pile.length) return true;

  // 10 always burns — always playable on anything
  if (card.rank === "10") return true;

  const last = pile[pile.length - 1];

  // Same rank on same rank is never allowed
  if (card.rank === last.rank) return false;

  // 3 is transparent — playable on anything (same rank already blocked above)
  if (card.rank === "3") return true;

  // 2 is always playable (on anything except another 2, already blocked above)
  if (card.rank === "2") return true;

  const { card: top, sevenActive } = getPileState(pile);
  if (!top) return true; // pile only has 3s

  if (sevenActive) {
    // After 7: must play STRICTLY LOWER than 7
    return RANK_VALUE[card.rank] < RANK_VALUE["7"];
  }

  // After a 2: top.rank==="2", value 15. A=1 < 15 so A fails — correct.
  // Normal cards must beat 2 (value 15) — impossible without 10.
  // So after a 2: only 10 can follow (or pick up). That's intended.

  // Ace wraps: A can be played on K
  if (card.rank === "A" && top.rank === "K") return true;

  // Normal: strictly higher
  return RANK_VALUE[card.rank] > RANK_VALUE[top.rank];
}

// Four of a kind at top of pile (ignore 3s)
function checkFourOfAKind(pile) {
  const nonThrees = pile.filter(c => c.rank !== "3");
  if (nonThrees.length < 4) return false;
  const topRank = nonThrees[nonThrees.length - 1].rank;
  let count = 0;
  for (let i = nonThrees.length - 1; i >= 0; i--) {
    if (nonThrees[i].rank === topRank) count++;
    else break;
  }
  return count >= 4;
}

function dealGame(playerCount) {
  const deck = shuffle(createDeck());
  const players = [];
  for (let i = 0; i < playerCount; i++) {
    players.push({
      faceDown: deck.splice(0, 3),
      faceUp: [],
      hand: deck.splice(0, 6),
      name: `Player ${i + 1}`,
      socketId: null,
      connected: false,
      ready: false,
      finished: false,
      finishOrder: null,
    });
  }
  return { players, drawPile: deck, pile: [], burned: [], phase: "lobby", currentPlayer: 0, finishCount: 0, lastBlind: null };
}

const rooms = {};

function getRoomState(room, forPlayerIndex) {
  const g = room.game;
  return {
    roomCode: room.code,
    phase: g.phase,
    currentPlayer: g.currentPlayer,
    players: g.players.map((p, i) => ({
      name: p.name,
      connected: p.connected,
      ready: p.ready,
      finished: p.finished,
      finishOrder: p.finishOrder,
      handCount: p.hand.length,
      faceUpCount: p.faceUp.length,
      faceDownCount: p.faceDown.length,
      faceUp: p.faceUp,
      faceDown: p.faceDown.map(() => ({ rank: "?", suit: "?" })),
      hand: i === forPlayerIndex ? p.hand : null,
    })),
    drawPileCount: g.drawPile.length,
    pile: g.pile,
    burned: g.burned.length,
    message: g.message || "",
    shithead: g.shithead,
    lastBlind: g.lastBlind || null,
  };
}

function emitToAll(room) {
  room.game.players.forEach((p, i) => {
    if (p.socketId) io.to(p.socketId).emit("gameState", getRoomState(room, i));
  });
}

function nextPlayer(room) {
  const g = room.game;
  let next = (g.currentPlayer + 1) % g.players.length;
  let tries = 0;
  while (g.players[next].finished && tries < g.players.length) {
    next = (next + 1) % g.players.length;
    tries++;
  }
  g.currentPlayer = next;
}

function checkWin(room) {
  const g = room.game;
  const active = g.players.filter(p => !p.finished);
  if (active.length === 1) {
    g.shithead = active[0].name;
    g.phase = "ended";
    g.message = `💩 ${active[0].name} is the Shithead!`;
    return true;
  }
  return false;
}

function playerFinished(room, idx) {
  const g = room.game;
  g.players[idx].finished = true;
  g.finishCount = (g.finishCount || 0) + 1;
  g.players[idx].finishOrder = g.finishCount;
  g.message = `🎉 ${g.players[idx].name} finished in position #${g.finishCount}!`;
  if (!checkWin(room)) nextPlayer(room);
}

// When hand is empty and draw pile is empty, immediately promote face-up cards to hand
function promoteIfNeeded(player, drawPile) {
  if (player.hand.length === 0 && drawPile.length === 0 && player.faceUp.length > 0) {
    player.hand.push(...player.faceUp);
    player.faceUp = [];
  }
}

function afterPlay(room, playerIdx) {
  const g = room.game;
  const player = g.players[playerIdx];

  // Refill hand to 3
  while (player.hand.length < 3 && g.drawPile.length > 0)
    player.hand.push(g.drawPile.pop());

  // Promote face-up → hand if draw pile now empty
  promoteIfNeeded(player, g.drawPile);

  if (g.pile.length > 0) {
    if (g.pile[g.pile.length - 1].rank === "10") {
      g.burned.push(...g.pile);
      g.pile = [];
      g.message += " 💥 BURN! Play again.";
      promoteIfNeeded(player, g.drawPile);
      emitToAll(room);
      return;
    }
    if (checkFourOfAKind(g.pile)) {
      g.burned.push(...g.pile);
      g.pile = [];
      g.message += " 🔥 Four of a kind — BURN! Play again.";
      promoteIfNeeded(player, g.drawPile);
      emitToAll(room);
      return;
    }
  }

  if (player.hand.length === 0 && player.faceUp.length === 0 && player.faceDown.length === 0) {
    playerFinished(room, playerIdx);
    emitToAll(room);
    return;
  }

  nextPlayer(room);
  emitToAll(room);
}

function processPlay(room, playerIdx, cardIds, fromFaceDown = false) {
  const g = room.game;
  const player = g.players[playerIdx];
  g.lastBlind = null;

  if (fromFaceDown) {
    const fdIdx = player.faceDown.findIndex(c => c.id === cardIds[0]);
    if (fdIdx === -1) { g.message = "Invalid face-down card"; emitToAll(room); return; }
    const card = player.faceDown[fdIdx];
    player.faceDown.splice(fdIdx, 1);
    g.lastBlind = card; // triggers flip animation on clients

    if (canPlay(card, g.pile)) {
      g.pile.push(card);
      g.message = `${player.name} flipped blind: ${card.rank}${card.suit} ✓`;
    } else {
      player.hand.push(card, ...g.pile);
      g.pile = [];
      g.message = `${player.name} flipped ${card.rank}${card.suit} — can't play! Takes it + the pile.`;
      nextPlayer(room);
      emitToAll(room);
      return;
    }
    afterPlay(room, playerIdx);
    return;
  }

  const source = player.hand.length > 0 ? player.hand : player.faceUp;
  const cards = cardIds.map(id => source.find(c => c.id === id)).filter(Boolean);

  if (!cards.length) { g.message = "❌ Those cards are no longer in your hand"; emitToAll(room); return; }
  if (!cards.every(c => c.rank === cards[0].rank)) { g.message = "❌ All played cards must be the same rank"; emitToAll(room); return; }
  if (!canPlay(cards[0], g.pile)) { g.message = `❌ Can't play ${cards[0].rank} here!`; emitToAll(room); return; }

  cards.forEach(card => {
    const idx = source.findIndex(c => c.id === card.id);
    if (idx !== -1) source.splice(idx, 1);
  });
  g.pile.push(...cards);

  if (cards[0].rank === "3") {
    const { card: below } = getPileState(g.pile.slice(0, g.pile.length - cards.length));
    g.message = `${player.name} played ${cards.length > 1 ? cards.length + "×" : ""}3 👻 — beat ${below ? below.rank : "anything"}!`;
  } else {
    g.message = `${player.name} played ${cards.map(c => c.rank + c.suit).join(" ")}`;
  }

  afterPlay(room, playerIdx);
}

io.on("connection", (socket) => {

  socket.on("createRoom", ({ playerCount, playerName }) => {
    const code = Math.random().toString(36).substr(2, 4).toUpperCase();
    const game = dealGame(playerCount);
    game.players[0].name = playerName || "Player 1";
    game.players[0].socketId = socket.id;
    game.players[0].connected = true;
    rooms[code] = { code, game };
    socket.join(code);
    socket.emit("roomCreated", { code, playerIndex: 0 });
    emitToAll(rooms[code]);
  });

  socket.on("joinRoom", ({ code, playerName }) => {
    const room = rooms[code.toUpperCase()];
    if (!room) { socket.emit("error", "Room not found"); return; }
    const g = room.game;
    if (g.phase !== "lobby") { socket.emit("error", "Game already started"); return; }
    const slot = g.players.findIndex(p => !p.connected);
    if (slot === -1) { socket.emit("error", "Room is full"); return; }
    g.players[slot].name = playerName || `Player ${slot + 1}`;
    g.players[slot].socketId = socket.id;
    g.players[slot].connected = true;
    socket.join(code.toUpperCase());
    socket.emit("roomJoined", { code: code.toUpperCase(), playerIndex: slot });
    if (g.players.every(p => p.connected)) {
      g.phase = "swap";
      g.message = "All players connected! Each choose 3 cards to place face-up.";
    }
    emitToAll(room);
  });

  socket.on("rejoinRoom", ({ code, playerIndex }) => {
    const room = rooms[code];
    if (!room) { socket.emit("error", "Room not found — game may have ended"); return; }
    const player = room.game.players[playerIndex];
    if (!player) { socket.emit("error", "Invalid player"); return; }
    player.socketId = socket.id;
    player.connected = true;
    socket.join(code);
    room.game.message = `${player.name} reconnected.`;
    socket.emit("gameState", getRoomState(room, playerIndex));
    emitToAll(room);
  });

  socket.on("placeFaceUp", ({ code, playerIndex, handCardId }) => {
    const room = rooms[code];
    if (!room || room.game.phase !== "swap") return;
    const player = room.game.players[playerIndex];
    if (player.faceUp.length >= 3) return;
    const hi = player.hand.findIndex(c => c.id === handCardId);
    if (hi === -1) return;
    const [card] = player.hand.splice(hi, 1);
    player.faceUp.push(card);
    emitToAll(room);
  });

  socket.on("returnToHand", ({ code, playerIndex, faceUpCardId }) => {
    const room = rooms[code];
    if (!room || room.game.phase !== "swap") return;
    const player = room.game.players[playerIndex];
    const fi = player.faceUp.findIndex(c => c.id === faceUpCardId);
    if (fi === -1) return;
    const [card] = player.faceUp.splice(fi, 1);
    player.hand.push(card);
    emitToAll(room);
  });

  socket.on("readyToPlay", ({ code, playerIndex }) => {
    const room = rooms[code];
    if (!room || room.game.phase !== "swap") return;
    const player = room.game.players[playerIndex];
    if (player.faceUp.length !== 3) { socket.emit("error", "Place exactly 3 cards face-up first!"); return; }
    if (player.ready) return;
    player.ready = true;
    if (room.game.players.every(p => p.ready)) {
      room.game.phase = "play";
      room.game.message = "Game started! Player 1 goes first.";
    }
    emitToAll(room);
  });

  socket.on("playCards", ({ code, playerIndex, cardIds }) => {
    const room = rooms[code];
    if (!room || room.game.phase !== "play") return;
    if (room.game.currentPlayer !== playerIndex) {
      io.to(socket.id).emit("gameState", getRoomState(room, playerIndex));
      return;
    }
    const player = room.game.players[playerIndex];
    const fromFaceDown = player.hand.length === 0 && player.faceUp.length === 0;
    if (fromFaceDown) {
      const resolvedIds = cardIds.map(id => {
        if (typeof id === "string" && id.startsWith("__fd__")) {
          const pos = parseInt(id.replace("__fd__", ""), 10);
          return player.faceDown[pos] ? player.faceDown[pos].id : null;
        }
        return id;
      }).filter(Boolean);
      processPlay(room, playerIndex, resolvedIds, true);
    } else {
      processPlay(room, playerIndex, cardIds, false);
    }
  });

  socket.on("pickUpPile", ({ code, playerIndex }) => {
    const room = rooms[code];
    if (!room || room.game.phase !== "play") return;
    if (room.game.currentPlayer !== playerIndex) return;
    const g = room.game;
    const player = g.players[playerIndex];
    player.hand.push(...g.pile);
    g.pile = [];
    g.message = `${player.name} picked up the pile.`;
    nextPlayer(room);
    emitToAll(room);
  });

  socket.on("disconnect", () => {
    for (const code of Object.keys(rooms)) {
      const room = rooms[code];
      const player = room.game.players.find(p => p.socketId === socket.id);
      if (player) { player.connected = false; player.socketId = null; emitToAll(room); }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Shithead server on port ${PORT}`));
