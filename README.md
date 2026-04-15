# 18X18-TIC-TAC-TOE-GAME\
🧠 AI-Based 18x18 Tic-Tac-Toe — Complete Project Documentation
📌 Overview

AI-Based 18x18 Tic-Tac-Toe is an advanced strategy game where a human player competes against an intelligent AI agent on a large 18×18 grid. Unlike the traditional 3×3 version, this project introduces a massive search space, requiring efficient decision-making algorithms such as Minimax and Alpha-Beta pruning.

The system is designed with a modular architecture where the backend handles game logic and AI computation, while the frontend provides an interactive user experience.

🏗️ Architecture
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (AI ENGINE)                    │
│                                                             │
│  ┌──────────────┐   ┌───────────────────────────────────┐   │
│  │ Game Engine  │──▶│ AI Decision Module               │   │
│  │              │   │ - Minimax Algorithm              │   │
│  │              │   │ - Alpha-Beta Pruning             │   │
│  │              │   │ - Heuristic Evaluation           │   │
│  └──────────────┘   └───────────────────────────────────┘   │
│         │                                                   │
│         ▼                                                   │
│   Board State (18x18 Matrix)                               │
│         │                                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (USER INTERFACE)                │
│                                                             │
│  User Input (Clicks) ──▶ Game Board Display                │
│                              │                              │
│                     Result Display (Win/Draw)              │
└─────────────────────────────────────────────────────────────┘
🔧 Tech Stack
Layer	Technology	Purpose
Language	Python / Java / C++	Core logic & AI
Data Structure	2D Array	Board representation
Programming Style	Event-driven	Game interaction
Concepts	AI Algorithms	Decision making
🤖 Core Algorithms
🔹 1. Minimax Algorithm

Minimax is a recursive decision-making algorithm used in two-player games.

Concept:

AI → Maximizer
Player → Minimizer

Goal:
Choose the move that maximizes AI’s chances of winning.

🔹 2. Alpha-Beta Pruning

Optimization of Minimax to improve efficiency.

Idea:

Alpha → Best value for AI
Beta → Best value for opponent

👉 Stops exploring branches that won’t affect the final decision

🔹 3. Heuristic Evaluation Function

Used to evaluate board states when full search is not possible.

Factors considered:

Consecutive symbols
Open sequences
Winning opportunities
Blocking opponent moves
🎮 Difficulty Levels
Level	Algorithm Used
Easy	Random / Rule-Based
Medium	Greedy + Heuristic
Hard	Minimax
Extreme	Minimax + Alpha-Beta
🧠 AI Decision Flow
Current Board State
        │
        ▼
Generate Possible Moves
        │
        ▼
Evaluate Moves (Heuristic / Minimax)
        │
        ▼
Apply Alpha-Beta Pruning (if needed)
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
Horizontal sequence
Vertical sequence
Diagonal sequence
🔁 Data Flow Summary
[User Input]
      │
      ▼
[Game Engine Updates Board]
      │
      ▼
[AI Algorithm Computes Move]
      │
      ▼
[Board Updated]
      │
      ▼
[Win/Draw Check]
      │
      ▼
[Display Output]
▶️ How to Run
Requirements
Python 3.x
Run the Project
git clone https://github.com/your-username/ai-tictactoe-18x18.git
cd ai-tictactoe-18x18
python main.py
📥 Inputs
Player move (row, column)
Difficulty level selection
📤 Outputs
AI-generated move
Updated board state
Game result:
Win
Loss
Draw
🧪 Test Cases
Valid move placement
Invalid move handling
AI response correctness
Win detection
Draw condition
Performance under large board
🎯 Key Design Decisions
Decision	Reason
Large 18×18 board	Increase complexity
Minimax algorithm	Optimal decision-making
Alpha-Beta pruning	Faster computation
Heuristic evaluation	Handle large search space
Multiple difficulty levels	Better user experience
📐 Algorithm Complexity
Operation	Complexity
Minimax	O(b^d)
Alpha-Beta	Reduced from Minimax
Heuristic Evaluation	O(n²)
Board Access	O(1)
🚀 Future Enhancements
Machine Learning-based AI
Improved UI design
Multiplayer support
Adaptive difficulty system
📌 Conclusion

This project demonstrates how Artificial Intelligence can be applied to complex game environments. By combining Minimax, Alpha-Beta pruning, and heuristic evaluation, the system achieves intelligent gameplay even on a large board. It serves as a strong example of applying AI concepts in real-world applications.

🙌 Contributors
Y. Lohith sai
D. Hanumanth sai kumar yadav
A. Javeed
D. Jathin rishikesav
