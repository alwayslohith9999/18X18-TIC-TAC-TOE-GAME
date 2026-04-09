# 18x18 Tic-Tac-Toe: AI Agents Architecture and Implementation

This document provides a comprehensive overview of how the AI opponents (Agents) are built, what approaches are used, and how they operate within the game. It is primarily built around the `getAIMove` logic in `App.jsx`.

## Overview
The game features four distinct AI "Agents": **Easy, Medium, Hard, and Unbeatable**. They all share a pipeline for generating candidate moves but differ drastically in how they evaluate and select the final move.

---

## 1. Shared Infrastructure

### Candidate Generation (`getCandidates`)
Instead of evaluating all 324 cells (18x18) every turn—which would be incredibly slow—the AI only considers "candidate" cells. Candidates are empty cells that are adjacent to at least one occupied cell.
- **Search Radius**: For Easy and Medium, the AI only looks at cells within a 1-cell radius of existing pieces. For Hard and Unbeatable, it expands the search to a 2-cell radius, allowing for more strategic, long-range setups.

### Immediate Threat & Win Detection (`checkWinner`)
Before performing complex evaluations, all agents (except Easy) perform a crucial 1-step lookahead loop on all candidate cells:
1. **Offensive Check**: If the AI can play on a cell and win on this exact turn, it immediately takes that move.
2. **Defensive Check**: If the opponent is threatening to win by playing on a cell on their *next* turn, the AI immediately plays there to block them.
*Note: Easy ignores this check to remain truly easy and beatable.*

### Heuristic Scoring (`scoreBoard`)
The core of the AI's intelligence is the `scoreBoard` function. It evaluates the current state of the board by scanning for sequences of pieces.
- For every piece on the board, it checks all 4 directions (horizontal, vertical, two diagonals).
- It counts the length of consecutive pieces and the number of "open ends" (empty cells at either end of the sequence).
- Sequences are scored exponentially: `10 ^ sequence_length`.
- The AI's pieces add to the total score, while the Opponent's pieces subtract from the score. Opponent sequences are weighted slightly less (e.g., `score -= 0.9 * s`), making the AI slightly more aggressive than defensive.

---

## 2. The Agent Profiles (How They Are Built)

### The "Easy" Agent
- **Approach**: Random Selection.
- **What it does**: Gathers all candidate moves (radius 1) and picks one completely at random.
- **Why we built it this way**: To provide a simple opponent for beginners that makes no strategic plans. It acts as a baseline dummy agent.

### The "Medium" Agent
- **Approach**: Heuristic Evaluation with Randomness.
- **What it does**: 
  1. Checks for immediate wins/blocks.
  2. Evaluates all candidate moves by temporarily placing a piece and calling the `scoreBoard` function.
  3. Sorts the moves from highest score to lowest.
  4. Takes the **Top 5** best moves and picks one at random among those five.
- **Why we built it this way**: It understands basic strategy, forms groups of pieces, and will block simple threats. However, its subset randomness prevents it from playing optimally, leading to occasional "blunders" the player can exploit.

### The "Hard" Agent
- **Approach**: Greedy Heuristic Selection (Depth-1).
- **What it does**:
  1. Expands candidate search to a 2-cell radius.
  2. Checks for immediate wins/blocks.
  3. Evaluates all candidates and strictly selects the **absolute best** move based on the `scoreBoard` heuristic.
- **Why we built it this way**: It provides a strong, consistent challenge. It doesn't look ahead into the future, but it maximizes its immediate board position perfectly. It will never blunder a 1-turn view.

### The "Unbeatable" Agent
- **Approach**: Minimax Algorithm with Alpha-Beta Pruning (Depth-2).
- **What it does**:
  1. Expands candidate search to a 2-cell radius.
  2. Checks for immediate wins/blocks.
  3. Identifies the Top 25 candidate moves based on an initial heuristic score to save computation.
  4. Runs the **Minimax algorithm** on these top 25 moves. For each move, it simulates the opponent's best possible response (minimizing the AI's score), and evaluates the resulting board state.
  5. Uses **Alpha-Beta Pruning** to stop evaluating branches that are demonstrably worse than a previously analyzed branch, drastically improving performance.
  6. Selects the move that yields the best guaranteed score regardless of the opponent's strategy over a 2-turn lookahead.
- **Why we built it this way**: To provide an extreme challenge. By exploring the game tree 2 steps into the future, it can formulate traps (e.g., creating two overlapping threats where the opponent can only block one, guaranteeing a win on the subsequent turn).

---

## 3. System Integration
How these agents are linked to the React frontend:
- When it's the AI's turn (`currentPlayer === aiPlayer`), a `useEffect` hook is triggered in the `GameBoard` component.
- `setThinking(true)` is called to render a "AI thinking..." status indicator.
- The computation is offloaded or timed out by `300ms`. This serves two purposes:
  1. Allows the React UI to update and render the thinking status.
  2. Prevents the game from feeling instantaneous and robotic, mimicking a real player's thought process.
- Once evaluated, the calculated `[row, column]` is passed back to `handleMove` just like a regular user click.
