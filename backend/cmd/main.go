package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
	"github.com/vfiftyfive/kube-maze/backend/pkg/maze"
)

// MazeResponse represents the JSON structure for the maze response
type MazeResponse struct {
	Width  int           `json:"width"`
	Height int           `json:"height"`
	Cells  [][]maze.Cell `json:"cells"`
}

func setupCORS(router *mux.Router) {
	router.Use(mux.CORSMethodMiddleware(router))
	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*") // Be permissive
			w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			next.ServeHTTP(w, r)
		})
	})
}

func generateMazeHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	width, err := strconv.Atoi(query.Get("width"))
	if err != nil || width <= 0 {
		http.Error(w, "Invalid width parameter", http.StatusBadRequest)
		return
	}

	height, err := strconv.Atoi(query.Get("height"))
	if err != nil || height <= 0 {
		http.Error(w, "Invalid height parameter", http.StatusBadRequest)
		return
	}

	generatedMaze := maze.NewMaze(width, height) // Use the NewMaze function from the maze package
	response := MazeResponse{
		Width:  generatedMaze.Width,
		Height: generatedMaze.Height,
		Cells:  generatedMaze.Cells,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	router := mux.NewRouter()
	setupCORS(router)
	logger := logrus.New()

	// Define the route for generating mazes
	router.HandleFunc("/maze", generateMazeHandler).Methods("GET")

	// Start the server
	logger.Info("Starting server on port 8080")
	if err := http.ListenAndServe(":8080", router); err != nil {
		logger.Fatal(err)
	}
}
