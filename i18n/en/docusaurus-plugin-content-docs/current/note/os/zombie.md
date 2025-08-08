# Zombie Processes

Orphan process: The father dies first, and the son is adopted by process 1.

Zombie process: The son dies first, and the father doesn't care.

## Killing Zombie Processes

1. Use `top` to check if there are zombie processes
2. Query where the zombie processes are through commands

```bash
ps -A -ostat,ppid,pid,cmd | grep -e '^[Zz]'
# Command explanation:

# -A parameter lists all processes

# -o custom output fields, we set the display fields to stat (status), ppid (parent process id), pid (process id), cmd (command) these four parameters

# Because processes with status z or Z are zombie processes, we use grep to capture processes with stat status zZ
```

## Examples

### Orphan Process

By controlling the sleep time, the father dies first, and the son is adopted by the orphanage (process 1). You can check through `ps` that the parent process of `a.out` becomes 1.

```c
#include <stdio.h>  
#include <stdlib.h>  
#include <unistd.h>  
#include <sys/wait.h>  
  
int main() {  
    pid_t pid = fork(); // Create child process  
  
    if (pid < 0) {  
        // fork failed  
        perror("fork failed");  
        exit(EXIT_FAILURE);  
    } else if (pid == 0) {  
        // Child process  
        printf("I am the child process with PID %d\n", getpid());  
        sleep(2000); // Let the child process run for a while, at this time the father is already dead.
        printf("Child process exiting...\n");  
        exit(EXIT_SUCCESS); // Child process exits  
    } else {  
        // Parent process exits directly
        printf("I am the parent process with PID %d and my child has PID %d\n", getpid(), pid);  
    }  
    return 0;  
}
```

### Zombie Process

By controlling the sleep time, the child process dies first. However, the parent process does not reclaim the child process.

```c
#include <stdio.h>  
#include <stdlib.h>  
#include <unistd.h>  
#include <sys/wait.h>  
  
int main() {  
    pid_t pid = fork(); // Create child process  
  
    if (pid < 0) {  
        // fork failed  
        perror("fork failed");  
        exit(EXIT_FAILURE);  
    } else if (pid == 0) {  
        // Child process  
        printf("I am the child process with PID %d\n", getpid());  
        sleep(2); // Let the child process run for a while  
        printf("Child process exiting...\n");  
        exit(EXIT_SUCCESS); // Child process exits  
    } else {  
        // Parent process  
        printf("I am the parent process with PID %d and my child has PID %d\n", getpid(), pid);  
        // Note: The parent process does not call wait() or waitpid() here, so the child process will become a zombie process  
        sleep(10000);  
    }  
    return 0;  
}
```

Query zombie processes

```bash
$ ps -A -ostat,ppid,pid,cmd | grep -e '^[Zz]'
Z+    933981  933982 [a.out] <defunct>
$ ps -ef | grep a.out
root      933981  933844  0 11:11 pts/4    00:00:00 ./a.out
root      933982  933981  0 11:11 pts/4    00:00:00 [a.out] <defunct>
root      934096  933897  0 11:13 pts/5    00:00:00 grep --color=auto a.out
```

### Reclaiming the Child

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <sys/wait.h>

// SIGCHLD signal handler function
void sigchld_handler(int signum) {
    // Use waitpid non-blocking to reclaim all terminated child processes
    while (waitpid(-1, NULL, WNOHANG) > 0);
}

int main() {
    // Set up SIGCHLD signal handler
    struct sigaction sa;
    sa.sa_handler = sigchld_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART; // Automatically restart interrupted system calls
    if (sigaction(SIGCHLD, &sa, NULL) == -1) {
        perror("sigaction");
        exit(EXIT_FAILURE);
    }

    // Create child process
    pid_t pid = fork();
    if (pid < 0) {
        perror("fork");
        exit(EXIT_FAILURE);
    }

    if (pid == 0) {
        // Child process
        printf("Child process: PID = %d\n", getpid());
        sleep(10); // Simulate child process executing some tasks
        printf("Child process ending: PID = %d\n", getpid());
        exit(EXIT_SUCCESS);
    } else {
        // Parent process
        printf("Parent process: PID = %d, Child process PID = %d\n", getpid(), pid);
        // Parent process continues to execute other tasks
        for (int i = 0; i < 5; ++i) {
            printf("Parent process is working...\n");
            sleep(10000);
        }
        // Cleanup work before parent process ends
        printf("Parent process ending: PID = %d\n", getpid());
    }
    return 0;
}
``` 