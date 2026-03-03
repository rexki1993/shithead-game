const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(express.static(path.join(__dirname, "../client/public")));

// Card order: A(1) < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < 2
// 10 = always playable (not on 10), burns pile
// 2  = always playable (not on 2), after 2 next can play anything except 2 or A
// 7  = next player must play strictly lower than 7
// 3  = transparent
const RANK_VALUE = { "A":1,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"2":15 };
const SUITS = ["spades","hearts","diamonds","clubs"];
const SUIT_SYMBOLS = { "spades":"spade","hearts":"heart","diamonds":"diamond","clubs":"club" };

function createDeck() {
  const suits = ["\u2660","\u2665","\u2666","\u2663"];
  const deck = [];
  for (let s = 0; s < suits.length; s++) {
    const suit = suits[s];
    const ranks = Object.keys(RANK_VALUE);
    for (let r = 0; r < ranks.length; r++) {
      const rank = ranks[r];
      deck.push({ rank: rank, suit: suit, id: rank + suit + Math.random().toString(36).substr(2, 4) });
    }
  }
  return deck;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

// Walk back through pile skipping transparent 3s.
function getPileState(pile) {
  for (let i = pile.length - 1; i >= 0; i--) {
    const r = pile[i].rank;
    if (r === "3") continue;
    return { card: pile[i], sevenActive: r === "7", twoActive: r === "2" };
  }
  return { card: null, sevenActive: false, twoActive: false };
}

function canPlay(card, pile) {
  if (!pile.length) return true;

  const last = pile[pile.length - 1];

  // Same rank never allowed
  if (card.rank === last.rank) return false;

  // 10 always playable (same rank blocked above)
  if (card.rank === "10") return true;

  // 3 transparent (same rank blocked above)
  if (card.rank === "3") return true;

  // 2 always playable (same rank blocked above)
  if (card.rank === "2") return true;

  const state = getPileState(pile);
  const top = state.card;
  const sevenActive = state.sevenActive;
  const twoActive = state.twoActive;

  if (!top) return true;

  // After 2: anything except 2 (blocked) and A
  if (twoActive) {
    return card.rank !== "A";
  }

  // After 7: strictly lower than 7
  if (sevenActive) {
    return RANK_VALUE[card.rank] < RANK_VALUE["7"];
  }

  // Ace wraps on K
  if (card.rank === "A" && top.rank === "K") return true;

  // Normal: strictly higher
  return RANK_VALUE[card.rank] > RANK_VALUE[top.rank];
}

function countTopRank(pile) {
  const nonThrees = [];
  for (let i = 0; i < pile.length; i++) {
    if (pile[i].rank !== "3") nonThrees.push(pile[i]);
  }
  if (!nonThrees.length) return { rank: null, count: 0 };
  const topRank = nonThrees[nonThrees.length - 1].rank;
  let count = 0;
  for (let i = nonThrees.length - 1; i >= 0; i--) {
    if (nonThrees[i].rank === topRank) count++;
    else break;
  }
  return { rank: topRank, count: count };
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
      name: "Player " + (i + 1),
      socketId: null,
      connected: false,
      isBot: false,
      ready: false,
      finished: false,
      finishOrder: null
    });
  }
  return {
    players: players,
    drawPile: deck,
    pile: [],
    burned: [],
    phase: "lobby",
    currentPlayer: 0,
    finishCount: 0,
    lastBlind: null,
    lastBlindPlayerName: null,
    fourWindow: null
  };
}

const rooms = {};

function getRoomState(room, forPlayerIndex) {
  const g = room.game;
  const topInfo = countTopRank(g.pile);
  return {
    roomCode: room.code,
    phase: g.phase,
    currentPlayer: g.currentPlayer,
    players: g.players.map(function(p, i) {
      return {
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
        faceDown: p.faceDown.map(function() { return { rank: "?", suit: "?" }; }),
        hand: i === forPlayerIndex ? p.hand : null
      };
    }),
    drawPileCount: g.drawPile.length,
    pile: g.pile,
    pileWithoutBlind: g.lastBlind ? g.pile.slice(0, -1) : g.pile,
    burned: g.burned.length,
    message: g.message || "",
    shithead: g.shithead,
    lastBlind: g.lastBlind || null,
    lastBlindPlayerName: g.lastBlindPlayerName || null,
    fourWindow: g.fourWindow || null,
    topRank: topInfo.rank,
    topCount: topInfo.count
  };
}

function emitToAll(room) {
  for (let i = 0; i < room.game.players.length; i++) {
    const p = room.game.players[i];
    if (p.socketId) {
      io.to(p.socketId).emit("gameState", getRoomState(room, i));
    }
  }
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
  const active = [];
  for (let i = 0; i < g.players.length; i++) {
    if (!g.players[i].finished) active.push(g.players[i]);
  }
  if (active.length === 1) {
    g.shithead = active[0].name;
    g.phase = "ended";
    g.message = "\uD83D\uDCA9 " + active[0].name + " is the Shithead!";
    return true;
  }
  return false;
}

function playerFinished(room, idx) {
  const g = room.game;
  g.players[idx].finished = true;
  g.finishCount = (g.finishCount || 0) + 1;
  g.players[idx].finishOrder = g.finishCount;
  g.message = "\uD83C\uDF89 " + g.players[idx].name + " finished in position #" + g.finishCount + "!";
  if (!checkWin(room)) nextPlayer(room);
}

function promoteIfNeeded(player, drawPile) {
  if (player.hand.length === 0 && drawPile.length === 0 && player.faceUp.length > 0) {
    for (let i = 0; i < player.faceUp.length; i++) {
      player.hand.push(player.faceUp[i]);
    }
    player.faceUp = [];
  }
}

function afterPlay(room, playerIdx) {
  const g = room.game;
  const player = g.players[playerIdx];
  g.fourWindow = null;

  while (player.hand.length < 3 && g.drawPile.length > 0) {
    player.hand.push(g.drawPile.pop());
  }
  promoteIfNeeded(player, g.drawPile);

  if (g.pile.length > 0) {
    if (g.pile[g.pile.length - 1].rank === "10") {
      for (let i = 0; i < g.pile.length; i++) g.burned.push(g.pile[i]);
      g.pile = [];
      g.message += " \uD83D\uDCA5 BURN! Play again.";
      promoteIfNeeded(player, g.drawPile);
      emitToAll(room);
      scheduleBotTurn(room);
      return;
    }
    if (checkFourOfAKind(g.pile)) {
      for (let i = 0; i < g.pile.length; i++) g.burned.push(g.pile[i]);
      g.pile = [];
      g.message += " \uD83D\uDD25 Four of a kind -- BURN! Play again.";
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

  // Check if 4-of-a-kind window opens for other players
  const topInfo = countTopRank(g.pile);
  if (topInfo.rank && topInfo.count >= 1 && topInfo.count < 4) {
    let othersCanComplete = false;
    for (let i = 0; i < g.players.length; i++) {
      if (i === playerIdx || g.players[i].finished) continue;
      const p = g.players[i];
      const src = p.hand.length > 0 ? p.hand : (p.faceUp.length > 0 ? p.faceUp : []);
      for (let j = 0; j < src.length; j++) {
        if (src[j].rank === topInfo.rank) { othersCanComplete = true; break; }
      }
      if (othersCanComplete) break;
    }
    if (othersCanComplete) {
      g.fourWindow = { rank: topInfo.rank, count: topInfo.count };
      clearTimeout(room._fourWindowTimer);
      room._fourWindowTimer = setTimeout(function() {
        if (room.game.fourWindow) {
          room.game.fourWindow = null;
          nextPlayer(room);
          emitToAll(room);
          scheduleBotTurn(room);
        }
      }, 8000);
      emitToAll(room);
      scheduleBotFourOfAKind(room, playerIdx);
      return;
    }
  }

  nextPlayer(room);
  emitToAll(room);
  scheduleBotTurn(room);
}

function processPlay(room, playerIdx, cardIds, fromFaceDown) {
  const g = room.game;
  const player = g.players[playerIdx];
  g.lastBlind = null;
  g.lastBlindPlayerName = null;

  if (fromFaceDown) {
    let fdIdx = -1;
    for (let i = 0; i < player.faceDown.length; i++) {
      if (player.faceDown[i].id === cardIds[0]) { fdIdx = i; break; }
    }
    if (fdIdx === -1) { g.message = "Invalid face-down card"; emitToAll(room); return; }
    const card = player.faceDown[fdIdx];
    player.faceDown.splice(fdIdx, 1);
    g.lastBlind = card;
    g.lastBlindPlayerName = player.name;

    if (canPlay(card, g.pile)) {
      g.pile.push(card);
      g.message = player.name + " flipped blind: " + card.rank + card.suit + " \u2713";
      afterPlay(room, playerIdx);
    } else {
      player.hand.push(card);
      for (let i = 0; i < g.pile.length; i++) player.hand.push(g.pile[i]);
      g.pile = [];
      g.message = player.name + " flipped " + card.rank + card.suit + " -- can't play! Takes it + the pile.";
      g.lastBlind = null;
      g.lastBlindPlayerName = null;
      nextPlayer(room);
      emitToAll(room);
      scheduleBotTurn(room);
    }
    return;
  }

  const source = player.hand.length > 0 ? player.hand : player.faceUp;
  const cards = [];
  for (let i = 0; i < cardIds.length; i++) {
    for (let j = 0; j < source.length; j++) {
      if (source[j].id === cardIds[i]) { cards.push(source[j]); break; }
    }
  }

  if (!cards.length) { g.message = "Those cards are no longer in your hand"; emitToAll(room); return; }

  let allSameRank = true;
  for (let i = 1; i < cards.length; i++) {
    if (cards[i].rank !== cards[0].rank) { allSameRank = false; break; }
  }
  if (!allSameRank) { g.message = "All played cards must be the same rank"; emitToAll(room); return; }

  const isMyTurn = g.currentPlayer === playerIdx;
  if (!isMyTurn) {
    if (!g.fourWindow || cards[0].rank !== g.fourWindow.rank) {
      io.to(player.socketId).emit("gameState", getRoomState(room, playerIdx));
      return;
    }
    clearTimeout(room._fourWindowTimer);
  } else {
    if (!canPlay(cards[0], g.pile)) { g.message = "Can't play " + cards[0].rank + " here!"; emitToAll(room); return; }
  }

  for (let i = 0; i < cards.length; i++) {
    for (let j = 0; j < source.length; j++) {
      if (source[j].id === cards[i].id) { source.splice(j, 1); break; }
    }
    g.pile.push(cards[i]);
  }

  if (!isMyTurn) {
    g.currentPlayer = playerIdx;
    const cardStr = cards.map(function(c) { return c.rank + c.suit; }).join(" ");
    g.message = player.name + " jumped in with " + cardStr + "! \uD83C\uDFAF";
  } else if (cards[0].rank === "3") {
    const pileBelow = g.pile.slice(0, g.pile.length - cards.length);
    const below = getPileState(pileBelow).card;
    g.message = player.name + " played " + (cards.length > 1 ? cards.length + "x" : "") + "3 -- beat " + (below ? below.rank : "anything") + "!";
  } else {
    g.message = player.name + " played " + cards.map(function(c) { return c.rank + c.suit; }).join(" ");
  }

  afterPlay(room, playerIdx);
}

// ── Bot AI ────────────────────────────────────────────────────────────────────

function botChooseCards(player, pile) {
  const source = player.hand.length > 0 ? player.hand : (player.faceUp.length > 0 ? player.faceUp : []);
  if (!source.length) return null;

  const byRank = {};
  for (let i = 0; i < source.length; i++) {
    const r = source[i].rank;
    if (!byRank[r]) byRank[r] = [];
    byRank[r].push(source[i]);
  }

  const playableRanks = Object.keys(byRank).filter(function(rank) {
    return canPlay({ rank: rank }, pile);
  });
  if (!playableRanks.length) return null;

  playableRanks.sort(function(a, b) {
    return (RANK_VALUE[a] || 50) - (RANK_VALUE[b] || 50);
  });

  const nonSpecial = playableRanks.filter(function(r) { return r !== "10" && r !== "2"; });
  const chosen = nonSpecial.length ? nonSpecial[0] : playableRanks[0];
  return byRank[chosen];
}

function scheduleBotTurn(room) {
  const g = room.game;
  if (g.phase !== "play") return;
  const botIdx = g.currentPlayer;
  const player = g.players[botIdx];
  if (!player || !player.isBot || player.finished) return;
  setTimeout(function() {
    if (room.game.phase !== "play") return;
    if (room.game.currentPlayer !== botIdx) return;
    executeBotTurn(room, botIdx);
  }, 1200 + Math.floor(Math.random() * 800));
}

function executeBotTurn(room, botIdx) {
  const g = room.game;
  const player = g.players[botIdx];
  if (!player || !player.isBot) return;

  if (player.hand.length === 0 && player.faceUp.length === 0 && player.faceDown.length > 0) {
    const pos = Math.floor(Math.random() * player.faceDown.length);
    const card = player.faceDown[pos];
    if (!card) return;
    processPlay(room, botIdx, [card.id], true);
    return;
  }

  const cards = botChooseCards(player, g.pile);
  if (!cards) {
    for (let i = 0; i < g.pile.length; i++) player.hand.push(g.pile[i]);
    g.pile = [];
    g.fourWindow = null;
    g.message = player.name + " picked up the pile.";
    nextPlayer(room);
    emitToAll(room);
    scheduleBotTurn(room);
    return;
  }

  processPlay(room, botIdx, cards.map(function(c) { return c.id; }), false);
}

function scheduleBotFourOfAKind(room, lastPlayerIdx) {
  const g = room.game;
  if (!g.fourWindow) return;
  const rank = g.fourWindow.rank;

  for (let i = 0; i < g.players.length; i++) {
    const p = g.players[i];
    if (!p.isBot || i === lastPlayerIdx || p.finished) continue;
    const src = p.hand.length > 0 ? p.hand : (p.faceUp.length > 0 ? p.faceUp : []);
    const matching = src.filter(function(c) { return c.rank === rank; });
    if (!matching.length) continue;
    if (Math.random() > 0.6) continue;
    (function(botI, matchCards) {
      setTimeout(function() {
        if (!room.game.fourWindow || room.game.fourWindow.rank !== rank) return;
        processPlay(room, botI, matchCards.map(function(c) { return c.id; }), false);
      }, 1500 + Math.floor(Math.random() * 1000));
    })(i, matching);
  }
}

// ── Socket handlers ───────────────────────────────────────────────────────────

io.on("connection", function(socket) {

  socket.on("createRoom", function(data) {
    const playerCount = data.playerCount;
    const playerName = data.playerName;
    const vsBot = data.vsBot;
    const code = Math.random().toString(36).substr(2, 4).toUpperCase();
    const count = vsBot ? 2 : playerCount;
    const game = dealGame(count);
    game.players[0].name = playerName || "Player 1";
    game.players[0].socketId = socket.id;
    game.players[0].connected = true;

    if (vsBot) {
      game.players[1].name = "Bot";
      game.players[1].isBot = true;
      game.players[1].connected = true;
      game.players[1].ready = true;
      const botHand = game.players[1].hand.slice();
      botHand.sort(function(a, b) { return (RANK_VALUE[b.rank] || 0) - (RANK_VALUE[a.rank] || 0); });
      const topThree = botHand.slice(0, 3);
      for (let k = 0; k < topThree.length; k++) {
        const card = topThree[k];
        for (let j = 0; j < game.players[1].hand.length; j++) {
          if (game.players[1].hand[j].id === card.id) {
            game.players[1].faceUp.push(game.players[1].hand.splice(j, 1)[0]);
            break;
          }
        }
      }
      game.phase = "swap";
      game.message = "Choose 3 cards to place face-up, then hit Ready!";
    }

    rooms[code] = { code: code, game: game };
    socket.join(code);
    socket.emit("roomCreated", { code: code, playerIndex: 0 });
    emitToAll(rooms[code]);
  });

  socket.on("joinRoom", function(data) {
    const room = rooms[data.code.toUpperCase()];
    if (!room) { socket.emit("error", "Room not found"); return; }
    const g = room.game;
    if (g.phase !== "lobby") { socket.emit("error", "Game already started"); return; }
    let slot = -1;
    for (let i = 0; i < g.players.length; i++) {
      if (!g.players[i].connected) { slot = i; break; }
    }
    if (slot === -1) { socket.emit("error", "Room is full"); return; }
    g.players[slot].name = data.playerName || ("Player " + (slot + 1));
    g.players[slot].socketId = socket.id;
    g.players[slot].connected = true;
    socket.join(data.code.toUpperCase());
    socket.emit("roomJoined", { code: data.code.toUpperCase(), playerIndex: slot });
    let allConnected = true;
    for (let i = 0; i < g.players.length; i++) {
      if (!g.players[i].connected) { allConnected = false; break; }
    }
    if (allConnected) {
      g.phase = "swap";
      g.message = "All players connected! Each choose 3 cards to place face-up.";
    }
    emitToAll(room);
  });

  socket.on("rejoinRoom", function(data) {
    const room = rooms[data.code];
    if (!room) { socket.emit("error", "Room not found -- game may have ended"); return; }
    const player = room.game.players[data.playerIndex];
    if (!player) { socket.emit("error", "Invalid player"); return; }
    player.socketId = socket.id;
    player.connected = true;
    socket.join(data.code);
    room.game.message = player.name + " reconnected.";
    socket.emit("gameState", getRoomState(room, data.playerIndex));
    emitToAll(room);
  });

  socket.on("placeFaceUp", function(data) {
    const room = rooms[data.code];
    if (!room || room.game.phase !== "swap") return;
    const player = room.game.players[data.playerIndex];
    if (player.faceUp.length >= 3) return;
    let hi = -1;
    for (let i = 0; i < player.hand.length; i++) {
      if (player.hand[i].id === data.handCardId) { hi = i; break; }
    }
    if (hi === -1) return;
    player.faceUp.push(player.hand.splice(hi, 1)[0]);
    emitToAll(room);
  });

  socket.on("returnToHand", function(data) {
    const room = rooms[data.code];
    if (!room || room.game.phase !== "swap") return;
    const player = room.game.players[data.playerIndex];
    let fi = -1;
    for (let i = 0; i < player.faceUp.length; i++) {
      if (player.faceUp[i].id === data.faceUpCardId) { fi = i; break; }
    }
    if (fi === -1) return;
    player.hand.push(player.faceUp.splice(fi, 1)[0]);
    emitToAll(room);
  });

  socket.on("readyToPlay", function(data) {
    const room = rooms[data.code];
    if (!room || room.game.phase !== "swap") return;
    const player = room.game.players[data.playerIndex];
    if (player.faceUp.length !== 3) { socket.emit("error", "Place exactly 3 cards face-up first!"); return; }
    if (player.ready) return;
    player.ready = true;
    let allReady = true;
    for (let i = 0; i < room.game.players.length; i++) {
      if (!room.game.players[i].ready) { allReady = false; break; }
    }
    if (allReady) {
      room.game.phase = "play";
      room.game.message = "Game started! Player 1 goes first.";
      scheduleBotTurn(room);
    }
    emitToAll(room);
  });

  socket.on("playCards", function(data) {
    const room = rooms[data.code];
    if (!room || room.game.phase !== "play") return;
    const g = room.game;
    const playerIndex = data.playerIndex;
    const cardIds = data.cardIds;
    const player = g.players[playerIndex];

    if (g.currentPlayer !== playerIndex && !g.fourWindow) {
      io.to(socket.id).emit("gameState", getRoomState(room, playerIndex));
      return;
    }

    const fromFaceDown = player.hand.length === 0 && player.faceUp.length === 0;
    if (fromFaceDown) {
      const resolvedIds = [];
      for (let i = 0; i < cardIds.length; i++) {
        const id = cardIds[i];
        if (typeof id === "string" && id.indexOf("__fd__") === 0) {
          const pos = parseInt(id.replace("__fd__", ""), 10);
          if (player.faceDown[pos]) resolvedIds.push(player.faceDown[pos].id);
        } else {
          resolvedIds.push(id);
        }
      }
      processPlay(room, playerIndex, resolvedIds, true);
    } else {
      processPlay(room, playerIndex, cardIds, false);
    }
  });

  socket.on("pickUpPile", function(data) {
    const room = rooms[data.code];
    if (!room || room.game.phase !== "play") return;
    if (room.game.currentPlayer !== data.playerIndex) return;
    const g = room.game;
    const player = g.players[data.playerIndex];
    for (let i = 0; i < g.pile.length; i++) player.hand.push(g.pile[i]);
    g.pile = [];
    g.fourWindow = null;
    g.message = player.name + " picked up the pile.";
    nextPlayer(room);
    emitToAll(room);
    scheduleBotTurn(room);
  });

  socket.on("disconnect", function() {
    const codes = Object.keys(rooms);
    for (let k = 0; k < codes.length; k++) {
      const room = rooms[codes[k]];
      for (let i = 0; i < room.game.players.length; i++) {
        if (room.game.players[i].socketId === socket.id) {
          room.game.players[i].connected = false;
          room.game.players[i].socketId = null;
          emitToAll(room);
          break;
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, function() {
  console.log("Shithead server on port " + PORT);
});
