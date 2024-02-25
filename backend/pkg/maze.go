package maze

// Cell represents a single cell in the maze
type Cell struct {
	X, Y  int     // Coordinates of the cell
	Walls [4]bool // Represents the walls of the cell: [top, right, bottom, left]
}

// Maze represents the structure of our maze
type Maze struct {
	Width, Height int
	Cells         [][]Cell
}

// NewMaze generates a new Maze with the given width and height
func NewMaze(width, height int) Maze {
	cells := make([][]Cell, height)
	for y := range cells {
		cells[y] = make([]Cell, width)
		for x := range cells[y] {
			cells[y][x] = Cell{X: x, Y: y, Walls: [4]bool{true, true, true, true}}
		}
	}
	return Maze{Width: width, Height: height, Cells: cells}
}
