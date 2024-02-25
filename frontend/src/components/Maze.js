import React from 'react';
import '../App.css'; // Importing App.css for styles

const Maze = ({ maze, playerPosition }) => {
  if (!maze) return null;

  const cellSize = 20; // Fixed cell size for simplicity

  return (
    <div className="maze-container" style={{ gridTemplateColumns: `repeat(${maze.width}, ${cellSize}px)` }}>
      {maze.cells.flat().map((cell, index) => (
        <div key={index} className={`maze-cell 
          ${cell.isStart ? 'start-cell' : ''} 
          ${cell.isFinish ? 'finish-cell' : ''} 
          ${playerPosition.x === cell.X && playerPosition.y === cell.Y ? 'player' : ''}`}
          style={{
            width: `${cellSize}px`,
            height: `${cellSize}px`,
            borderTop: cell.Walls[0] ? '2px solid #333' : 'none',
            borderRight: cell.Walls[1] ? '2px solid #333' : 'none',
            borderBottom: cell.Walls[2] ? '2px solid #333' : 'none',
            borderLeft: cell.Walls[3] ? '2px solid #333' : 'none',
          }}>
        </div>
      ))}
    </div>
  );
};

export default Maze;
