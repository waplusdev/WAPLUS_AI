'use strict';

const { sendHtmlPrimitive } = require('../../core/ui');

const FILES = 'abcdefgh';
const START_BOARD = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const PIECES = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
};

const games = global.__waplusChessGames ||= new Map();

function cloneBoard(board) {
  return board.map(row => row.slice());
}

function key(row, col) {
  return `${FILES[col]}${8 - row}`;
}

function parseSquare(square) {
  if (!/^[a-h][1-8]$/.test(square)) return null;
  return { row: 8 - Number(square[1]), col: FILES.indexOf(square[0]) };
}

function inside(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function colorOf(piece) {
  if (!piece) return null;
  return piece === piece.toUpperCase() ? 'white' : 'black';
}

function opposite(color) {
  return color === 'white' ? 'black' : 'white';
}

function copyState(state) {
  return {
    board: cloneBoard(state.board),
    turn: state.turn,
    castling: { ...state.castling },
    enPassant: state.enPassant ? { ...state.enPassant } : null,
    halfmove: state.halfmove,
    fullmove: state.fullmove
  };
}

function locateKing(state, color) {
  const king = color === 'white' ? 'K' : 'k';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (state.board[row][col] === king) return { row, col };
    }
  }
  return null;
}

function isSquareAttacked(state, row, col, byColor) {
  const board = state.board;
  const pawn = byColor === 'white' ? 'P' : 'p';
  const pawnRow = byColor === 'white' ? row + 1 : row - 1;
  for (const dc of [-1, 1]) {
    if (inside(pawnRow, col + dc) && board[pawnRow][col + dc] === pawn) return true;
  }

  const knight = byColor === 'white' ? 'N' : 'n';
  for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
    if (inside(row + dr, col + dc) && board[row + dr][col + dc] === knight) return true;
  }

  const king = byColor === 'white' ? 'K' : 'k';
  for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
    if (inside(row + dr, col + dc) && board[row + dr][col + dc] === king) return true;
  }

  const rays = [
    [[-1, 0], [1, 0]],
    [[0, -1], [0, 1]],
    [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  ];
  for (let group = 0; group < rays.length; group++) {
    for (const [dr, dc] of rays[group]) {
      let r = row + dr;
      let c = col + dc;
      while (inside(r, c)) {
        const piece = board[r][c];
        if (piece) {
          if (colorOf(piece) === byColor) {
            const type = piece.toUpperCase();
            if (type === 'Q' || (group < 2 && type === 'R') || (group === 2 && type === 'B')) return true;
          }
          break;
        }
        r += dr;
        c += dc;
      }
    }
  }
  return false;
}

function inCheck(state, color) {
  const king = locateKing(state, color);
  return !king || isSquareAttacked(state, king.row, king.col, opposite(color));
}

function pseudoMoves(state, from) {
  const piece = state.board[from.row][from.col];
  if (!piece) return [];
  const color = colorOf(piece);
  const type = piece.toUpperCase();
  const moves = [];
  const add = (row, col, extra = {}) => {
    if (!inside(row, col)) return false;
    const target = state.board[row][col];
    if (!target) moves.push({ from, to: { row, col }, ...extra });
    else if (colorOf(target) !== color && target.toUpperCase() !== 'K') moves.push({ from, to: { row, col }, capture: true, ...extra });
    return !target;
  };

  if (type === 'P') {
    const dir = color === 'white' ? -1 : 1;
    const start = color === 'white' ? 6 : 1;
    const promotionRow = color === 'white' ? 0 : 7;
    if (inside(from.row + dir, from.col) && !state.board[from.row + dir][from.col]) {
      moves.push({ from, to: { row: from.row + dir, col: from.col }, promotion: from.row + dir === promotionRow });
      if (from.row === start && !state.board[from.row + dir * 2][from.col]) {
        moves.push({ from, to: { row: from.row + dir * 2, col: from.col }, pawnDouble: true });
      }
    }
    for (const dc of [-1, 1]) {
      const row = from.row + dir;
      const col = from.col + dc;
      if (!inside(row, col)) continue;
      const target = state.board[row][col];
      const enPassant = state.enPassant && state.enPassant.row === row && state.enPassant.col === col;
      if ((target && colorOf(target) !== color && target.toUpperCase() !== 'K') || enPassant) {
        moves.push({ from, to: { row, col }, capture: Boolean(target), enPassant, promotion: row === promotionRow });
      }
    }
  } else if (type === 'N') {
    for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) add(from.row + dr, from.col + dc);
  } else if (type === 'K') {
    for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0]]) add(from.row + dr, from.col + dc);
    const enemy = opposite(color);
    if (!inCheck(state, color) && from.col === 4) {
      const rank = color === 'white' ? 7 : 0;
      const rights = color === 'white' ? ['K', 'Q'] : ['k', 'q'];
      if (from.row === rank && state.board[rank][7] === (color === 'white' ? 'R' : 'r') && state.castling[rights[0]] && !state.board[rank][5] && !state.board[rank][6] && !isSquareAttacked(state, rank, 5, enemy) && !isSquareAttacked(state, rank, 6, enemy)) {
        moves.push({ from, to: { row: rank, col: 6 }, castle: 'king' });
      }
      if (from.row === rank && state.board[rank][0] === (color === 'white' ? 'R' : 'r') && state.castling[rights[1]] && !state.board[rank][1] && !state.board[rank][2] && !state.board[rank][3] && !isSquareAttacked(state, rank, 3, enemy) && !isSquareAttacked(state, rank, 2, enemy)) {
        moves.push({ from, to: { row: rank, col: 2 }, castle: 'queen' });
      }
    }
  } else {
    const directions = type === 'B' ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : type === 'R' ? [[-1, 0], [1, 0], [0, -1], [0, 1]] : [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of directions) {
      let row = from.row + dr;
      let col = from.col + dc;
      while (add(row, col)) { row += dr; col += dc; }
    }
  }
  return moves;
}

function applyMove(state, move, promotion = 'Q') {
  const next = copyState(state);
  const piece = next.board[move.from.row][move.from.col];
  const color = colorOf(piece);
  const type = piece.toUpperCase();
  next.board[move.from.row][move.from.col] = null;
  if (move.enPassant) next.board[move.from.row][move.to.col] = null;

  if (move.castle) {
    const rank = color === 'white' ? 7 : 0;
    const rookFrom = move.castle === 'king' ? 7 : 0;
    const rookTo = move.castle === 'king' ? 5 : 3;
    next.board[rank][rookTo] = next.board[rank][rookFrom];
    next.board[rank][rookFrom] = null;
  }

  next.board[move.to.row][move.to.col] = move.promotion ? (color === 'white' ? promotion.toUpperCase() : promotion.toLowerCase()) : piece;
  next.enPassant = move.pawnDouble ? { row: (move.from.row + move.to.row) / 2, col: move.from.col } : null;
  if (type === 'K') {
    if (color === 'white') { next.castling.K = false; next.castling.Q = false; }
    else { next.castling.k = false; next.castling.q = false; }
  }
  if (type === 'R') {
    if (move.from.row === 7 && move.from.col === 0) next.castling.Q = false;
    if (move.from.row === 7 && move.from.col === 7) next.castling.K = false;
    if (move.from.row === 0 && move.from.col === 0) next.castling.q = false;
    if (move.from.row === 0 && move.from.col === 7) next.castling.k = false;
  }
  const captured = state.board[move.to.row][move.to.col];
  if (captured?.toUpperCase() === 'R') {
    if (move.to.row === 7 && move.to.col === 0) next.castling.Q = false;
    if (move.to.row === 7 && move.to.col === 7) next.castling.K = false;
    if (move.to.row === 0 && move.to.col === 0) next.castling.q = false;
    if (move.to.row === 0 && move.to.col === 7) next.castling.k = false;
  }
  next.halfmove = type === 'P' || captured || move.enPassant ? 0 : state.halfmove + 1;
  next.fullmove = color === 'black' ? state.fullmove + 1 : state.fullmove;
  next.turn = opposite(color);
  return next;
}

function legalMoves(state, color = state.turn) {
  const result = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (colorOf(state.board[row][col]) !== color) continue;
      const from = { row, col };
      for (const move of pseudoMoves(state, from)) {
        const next = applyMove(state, move);
        if (!inCheck(next, color)) result.push(move);
      }
    }
  }
  return result;
}

function initialState() {
  return { board: cloneBoard(START_BOARD), turn: 'white', castling: { K: true, Q: true, k: true, q: true }, enPassant: null, halfmove: 0, fullmove: 1 };
}

function playerName(player) {
  return player?.name || `@${String(player?.jid || '').split('@')[0]}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function statusFor(game) {
  if (game.result) return game.result;
  const moves = legalMoves(game.state);
  if (!moves.length) return inCheck(game.state, game.state.turn) ? `${game.state.turn === 'white' ? 'White' : 'Black'} is checkmated.` : 'Draw by stalemate.';
  if (game.state.halfmove >= 100) return 'Draw by the fifty-move rule.';
  return inCheck(game.state, game.state.turn) ? `${game.state.turn === 'white' ? 'White' : 'Black'} is in check.` : `${game.state.turn === 'white' ? 'White' : 'Black'} to move.`;
}

function gameHtml(game, prefix) {
  const state = game.state;
  const legal = legalMoves(state);
  const status = statusFor(game);
  const turn = state.turn === 'white' ? game.white : game.black;
  const squares = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col];
      const light = (row + col) % 2 === 0;
      const isLast = game.lastMove && ((game.lastMove.from.row === row && game.lastMove.from.col === col) || (game.lastMove.to.row === row && game.lastMove.to.col === col));
      const legalTarget = legal.some(move => move.to.row === row && move.to.col === col);
      squares.push(`<div class="sq ${light ? 'light' : 'dark'} ${isLast ? 'last' : ''}"><span class="coord">${col === 0 ? 8 - row : ''}${row === 7 ? FILES[col] : ''}</span><span class="piece ${colorOf(piece) || ''}">${piece ? PIECES[piece] : legalTarget ? '·' : ''}</span></div>`);
    }
  }
  const playerLine = game.black ? `♙ ${escapeHtml(playerName(game.white))}  vs  ♟ ${escapeHtml(playerName(game.black))}` : `♙ ${escapeHtml(playerName(game.white))}  vs  waiting for Black`;
  const controls = game.result ? `${escapeHtml(status)}<br><small>Start another game with <b>${escapeHtml(prefix)}chess new</b>.</small>` : `${escapeHtml(status)}<br><small>${escapeHtml(prefix)}chess e2e4 · ${escapeHtml(prefix)}chess resign · ${escapeHtml(prefix)}chess help</small>`;
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
*{box-sizing:border-box}body{margin:0;padding:10px;background:#071314;color:#d9fff7;font-family:system-ui,Arial,sans-serif}.wrap{max-width:390px;margin:auto;border:1px solid #18d8b5;border-radius:18px;padding:14px;background:linear-gradient(145deg,#102d2d,#071010);box-shadow:0 0 24px #00d9a633}.title{text-align:center;color:#43f5cc;font-weight:800;letter-spacing:2px;font-size:16px}.players{text-align:center;font-size:11px;color:#b8e8dd;margin:8px 0 12px}.board{display:grid;grid-template-columns:repeat(8,1fr);border:3px solid #1aa98d;border-radius:8px;overflow:hidden;max-width:360px;margin:auto}.sq{aspect-ratio:1;display:flex;align-items:center;justify-content:center;position:relative}.light{background:#b9e4ce;color:#163b31}.dark{background:#347b68;color:#effff9}.last{box-shadow:inset 0 0 0 3px #ffd166}.piece{font-family:"DejaVu Sans",serif;font-size:clamp(25px,8vw,39px);line-height:1;text-shadow:1px 2px 2px #0008}.piece.white{color:#fff;text-shadow:1px 2px 2px #000}.piece.black{color:#17211f;text-shadow:0 1px 1px #d9fff7}.coord{position:absolute;top:2px;left:3px;font:700 8px monospace;opacity:.65}.status{text-align:center;color:#eafff8;font-size:12px;line-height:1.55;margin-top:12px}.hint{text-align:center;color:#78ad9e;font-size:9px;margin-top:8px}.brand{text-align:center;color:#4c8277;font-size:9px;margin-top:12px}</style></head><body><main class="wrap"><div class="title">♔ WAPlus CHESS ♚</div><div class="players">${playerLine}</div><div class="board">${squares.join('')}</div><div class="status">${controls}</div><div class="brand">Gen 4 Rich HTML · ${state.fullmove}.${state.turn === 'white' ? ' White' : ' Black'}</div></main></body></html>`;
}

function textBoard(game) {
  const rows = game.state.board.map((row, index) => `${8 - index} ${row.map(piece => piece ? PIECES[piece] : '·').join(' ')}`).join('\n');
  return `♔ WAPlus CHESS ♚\n\n${rows}\n  a b c d e f g h\n\n${statusFor(game)}`;
}

function findMove(state, notation) {
  const clean = notation.toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, '');
  const match = clean.match(/^([a-h][1-8])(?:-)?([a-h][1-8])(?:=?([qrbn]))?$/);
  if (!match) return null;
  const from = parseSquare(match[1]);
  const to = parseSquare(match[2]);
  const candidates = legalMoves(state).filter(move => move.from.row === from.row && move.from.col === from.col && move.to.row === to.row && move.to.col === to.col);
  if (!candidates.length) return null;
  return { move: candidates[0], promotion: (match[3] || 'q').toUpperCase() };
}

async function render(sock, game, prefix, reply) {
  try {
    await sendHtmlPrimitive(sock, game.chat, gameHtml(game, prefix));
  } catch (error) {
    console.error('[CHESS:HTML]', error.stack || error);
    await reply(textBoard(game));
  }
}

function newGame(chat, sender, name) {
  return { chat, state: initialState(), white: { jid: sender, name }, black: null, lastMove: null, result: null };
}

module.exports = {
  name: 'chess',
  alias: ['chessgame'],
  desc: 'Play a two-player chess game in a Gen 4 rich HTML board',
  category: 'Games',
  cooldown: 700,

  async execute(sock, message, ctx) {
    const { args, reply, prefix, chat, sender } = ctx;
    const action = String(args[0] || '').toLowerCase();
    const displayName = message.pushName || `@${String(sender || '').split('@')[0]}`;
    let game = games.get(chat);

    if (['help', '?'].includes(action)) {
      return reply(`♔ *WAPlus CHESS* ♚\n\n${prefix}chess — start/show the board\n${prefix}chess join — join as Black\n${prefix}chess e2e4 — make a move\n${prefix}chess e7e8q — promote to a queen\n${prefix}chess resign — resign the game\n${prefix}chess leave — close the game\n\nTwo players share one game per chat. Moves are checked for legality.`);
    }

    if (!game || action === 'new' || action === 'start') {
      game = newGame(chat, sender, displayName);
      games.set(chat, game);
      return render(sock, game, prefix, reply);
    }

    if (action === 'join') {
      if (game.black) return reply('♟ Black is already taken. Watch the board or start a new game.');
      if (game.white.jid === sender) return reply('You are already playing as White.');
      game.black = { jid: sender, name: displayName };
      return render(sock, game, prefix, reply);
    }

    if (action === 'leave' || action === 'close') {
      if (![game.white?.jid, game.black?.jid].includes(sender)) return reply('Only a player can close this game.');
      games.delete(chat);
      return reply(`♔ Chess game closed. Start another with ${prefix}chess new.`);
    }

    if (action === 'resign' || action === 'surrender') {
      const side = game.white?.jid === sender ? 'White' : game.black?.jid === sender ? 'Black' : null;
      if (!side) return reply('Only one of the two players can resign this game.');
      if (!game.black) return reply('Waiting for Black to join; there is no opponent to resign against.');
      game.result = `${side} resigned. ${side === 'White' ? 'Black' : 'White'} wins.`;
      return render(sock, game, prefix, reply);
    }

    if (!game.black) return reply(`♙ ${playerName(game.white)} opened the board. Use ${prefix}chess join to play as Black.`);
    const expectedJid = game.state.turn === 'white' ? game.white.jid : game.black.jid;
    if (sender !== expectedJid) return reply(`It is ${game.state.turn}'s turn. Only that player can move.`);

    if (game.result) return reply(`Game over: ${game.result}`);
    const parsed = findMove(game.state, args[0] || '');
    if (!parsed) return reply(`Illegal move. Use coordinate notation such as ${prefix}chess e2e4 or ${prefix}chess e7e8q.`);

    const mover = game.state.turn;
    game.state = applyMove(game.state, parsed.move, parsed.promotion);
    game.lastMove = parsed.move;
    const nextMoves = legalMoves(game.state);
    if (!nextMoves.length) game.result = inCheck(game.state, game.state.turn) ? `${mover === 'white' ? 'White' : 'Black'} wins by checkmate.` : 'Draw by stalemate.';
    else if (game.state.halfmove >= 100) game.result = 'Draw by the fifty-move rule.';
    return render(sock, game, prefix, reply);
  }
};
