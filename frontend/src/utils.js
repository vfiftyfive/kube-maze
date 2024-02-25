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
      if (x < 0 || y < 0 || x >= maze.width || y >= maze.height || visited[y][x] || found) return;

      visited[y][x] = true;
      path.push({x, y});

      // Move Right, checking for right wall of current cell
      if (!maze.cells[y][x].Walls[1]) dfs(x + 1, y);
      // Move Down, checking for bottom wall of current cell
      if (!maze.cells[y][x].Walls[2]) dfs(x, y + 1);
      // Move Left, check if there's no left wall on the target cell (or right wall on the current cell's left neighbor)
      if (x > 0 && !maze.cells[y][x-1].Walls[1]) dfs(x - 1, y);
      // Move Up, check if there's no top wall on the target cell (or bottom wall on the current cell's top neighbor)
      if (y > 0 && !maze.cells[y-1][x].Walls[2]) dfs(x, y - 1);

      if (!found) path.pop();
  };

  dfs(startX, startY);

  return path;
};
