/*
Copyright 2024.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// EDIT THIS FILE!  THIS IS SCAFFOLDING FOR YOU TO OWN!
// NOTE: json tags are required.  Any new fields you add must have json tags for the fields to be serialized.

// MazeSpec defines the desired state of Maze
type MazeSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file
	// Size defines the size of the maze (e.g., "5x5")
	Size string `json:"size,omitempty"`

	// CheatMode specifies if the cheat mode is enabled (true or false)
	CheatMode bool `json:"cheatMode,omitempty"`

	// BackendURL specifies the DNS name of the service for the maze
	BackendURL string `json:"serviceName,omitempty"`

	// Port specifies the port on which the maze service is exposed
	Port int32 `json:"port,omitempty"`

	// Replicas specifies the number of replicas for the maze service
	Replicas *int32 `json:"replicas,omitempty"`
}

// MazeStatus defines the observed state of Maze
type MazeStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file
	// Available indicates whether the Maze is currently available
	Available bool `json:"available,omitempty"`

	// ServiceURL provides the URL through which the Maze can be accessed
	ServiceURL string `json:"serviceURL,omitempty"`

	// LastError describes the last known error, if any, that occurred during the provisioning or operation of the Maze
	LastError string `json:"lastError,omitempty"`
}

//+kubebuilder:object:root=true
//+kubebuilder:subresource:status

// Maze is the Schema for the mazes API
type Maze struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   MazeSpec   `json:"spec,omitempty"`
	Status MazeStatus `json:"status,omitempty"`
}

//+kubebuilder:object:root=true

// MazeList contains a list of Maze
type MazeList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Maze `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Maze{}, &MazeList{})
}
