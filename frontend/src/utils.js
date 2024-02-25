// utils.js
export const solveMaze = (maze, startX, startY, endX, endY) => {
  const visited = Array.from(Array(maze.height), () => Array(maze.width).fill(false));
  let path = [];
  let found = false;

  const dfs = (x, y) => {
      if (x === endX && y === endY) {
          path.push({x, y});
          found = true;
          return;
      }
      if (x < 0 || y < 0 || x >= maze.width || y >= maze.height || visited[y][x] || maze.cells[y][x].Walls[2] || found) return;

      visited[y][x] = true;
      path.push({x, y});

      // Move Right
      if (!maze.cells[y][x].Walls[1]) dfs(x + 1, y);
      // Move Down
      if (!maze.cells[y][x].Walls[2]) dfs(x, y + 1);
      // Move Left
      if (!maze.cells[y][x].Walls[3]) dfs(x - 1, y);
      // Move Up
      if (!maze.cells[y][x].Walls[0]) dfs(x, y - 1);

      if (!found) path.pop();
  };

  dfs(startX, startY);

  return path;
};
