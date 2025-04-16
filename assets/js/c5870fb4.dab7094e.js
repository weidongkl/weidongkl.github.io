"use strict";(self.webpackChunkweidongkl_github_io=self.webpackChunkweidongkl_github_io||[]).push([[2244],{4709:(n,e,i)=>{i.r(e),i.d(e,{assets:()=>l,contentTitle:()=>o,default:()=>a,frontMatter:()=>r,metadata:()=>t,toc:()=>c});const t=JSON.parse('{"id":"note/os/zombie","title":"\u50f5\u5c38\u8fdb\u7a0b","description":"\u5b64\u513f\u8fdb\u7a0b\uff1a \u7236\u4eb2\u5148\u6b7b\uff0c\u513f\u5b50\u88ab1\u53f7\u6536\u517b\u3002","source":"@site/docs/note/os/zombie.md","sourceDirName":"note/os","slug":"/note/os/zombie","permalink":"/docs/note/os/zombie","draft":false,"unlisted":false,"editUrl":"https://github.com/weidongkl/weidongkl.github.io/tree/master/docs/note/os/zombie.md","tags":[],"version":"current","frontMatter":{},"sidebar":"note","previous":{"title":"chroot \u7528\u6cd5","permalink":"/docs/note/os/chroot"},"next":{"title":"Git","permalink":"/docs/category/git"}}');var s=i(4848),d=i(8453);const r={},o="\u50f5\u5c38\u8fdb\u7a0b",l={},c=[{value:"\u67e5\u6740\u50f5\u5c38\u8fdb\u7a0b",id:"\u67e5\u6740\u50f5\u5c38\u8fdb\u7a0b",level:2},{value:"\u4e3e\u4f8b",id:"\u4e3e\u4f8b",level:2},{value:"\u5b64\u513f\u8fdb\u7a0b",id:"\u5b64\u513f\u8fdb\u7a0b",level:3},{value:"\u50f5\u5c38\u8fdb\u7a0b",id:"\u50f5\u5c38\u8fdb\u7a0b-1",level:3},{value:"\u56de\u6536\u513f\u5b50",id:"\u56de\u6536\u513f\u5b50",level:3}];function p(n){const e={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",...(0,d.R)(),...n.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(e.header,{children:(0,s.jsx)(e.h1,{id:"\u50f5\u5c38\u8fdb\u7a0b",children:"\u50f5\u5c38\u8fdb\u7a0b"})}),"\n",(0,s.jsx)(e.p,{children:"\u5b64\u513f\u8fdb\u7a0b\uff1a \u7236\u4eb2\u5148\u6b7b\uff0c\u513f\u5b50\u88ab1\u53f7\u6536\u517b\u3002"}),"\n",(0,s.jsx)(e.p,{children:"\u50f5\u5c38\u8fdb\u7a0b\uff1a\u513f\u5b50\u5148\u6b7b\uff0c\u7236\u4eb2\u4e0d\u7ba1\u4e0d\u987e\u3002"}),"\n",(0,s.jsx)(e.h2,{id:"\u67e5\u6740\u50f5\u5c38\u8fdb\u7a0b",children:"\u67e5\u6740\u50f5\u5c38\u8fdb\u7a0b"}),"\n",(0,s.jsxs)(e.ol,{children:["\n",(0,s.jsx)(e.li,{children:"top\u67e5\u770b\u662f\u5426\u6709\u50f5\u5c38\u8fdb\u7a0b"}),"\n",(0,s.jsx)(e.li,{children:"\u901a\u8fc7\u547d\u4ee4\u67e5\u8be2\u50f5\u5c38\u8fdb\u7a0b\u5728\u54ea"}),"\n"]}),"\n",(0,s.jsx)(e.pre,{children:(0,s.jsx)(e.code,{className:"language-bash",children:"ps -A -ostat,ppid,pid,cmd | grep -e '^[Zz]'\n# \u547d\u4ee4\u6ce8\u89e3\uff1a\n\n# -A \u53c2\u6570\u5217\u51fa\u6240\u6709\u8fdb\u7a0b\n\n# -o \u81ea\u5b9a\u4e49\u8f93\u51fa\u5b57\u6bb5 \u6211\u4eec\u8bbe\u5b9a\u663e\u793a\u5b57\u6bb5\u4e3a stat\uff08\u72b6\u6001\uff09, ppid\uff08\u8fdb\u7a0b\u7236id\uff09, pid(\u8fdb\u7a0bid)\uff0ccmd\uff08\u547d\u4ee4\uff09\u8fd9\u56db\u4e2a\u53c2\u6570\n\n# \u56e0\u4e3a\u72b6\u6001\u4e3a z\u6216\u8005Z\u7684\u8fdb\u7a0b\u4e3a\u50f5\u5c38\u8fdb\u7a0b\uff0c\u6240\u4ee5\u6211\u4eec\u4f7f\u7528grep\u6293\u53d6stat\u72b6\u6001\u4e3azZ\u8fdb\u7a0b\n"})}),"\n",(0,s.jsx)(e.h2,{id:"\u4e3e\u4f8b",children:"\u4e3e\u4f8b"}),"\n",(0,s.jsx)(e.h3,{id:"\u5b64\u513f\u8fdb\u7a0b",children:"\u5b64\u513f\u8fdb\u7a0b"}),"\n",(0,s.jsxs)(e.p,{children:["\u901a\u8fc7sleep\u65f6\u95f4\uff0c\u63a7\u5236\u7236\u4eb2\u5148\u6b7b\uff0c\u6b64\u65f6\u513f\u5b50\u88ab1\u53f7\u5b64\u513f\u9662\u6536\u517b\u3002\u53ef\u4ee5\u901a\u8fc7 ",(0,s.jsx)(e.code,{children:"ps"}),"\u67e5\u770b\uff0c",(0,s.jsx)(e.code,{children:"a.out"}),"\u7684\u7236\u8fdb\u7a0b\u53d8\u6210\u4e86 1"]}),"\n",(0,s.jsx)(e.pre,{children:(0,s.jsx)(e.code,{className:"language-c",children:'#include <stdio.h>  \n#include <stdlib.h>  \n#include <unistd.h>  \n#include <sys/wait.h>  \n  \nint main() {  \n    pid_t pid = fork(); // \u521b\u5efa\u5b50\u8fdb\u7a0b  \n  \n    if (pid < 0) {  \n        // fork\u5931\u8d25  \n        perror("fork failed");  \n        exit(EXIT_FAILURE);  \n    } else if (pid == 0) {  \n        // \u5b50\u8fdb\u7a0b  \n        printf("I am the child process with PID %d\\n", getpid());  \n        sleep(2000); // \u8ba9\u5b50\u8fdb\u7a0b\u8fd0\u884c\u4e00\u6bb5\u65f6\u95f4 \uff0c\u6b64\u65f6\u7236\u4eb2\u5df2\u6b7b\u3002\n        printf("Child process exiting...\\n");  \n        exit(EXIT_SUCCESS); // \u5b50\u8fdb\u7a0b\u9000\u51fa  \n    } else {  \n        // \u7236\u8fdb\u7a0b\u76f4\u63a5\u9000\u51fa\n        printf("I am the parent process with PID %d and my child has PID %d\\n", getpid(), pid);  \n    }  \n    return 0;  \n}\n'})}),"\n",(0,s.jsx)(e.h3,{id:"\u50f5\u5c38\u8fdb\u7a0b-1",children:"\u50f5\u5c38\u8fdb\u7a0b"}),"\n",(0,s.jsx)(e.p,{children:"\u901a\u8fc7sleep\u65f6\u95f4\uff0c\u63a7\u5236\u5b50\u8fdb\u7a0b\u5148\u6b7b\u3002\u4f46\u662f\uff0c\u7236\u8fdb\u7a0b\u4e0d\u56de\u6536\u5b50\u8fdb\u7a0b\u3002"}),"\n",(0,s.jsx)(e.pre,{children:(0,s.jsx)(e.code,{className:"language-c",children:'#include <stdio.h>  \n#include <stdlib.h>  \n#include <unistd.h>  \n#include <sys/wait.h>  \n  \nint main() {  \n    pid_t pid = fork(); // \u521b\u5efa\u5b50\u8fdb\u7a0b  \n  \n    if (pid < 0) {  \n        // fork\u5931\u8d25  \n        perror("fork failed");  \n        exit(EXIT_FAILURE);  \n    } else if (pid == 0) {  \n        // \u5b50\u8fdb\u7a0b  \n        printf("I am the child process with PID %d\\n", getpid());  \n        sleep(2); // \u8ba9\u5b50\u8fdb\u7a0b\u8fd0\u884c\u4e00\u6bb5\u65f6\u95f4  \n        printf("Child process exiting...\\n");  \n        exit(EXIT_SUCCESS); // \u5b50\u8fdb\u7a0b\u9000\u51fa  \n    } else {  \n        // \u7236\u8fdb\u7a0b  \n        printf("I am the parent process with PID %d and my child has PID %d\\n", getpid(), pid);  \n        // \u6ce8\u610f\uff1a\u8fd9\u91cc\u7236\u8fdb\u7a0b\u6ca1\u6709\u8c03\u7528wait()\u6216waitpid()\uff0c\u6240\u4ee5\u5b50\u8fdb\u7a0b\u4f1a\u53d8\u6210\u50f5\u5c38\u8fdb\u7a0b  \n        sleep(10000);  \n    }  \n    return 0;  \n}\n'})}),"\n",(0,s.jsx)(e.p,{children:"\u67e5\u8be2\u50f5\u5c38\u8fdb\u7a0b"}),"\n",(0,s.jsx)(e.pre,{children:(0,s.jsx)(e.code,{className:"language-bash",children:"$ ps -A -ostat,ppid,pid,cmd | grep -e '^[Zz]'\nZ+    933981  933982 [a.out] <defunct>\n$ ps -ef | grep a.out\nroot      933981  933844  0 11:11 pts/4    00:00:00 ./a.out\nroot      933982  933981  0 11:11 pts/4    00:00:00 [a.out] <defunct>\nroot      934096  933897  0 11:13 pts/5    00:00:00 grep --color=auto a.out\n"})}),"\n",(0,s.jsx)(e.h3,{id:"\u56de\u6536\u513f\u5b50",children:"\u56de\u6536\u513f\u5b50"}),"\n",(0,s.jsx)(e.pre,{children:(0,s.jsx)(e.code,{className:"language-c",children:'#include <stdio.h>\n#include <stdlib.h>\n#include <unistd.h>\n#include <signal.h>\n#include <sys/wait.h>\n\n// SIGCHLD \u4fe1\u53f7\u5904\u7406\u51fd\u6570\nvoid sigchld_handler(int signum) {\n    // \u4f7f\u7528 waitpid \u975e\u963b\u585e\u56de\u6536\u6240\u6709\u5df2\u7ec8\u6b62\u7684\u5b50\u8fdb\u7a0b\n    while (waitpid(-1, NULL, WNOHANG) > 0);\n}\n\nint main() {\n    // \u8bbe\u7f6e SIGCHLD \u4fe1\u53f7\u5904\u7406\u51fd\u6570\n    struct sigaction sa;\n    sa.sa_handler = sigchld_handler;\n    sigemptyset(&sa.sa_mask);\n    sa.sa_flags = SA_RESTART; // \u81ea\u52a8\u91cd\u542f\u88ab\u4e2d\u65ad\u7684\u7cfb\u7edf\u8c03\u7528\n    if (sigaction(SIGCHLD, &sa, NULL) == -1) {\n        perror("sigaction");\n        exit(EXIT_FAILURE);\n    }\n\n    // \u521b\u5efa\u5b50\u8fdb\u7a0b\n    pid_t pid = fork();\n    if (pid < 0) {\n        perror("fork");\n        exit(EXIT_FAILURE);\n    }\n\n    if (pid == 0) {\n        // \u5b50\u8fdb\u7a0b\n        printf("\u5b50\u8fdb\u7a0b: PID = %d\\n", getpid());\n        sleep(10); // \u6a21\u62df\u5b50\u8fdb\u7a0b\u6267\u884c\u4e00\u4e9b\u4efb\u52a1\n        printf("\u5b50\u8fdb\u7a0b\u7ed3\u675f: PID = %d\\n", getpid());\n        exit(EXIT_SUCCESS);\n    } else {\n        // \u7236\u8fdb\u7a0b\n        printf("\u7236\u8fdb\u7a0b: PID = %d, \u5b50\u8fdb\u7a0b PID = %d\\n", getpid(), pid);\n        // \u7236\u8fdb\u7a0b\u7ee7\u7eed\u6267\u884c\u5176\u4ed6\u4efb\u52a1\n        for (int i = 0; i < 5; ++i) {\n            printf("\u7236\u8fdb\u7a0b\u6b63\u5728\u5de5\u4f5c...\\n");\n            sleep(10000)\n        }\n        // \u7236\u8fdb\u7a0b\u7ed3\u675f\u524d\u7684\u6536\u5c3e\u5de5\u4f5c\n        printf("\u7236\u8fdb\u7a0b\u7ed3\u675f: PID = %d\\n", getpid());\n    }\n    return 0;\n}\n'})})]})}function a(n={}){const{wrapper:e}={...(0,d.R)(),...n.components};return e?(0,s.jsx)(e,{...n,children:(0,s.jsx)(p,{...n})}):p(n)}},8453:(n,e,i)=>{i.d(e,{R:()=>r,x:()=>o});var t=i(6540);const s={},d=t.createContext(s);function r(n){const e=t.useContext(d);return t.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function o(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(s):n.components||s:r(n.components),t.createElement(d.Provider,{value:e},n.children)}}}]);