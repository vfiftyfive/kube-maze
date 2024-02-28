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

package controller

import (
	"context"
	"strconv"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/util/intstr"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller/controllerutil"
	"sigs.k8s.io/controller-runtime/pkg/log"

	maze "github.com/vfiftyfive/kube-maze/backend/pkg/maze"
)

// MazeReconciler reconciles a Maze object
type MazeReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

//+kubebuilder:rbac:groups=maze.staticvoid.io,resources=mazes,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=maze.staticvoid.io,resources=mazes/status,verbs=get;update;patch
//+kubebuilder:rbac:groups=maze.staticvoid.io,resources=mazes/finalizers,verbs=update
//+kubebuilder:rbac:groups=apps,resources=deployments,verbs=get;list;watch;create;update;patch;delete
//+kubebuilder:rbac:groups=core,resources=services,verbs=get;list;watch;create;update;patch;delete

func (r *MazeReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := log.FromContext(ctx)

	// Fetch the Maze instance
	maze := &maze.Maze{}
	err := r.Get(ctx, req.NamespacedName, maze)
	if err != nil {
		log.Info("Maze resource not found. Ignoring since object must be deleted")
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	// Define the desired Deployment
	desiredDeployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      maze.Name,
			Namespace: maze.Namespace,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: maze.Spec.Replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"app": maze.Name},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{"app": maze.Name},
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{
							Name:  "kube-maze-backend",
							Image: "vfiftyfive/kube-maze-backend:0.1",
							Ports: []corev1.ContainerPort{{ContainerPort: 8080}},
						},
						{
							Name:  "kube-maze-frontend",
							Image: "vfiftyfive/kube-maze-frontend:0.1",
							Env: []corev1.EnvVar{
								{Name: "REACT_APP_MAZE_SIZE", Value: maze.Spec.Size},
								{Name: "REACT_APP_CHEAT_MODE", Value: strconv.FormatBool(maze.Spec.CheatMode)},
								{Name: "REACT_APP_BACKEND_URL", Value: "http://localhost:8080"},
							},
							Ports: []corev1.ContainerPort{{ContainerPort: 80}},
						},
					},
				},
			},
		},
	}

	// Set Maze instance as the owner of the Deployment
	if err := controllerutil.SetControllerReference(maze, desiredDeployment, r.Scheme); err != nil {
		return ctrl.Result{}, err
	}

	// Check if the Deployment already exists, if not create a new one, otherwise update
	foundDeployment := &appsv1.Deployment{}
	err = r.Get(ctx, client.ObjectKey{Name: maze.Name, Namespace: maze.Namespace}, foundDeployment)
	if err != nil && errors.IsNotFound(err) {
		log.Info("Creating a new Deployment", "Deployment.Namespace", desiredDeployment.Namespace, "Deployment.Name", desiredDeployment.Name)
		err = r.Create(ctx, desiredDeployment)
		if err != nil {
			log.Error(err, "Failed to create new Deployment", "Deployment.Namespace", desiredDeployment.Namespace, "Deployment.Name", desiredDeployment.Name)
			return ctrl.Result{}, err
		}
	} else if err != nil {
		return ctrl.Result{}, err
	} else {
		// Update Deployment if it already exists and is different from the desired state
		desiredDeployment.ResourceVersion = foundDeployment.ResourceVersion
		err = r.Update(ctx, desiredDeployment)
		if err != nil {
			log.Error(err, "Failed to update Deployment", "Deployment.Namespace", desiredDeployment.Namespace, "Deployment.Name", desiredDeployment.Name)
			return ctrl.Result{}, err
		}
	}

	// Define the desired Service
	desiredService := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      maze.Name,
			Namespace: maze.Namespace,
		},
		Spec: corev1.ServiceSpec{
			Selector: map[string]string{
				"app": maze.Name,
			},
			Ports: []corev1.ServicePort{
				{
					Port:       80,
					TargetPort: intstr.FromInt(80),
				},
				{
					Port:       8080,
					TargetPort: intstr.FromInt(8080),
				},
			},
		},
	}

	// Set Maze instance as the owner of the Service
	if err := controllerutil.SetControllerReference(maze, desiredService, r.Scheme); err != nil {
		return ctrl.Result{}, err
	}

	// Check if the Service already exists, if not create a new one, otherwise do nothing
	foundService := &corev1.Service{}
	err = r.Get(ctx, client.ObjectKey{Name: maze.Name, Namespace: maze.Namespace}, foundService)
	if err != nil && errors.IsNotFound(err) {
		log.Info("Creating a new Service", "Service.Namespace", desiredService.Namespace, "Service.Name", desiredService.Name)
		err = r.Create(ctx, desiredService)
		if err != nil {
			log.Error(err, "Failed to create new Service", "Service.Namespace", desiredService.Namespace, "Service.Name", desiredService.Name)
			return ctrl.Result{}, err
		}
	} else if err != nil {
		return ctrl.Result{}, err
	}

	// Deployment and Service are successfully created or updated
	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *MazeReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&maze.Maze{}).
		Complete(r)
}
