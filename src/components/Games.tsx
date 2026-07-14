import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Cpu, User } from 'lucide-react';
import './Games.css';

// Snake Constants
const GRID_SIZE = 15;
const INITIAL_SNAKE = [
  { x: 7, y: 7 },
  { x: 7, y: 8 },
  { x: 7, y: 9 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // Up

export default function Games() {
  const [activeTab, setActiveTab] = useState<'snake' | 'tictactoe'>('snake');

  // --- SNAKE STATE ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [bug, setBug] = useState({ x: 3, y: 3 });
  const [dir, setDir] = useState(INITIAL_DIRECTION);
  const [snakeSpeed, setSnakeSpeed] = useState(150);
  const [isSnakeRunning, setIsSnakeRunning] = useState(false);
  const [isSnakeGameOver, setIsSnakeGameOver] = useState(false);
  const [bugsResolved, setBugsResolved] = useState(0);
  const [snakeHighScore, setSnakeHighScore] = useState(() => {
    return Number(localStorage.getItem('snake_highscore') || '0');
  });

  // --- TIC-TAC-TOE STATE ---
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState<'ai' | 'pvp'>('ai');
  const [tttWinner, setTttWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [tttScores, setTttScores] = useState(() => {
    const saved = localStorage.getItem('ttt_scores');
    return saved ? JSON.parse(saved) : { player: 0, opponent: 0, ties: 0 };
  });

  const nextDirection = useRef(INITIAL_DIRECTION);

  // Generate random bug location not on snake
  const generateBug = (currentSnake: { x: number; y: number }[]) => {
    while (true) {
      const newBug = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some(
        (segment) => segment.x === newBug.x && segment.y === newBug.y
      );
      if (!onSnake) return newBug;
    }
  };

  // --- SNAKE LOOP ---
  useEffect(() => {
    if (!isSnakeRunning || isSnakeGameOver || activeTab !== 'snake') return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const currentDir = nextDirection.current;
        setDir(currentDir);
        
        const head = prevSnake[0];
        const newHead = {
          x: head.x + currentDir.x,
          y: head.y + currentDir.y,
        };

        // Wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsSnakeGameOver(true);
          setIsSnakeRunning(false);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setIsSnakeGameOver(true);
          setIsSnakeRunning(false);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Eat bug
        if (newHead.x === bug.x && newHead.y === bug.y) {
          setBugsResolved((prev) => {
            const nextScore = prev + 1;
            if (nextScore > snakeHighScore) {
              setSnakeHighScore(nextScore);
              localStorage.setItem('snake_highscore', String(nextScore));
            }
            return nextScore;
          });
          setBug(generateBug(newSnake));
          // Speed up slightly
          setSnakeSpeed((speed) => Math.max(80, speed - 2));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, snakeSpeed);
    return () => clearInterval(interval);
  }, [isSnakeRunning, isSnakeGameOver, bug, snakeSpeed, activeTab, snakeHighScore]);

  // Snake Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'snake') return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault(); // Prevent page scrolling
      }

      if (e.key === ' ' && !isSnakeGameOver) {
        setIsSnakeRunning((prev) => !prev);
        return;
      }

      const currentDir = dir;
      let newDir = { ...nextDirection.current };

      switch (e.key) {
        case 'ArrowUp':
          if (currentDir.y === 0) newDir = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (currentDir.y === 0) newDir = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (currentDir.x === 0) newDir = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (currentDir.x === 0) newDir = { x: 1, y: 0 };
          break;
        default:
          return;
      }

      nextDirection.current = newDir;
      if (!isSnakeRunning && !isSnakeGameOver) {
        setIsSnakeRunning(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dir, isSnakeRunning, isSnakeGameOver, activeTab]);

  const handleSnakeButtonDir = (newDir: { x: number; y: number }) => {
    if (isSnakeGameOver) return;
    const currentDir = dir;
    if (newDir.x !== 0 && currentDir.x === 0) {
      nextDirection.current = newDir;
    } else if (newDir.y !== 0 && currentDir.y === 0) {
      nextDirection.current = newDir;
    }
    if (!isSnakeRunning) {
      setIsSnakeRunning(true);
    }
  };

  const resetSnake = () => {
    setSnake(INITIAL_SNAKE);
    setDir(INITIAL_DIRECTION);
    nextDirection.current = INITIAL_DIRECTION;
    setBug({ x: 3, y: 3 });
    setBugsResolved(0);
    setSnakeSpeed(150);
    setIsSnakeGameOver(false);
    setIsSnakeRunning(false);
  };

  // --- TIC-TAC-TOE LOGIC ---
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  const checkWinner = (squares: (string | null)[]) => {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], pattern };
      }
    }
    if (squares.every(square => square !== null)) {
      return { winner: 'Tie', pattern: null };
    }
    return null;
  };

  const makeMove = (index: number, player: string) => {
    if (board[index] || tttWinner) return false;
    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);

    const winResult = checkWinner(newBoard);
    if (winResult) {
      setTttWinner(winResult.winner);
      if (winResult.pattern) {
        setWinningLine(winResult.pattern);
      }
      updateTttScores(winResult.winner);
    } else {
      setIsXNext(player !== 'X');
    }
    return true;
  };

  const updateTttScores = (winner: string) => {
    setTttScores((prev: any) => {
      let nextScores = { ...prev };
      if (winner === 'X') {
        nextScores.player += 1;
      } else if (winner === 'O') {
        nextScores.opponent += 1;
      } else {
        nextScores.ties += 1;
      }
      localStorage.setItem('ttt_scores', JSON.stringify(nextScores));
      return nextScores;
    });
  };

  // Mini-max AI for Tic-Tac-Toe
  const findBestMove = (squares: (string | null)[]) => {
    // 1. Try to win
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        const testBoard = [...squares];
        testBoard[i] = 'O';
        if (checkWinner(testBoard)?.winner === 'O') return i;
      }
    }
    // 2. Block player
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        const testBoard = [...squares];
        testBoard[i] = 'X';
        if (checkWinner(testBoard)?.winner === 'X') return i;
      }
    }
    // 3. Take center
    if (!squares[4]) return 4;
    // 4. Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(c => !squares[c]);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    // 5. Take whatever is left
    const emptyIndices = squares.map((s, idx) => s === null ? idx : null).filter(idx => idx !== null) as number[];
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  };

  // AI Move triggers after player moves
  useEffect(() => {
    if (activeTab !== 'tictactoe' || gameMode !== 'ai' || isXNext || tttWinner) return;

    const aiTimeout = setTimeout(() => {
      const bestMove = findBestMove(board);
      if (bestMove !== undefined && bestMove !== -1) {
        makeMove(bestMove, 'O');
      }
    }, 500);

    return () => clearTimeout(aiTimeout);
  }, [isXNext, board, tttWinner, gameMode, activeTab]);

  const handleTttClick = (index: number) => {
    if (!isXNext && gameMode === 'ai') return; // Wait for AI
    makeMove(index, isXNext ? 'X' : 'O');
  };

  const resetTtt = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setTttWinner(null);
    setWinningLine(null);
  };

  const resetTttScores = () => {
    const defaultScores = { player: 0, opponent: 0, ties: 0 };
    setTttScores(defaultScores);
    localStorage.setItem('ttt_scores', JSON.stringify(defaultScores));
  };

  return (
    <section id="playroom" className="playroom-section">
      <div className="container">
        <div className="section-header">
          <span className="section-number">04</span>
          <h2 className="section-title">Playroom</h2>
        </div>

        <div className="playroom-layout">
          {/* Controls & Tab selector */}
          <div className="playroom-sidebar">
            <h3 className="playroom-subtitle">
              Need a <span className="serif-font">break</span>?
            </h3>
            <p className="playroom-desc">
              Here are some quick retro-styled games inspired by software development. Resolve bugs, merge commits, and test your logic.
            </p>

            <div className="tab-buttons">
              <button
                className={`tab-btn ${activeTab === 'snake' ? 'active' : ''}`}
                onClick={() => setActiveTab('snake')}
              >
                Bug Hunter (Snake)
              </button>
              <button
                className={`tab-btn ${activeTab === 'tictactoe' ? 'active' : ''}`}
                onClick={() => setActiveTab('tictactoe')}
              >
                Git Align (Tic-Tac-Toe)
              </button>
            </div>

            {/* Scoreboard */}
            <div className="scoreboard">
              <h4 className="scoreboard-title">STATISTICS</h4>
              {activeTab === 'snake' ? (
                <div className="stat-grid">
                  <div className="stat-box">
                    <span className="stat-label">Bugs Resolved</span>
                    <span className="stat-val text-gold">{bugsResolved}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">High Score</span>
                    <span className="stat-val">{snakeHighScore}</span>
                  </div>
                </div>
              ) : (
                <div className="stat-grid">
                  <div className="stat-box">
                    <span className="stat-label">Player (X)</span>
                    <span className="stat-val text-gold">{tttScores.player}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">{gameMode === 'ai' ? 'AI (O)' : 'Opponent'}</span>
                    <span className="stat-val">{tttScores.opponent}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Ties</span>
                    <span className="stat-val">{tttScores.ties}</span>
                  </div>
                </div>
              )}
              {activeTab === 'tictactoe' && (
                <button className="clear-stats-btn" onClick={resetTttScores}>
                  Reset Stats
                </button>
              )}
            </div>
          </div>

          {/* Game Window Area */}
          <div className="game-screen-wrapper">
            {activeTab === 'snake' ? (
              <div className="snake-game-container">
                <div className="game-controls-header">
                  <span className="game-status-pill">
                    {isSnakeGameOver ? 'SYSTEM CRASHED (Game Over)' : isSnakeRunning ? 'DEBUGGER RUNNING' : 'DEBUGGER IDLE'}
                  </span>
                  <div className="game-action-buttons">
                    <button
                      className="game-action-btn"
                      onClick={() => setIsSnakeRunning(!isSnakeRunning)}
                      disabled={isSnakeGameOver}
                      title={isSnakeRunning ? 'Pause' : 'Start'}
                    >
                      {isSnakeRunning ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button className="game-action-btn" onClick={resetSnake} title="Reset">
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>

                {/* Snake Grid Board */}
                <div className="snake-board">
                  {Array.from({ length: GRID_SIZE }).map((_, y) => (
                    <div key={y} className="snake-row">
                      {Array.from({ length: GRID_SIZE }).map((_, x) => {
                        const isSnakeSegment = snake.some((segment) => segment.x === x && segment.y === y);
                        const isHead = snake[0].x === x && snake[0].y === y;
                        const isBugSegment = bug.x === x && bug.y === y;

                        return (
                          <div
                            key={x}
                            className={`snake-cell 
                              ${isSnakeSegment ? 'snake-body' : ''} 
                              ${isHead ? 'snake-head' : ''} 
                              ${isBugSegment ? 'bug-cell' : ''}
                            `}
                          />
                        );
                      })}
                    </div>
                  ))}

                  {/* Overlays */}
                  {isSnakeGameOver && (
                    <div className="board-overlay animate-fade-in">
                      <AlertTriangle className="error-icon" size={48} />
                      <h3>Runtime Error</h3>
                      <p>Your compiler ran into a wall or collided with its own buffer!</p>
                      <button className="restart-btn" onClick={resetSnake}>
                        Recompile
                      </button>
                    </div>
                  )}

                  {!isSnakeRunning && !isSnakeGameOver && (
                    <div className="board-overlay">
                      <h3>Press Space or Start</h3>
                      <p>Use arrow keys to steer the compiler and resolve bugs (red glowing cells).</p>
                      <button className="restart-btn" onClick={() => setIsSnakeRunning(true)}>
                        Start Debugging
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Steering Controls */}
                <div className="mobile-dpad">
                  <div className="dpad-row">
                    <button className="dpad-btn up" onClick={() => handleSnakeButtonDir({ x: 0, y: -1 })}>▲</button>
                  </div>
                  <div className="dpad-row">
                    <button className="dpad-btn left" onClick={() => handleSnakeButtonDir({ x: -1, y: 0 })}>◀</button>
                    <div className="dpad-center" />
                    <button className="dpad-btn right" onClick={() => handleSnakeButtonDir({ x: 1, y: 0 })}>▶</button>
                  </div>
                  <div className="dpad-row">
                    <button className="dpad-btn down" onClick={() => handleSnakeButtonDir({ x: 0, y: 1 })}>▼</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ttt-game-container">
                <div className="game-controls-header">
                  <div className="mode-selector">
                    <button
                      className={`mode-btn ${gameMode === 'ai' ? 'active' : ''}`}
                      onClick={() => {
                        setGameMode('ai');
                        resetTtt();
                      }}
                    >
                      <Cpu size={14} /> <span>VS Engine</span>
                    </button>
                    <button
                      className={`mode-btn ${gameMode === 'pvp' ? 'active' : ''}`}
                      onClick={() => {
                        setGameMode('pvp');
                        resetTtt();
                      }}
                    >
                      <User size={14} /> <span>Local Dev</span>
                    </button>
                  </div>

                  <button className="game-action-btn" onClick={resetTtt} title="Reset Match">
                    <RotateCcw size={16} />
                  </button>
                </div>

                {/* Tic Tac Toe Grid */}
                <div className="ttt-board">
                  {board.map((value, idx) => {
                    const isWinningSquare = winningLine?.includes(idx);
                    return (
                      <button
                        key={idx}
                        className={`ttt-square ${isWinningSquare ? 'winning-square' : ''} ${value ? 'filled' : ''}`}
                        onClick={() => handleTttClick(idx)}
                        disabled={value !== null || tttWinner !== null || (!isXNext && gameMode === 'ai')}
                      >
                        {value && (
                          <span className={`ttt-symbol ${value === 'X' ? 'symbol-x' : 'symbol-o'}`}>
                            {value}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Winner Overlay */}
                  {tttWinner && (
                    <div className="board-overlay animate-fade-in">
                      <h3>
                        {tttWinner === 'Tie'
                          ? 'Branches Merged (Tie)'
                          : `${tttWinner === 'X' ? 'Player (X)' : gameMode === 'ai' ? 'Engine (O)' : 'Opponent (O)'} Wins!`}
                      </h3>
                      <p>
                        {tttWinner === 'Tie'
                          ? 'No conflicts found, clean git history.'
                          : 'Build aligned successfully.'}
                      </p>
                      <button className="restart-btn" onClick={resetTtt}>
                        Deploy Next Commit
                      </button>
                    </div>
                  )}
                </div>

                <div className="ttt-turn-indicator">
                  {!tttWinner && (
                    <span>
                      Active Branch:{' '}
                      <strong className={isXNext ? 'text-gold' : 'text-primary'}>
                        {isXNext ? 'Player (X)' : gameMode === 'ai' ? 'Thinking...' : 'Opponent (O)'}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
