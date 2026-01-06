package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"runtime"
	"syscall"

	"golang.org/x/sys/unix"
)

func main() {
	runtime.LockOSThread()

	if os.Getenv("SANDBOX") == "1" {
		child()
		return
	}

	cmd := exec.Command("/proc/self/exe")
	cmd.Env = append(os.Environ(), "SANDBOX=1")
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	cmd.SysProcAttr = &unix.SysProcAttr{
		Cloneflags: unix.CLONE_NEWUTS |
			unix.CLONE_NEWPID |
			unix.CLONE_NEWNS |
			unix.CLONE_NEWUSER,

		UidMappings: []syscall.SysProcIDMap{
			{ContainerID: 0, HostID: os.Getuid(), Size: 1},
		},
		GidMappingsEnableSetgroups: false,
		GidMappings: []syscall.SysProcIDMap{
			{ContainerID: 0, HostID: os.Getgid(), Size: 1},
		},
	}

	if err := cmd.Run(); err != nil {
		log.Fatal(err)
	}
}

func child() {
	fmt.Println("== sandbox child ==")

	if err := unix.Sethostname([]byte("sandbox")); err != nil {
		log.Fatal(err)
	}

	// mount -t proc proc /proc
	if err := unix.Mount("proc", "/proc", "proc", 0, ""); err != nil {
		log.Fatal(err)
	}
	defer unix.Unmount("/proc", 0)

	cmd := exec.Command("/bin/bash")
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		log.Fatal(err)
	}
}

