import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'snake' | 'tictactoe' | 'hexmatch'>('snake');

  // --- 1. SNAKE STATE ---
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

  // Snake Loop
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
        e.preventDefault();
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

  // --- 2. TIC-TAC-TOE STATE & LOGIC ---
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [tttWinner, setTttWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
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
    } else {
      setIsXNext(player !== 'X');
    }
    return true;
  };

  // AI Logic
  const findBestMove = (squares: (string | null)[]) => {
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        const testBoard = [...squares];
        testBoard[i] = 'O';
        if (checkWinner(testBoard)?.winner === 'O') return i;
      }
    }
    for (let i = 0; i < squares.length; i++) {
      if (!squares[i]) {
        const testBoard = [...squares];
        testBoard[i] = 'X';
        if (checkWinner(testBoard)?.winner === 'X') return i;
      }
    }
    if (!squares[4]) return 4;
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(c => !squares[c]);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    const emptyIndices = squares.map((s, idx) => s === null ? idx : null).filter(idx => idx !== null) as number[];
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  };

  useEffect(() => {
    if (activeTab !== 'tictactoe' || isXNext || tttWinner) return;

    const aiTimeout = setTimeout(() => {
      const bestMove = findBestMove(board);
      if (bestMove !== undefined && bestMove !== -1) {
        makeMove(bestMove, 'O');
      }
    }, 400);

    return () => clearTimeout(aiTimeout);
  }, [isXNext, board, tttWinner, activeTab]);

  const handleTttClick = (index: number) => {
    if (!isXNext) return;
    makeMove(index, 'X');
  };

  const resetTtt = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setTttWinner(null);
    setWinningLine(null);
  };

  // --- 3. HEX MATCH STATE & LOGIC ---
  const generateRandomColor = () => ({
    r: Math.floor(Math.random() * 200) + 30,
    g: Math.floor(Math.random() * 200) + 30,
    b: Math.floor(Math.random() * 200) + 30,
  });

  const [targetColor, setTargetColor] = useState(generateRandomColor);
  const [userColor, setUserColor] = useState({ r: 128, g: 128, b: 128 });
  const [hexAccuracy, setHexAccuracy] = useState<number | null>(null);

  const handleHexSubmit = () => {
    const rDiff = Math.abs(targetColor.r - userColor.r);
    const gDiff = Math.abs(targetColor.g - userColor.g);
    const bDiff = Math.abs(targetColor.b - userColor.b);
    const totalDiff = rDiff + gDiff + bDiff;
    const accuracy = Math.max(0, Math.round(100 - (totalDiff / 765) * 100));
    setHexAccuracy(accuracy);
  };

  const resetHexMatch = () => {
    setTargetColor(generateRandomColor());
    setUserColor({ r: 128, g: 128, b: 128 });
    setHexAccuracy(null);
  };

  return (
    <section id="playroom" className="playroom-section">
      <div className="container">
        <div className="section-header">
          <span className="section-number">04</span>
          <h2 className="section-title">Playroom</h2>
        </div>

        <div className="playroom-layout">
          {/* Games Selection Sidebar */}
          <div className="playroom-sidebar">
            <div className="tab-buttons">
              <button
                className={`tab-btn ${activeTab === 'snake' ? 'active' : ''}`}
                onClick={() => setActiveTab('snake')}
              >
                01. Bug Hunter
              </button>
              <button
                className={`tab-btn ${activeTab === 'tictactoe' ? 'active' : ''}`}
                onClick={() => setActiveTab('tictactoe')}
              >
                02. Git Align
              </button>
              <button
                className={`tab-btn ${activeTab === 'hexmatch' ? 'active' : ''}`}
                onClick={() => setActiveTab('hexmatch')}
              >
                03. CSS Color Match
              </button>
            </div>
          </div>

          {/* Game Window Display Area */}
          <div className="game-screen-wrapper">
            
            {/* 1. SNAKE GAME */}
            {activeTab === 'snake' && (
              <div className="snake-game-container">
                <div className="game-controls-header">
                  <span className="game-status-pill">
                    {isSnakeGameOver ? 'Game Over' : isSnakeRunning ? 'Running' : 'Idle'}
                  </span>
                  <span className="score-pill">Score: {bugsResolved} | High: {snakeHighScore}</span>
                  <div className="game-action-buttons">
                    <button
                      className="game-action-btn"
                      onClick={() => setIsSnakeRunning(!isSnakeRunning)}
                      disabled={isSnakeGameOver}
                    >
                      {isSnakeRunning ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button className="game-action-btn" onClick={resetSnake}>
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>

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

                  {isSnakeGameOver && (
                    <div className="board-overlay animate-fade-in">
                      <AlertTriangle className="error-icon" size={36} />
                      <h3>Runtime Error</h3>
                      <p>The compiler ran into a wall or collided with its own buffer.</p>
                      <button className="restart-btn" onClick={resetSnake}>
                        Recompile
                      </button>
                    </div>
                  )}

                  {!isSnakeRunning && !isSnakeGameOver && (
                    <div className="board-overlay">
                      <h3>Bug Hunter</h3>
                      <p>Steer the compiler using Arrow Keys. Resolve red bugs to grow the codebase.</p>
                      <button className="restart-btn" onClick={() => setIsSnakeRunning(true)}>
                        Start Debugging
                      </button>
                    </div>
                  )}
                </div>

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
            )}

            {/* 2. TIC TAC TOE */}
            {activeTab === 'tictactoe' && (
              <div className="ttt-game-container">
                <div className="game-controls-header">
                  <span className="game-status-pill">Commit Aligner</span>
                  <button className="game-action-btn" onClick={resetTtt}>
                    <RotateCcw size={14} />
                  </button>
                </div>

                <div className="ttt-board">
                  {board.map((value, idx) => {
                    const isWinningSquare = winningLine?.includes(idx);
                    return (
                      <button
                        key={idx}
                        className={`ttt-square ${isWinningSquare ? 'winning-square' : ''} ${value ? 'filled' : ''}`}
                        onClick={() => handleTttClick(idx)}
                        disabled={value !== null || tttWinner !== null || !isXNext}
                      >
                        {value && (
                          <span className={`ttt-symbol ${value === 'X' ? 'symbol-x' : 'symbol-o'}`}>
                            {value}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {tttWinner && (
                    <div className="board-overlay animate-fade-in">
                      <h3>
                        {tttWinner === 'Tie'
                          ? 'Branches Merged'
                          : `${tttWinner === 'X' ? 'You Win' : 'Engine Wins'}`}
                      </h3>
                      <p>
                        {tttWinner === 'Tie'
                          ? 'No conflicts, clean git history.'
                          : 'Build aligned successfully.'}
                      </p>
                      <button className="restart-btn" onClick={resetTtt}>
                        Next Commit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. CSS COLOR MATCH */}
            {activeTab === 'hexmatch' && (
              <div className="hex-game-container">
                <div className="game-controls-header">
                  <span className="game-status-pill">Match Target Color</span>
                  <button className="game-action-btn" onClick={resetHexMatch}>
                    <RotateCcw size={14} />
                  </button>
                </div>

                <div className="hex-colors-preview">
                  <div className="color-preview-box">
                    <div
                      className="color-block"
                      style={{ backgroundColor: `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})` }}
                    />
                    <span className="color-label">Target CSS</span>
                  </div>
                  <div className="color-preview-box">
                    <div
                      className="color-block"
                      style={{ backgroundColor: `rgb(${userColor.r}, ${userColor.g}, ${userColor.b})` }}
                    />
                    <span className="color-label">Your Input</span>
                  </div>
                </div>

                <div className="color-sliders">
                  <div className="slider-group">
                    <span className="slider-label text-red">R ({userColor.r})</span>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={userColor.r}
                      onChange={(e) => setUserColor({ ...userColor, r: Number(e.target.value) })}
                      disabled={hexAccuracy !== null}
                    />
                  </div>
                  <div className="slider-group">
                    <span className="slider-label text-green">G ({userColor.g})</span>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={userColor.g}
                      onChange={(e) => setUserColor({ ...userColor, g: Number(e.target.value) })}
                      disabled={hexAccuracy !== null}
                    />
                  </div>
                  <div className="slider-group">
                    <span className="slider-label text-blue">B ({userColor.b})</span>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={userColor.b}
                      onChange={(e) => setUserColor({ ...userColor, b: Number(e.target.value) })}
                      disabled={hexAccuracy !== null}
                    />
                  </div>
                </div>

                {hexAccuracy === null ? (
                  <button className="restart-btn full-width" onClick={handleHexSubmit}>
                    Compile & Match
                  </button>
                ) : (
                  <div className="hex-results animate-fade-in">
                    <h4>Accuracy: {hexAccuracy}%</h4>
                    <p className="hex-code-match">
                      Target: RGB({targetColor.r}, {targetColor.g}, {targetColor.b}) <br />
                      Current: RGB({userColor.r}, {userColor.g}, {userColor.b})
                    </p>
                    <button className="restart-btn" onClick={resetHexMatch}>
                      Next Color
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
