You are building a fully functional, production-grade 18×18 Tic Tac Toe game 
in Antigravity. Follow this architecture and specification exactly.

════════════════════════════════════
 PROJECT OVERVIEW
════════════════════════════════════
- Board: 18 rows × 18 columns (324 cells)
- Win condition: configurable N-in-a-row (user picks 3–10 before game starts)
- Modes: Player vs AI, or Player vs Player (2 humans)
- AI difficulties: Easy, Medium, Hard, Unbeatable
- Player symbol: choose X or O before game starts
- Scoring: persistent win/loss/draw counter across rounds

════════════════════════════════════
 ARCHITECTURE — 5 LAYERS
════════════════════════════════════

1. CONFIG LAYER (SetupScreen component)
   - boardSize: fixed at 18
   - winCount: integer slider 3 to 10 (default 5)
   - mode: "ai" | "2p"
   - difficulty: "easy" | "medium" | "hard" | "unbeatable"
   - playerSymbol: "X" | "O"
   - On submit → pass config object to GameBoard

2. STATE LAYER (useState inside GameBoard)
   - board: 18×18 2D array, each cell = null | "X" | "O"
   - currentPlayer: "X" | "O"
   - winner: null | "X" | "O" | "draw"
   - winCells: array of [row, col] pairs forming the winning line
   - lastMove: [row, col] of the most recently placed piece
   - scores: { X: number, O: number, draws: number }
   - thinking: boolean (true while AI is computing)
   - moveCount: integer tracking total moves made

3. GAME LOGIC LAYER (pure functions)
   - createBoard(): returns 18×18 2D array filled with null
   - makeMove(board, row, col, player): returns new board with move applied
   - checkWinner(board, row, col, player, winCount): returns boolean
     → checks 4 directions: horizontal, vertical, diagonal, anti-diagonal
     → only checks around the last placed piece for efficiency
   - findWinCells(board, row, col, player, winCount): returns [[r,c], ...]
     → returns the exact cells forming the winning line for highlighting
   - isDraw(board, moveCount): returns true if board is full with no winner

4. AI ENGINE LAYER (pure functions)
   - getCandidates(board, radius=2): returns array of [row, col] empty cells 
     within `radius` steps of any occupied cell. Falls back to center if 
     board is empty.
   - scoreBoard(board, aiPlayer, winCount): returns integer heuristic score
     → for each direction at each occupied cell, count open sequences
     → score = sum of 10^(sequence_length) for AI sequences
     → subtract 0.9 × 10^(sequence_length) for opponent sequences
   - minimax(board, depth, alpha, beta, isMaximizing, aiPlayer, winCount, 
     lastMove): returns integer score
     → base cases: winner found → ±10000±depth, depth=0 → scoreBoard
     → prune candidates to top 20 for depth > 1, unlimited for depth = 1
   - getAIMove(board, aiPlayer, difficulty, winCount): returns [row, col]
     → Easy: random candidate move
     → Medium: win immediately if possible, else block opponent win, 
       else random from top 5 candidates
     → Hard: win/block + 1-ply scoring over top 30 candidates
     → Unbeatable: win/block + minimax depth 2 over top 25 candidates,
       alpha-beta pruning throughout

5. UI LAYER (React components)
   - SetupScreen: full-page setup with controls for all config options
   - GameBoard: 18×18 grid of clickable cells
   - ScoreBar: live X / Draws / O counter
   - StatusBanner: shows whose turn it is, "AI thinking...", or winner message
   - Reset button: clears board and starts new round (keeps scores)
   - Back to Menu button: returns to SetupScreen (resets scores)

════════════════════════════════════
 CELL RENDERING RULES
════════════════════════════════════
- Empty cell: subtle hover highlight on mouseover (skip if AI turn or game over)
- Last move cell: slightly brighter background tint
- Winning cells: distinct accent background + inner glow indicator
- X color: red family (#ef4444)
- O color: blue family (#3b82f6)
- Winning X: brighter red (#ff6b6b) with purple cell highlight
- Winning O: brighter blue (#60a5fa) with purple cell highlight
- Cell size: 34px × 34px
- Board must be horizontally scrollable if viewport is narrow

════════════════════════════════════
 AI TURN FLOW
════════════════════════════════════
- Detect: mode === "ai" AND currentPlayer === aiPlayer AND !winner
- Show "AI thinking..." in StatusBanner immediately
- Delay: setTimeout 300ms (gives UI time to render "thinking" state)
- Inside timeout: clone board, call getAIMove(), apply move, update state
- Cleanup: clear timeout on unmount or if game ends during delay

════════════════════════════════════
 WIN CHECK OPTIMIZATION
════════════════════════════════════
Do NOT scan the full 18×18 board after each move.
Only scan outward from the last placed piece in 4 directions.
For each direction [dr, dc] and its reverse [-dr, -dc]:
  count consecutive matching pieces from the placed cell outward
  if count >= winCount → winner found

════════════════════════════════════
 DESIGN SYSTEM
════════════════════════════════════
Theme: dark, minimalist, monospace aesthetic
Background: #0a0a0f (near-black)
Panels: #111118 with border #2a2a3a
Accent: #6366f1 (indigo) for interactive elements and highlights
Font: 'Courier New', monospace throughout
Buttons: smooth hover transitions (transform + box-shadow)
Setup screen title: gradient text from #e0e0e0 to #6366f1
Difficulty color coding:
  Easy     → #22c55e (green)
  Medium   → #f59e0b (amber)
  Hard     → #ef4444 (red)
  Unbeatable → #a855f7 (purple)

════════════════════════════════════
 COMPONENT STRUCTURE
════════════════════════════════════

App
├── SetupScreen (if no config)
│   ├── win count stepper (− / number / +)
│   ├── mode selector (AI | 2 Player)
│   ├── difficulty grid (Easy / Medium / Hard / Unbeatable)
│   ├── symbol selector (X | O)
│   └── Start Game button
└── GameBoard (if config exists)
    ├── Header (Back to Menu | title | Reset)
    ├── ScoreBar (X score | Draws | O score)
    ├── StatusBanner (current turn / thinking / winner)
    ├── Board (18×18 scrollable grid)
    └── Play Again button (shown only when game is over)

════════════════════════════════════
 EDGE CASES TO HANDLE
════════════════════════════════════
- Prevent human click when: cell is occupied, game is over, or AI is thinking
- In "ai" mode, if playerSymbol = "O", AI plays first (AI = X, human = O)
- Draw detection: moveCount >= 18*18 = 324 and no winner
- Clicking Reset during AI thinking: clear timeout, reset all state
- winCount must never exceed boardSize (cap at 10, minimum 3)

════════════════════════════════════
 OUTPUT FORMAT
════════════════════════════════════
- Single .jsx file with default export App
- No external libraries except React (useState, useEffect, useCallback)
- All logic in one file — no separate utility imports
- No TypeScript — plain JavaScript JSX only
- Inline styles only — no CSS modules or styled-components
- Works standalone in any React sandbox (CodeSandbox, StackBlitz, Antigravity)

Build the complete, working implementation now.