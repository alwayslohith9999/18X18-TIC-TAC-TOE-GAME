📌 Overview

AI-Based 18x18 Tic-Tac-Toe is an advanced strategic game where a human player competes against an intelligent AI agent on a large 18×18 grid. Unlike the traditional 3×3 version, this project introduces a significantly larger search space, requiring efficient artificial intelligence algorithms for decision-making.

The system uses multiple AI strategies ranging from simple random logic to advanced Minimax with Alpha-Beta pruning, allowing progressive difficulty levels and intelligent gameplay.


┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (AI ENGINE)                    │
│                                                             │
│  ┌──────────────┐   ┌───────────────────────────────────┐   │
│  │ Game Engine  │──▶│ AI Decision Module               │   │
│  │              │   │ - Minimax()                      │   │
│  │              │   │ - Alpha-Beta Pruning             │   │
│  │              │   │ - Heuristic Evaluation           │   │
│  └──────────────┘   └───────────────────────────────────┘   │
│         │                                                   │
│         ▼                                                   │
│   Board State (18x18 Matrix)                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (USER INTERFACE)                │
│                                                             │
│  User Input ──▶ Board Display ──▶ Game Status Output        │
└─────────────────────────────────────────────────────────────┘



| Layer             | Technology          | Purpose              |
| ----------------- | ------------------- | -------------------- |
| Language          | Python / Java / C++ | Core AI logic        |
| Data Structure    | 2D Array            | Board representation |
| Programming Model | Event-driven        | Game flow            |
| Concepts          | AI Algorithms       | Decision-making      |



🤖 Core Algorithm — Minimax & Alpha-Beta Pruning
❓ What is Minimax?

Minimax is a decision-making algorithm used in two-player games where:

AI = Maximizing player
Human = Minimizing player

The algorithm explores all possible future moves and selects the optimal move.




⚙️ The Three Evaluation Components
1. Heuristic Score (Evaluation Function)

Used when full search is not possible.

Evaluates board using:
Score = (AI sequences) - (Opponent sequences)

Factors:

Consecutive symbols
Open spaces
Winning chances

2. Maximizer (AI Move)

AI tries to maximize the score

best = max(all possible moves)
3. Minimizer (Opponent Move)

Opponent tries to minimize AI score

best = min(all possible moves)

🔁 Minimax Execution Flow
minimax(board, depth, isMax)
        │
        ├── If terminal state → return score
        │
        ├── If isMax (AI turn):
        │      best = -∞
        │      for each move:
        │          best = max(best, minimax(...))
        │
        └── If isMin (Human turn):
               best = +∞
               for each move:
                   best = min(best, minimax(...))

                   ⚡ Alpha-Beta Pruning (Optimization)

Alpha-Beta reduces unnecessary calculations.

Definitions:
Alpha → best value for AI
Beta → best value for opponent
Pruning Condition:
If Beta ≤ Alpha → STOP exploring branch
Why it is Important?
Reduces computation time
Allows deeper search
Improves performance


🎮 Difficulty Levels (Algorithm Mapping)
| Level   | Algorithm Used       |
| ------- | -------------------- |
| Easy    | Random / Rule-Based  |
| Medium  | Greedy + Heuristic   |
| Hard    | Minimax              |
| Extreme | Minimax + Alpha-Beta |


🧠 AI Decision Flow

Current Board
      │
      ▼
Generate All Moves
      │
      ▼
Apply Minimax
      │
      ▼
Apply Alpha-Beta Pruning
      │
      ▼
Select Best Move
      │
      ▼
Update Board

📊 Game Logic
Board Representation
18×18 grid
Values:
0 → Empty
1 → Player
-1 → AI
Winning Conditions
Horizontal
Vertical
Diagonal


🔁 Data Flow Summary
[User Move]
     │
     ▼
[Game Engine Updates Board]
     │
     ▼
[AI Computes Move]
     │
     ▼
[Board Updated]
     │
     ▼
[Check Win/Draw]
     │
     ▼
[Display Output]


▶️ How to Run
Requirements
Python 3.x
Run
git clone https://github.com/your-username/ai-tictactoe-18x18.git
cd ai-tictactoe-18x18
python main.py

📥 Inputs
Player move (row, column)
Difficulty level
📤 Outputs
AI move
Updated board
Game result:
Win
Loss
Draw

📐 Algorithm Complexity

| Operation      | Complexity         |
| -------------- | ------------------ |
| Minimax        | O(b^d)             |
| Alpha-Beta     | Reduced O(b^(d/2)) |
| Heuristic Eval | O(n²)              |
| Board Access   | O(1)               |


🎯 Key Design Decisions
| Decision          | Reason                    |
| ----------------- | ------------------------- |
| 18×18 board       | Increase complexity       |
| Minimax           | Optimal decision-making   |
| Alpha-Beta        | Performance optimization  |
| Heuristic scoring | Handle large search space |
| Multi-level AI    | Better user experience    |


🚀 Future Enhancements
Machine Learning AI
Better UI
Multiplayer mode
Adaptive AI
📌 Conclusion

This project demonstrates how Artificial Intelligence algorithms can be applied to complex game environments. By combining Minimax, Alpha-Beta pruning, and heuristic evaluation, the system achieves efficient and intelligent gameplay even with a large board size.
