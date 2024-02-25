import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Maze from './components/Maze';
import './App.css';

function App() {
  const [maze, setMaze] = useState(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!maze) return;
      
      let newX = playerPosition.x;
      let newY = playerPosition.y;

      switch (event.key) {
        case "ArrowUp":
          // Attempt to move up
          newY = newY > 0 && !maze.cells[newY][newX].Walls[0] ? newY - 1 : newY;
          break;
        case "ArrowDown":
          // Attempt to move down
          newY = newY < maze.height - 1 && !maze.cells[newY][newX].Walls[2] ? newY + 1 : newY;
          break;
        case "ArrowLeft":
          // Attempt to move left
          newX = newX > 0 && !maze.cells[newY][newX].Walls[3] ? newX - 1 : newX;
          break;
        case "ArrowRight":
          // Attempt to move right
          newX = newX < maze.width - 1 && !maze.cells[newY][newX].Walls[1] ? newX + 1 : newX;
          break;
        default:
          return; // If it's not an arrow key, we don't want to do anything
      }

      setPlayerPosition({ x: newX, y: newY });
    };

    // Bind the event listener
    window.addEventListener('keydown', handleKeyDown);

    // Unbind the event listener on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerPosition, maze]); // Only re-bind the event listener if these values change

  useEffect(() => {
    const name = Cookies.get('playerName');
    if (!name) {
      const newName = generatePlayerName();
      Cookies.set('playerName', newName, { expires: 7 });
      setPlayerName(newName);
    } else {
      setPlayerName(name);
    }
    
    // Fetch the maze once on component mount
    fetchMaze();
  }, []); // Empty array to ensure this effect runs only once

  const fetchMaze = () => {
    // Assuming your backend service is running and accessible
    fetch('http://localhost:8080/maze?width=5&height=5')
      .then(response => response.json())
      .then(data => {
        setMaze(data);
        setPlayerPosition({ x: 0, y: 0 }); // Reset player position when fetching a new maze
      })
      .catch(error => console.error('Error fetching maze:', error));
  };

  const generatePlayerName = () => {
    const colors = ['Red', 'Green', 'Blue', 'Yellow', 'Purple'];
    const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const fruit = fruits[Math.floor(Math.random() * fruits.length)];
    return `${color} ${fruit}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to the Maze, {playerName}!</h1>
        <div className="welcome-frame">
          {maze && <Maze maze={maze} playerPosition={playerPosition} />}
        </div>
      </header>
    </div>
  );
}

export default App;
