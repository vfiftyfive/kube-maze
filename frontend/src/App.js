import { useState, useEffect } from "react";
// import { solve } from "./util"; // Assuming solve is still relevant
import "./styles.scss";

export default function App() {
  const [gameId] = useState(1);
  const [status] = useState("playing");
  const [userPosition, setUserPosition] = useState({ x: 0, y: 0 });
  const [maze, setMaze] = useState(null);
  const cheatMode = process.env.REACT_APP_CHEAT_MODE === 'true' ? true : (false); // Default to false if env var is missing
  const mazeSize = process.env.REACT_APP_MAZE_SIZE || 10; // Default to 10 if env var is missing

  useEffect(() => {
    const fetchMaze = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/maze?width=${mazeSize}&height=${mazeSize}`);
        const data = await response.json();
        setMaze(data);
        setUserPosition({ x: data.cells.findIndex(row => row.some(cell => cell.IsStart)), y: 0 }); // Simplified start position logic
      } catch (error) {
        console.error("Failed to fetch maze:", error);
      }
    };

    fetchMaze();
  }, [gameId, mazeSize]);

  const handleMove = (e) => {
    if (status !== "playing" || !maze) return;
    e.preventDefault();
    let { x, y } = userPosition;

    // Adjust movement logic based on the fetched maze structure
    switch (e.key) {
      case "ArrowUp": if (y > 0 && !maze.cells[y][x].Walls[0]) y--; break;
      case "ArrowDown": if (y < maze.height - 1 && !maze.cells[y][x].Walls[2]) y++; break;
      case "ArrowLeft": if (x > 0 && !maze.cells[y][x].Walls[3]) x--; break;
      case "ArrowRight": if (x < maze.width - 1 && !maze.cells[y][x].Walls[1]) x++; break;
      default: return;
    }

    setUserPosition({ x, y });
  };

  // Use solve function if needed for cheat mode or other features
  // const solutionSet = cheatMode ? new Set(solve(maze, userPosition.x, userPosition.y).map(([x, y]) => `${x}-${y}`)) : new Set();

  const makeClassName = (i, j) => {
    let className = '';
    const cell = maze.cells[i][j];
    className += cell.Walls[0] ? ' topWall' : '';
    className += cell.Walls[1] ? ' rightWall' : '';
    className += cell.Walls[2] ? ' bottomWall' : '';
    className += cell.Walls[3] ? ' leftWall' : '';
    if (cell.IsStart) className += ' start';
    if (cell.IsFinish) className += ' finish';
    if (userPosition.x === j && userPosition.y === i) className += ' currentPosition';
    // if (cheatMode && solutionSet.has(`${i}-${j}`)) className += ' solutionPath';
    return className.trim();
  };

  return (
    <div className="App" onKeyDown={handleMove} tabIndex={0}>
      {/* Instructions updated for arrow keys */}
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
      {status === "won" && (
        <div className="info">
          <p>You won! Click to restart.</p>
        </div>
      )}
    </div>
  );
}
