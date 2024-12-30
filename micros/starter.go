package main

import (
	"log"
	"os"
	"os/exec"
	"sync"
)

func startService(name, command, dir string) {
	cmd := exec.Command(command)
	cmd.Dir = dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Start(); err != nil {
		log.Fatalf("Failed to start service %s: %v", name, err)
	}
	log.Printf("Service %s started with PID %d", name, cmd.Process.Pid)

	// Wait for the process to complete
	if err := cmd.Wait(); err != nil {
		log.Printf("Service %s stopped with error: %v", name, err)
	} else {
		log.Printf("Service %s stopped gracefully", name)
	}
}

func main() {
	services := []struct {
		name    string
		command string
		dir     string
	}{
		{"Ads Service", "./naevis.exe", "./ads"},
		{"Auth Service", "./naevis.exe", "./auth"},
		{"Business Service", "./naevis.exe", "./business"},
		{"Events Service", "./naevis.exe", "./events"},
		{"Feed Service", "./naevis.exe", "./feed"},
		{"Media Service", "./naevis.exe", "./media"},
		{"Merch Service", "./naevis.exe", "./merch"},
		{"Place Service", "./naevis.exe", "./place"},
		{"Profile Service", "./naevis.exe", "./profile"},
		{"Settings Service", "./naevis.exe", "./settings"},
		{"Ticket Service", "./naevis.exe", "./ticket"},
	}

	var wg sync.WaitGroup

	for _, service := range services {
		wg.Add(1)
		go func(svc struct {
			name    string
			command string
			dir     string
		}) {
			defer wg.Done()
			startService(svc.name, svc.command, svc.dir)
		}(service)
	}

	wg.Wait()
	log.Println("All services have stopped.")
}
