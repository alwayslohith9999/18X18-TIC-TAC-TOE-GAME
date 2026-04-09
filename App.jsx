import React, { useState, useEffect, useCallback, useRef } from 'react';

const BOARD_SIZE = 18;
const DIRS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1]
];

function createBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

function makeMove(board, row, col, player) {
  const newBoard = board.map(r => [...r]);
  newBoard[row][col] = player;
  return newBoard;
}

function checkWinner(board, row, col, player, winCount) {
  for (const [dr, dc] of DIRS) {
    let count = 1;

    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++;
      r += dr;
      c += dc;
    }

    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++;
      r -= dr;
      c -= dc;
    }

    if (count >= winCount) return true;
  }
  return false;
}

function findWinCells(board, row, col, player, winCount) {
  for (const [dr, dc] of DIRS) {
    let count = 1;
    const cells = [[row, col]];

    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++;
      cells.push([r, c]);
      r += dr;
      c += dc;
    }

    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
      count++;
      cells.push([r, c]);
      r -= dr;
      c -= dc;
    }

    if (count >= winCount) return cells;
  }
  return [];
}

function isDraw(board, moveCount) {
  return moveCount >= BOARD_SIZE * BOARD_SIZE;
}

function getCandidates(board, radius = 2) {
  const candidates = new Set();
  let hasOccupied = false;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) {
        hasOccupied = true;
        for (let dr = -radius; dr <= radius; dr++) {
          for (let dc = -radius; dc <= radius; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === null) {
              candidates.add(`${nr},${nc}`);
            }
          }
        }
      }
    }
  }

  if (!hasOccupied) {
    return [[Math.floor(BOARD_SIZE / 2), Math.floor(BOARD_SIZE / 2)]];
  }

  return Array.from(candidates).map(str => {
    const [r, c] = str.split(',').map(Number);
    return [r, c];
  });
}

function scoreBoard(board, aiPlayer, winCount) {
  let score = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p !== null) {
        for (const [dr, dc] of DIRS) {
          const prevR = r - dr;
          const prevC = c - dc;

          if (prevR >= 0 && prevR < BOARD_SIZE && prevC >= 0 && prevC < BOARD_SIZE && board[prevR][prevC] === p) {
            continue; 
          }

          let seqLen = 1;
          let r2 = r + dr;
          let c2 = c + dc;
          while (r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && board[r2][c2] === p) {
            seqLen++;
            r2 += dr;
            c2 += dc;
          }

          let openEnds = 0;
          if (prevR >= 0 && prevR < BOARD_SIZE && prevC >= 0 && prevC < BOARD_SIZE && board[prevR][prevC] === null) openEnds++;
          if (r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && board[r2][c2] === null) openEnds++;

          if (openEnds > 0 || seqLen >= winCount) {
            let s = Math.pow(10, Math.min(seqLen, winCount));
            if (p === aiPlayer) {
              score += s;
            } else {
              score -= 0.9 * s;
            }
          }
        }
      }
    }
  }
  return Math.floor(score);
}

function minimax(board, depth, alpha, beta, isMaximizing, aiPlayer, winCount, lastMove) {
  const oppPlayer = aiPlayer === 'X' ? 'O' : 'X';
  const curPlayer = isMaximizing ? oppPlayer : aiPlayer;

  if (lastMove) {
    if (checkWinner(board, lastMove[0], lastMove[1], curPlayer, winCount)) {
      return isMaximizing ? -10000 - depth : 10000 + depth;
    }
  }

  if (depth === 0) {
    return scoreBoard(board, aiPlayer, winCount);
  }

  const cands = getCandidates(board, 1);
  if (cands.length === 0) return 0; // Draw

  const scoredCands = cands.map(([r, c]) => {
    let s = 0;
    const testPlayer = isMaximizing ? aiPlayer : oppPlayer;
    board[r][c] = testPlayer;
    if (checkWinner(board, r, c, testPlayer, winCount)) s = 1000;
    board[r][c] = null;
    return { r, c, s };
  });

  scoredCands.sort((a, b) => b.s - a.s);
  const topCands = scoredCands.slice(0, depth > 1 ? 20 : 30); // 20 for depth >= 2

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const cand of topCands) {
      board[cand.r][cand.c] = aiPlayer;
      const ev = minimax(board, depth - 1, alpha, beta, false, aiPlayer, winCount, [cand.r, cand.c]);
      board[cand.r][cand.c] = null;
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const cand of topCands) {
      board[cand.r][cand.c] = oppPlayer;
      const ev = minimax(board, depth - 1, alpha, beta, true, aiPlayer, winCount, [cand.r, cand.c]);
      board[cand.r][cand.c] = null;
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getAIMove(board, aiPlayer, difficulty, winCount) {
  const oppPlayer = aiPlayer === 'X' ? 'O' : 'X';
  const radius = difficulty === 'hard' || difficulty === 'unbeatable' ? 2 : 1;
  const cands = getCandidates(board, radius);

  if (cands.length === 0) {
    return [Math.floor(BOARD_SIZE / 2), Math.floor(BOARD_SIZE / 2)];
  }

  if (difficulty === 'easy') {
    return cands[Math.floor(Math.random() * cands.length)];
  }

  for (const [r, c] of cands) {
    board[r][c] = aiPlayer;
    if (checkWinner(board, r, c, aiPlayer, winCount)) {
      board[r][c] = null;
      return [r, c];
    }
    board[r][c] = null;
  }

  for (const [r, c] of cands) {
    board[r][c] = oppPlayer;
    if (checkWinner(board, r, c, oppPlayer, winCount)) {
      board[r][c] = null;
      return [r, c];
    }
    board[r][c] = null;
  }

  if (difficulty === 'medium') {
    const scoredCands = cands.map(([r, c]) => {
      board[r][c] = aiPlayer;
      const aiScore = scoreBoard(board, aiPlayer, winCount);
      board[r][c] = oppPlayer;
      const oppScore = scoreBoard(board, oppPlayer, winCount);
      board[r][c] = null;
      return { r, c, score: aiScore - oppScore };
    });
    scoredCands.sort((a, b) => b.score - a.score);
    const top5 = scoredCands.slice(0, 5);
    const chosen = top5[Math.floor(Math.random() * top5.length)];
    return [chosen.r, chosen.c];
  }

  const depth = difficulty === 'unbeatable' ? 2 : 1;
  const maxCands = difficulty === 'unbeatable' ? 25 : 30;

  const scoredCands = cands.map(([r, c]) => {
    board[r][c] = aiPlayer;
    const aiScore = scoreBoard(board, aiPlayer, winCount);
    board[r][c] = oppPlayer;
    const oppScore = scoreBoard(board, oppPlayer, winCount);
    board[r][c] = null;
    return { r, c, score: aiScore - oppScore };
  });

  scoredCands.sort((a, b) => b.score - a.score);
  const topCands = scoredCands.slice(0, maxCands);

  let bestScore = -Infinity;
  let bestMove = [topCands[0].r, topCands[0].c];

  for (const cand of topCands) {
    board[cand.r][cand.c] = aiPlayer;
    const score = minimax(board, depth - 1, -Infinity, Infinity, false, aiPlayer, winCount, [cand.r, cand.c]);
    board[cand.r][cand.c] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = [cand.r, cand.c];
    }
  }

  return bestMove;
}

const UI_COLORS = {
  bg: '#0a0a0f',
  panel: '#111118',
  border: '#2a2a3a',
  accent: '#6366f1',
  text: '#e0e0e0',
  x: '#ef4444',
  o: '#3b82f6',
  xWin: '#ff6b6b',
  oWin: '#60a5fa',
  winCellGlow: 'rgba(168, 85, 247, 0.4)',
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
  unbeatable: '#a855f7'
};

const styles = `
  .game-container {
    background-color: ${UI_COLORS.bg};
    min-height: 100vh;
    color: ${UI_COLORS.text};
    font-family: 'Courier New', monospace;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem;
    box-sizing: border-box;
  }
  .setup-panel {
    background-color: ${UI_COLORS.panel};
    border: 1px solid ${UI_COLORS.border};
    border-radius: 8px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    margin-bottom: 2rem;
  }
  .setup-row {
    margin-bottom: 1.5rem;
  }
  .setup-row label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  .btn-group {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .btn {
    flex: 1;
    background-color: ${UI_COLORS.border};
    color: ${UI_COLORS.text};
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    transition: transform 0.1s, box-shadow 0.1s, background-color 0.1s;
    font-size: 1rem;
    text-align: center;
  }
  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    background-color: #3a3a4a;
  }
  .btn.active {
    background-color: ${UI_COLORS.accent};
    color: #fff;
    font-weight: bold;
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
  }
  .btn-start {
    width: 100%;
    background-color: ${UI_COLORS.accent};
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
    padding: 1rem;
    margin-top: 1rem;
  }
  .btn-start:hover {
    background-color: #4f46e5;
  }
  .title-gradient {
    background: linear-gradient(90deg, #e0e0e0, ${UI_COLORS.accent});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2.5rem;
  }
  .board-container {
    overflow-x: auto;
    max-width: 100%;
    padding: 1rem 0;
  }
  .board-grid {
    display: flex;
    flex-direction: column;
  }
  .board-row {
    display: flex;
  }
  .cell {
    width: 34px;
    height: 34px;
    background-color: ${UI_COLORS.panel};
    border: 1px solid ${UI_COLORS.border};
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.1s, border-color 0.1s;
    flex-shrink: 0;
  }
  .cell:hover:not(.occupied):not(.disabled) {
    background-color: #1a1a24;
    border-color: ${UI_COLORS.accent};
  }
  .cell.last-move {
    background-color: #1c1c28;
  }
  .cell.win-cell {
    background-color: #2a1144;
    box-shadow: inset 0 0 10px ${UI_COLORS.winCellGlow};
    border-color: #a855f7;
  }
  .cell.occupied {
    cursor: default;
  }
  .cell.disabled {
    cursor: not-allowed;
  }
  .score-bar {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 612px;
    background-color: ${UI_COLORS.panel};
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    border: 1px solid ${UI_COLORS.border};
  }
  .status-banner {
    text-align: center;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    height: 1.5rem;
  }
  .header-actions {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 612px;
    margin-bottom: 1rem;
    align-items: center;
  }
`;

function SetupScreen({ onStart }) {
  const [winCount, setWinCount] = useState(5);
  const [mode, setMode] = useState('ai');
  const [difficulty, setDifficulty] = useState('medium');
  const [playerSymbol, setPlayerSymbol] = useState('X');

  return (
    <div className="game-container">
      <style>{styles}</style>
      <h1 className="title-gradient">18x18 TIC TAC TOE</h1>
      
      <div className="setup-panel">
        <div className="setup-row">
          <label>Win Condition: {winCount} in a row</label>
          <div className="btn-group">
            <button className="btn" onClick={() => setWinCount(Math.max(3, winCount - 1))}>-</button>
            <button className="btn" onClick={() => setWinCount(Math.min(10, winCount + 1))}>+</button>
          </div>
        </div>

        <div className="setup-row">
          <label>Game Mode</label>
          <div className="btn-group">
            <button className={`btn ${mode === 'ai' ? 'active' : ''}`} onClick={() => setMode('ai')}>Vs AI</button>
            <button className={`btn ${mode === '2p' ? 'active' : ''}`} onClick={() => setMode('2p')}>2 Player</button>
          </div>
        </div>

        {mode === 'ai' && (
          <div className="setup-row">
            <label>AI Difficulty</label>
            <div className="btn-group">
              <button 
                className={`btn ${difficulty === 'easy' ? 'active' : ''}`} 
                onClick={() => setDifficulty('easy')}
                style={difficulty === 'easy' ? {backgroundColor: UI_COLORS.easy} : {}}
              >Easy</button>
              <button 
                className={`btn ${difficulty === 'medium' ? 'active' : ''}`} 
                onClick={() => setDifficulty('medium')}
                style={difficulty === 'medium' ? {backgroundColor: UI_COLORS.medium} : {}}
              >Medium</button>
              <button 
                className={`btn ${difficulty === 'hard' ? 'active' : ''}`} 
                onClick={() => setDifficulty('hard')}
                style={difficulty === 'hard' ? {backgroundColor: UI_COLORS.hard} : {}}
              >Hard</button>
              <button 
                className={`btn ${difficulty === 'unbeatable' ? 'active' : ''}`} 
                onClick={() => setDifficulty('unbeatable')}
                style={difficulty === 'unbeatable' ? {backgroundColor: UI_COLORS.unbeatable} : {}}
              >Unbeatable</button>
            </div>
          </div>
        )}

        <div className="setup-row">
          <label>Your Symbol</label>
          <div className="btn-group">
            <button className={`btn ${playerSymbol === 'X' ? 'active' : ''}`} onClick={() => setPlayerSymbol('X')} style={playerSymbol === 'X' ? {backgroundColor: UI_COLORS.x} : {}}>X</button>
            <button className={`btn ${playerSymbol === 'O' ? 'active' : ''}`} onClick={() => setPlayerSymbol('O')} style={playerSymbol === 'O' ? {backgroundColor: UI_COLORS.o} : {}}>O</button>
          </div>
        </div>

        <button 
          className="btn btn-start" 
          onClick={() => onStart({ winCount, mode, difficulty, playerSymbol, boardSize: BOARD_SIZE })}
        >
          START GAME
        </button>
      </div>
    </div>
  );
}

function GameBoard({ config, onBack }) {
  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [winCells, setWinCells] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [thinking, setThinking] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  const aiPlayer = config.playerSymbol === 'X' ? 'O' : 'X';

  const handleMove = useCallback((r, c) => {
    if (board[r][c] || winner) return;

    const newBoard = makeMove(board, r, c, currentPlayer);
    setBoard(newBoard);
    setLastMove([r, c]);
    const nextMoveCount = moveCount + 1;
    setMoveCount(nextMoveCount);

    if (checkWinner(newBoard, r, c, currentPlayer, config.winCount)) {
      setWinner(currentPlayer);
      setWinCells(findWinCells(newBoard, r, c, currentPlayer, config.winCount));
      setScores(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer] + 1 }));
      return;
    }

    if (isDraw(newBoard, nextMoveCount)) {
      setWinner('draw');
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      return;
    }

    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  }, [board, currentPlayer, config.winCount, winner, moveCount]);

  useEffect(() => {
    let timeoutId;

    if (config.mode === 'ai' && currentPlayer === aiPlayer && !winner && moveCount < BOARD_SIZE * BOARD_SIZE) {
      setThinking(true);
      timeoutId = setTimeout(() => {
        const [r, c] = getAIMove(board, aiPlayer, config.difficulty, config.winCount);
        if (r !== undefined && c !== undefined) {
           handleMove(r, c);
        }
        setThinking(false);
      }, 300);
    }

    return () => clearTimeout(timeoutId);
  }, [currentPlayer, config, winner, moveCount, board, aiPlayer, handleMove]);

  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPlayer('X');
    setWinner(null);
    setWinCells([]);
    setLastMove(null);
    setThinking(false);
    setMoveCount(0);
  };

  const isWinCell = (row, col) => winCells.some(([r, c]) => r === row && c === col);
  const isLastMove = (row, col) => lastMove && lastMove[0] === row && lastMove[1] === col;

  return (
    <div className="game-container">
      <style>{styles}</style>
      
      <div className="header-actions">
        <button className="btn" onClick={onBack}>BACK TO MENU</button>
        <h2 style={{margin: 0, fontSize: '1.2rem'}}>18x18 TAC</h2>
        <button className="btn" onClick={resetGame}>RESET GAME</button>
      </div>

      <div className="score-bar">
        <div style={{ color: UI_COLORS.x }}>X: {scores.X}</div>
        <div style={{ color: UI_COLORS.text }}>DRAWS: {scores.draws}</div>
        <div style={{ color: UI_COLORS.o }}>O: {scores.O}</div>
      </div>

      <div className="status-banner">
        {winner === 'draw' ? 'Game ended in a Draw!' :
         winner ? `Player ${winner} wins!` :
         thinking ? 'AI thinking...' :
         `Current Turn: ${currentPlayer}`}
      </div>

      <div className="board-container">
        <div className="board-grid">
          {board.map((row, r) => (
            <div key={r} className="board-row">
              {row.map((cell, c) => {
                const wc = isWinCell(r, c);
                const lm = isLastMove(r, c);
                
                let cx = 'cell';
                if (cell) cx += ' occupied';
                if (!cell && (thinking || winner)) cx += ' disabled';
                if (wc) cx += ' win-cell';
                if (lm && !wc) cx += ' last-move';

                let color = cell === 'X' ? (wc ? UI_COLORS.xWin : UI_COLORS.x) : 
                            cell === 'O' ? (wc ? UI_COLORS.oWin : UI_COLORS.o) : '';

                return (
                  <div 
                    key={`${r}-${c}`} 
                    className={cx}
                    style={{ color }}
                    onClick={() => {
                       if (config.mode === '2p' || currentPlayer !== aiPlayer) {
                          handleMove(r, c);
                       }
                    }}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {winner && (
        <button className="btn btn-start" style={{maxWidth: '200px', marginTop: '1rem'}} onClick={resetGame}>
          PLAY AGAIN
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [config, setConfig] = useState(null);

  if (!config) {
    return <SetupScreen onStart={(cfg) => setConfig(cfg)} />;
  }

  return <GameBoard config={config} onBack={() => { setConfig(null); }} />;
}
