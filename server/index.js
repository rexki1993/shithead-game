const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.get("/health", (req, res) => res.send("ok"));
app.use(express.static(path.join(__dirname, "../client/public")));

// Card order: A(1) < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < 2
// 10 is always playable and burns. 2 is always playable and acts as a "free reset"
// (after 2, next player can play anything except 2 or A).
const RANK_VALUE = {"A":1,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"2":15};
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
// Returns { card, sevenActive, twoActive }
function getPileState(pile) {
  for (let i = pile.length - 1; i >= 0; i--) {
    const r = pile[i].rank;
    if (r === "3") continue;
    return {
      card: pile[i],
      sevenActive: r === "7",
      twoActive: r === "2"
    };
  }
  return { card: null, sevenActive: false, twoActive: false };
}

function canPlay(card, pile) {
  if (!pile.length) return true;

  // 10 always playable except on another 10 (same-rank rule below handles that)
  // Same rank never allowed
  const last = pile[pile.length - 1];
  if (card.rank === last.rank) return false;

  // 10: always playable (burns pile), same-rank already blocked above
  if (card.rank === "10") return true;

  // 3: transparent, playable on anything except another 3 (blocked above)
  if (card.rank === "3") return true;

  // 2: always playable except on another 2 (blocked above)
  if (card.rank === "2") return true;

  const { card: top, sevenActive, twoActive } = getPileState(pile);
  if (!top) return true; // pile only has 3s

  if (twoActive) {
    // After a 2: can play anything EXCEPT 2 (blocked above) and A
    return card.rank !== "A";
  }

  if (sevenActive) {
    // After 7: must play STRICTLY LOWER than 7
    return RANK_VALUE[card.rank] < RANK_VALUE["7"];
  }

  // Ace wrap-around: A can be played on K
  if (card.rank === "A" && top.rank === "K") return true;

  // Normal: strictly higher
  return RANK_VALUE[card.rank] > RANK_VALUE[top.rank];
}

// Check if pile top has N of same rank (ignoring 3s)
function countTopRank(pile) {
  const nonThrees = pile.filter(c => c.rank !== "3");
  if (!nonThrees.length) return { rank: null, count: 0 };
  const topRank = nonThrees[nonThrees.length - 1].rank;
  let count = 0;
  for (let i = nonThrees.length - 1; i >= 0; i--) {
    if (nonThrees[i].rank === topRank) count++;
    else break;
  }
  return { rank: topRank, count };
}

function checkFourOfAKind(pile) {
  return countTopRank(pile).count >= 4;
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
      isBot: false,
      ready: false,
      finished: false,
      finishOrder: null,
    });
  }
  return {
    players, drawPile: deck, pile: [], burned: [],
    phase: "lobby", currentPlayer: 0, finishCount: 0,
    lastBlind: null,
    // Out-of-turn 4-of-a-kind window: { rank, playedBy } or null
    fourWindow: null,
  };
}

const rooms = {};

function getRoomState(room, forPlayerIndex) {
  const g = room.game;
  const { rank: topRank, count: topCount } = countTopRank(g.pile);
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
      isBot: p.isBot,
      handCount: p.hand.length,
      faceUpCount: p.faceUp.length,
      faceDownCount: p.faceDown.length,
      faceUp: p.faceUp,
      faceDown: p.faceDown.map(() => ({ rank: "?", suit: "?" })),
      hand: i === forPlayerIndex ? p.hand : null,
    })),
    drawPileCount: g.drawPile.length,
    pile: g.pile,
    // Delay showing blind card in pile until animation finishes — send separately
    pileWithoutBlind: g.lastBlind ? g.pile.slice(0, -1) : g.pile,
    burned: g.burned.length,
    message: g.message || "",
    shithead: g.shithead,
    lastBlind: g.lastBlind || null,
    lastBlindPlayerName: g.lastBlindPlayerName || null,
    fourWindow: g.fourWindow, // { rank, count } — lets clients know 4-of-a-kind is available
    topRank, topCount,
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
  g.message = `🎉 ${g.players[idx].name} finished #${g.finishCount}!`;
  if (!checkWin(room)) nextPlayer(room);
}

function promoteIfNeeded(player, drawPile) {
  if (player.hand.length === 0 && drawPile.length === 0 && player.faceUp.length > 0) {
    player.hand.push(...player.faceUp);
    player.faceUp = [];
  }
}

function afterPlay(room, playerIdx) {
  const g = room.game;
  const player = g.players[playerIdx];
  g.fourWindow = null;

  while (player.hand.length < 3 && g.drawPile.length > 0)
    player.hand.push(g.drawPile.pop());
  promoteIfNeeded(player, g.drawPile);

  if (g.pile.length > 0) {
    if (g.pile[g.pile.length - 1].rank === "10") {
      g.burned.push(...g.pile); g.pile = [];
      g.message += " 💥 BURN! Play again.";
      promoteIfNeeded(player, g.drawPile);
      emitToAll(room);
      scheduleBotTurn(room);
      return;
    }
    if (checkFourOfAKind(g.pile)) {
      g.burned.push(...g.pile); g.pile = [];
      g.message += " 🔥 Four of a kind — BURN! Play again.";
      promoteIfNeeded(player, g.drawPile);
      emitToAll(room);
      scheduleBotTurn(room);
      return;
    }
  }

  if (player.hand.length === 0 && player.faceUp.length === 0 && player.faceDown.length === 0) {
    playerFinished(room, playerIdx);
    emitToAll(room);
    scheduleBotTurn(room);
    return;
  }

  // Check if out-of-turn 4-of-a-kind window opens
  // Any other non-finished player who holds cards matching topRank can jump in
  const { rank: topRank, count: topCount } = countTopRank(g.pile);
  if (topRank && topCount < 4) {
    const othersCanComplete = g.players.some((p, i) => {
      if (i === playerIdx || p.finished) return false;
      const src = p.hand.length > 0 ? p.hand : (p.faceUp.length > 0 ? p.faceUp : []);
      return src.some(c => c.rank === topRank);
    });
    if (othersCanComplete) {
      g.fourWindow = { rank: topRank, count: topCount };
      // Give a short window (8s) then auto-advance if nobody jumps in
      clearTimeout(room._fourWindowTimer);
      room._fourWindowTimer = setTimeout(() => {
        if (room.game.fourWindow) {
          room.game.fourWindow = null;
          nextPlayer(room);
          emitToAll(room);
          scheduleBotTurn(room);
        }
      }, 8000);
      emitToAll(room);
      // Check if bot should jump in
      scheduleBotFourOfAKind(room, playerIdx);
      return;
    }
  }

  nextPlayer(room);
  emitToAll(room);
  scheduleBotTurn(room);
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
    g.lastBlind = card;
    g.lastBlindPlayerName = player.name;
      g.pile.push(card);
      g.message = `${player.name} flipped blind: ${card.rank}${card.suit} ✓`;
    } else {
      player.hand.push(card, ...g.pile);
      g.pile = [];
      g.message = `${player.name} flipped ${card.rank}${card.suit} — can't play! Takes it + the pile.`;
      g.lastBlind = null;
      g.lastBlindPlayerName = null;
      nextPlayer(room);
      emitToAll(room);
      scheduleBotTurn(room);
      return;
    }
    afterPlay(room, playerIdx);
    return;
  }

  const source = player.hand.length > 0 ? player.hand : player.faceUp;
  const cards = cardIds.map(id => source.find(c => c.id === id)).filter(Boolean);

  if (!cards.length) { g.message = "❌ Those cards are no longer in your hand"; emitToAll(room); return; }
  if (!cards.every(c => c.rank === cards[0].rank)) { g.message = "❌ All played cards must be same rank"; emitToAll(room); return; }

  // Allow out-of-turn play ONLY if fourWindow is open and card matches
  const isMyTurn = g.currentPlayer === playerIdx;
  if (!isMyTurn) {
    if (!g.fourWindow || cards[0].rank !== g.fourWindow.rank) {
      io.to(player.socketId).emit("gameState", getRoomState(room, playerIdx));
      return;
    }
    // Valid out-of-turn 4-of-a-kind completion
    clearTimeout(room._fourWindowTimer);
  } else {
    if (!canPlay(cards[0], g.pile)) { g.message = `❌ Can't play ${cards[0].rank} here!`; emitToAll(room); return; }
  }

  cards.forEach(card => {
    const idx = source.findIndex(c => c.id === card.id);
    if (idx !== -1) source.splice(idx, 1);
  });
  g.pile.push(...cards);

  if (!isMyTurn) {
    // Out-of-turn 4-of-a-kind completion — this player now gets the turn
    g.currentPlayer = playerIdx;
    g.message = `${player.name} jumped in with ${cards.map(c=>c.rank+c.suit).join(" ")}! 🎯`;
  } else if (cards[0].rank === "3") {
    const { card: below } = getPileState(g.pile.slice(0, g.pile.length - cards.length));
    g.message = `${player.name} played ${cards.length > 1 ? cards.length+"×" : ""}3 👻 — beat ${below ? below.rank : "anything"}!`;
  } else {
    g.message = `${player.name} played ${cards.map(c => c.rank+c.suit).join(" ")}`;
  }

  afterPlay(room, playerIdx);
}

// ── Bot AI ──────────────────────────────────────────────────────────────────

function botChooseCards(player, pile) {
  // Get available source
  const source = player.hand.length > 0 ? player.hand : (player.faceUp.length > 0 ? player.faceUp : []);
  if (!source.length) return null; // must flip face-down

  // Group by rank
  const byRank = {};
  source.forEach(c => { if (!byRank[c.rank]) byRank[c.rank] = []; byRank[c.rank].push(c); });

  // Find playable ranks
  const playable = Object.entries(byRank).filter(([rank]) => canPlay({rank}, pile));
  if (!playable.length) return null;

  // Strategy: prefer to play lowest valid rank (but not 10/2 unless forced)
  // Sort playable by RANK_VALUE
  playable.sort((a, b) => (RANK_VALUE[a[0]]||50) - (RANK_VALUE[b[0]]||50));

  // Avoid playing 10 or 2 unless it's the only option
  const nonSpecial = playable.filter(([r]) => r !== "10" && r !== "2");
  const chosen = nonSpecial.length ? nonSpecial[0] : playable[0];

  return chosen[1]; // array of cards with that rank (play all of them)
}

function scheduleBotTurn(room) {
  const g = room.game;
  if (g.phase !== "play") return;
  const player = g.players[g.currentPlayer];
  if (!player || !player.isBot || player.finished) return;

  setTimeout(() => {
    if (room.game.phase !== "play") return;
    if (room.game.currentPlayer !== g.players.indexOf(player)) return;
    executeBotTurn(room, g.players.indexOf(player));
  }, 1200 + Math.random() * 800);
}

function executeBotTurn(room, botIdx) {
  const g = room.game;
  const player = g.players[botIdx];
  if (!player || !player.isBot) return;

  // Must flip face-down?
  if (player.hand.length === 0 && player.faceUp.length === 0 && player.faceDown.length > 0) {
    const pos = Math.floor(Math.random() * player.faceDown.length);
    const card = player.faceDown[pos];
    if (!card) return;
    processPlay(room, botIdx, [card.id], true);
    return;
  }

  const cards = botChooseCards(player, g.pile);
  if (!cards) {
    // Pick up pile
    player.hand.push(...g.pile);
    g.pile = [];
    g.fourWindow = null;
    g.message = `${player.name} picked up the pile.`;
    nextPlayer(room);
    emitToAll(room);
    scheduleBotTurn(room);
    return;
  }

  processPlay(room, botIdx, cards.map(c => c.id), false);
}

function scheduleBotFourOfAKind(room, lastPlayerIdx) {
  const g = room.game;
  if (!g.fourWindow) return;
  const rank = g.fourWindow.rank;

  // Find bot players (not the one who just played) who can complete
  g.players.forEach((p, i) => {
    if (!p.isBot || i === lastPlayerIdx || p.finished) return;
    const src = p.hand.length > 0 ? p.hand : (p.faceUp.length > 0 ? p.faceUp : []);
    const matching = src.filter(c => c.rank === rank);
    if (!matching.length) return;

    // Bot decides to jump in ~60% of the time
    if (Math.random() > 0.6) return;

    setTimeout(() => {
      if (!room.game.fourWindow || room.game.fourWindow.rank !== rank) return;
      processPlay(room, i, matching.map(c => c.id), false);
    }, 1500 + Math.random() * 1000);
  });
}

// ── Socket handlers ─────────────────────────────────────────────────────────

io.on("connection", (socket) => {

  socket.on("createRoom", ({ playerCount, playerName, vsBot }) => {
    const code = Math.random().toString(36).substr(2, 4).toUpperCase();
    const count = vsBot ? 2 : playerCount; // vs bot always 2 players
    const game = dealGame(count);
    game.players[0].name = playerName || "Player 1";
    game.players[0].socketId = socket.id;
    game.players[0].connected = true;
    if (vsBot) {
      game.players[1].name = "🤖 Bot";
      game.players[1].isBot = true;
      game.players[1].connected = true;
      game.players[1].ready = true;
      // Auto-place bot's 3 best cards face-up
      const hand = [...game.players[1].hand];
      hand.sort((a,b) => (RANK_VALUE[b.rank]||0)-(RANK_VALUE[a.rank]||0));
      const topThree = hand.slice(0,3);
      topThree.forEach(card => {
        const hi = game.players[1].hand.findIndex(c => c.id === card.id);
        if (hi !== -1) {
          game.players[1].faceUp.push(...game.players[1].hand.splice(hi,1));
        }
      });
    }
    rooms[code] = { code, game };
    socket.join(code);
    socket.emit("roomCreated", { code, playerIndex: 0 });
    if (vsBot) {
      game.phase = "swap";
      game.message = "Choose 3 cards to place face-up, then hit Ready!";
    }
    emitToAll(rooms[code]);
  });

  socket.on("joinRoom", ({ code, playerName }) => {
    const room = rooms[code.toUpperCase()];
    if (!room) { socket.emit("error", "Room not found"); return; }
    const g = room.game;
    if (g.phase !== "lobby") { socket.emit("error", "Game already started"); return; }
    const slot = g.players.findIndex(p => !p.connected);
    if (slot === -1) { socket.emit("error", "Room is full"); return; }
    g.players[slot].name = playerName || `Player ${slot+1}`;
    g.players[slot].socketId = socket.id;
    g.players[slot].connected = true;
    socket.join(code.toUpperCase());
    socket.emit("roomJoined", { code: code.toUpperCase(), playerIndex: slot });
    if (g.players.every(p => p.connected)) {
      g.phase = "swap";
      g.message = "All connected! Each choose 3 cards to place face-up.";
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
    player.faceUp.push(...player.hand.splice(hi, 1));
    emitToAll(room);
  });

  socket.on("returnToHand", ({ code, playerIndex, faceUpCardId }) => {
    const room = rooms[code];
    if (!room || room.game.phase !== "swap") return;
    const player = room.game.players[playerIndex];
    const fi = player.faceUp.findIndex(c => c.id === faceUpCardId);
    if (fi === -1) return;
    player.hand.push(...player.faceUp.splice(fi, 1));
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
      scheduleBotTurn(room);
    }
    emitToAll(room);
  });

  socket.on("playCards", ({ code, playerIndex, cardIds }) => {
    const room = rooms[code];
    if (!room || room.game.phase !== "play") return;
    const g = room.game;
    const player = g.players[playerIndex];

    // Allow out-of-turn only for 4-of-a-kind window
    if (g.currentPlayer !== playerIndex && !g.fourWindow) {
      io.to(socket.id).emit("gameState", getRoomState(room, playerIndex));
      return;
    }

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
    g.pile = []; g.fourWindow = null;
    g.message = `${player.name} picked up the pile.`;
    nextPlayer(room);
    emitToAll(room);
    scheduleBotTurn(room);
  });

  socket.on("passFourWindow", ({ code, playerIndex }) => {
    // Player explicitly passes on the 4-of-a-kind opportunity
    const room = rooms[code];
    if (!room || !room.game.fourWindow) return;
    // Just ignore — window will expire on its own timer
    // (or they can just not play; no action needed)
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
server.listen(PORT, "0.0.0.0", () => console.log(`Shithead server listening on 0.0.0.0:${PORT}`));

