const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, "../client/public")));

// ─── Game Logic ───────────────────────────────────────────────────────────────
const RANKS = ["3","4","5","6","8","9","J","Q","K","A","7","2","10"];
const RANK_ORDER = { "3":1,"4":2,"5":3,"6":4,"8":5,"9":6,"J":7,"Q":8,"K":9,"A":10,"7":11,"2":12,"10":13 };
const SUITS = ["♠","♥","♦","♣"];

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of Object.keys(RANK_ORDER)) {
      deck.push({ rank, suit, id: `${rank}${suit}` });
    }
  }
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

function topCard(pile) {
  return pile.length ? pile[pile.length - 1] : null;
}

function effectiveTop(pile) {
  // skip 7s to find what the "floor" is
  for (let i = pile.length - 1; i >= 0; i--) {
    if (pile[i].rank !== "7") return pile[i];
  }
  return null;
}

function canPlay(card, pile) {
  const top = effectiveTop(pile);
  if (!top) return true; // empty pile
  if (card.rank === "2" || card.rank === "10") return true; // always playable
  const sevenOnTop = pile.length && pile[pile.length-1].rank === "7";
  if (sevenOnTop) {
    // must play 7 or lower
    return RANK_ORDER[card.rank] <= RANK_ORDER["7"];
  }
  return RANK_ORDER[card.rank] >= RANK_ORDER[top.rank];
}

function dealGame(playerCount) {
  const deck = shuffle(createDeck());
  const players = [];
  for (let i = 0; i < playerCount; i++) {
    players.push({
      faceDown: deck.splice(0, 3),
      faceUp: deck.splice(0, 3),
      hand: deck.splice(0, 3),
      name: `Player ${i + 1}`,
      socketId: null,
      connected: false,
    });
  }
  return { players, drawPile: deck, pile: [], burned: [], phase: "swap" };
}

function checkFourOfAKind(pile) {
  if (pile.length < 4) return false;
  const top4 = pile.slice(-4);
  return top4.every(c => c.rank === top4[0].rank);
}

// ─── Rooms ────────────────────────────────────────────────────────────────────
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
      handCount: p.hand.length,
      faceUpCount: p.faceUp.length,
      faceDownCount: p.faceDown.length,
      faceUp: p.faceUp,
      faceDown: i === forPlayerIndex ? p.faceDown : p.faceDown.map(() => ({ rank: "?", suit: "?" })),
      hand: i === forPlayerIndex ? p.hand : null,
      isMe: i === forPlayerIndex,
    })),
    drawPileCount: g.drawPile.length,
    pile: g.pile,
    burned: g.burned.length,
    message: g.message || "",
    winner: g.winner,
    shithead: g.shithead,
  };
}

function emitToAll(room) {
  room.game.players.forEach((p, i) => {
    if (p.socketId) {
      io.to(p.socketId).emit("gameState", getRoomState(room, i));
    }
  });
  // also emit to spectators/host
  if (room.hostSocket) {
    io.to(room.hostSocket).emit("gameState", getRoomState(room, -1));
  }
}

function nextPlayer(room) {
  const g = room.game;
  let next = (g.currentPlayer + 1) % g.players.length;
  // skip players who have finished
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
    g.winner = g.players.find(p => p.finished)?.name || "";
    g.phase = "ended";
    return true;
  }
  return false;
}

function playerFinished(room, idx) {
  const g = room.game;
  g.players[idx].finished = true;
  g.message = `${g.players[idx].name} has finished! 🎉`;
  if (!checkWin(room)) {
    nextPlayer(room);
  }
}

function processPlay(room, playerIdx, cardIds, fromFaceDown = false) {
  const g = room.game;
  const player = g.players[playerIdx];
  let cards;

  if (fromFaceDown) {
    // playing face down blind
    const card = player.faceDown[cardIds[0]];
    if (!card) { g.message = "Invalid card"; return; }
    if (canPlay(card, g.pile)) {
      player.faceDown.splice(cardIds[0], 1);
      g.pile.push(card);
      g.message = `${player.name} played face-down card: ${card.rank}${card.suit}`;
    } else {
      // pick up the pile
      player.faceDown.splice(cardIds[0], 1);
      player.hand.push(card, ...g.pile);
      g.pile = [];
      g.message = `${player.name} flipped a ${card.rank} — couldn't play! Pick up the pile.`;
      nextPlayer(room);
      emitToAll(room);
      return;
    }
  } else {
    // from hand
    const source = player.hand.length > 0 ? player.hand : player.faceUp;
    cards = cardIds.map(id => source.find(c => c.id === id)).filter(Boolean);
    if (!cards.length) { g.message = "Invalid cards selected"; return; }
    // all must be same rank
    if (!cards.every(c => c.rank === cards[0].rank)) { g.message = "Must play same rank"; return; }
    if (!canPlay(cards[0], g.pile)) { g.message = "Cannot play that card!"; return; }
    // remove from source
    cards.forEach(card => {
      const idx = source.findIndex(c => c.id === card.id);
      if (idx !== -1) source.splice(idx, 1);
    });
    g.pile.push(...cards);
    g.message = `${player.name} played ${cards.map(c=>c.rank+c.suit).join(" ")}`;
  }

  const played = fromFaceDown ? [g.pile[g.pile.length-1]] : cards;
  const rank = played[0].rank;

  // Draw back up to 3
  while (player.hand.length < 3 && g.drawPile.length > 0) {
    player.hand.push(g.drawPile.pop());
  }

  // Special effects
  if (rank === "10") {
    g.burned.push(...g.pile);
    g.pile = [];
    g.message = (g.message || "") + " 💥 BURN! Play again.";
    // same player plays again
    emitToAll(room);
    return;
  }

  if (checkFourOfAKind(g.pile)) {
    g.burned.push(...g.pile);
    g.pile = [];
    g.message = (g.message || "") + " 🔥 Four of a kind — BURN! Play again.";
    emitToAll(room);
    return;
  }

  // Check if player is done
  if (player.hand.length === 0 && player.faceUp.length === 0 && player.faceDown.length === 0) {
    playerFinished(room, playerIdx);
    emitToAll(room);
    return;
  }

  nextPlayer(room);
  emitToAll(room);
}

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {

  socket.on("createRoom", ({ playerCount, playerName }) => {
    const code = Math.random().toString(36).substr(2, 4).toUpperCase();
    const game = dealGame(playerCount);
    game.currentPlayer = 0;
    game.players[0].name = playerName || "Player 1";
    game.players[0].socketId = socket.id;
    game.players[0].connected = true;
    rooms[code] = { code, game, hostSocket: null };
    socket.join(code);
    socket.emit("roomCreated", { code, playerIndex: 0 });
    emitToAll(rooms[code]);
  });

  socket.on("joinRoom", ({ code, playerName }) => {
    const room = rooms[code.toUpperCase()];
    if (!room) { socket.emit("error", "Room not found"); return; }
    const g = room.game;
    const slot = g.players.findIndex(p => !p.connected);
    if (slot === -1) { socket.emit("error", "Room is full"); return; }
    g.players[slot].name = playerName || `Player ${slot + 1}`;
    g.players[slot].socketId = socket.id;
    g.players[slot].connected = true;
    socket.join(code.toUpperCase());
    socket.emit("roomJoined", { code: code.toUpperCase(), playerIndex: slot });
    emitToAll(room);
  });

  socket.on("swapCard", ({ code, playerIndex, handCardId, faceUpCardId }) => {
    const room = rooms[code];
    if (!room || room.game.phase !== "swap") return;
    const player = room.game.players[playerIndex];
    const hi = player.hand.findIndex(c => c.id === handCardId);
    const fi = player.faceUp.findIndex(c => c.id === faceUpCardId);
    if (hi === -1 || fi === -1) return;
    [player.hand[hi], player.faceUp[fi]] = [player.faceUp[fi], player.hand[hi]];
    emitToAll(room);
  });

  socket.on("readyToPlay", ({ code, playerIndex }) => {
    const room = rooms[code];
    if (!room) return;
    room.game.players[playerIndex].ready = true;
    const allReady = room.game.players.every(p => p.ready);
    if (allReady) {
      room.game.phase = "play";
      room.game.message = "Game started! Player 1 goes first.";
    }
    emitToAll(room);
  });

  socket.on("playCards", ({ code, playerIndex, cardIds }) => {
    const room = rooms[code];
    if (!room || room.game.phase !== "play") return;
    if (room.game.currentPlayer !== playerIndex) { socket.emit("error", "Not your turn"); return; }
    const player = room.game.players[playerIndex];
    const fromFaceDown = player.hand.length === 0 && player.faceUp.length === 0;
    processPlay(room, playerIndex, cardIds, fromFaceDown);
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
      if (player) {
        player.connected = false;
        player.socketId = null;
        emitToAll(room);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Shithead server running on port ${PORT}`));
