package main

import (
	"encoding/json"
	"kube-maze/backend/pkg/maze"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
)

// Maze represents the structure of our maze
type Maze struct {
	Width  int `json:"width"`
	Height int `json:"height"`
	// Add more fields as needed for your maze logic
}

func generateMaze(width, height int) maze.Maze {
	return maze.NewMaze(width, height) // Assuming you've imported the maze package correctly
}

func main() {
	router := mux.NewRouter()
	logger := logrus.New()

	// Define your routes here
	router.HandleFunc("/maze", func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		width, _ := strconv.Atoi(query.Get("width"))
		height, _ := strconv.Atoi(query.Get("height"))

		if width <= 0 || height <= 0 {
			http.Error(w, "Invalid width or height parameter", http.StatusBadRequest)
			return
		}

		// Placeholder for maze generation logic
		maze := generateMaze(width, height) // Implement this function
		json.NewEncoder(w).Encode(maze)
	}).Methods("GET")

	logger.Info("Starting server on port 8080")

	http.ListenAndServe(":8080", router)
}
