import React, { useState, useEffect } from "react";
import { solveMaze } from "./utils"; 
import "./styles.scss";

export default function App() {
  const [userPosition, setUserPosition] = useState({ x: 0, y: 0 });
  const [maze, setMaze] = useState(null);
  const [gameStatus, setGameStatus] = useState("playing");
  const [solutionPath, setSolutionPath] = useState([]);
  
  useEffect(() => {
    const backendUrl = window.backendUrl || "http://localhost:8080";
    const cheatMode = window.cheatMode === 'true';
    const mazeSize = window.mazeSize || 10;

    const fetchMaze = async () => {
      const url = `${backendUrl}/maze?width=${mazeSize}&height=${mazeSize}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        setMaze(data);
        
        let startPosition = { x: 0, y: 0 }, endPosition = { x: 0, y: 0 };
        data.cells.forEach((row, y) => row.forEach((cell, x) => {
          if (cell.IsStart) startPosition = { x, y };
          if (cell.IsFinish) endPosition = { x, y };
        }));

        console.log("Start Position:", startPosition); // Log start position
        console.log("End Position:", endPosition); // Log end position

        setUserPosition({ x: data.cells.findIndex(row => row.some(cell => cell.IsStart)), y: 0 });
        
        if (cheatMode) {
          const solution = solveMaze(data, startPosition.x, startPosition.y, endPosition.x, endPosition.y);
          console.log("Solution Path:", solution); // Log the solution path
          setSolutionPath(solution);
        }

      } catch (error) {
        console.error("Failed to fetch maze:", error);
      }
    };

    fetchMaze();
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [maze, userPosition, gameStatus]);

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
  
  const makeClassName = (i, j) => {
    const cell = maze ? maze.cells[i][j] : null;
    let className = cell ? `${cell.Walls.map((wall, index) => wall ? `${["topWall", "rightWall", "bottomWall", "leftWall"][index]}` : '').join(' ')}` : '';
  
    // Apply solutionPath only if it's not the current position or destination
    if (solutionPath.some(pos => pos.x === j && pos.y === i) && window.cheatMode && !(i === userPosition.y && j === userPosition.x)) {
      className += ' solutionPath';
    }
  
    if (cell?.IsStart) className += ' start';
    if (cell?.IsFinish) {
      className += ' finish destination'; // Ensures destination class is added last
    }
  
    // Check if the current cell is the user's position
    if (i === userPosition.y && j === userPosition.x) {
      className += ' currentPosition';
    }
  
    return className.trim();
  };

  return (
    <div className="App" tabIndex="0" onKeyDown={handleKeyDown}>
      <p>Use &#8592;, &#8593;, &#8594;, &#8595; to move. If you see breadcrumbs, cheat mode is ON!.</p>
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
