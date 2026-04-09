import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const BOARD_SIZE = 18;
const DIRS = [
  [0, 1], // horizontal
  [1, 0], // vertical
  [1, 1], // diagonal
  [1, -1] // anti-diagonal
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

function getCandidates(board, radius = 1) {
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
  if (cands.length === 0) return 0;

  const scoredCands = cands.map(([r, c]) => {
    let s = 0;
    const testPlayer = isMaximizing ? aiPlayer : oppPlayer;
    board[r][c] = testPlayer;
    if (checkWinner(board, r, c, testPlayer, winCount)) s = 1000;
    board[r][c] = null;
    return { r, c, s };
  });

  scoredCands.sort((a, b) => b.s - a.s);
  const topCands = scoredCands.slice(0, depth > 1 ? 6 : 12);

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
  const cands = getCandidates(board, 1); 

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
  const maxCands = difficulty === 'unbeatable' ? 10 : 15; 

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

// Background Orbs
function FluidBackground() {
  return (
    <div className="fluid-bg">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="orb orb-4"></div>
    </div>
  );
}

// Theme Switcher Component
function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}

function SetupScreen({ onStart, theme, toggleTheme }) {
  const [winCount, setWinCount] = useState(5);
  const [mode, setMode] = useState('ai');
  const [difficulty, setDifficulty] = useState('medium');
  const [playerSymbol, setPlayerSymbol] = useState('X');

  return (
    <>
      <FluidBackground />
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      <div className="game-wrapper">
        <div className="setup-panel glass-card">
          <div className="title-container">
            <h1 className="title-gradient">Tic-Tac-Toe</h1>
            <p className="subtitle">Select your configuration to enter the grid.</p>
          </div>
          
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
                <button className={`btn ${difficulty === 'easy' ? 'active bg-easy' : ''}`} onClick={() => setDifficulty('easy')}>Easy</button>
                <button className={`btn ${difficulty === 'medium' ? 'active bg-medium' : ''}`} onClick={() => setDifficulty('medium')}>Medium</button>
                <button className={`btn ${difficulty === 'hard' ? 'active bg-hard' : ''}`} onClick={() => setDifficulty('hard')}>Hard</button>
                <button className={`btn ${difficulty === 'unbeatable' ? 'active bg-unbeatable' : ''}`} onClick={() => setDifficulty('unbeatable')}>Ultra</button>
              </div>
            </div>
          )}

          <div className="setup-row">
            <label>Your Symbol</label>
            <div className="btn-group">
              <button className={`btn btn-symbol ${playerSymbol === 'X' ? 'active' : ''}`} data-symbol="X" onClick={() => setPlayerSymbol('X')} >
                <span className="text-x">X</span>
              </button>
              <button className={`btn btn-symbol ${playerSymbol === 'O' ? 'active' : ''}`} data-symbol="O" onClick={() => setPlayerSymbol('O')} >
                 <span className="text-o">O</span>
              </button>
            </div>
          </div>

          <button 
            className="btn-start" 
            onClick={() => onStart({ winCount, mode, difficulty, playerSymbol, boardSize: BOARD_SIZE })}
          >
            START GAME
          </button>
        </div>
      </div>
    </>
  );
}

function GameBoard({ config, onBack, theme, toggleTheme }) {
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
      }, 50);
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
    <>
      <FluidBackground />
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      <div className="game-wrapper">
        
        <div className="header-actions">
          <button className="action-btn" onClick={onBack}>&#8592; MENU</button>
          <h2>{config.boardSize}x{config.boardSize} ZONE</h2>
          <button className="action-btn" onClick={resetGame}>RESET</button>
        </div>

        <div className="score-bar glass-card">
          <div className="score-player text-x">
            <span className="label">Player X</span>
            <span className="score">{scores.X}</span>
          </div>
          <div className="score-player" style={{ opacity: 0.7 }}>
            <span className="label" style={{color: 'var(--text-color)'}}>Draws</span>
            <span className="score" style={{color: 'var(--text-color)'}}>{scores.draws}</span>
          </div>
          <div className="score-player text-o">
            <span className="label">Player O</span>
            <span className="score">{scores.O}</span>
          </div>
        </div>

        <div className="status-banner">
          {winner === 'draw' ? 'Stalemate! Game ended in a draw.' :
           winner ? <span>Victory! <span className={winner==='X'?'text-x':'text-o'}>{winner}</span> takes the match!</span> :
           thinking ? <span style={{ opacity: 0.7 }}>AI is computing...</span> :
           <span>Awaiting Move: <span className={currentPlayer==='X'?'text-x':'text-o'}>{currentPlayer}</span></span>}
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

                  let textClass = cell === 'X' ? 'text-x' : cell === 'O' ? 'text-o' : '';

                  return (
                    <div 
                      key={`${r}-${c}`} 
                      className={`${cx} ${textClass}`}
                      onClick={() => {
                         if (thinking || winner) return;
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
          <button className="btn-start play-again" onClick={resetGame}>
            PLAY AGAIN
          </button>
        )}
      </div>
    </>
  );
}

export default function App() {
  const [config, setConfig] = useState(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (!config) {
    return <SetupScreen onStart={(cfg) => setConfig(cfg)} theme={theme} toggleTheme={toggleTheme} />;
  }

  return <GameBoard config={config} onBack={() => { setConfig(null); }} theme={theme} toggleTheme={toggleTheme} />;
}
