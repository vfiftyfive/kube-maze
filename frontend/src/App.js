import React, { useState, useEffect } from "react";
import { solveMaze } from "./utils"; 
import "./styles.scss";

export default function App() {
  const [userPosition, setUserPosition] = useState({ x: 0, y: 0 });
  const [maze, setMaze] = useState(null);
  const [gameStatus, setGameStatus] = useState("playing");
  const cheatMode = process.env.REACT_APP_CHEAT_MODE === "true";
  const mazeSize = process.env.REACT_APP_MAZE_SIZE || 10;
  const [solutionPath, setSolutionPath] = useState([]);

  useEffect(() => {
    const fetchMaze = async () => {
      const url = `${process.env.REACT_APP_BACKEND_API_URL}/maze?width=${mazeSize}&height=${mazeSize}`; // Adjusted for a single size parameter
      try {
        const response = await fetch(url);
        const data = await response.json();
        setMaze(data);
        
        let startPosition = { x: 0, y: 0 };
        for (let y = 0; y < data.height; y++) {
          for (let x = 0; x < data.width; x++) {
            if (data.cells[y][x].IsStart) {
              startPosition = { x, y };
              break;
            }
          }
        }
        setUserPosition({ x: data.cells.findIndex(row => row.some(cell => cell.IsStart)), y: 0 });
        if (cheatMode) {
          const solution = solveMaze(data, /* startX, startY, endX, endY */);
          const formattedSolutionPath = solution.map(point => `${point.y}-${point.x}`);
          setSolutionPath(formattedSolutionPath);
        }
        
      } catch (error) {
        console.error("Failed to fetch maze:", error);
      }
    };

    fetchMaze();
  }, [mazeSize, cheatMode]);

  const handleKeyDown = (event) => {
    if (!maze || gameStatus !== "playing") return;
    let newX = userPosition.x;
    let newY = userPosition.y;

    switch (event.key) {
      case "ArrowUp":
        if (newY > 0 && !maze.cells[newY][newX].Walls[0]) newY--;
        break;
      case "ArrowDown":
        if (newY < maze.height - 1 && !maze.cells[newY][newX].Walls[2]) newY++;
        break;
      case "ArrowLeft":
        if (newX > 0 && !maze.cells[newY][newX].Walls[3]) newX--;
        break;
      case "ArrowRight":
        if (newX < maze.width - 1 && !maze.cells[newY][newX].Walls[1]) newX++;
        break;
      default:
        return;
    }

    setUserPosition({ x: newX, y: newY });
    // Check for win condition
    if (maze.cells[newY][newX].IsFinish) {
      setGameStatus("won");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [maze, userPosition, gameStatus]);

  const makeClassName = (i, j) => {
    const cell = maze ? maze.cells[i][j] : null;
    let className = cell ? `${cell.Walls.map((wall, index) => wall ? `${["topWall", "rightWall", "bottomWall", "leftWall"][index]}` : '').join(' ')} ${cell.IsStart ? 'start' : ''} ${cell.IsFinish ? 'finish destination' : ''} ${i === userPosition.y && j === userPosition.x ? 'currentPosition' : ''} ${cheatMode && solutionPath.includes(`${i}-${j}`) ? 'solutionPath' : ''}` : '';
    return className.trim();
  };
  
  

  return (
    <div className="App" tabIndex="0" onKeyDown={handleKeyDown}>
      <p>Use &#8592;, &#8593;, &#8594;, &#8595; to move. Cheat mode is {cheatMode ? "ON" : "OFF"}.</p>
      {maze && (
        <table id="maze">
          <tbody>
            {maze.cells.map((row, i) => (
              <tr key={`row-${i}`}>
                {row.map((cell, j) => (
                  <td key={`cell-${i}-${j}`} className={makeClassName(i, j)}>
                    <div />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {gameStatus === "won" && (
        <div className="congratsMessage">
          <p>Congrats, you've solved the maze! 😊</p>
          <button className="playAgainBtn" onClick={() => window.location.reload()}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
