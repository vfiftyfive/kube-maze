package maze

import (
	"math/rand"
	"time"
)

type Cell struct {
	X, Y     int
	Visited  bool
	Walls    [4]bool // top, right, bottom, left
	IsStart  bool    // Indicates the starting cell
	IsFinish bool    // Indicates the finish cell
}

type Maze struct {
	Width, Height int
	Cells         [][]Cell
}

// NewMaze initializes and returns a new maze
func NewMaze(width, height int) Maze {
	rand.Seed(time.Now().UnixNano()) // Consider moving this to main or init function

	m := Maze{Width: width, Height: height, Cells: make([][]Cell, height)}
	for y := range m.Cells {
		m.Cells[y] = make([]Cell, width)
		for x := range m.Cells[y] {
			m.Cells[y][x] = Cell{X: x, Y: y, Walls: [4]bool{true, true, true, true}}
		}
	}

	// Mark the start and finish cells
	m.Cells[0][0].IsStart = true
	m.Cells[height-1][width-1].IsFinish = true

	// Begin recursive backtracker maze generation
	stack := []*Cell{&m.Cells[0][0]} // Use a pointer to the start cell

	m.Cells[0][0].Visited = true

	for len(stack) > 0 {
		current := stack[len(stack)-1]

		neighbors := m.getUnvisitedNeighbors(*current)

		if len(neighbors) > 0 {
			// Choose a random unvisited neighboring cell
			chosenIndex := rand.Intn(len(neighbors))
			next := &m.Cells[neighbors[chosenIndex].Y][neighbors[chosenIndex].X]

			// Remove the wall between the current cell and the chosen cell
			m.removeWalls(current, next)

			// Mark the chosen cell as visited and push it to the stack
			next.Visited = true
			stack = append(stack, next)
		} else {
			// Pop a cell from the stack
			stack = stack[:len(stack)-1]
		}
	}

	return m
}

// getUnvisitedNeighbors returns a slice of unvisited neighbor cells
func (m *Maze) getUnvisitedNeighbors(cell Cell) []Cell {
	var neighbors []Cell

	directions := []struct {
		dx, dy int
	}{
		{0, -1}, // top
		{1, 0},  // right
		{0, 1},  // bottom
		{-1, 0}, // left
	}

	for _, dir := range directions {
		nx, ny := cell.X+dir.dx, cell.Y+dir.dy

		if nx >= 0 && nx < m.Width && ny >= 0 && ny < m.Height && !m.Cells[ny][nx].Visited {
			neighbors = append(neighbors, m.Cells[ny][nx])
		}
	}

	return neighbors
}

// removeWalls removes the walls between two adjacent cells
func (m *Maze) removeWalls(current, next *Cell) {
	dx := next.X - current.X
	dy := next.Y - current.Y

	if dx == 1 {
		current.Walls[1] = false
		next.Walls[3] = false
	} else if dx == -1 {
		current.Walls[3] = false
		next.Walls[1] = false
	} else if dy == 1 {
		current.Walls[2] = false
		next.Walls[0] = false
	} else if dy == -1 {
		current.Walls[0] = false
		next.Walls[2] = false
	}
}
