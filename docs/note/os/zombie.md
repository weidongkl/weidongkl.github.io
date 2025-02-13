# 僵尸进程

孤儿进程： 父亲先死，儿子被1号收养。

僵尸进程：儿子先死，父亲不管不顾。

## 查杀僵尸进程

1. top查看是否有僵尸进程
2. 通过命令查询僵尸进程在哪
```bash
ps -A -ostat,ppid,pid,cmd | grep -e '^[Zz]'
# 命令注解：

# -A 参数列出所有进程

# -o 自定义输出字段 我们设定显示字段为 stat（状态）, ppid（进程父id）, pid(进程id)，cmd（命令）这四个参数

# 因为状态为 z或者Z的进程为僵尸进程，所以我们使用grep抓取stat状态为zZ进程
```
## 举例

### 孤儿进程

通过sleep时间，控制父亲先死，此时儿子被1号孤儿院收养。可以通过 `ps`查看，`a.out`的父进程变成了 1

```c
#include <stdio.h>  
#include <stdlib.h>  
#include <unistd.h>  
#include <sys/wait.h>  
  
int main() {  
    pid_t pid = fork(); // 创建子进程  
  
    if (pid < 0) {  
        // fork失败  
        perror("fork failed");  
        exit(EXIT_FAILURE);  
    } else if (pid == 0) {  
        // 子进程  
        printf("I am the child process with PID %d\n", getpid());  
        sleep(2000); // 让子进程运行一段时间 ，此时父亲已死。
        printf("Child process exiting...\n");  
        exit(EXIT_SUCCESS); // 子进程退出  
    } else {  
        // 父进程直接退出
        printf("I am the parent process with PID %d and my child has PID %d\n", getpid(), pid);  
    }  
    return 0;  
}
```

### 僵尸进程

通过sleep时间，控制子进程先死。但是，父进程不回收子进程。

```c
#include <stdio.h>  
#include <stdlib.h>  
#include <unistd.h>  
#include <sys/wait.h>  
  
int main() {  
    pid_t pid = fork(); // 创建子进程  
  
    if (pid < 0) {  
        // fork失败  
        perror("fork failed");  
        exit(EXIT_FAILURE);  
    } else if (pid == 0) {  
        // 子进程  
        printf("I am the child process with PID %d\n", getpid());  
        sleep(2); // 让子进程运行一段时间  
        printf("Child process exiting...\n");  
        exit(EXIT_SUCCESS); // 子进程退出  
    } else {  
        // 父进程  
        printf("I am the parent process with PID %d and my child has PID %d\n", getpid(), pid);  
        // 注意：这里父进程没有调用wait()或waitpid()，所以子进程会变成僵尸进程  
        sleep(10000);  
    }  
    return 0;  
}
```

查询僵尸进程

```bash
$ ps -A -ostat,ppid,pid,cmd | grep -e '^[Zz]'
Z+    933981  933982 [a.out] <defunct>
$ ps -ef | grep a.out
root      933981  933844  0 11:11 pts/4    00:00:00 ./a.out
root      933982  933981  0 11:11 pts/4    00:00:00 [a.out] <defunct>
root      934096  933897  0 11:13 pts/5    00:00:00 grep --color=auto a.out
```



### 回收儿子

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <sys/wait.h>

// SIGCHLD 信号处理函数
void sigchld_handler(int signum) {
    // 使用 waitpid 非阻塞回收所有已终止的子进程
    while (waitpid(-1, NULL, WNOHANG) > 0);
}

int main() {
    // 设置 SIGCHLD 信号处理函数
    struct sigaction sa;
    sa.sa_handler = sigchld_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART; // 自动重启被中断的系统调用
    if (sigaction(SIGCHLD, &sa, NULL) == -1) {
        perror("sigaction");
        exit(EXIT_FAILURE);
    }

    // 创建子进程
    pid_t pid = fork();
    if (pid < 0) {
        perror("fork");
        exit(EXIT_FAILURE);
    }

    if (pid == 0) {
        // 子进程
        printf("子进程: PID = %d\n", getpid());
        sleep(10); // 模拟子进程执行一些任务
        printf("子进程结束: PID = %d\n", getpid());
        exit(EXIT_SUCCESS);
    } else {
        // 父进程
        printf("父进程: PID = %d, 子进程 PID = %d\n", getpid(), pid);
        // 父进程继续执行其他任务
        for (int i = 0; i < 5; ++i) {
            printf("父进程正在工作...\n");
            sleep(10000)
        }
        // 父进程结束前的收尾工作
        printf("父进程结束: PID = %d\n", getpid());
    }
    return 0;
}
```

