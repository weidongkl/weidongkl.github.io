"use strict";(self.webpackChunkweidongkl_github_io=self.webpackChunkweidongkl_github_io||[]).push([[5929],{7089:(n,e,r)=>{r.r(e),r.d(e,{assets:()=>c,contentTitle:()=>s,default:()=>a,frontMatter:()=>o,metadata:()=>t,toc:()=>d});const t=JSON.parse('{"id":"note/golang/design/microkernel","title":"microkernel \u8bbe\u8ba1","description":"microkernel\uff08\u5fae\u5185\u6838\uff09\u67b6\u6784\u7684\u6838\u5fc3\u601d\u60f3\u662f \u6838\u5fc3\u529f\u80fd\u6700\u5c0f\u5316\uff0c\u5176\u4ed6\u529f\u80fd\u4ee5\u63d2\u4ef6\u6216\u670d\u52a1\u7684\u5f62\u5f0f\u8fd0\u884c\u5728\u7528\u6237\u6001\uff0c\u901a\u8fc7 \u8fdb\u7a0b\u95f4\u901a\u4fe1\uff08IPC\uff09 \u4e0e\u5185\u6838\u4ea4\u4e92\u3002","source":"@site/docs/note/golang/design/microkernel.md","sourceDirName":"note/golang/design","slug":"/note/golang/design/microkernel","permalink":"/docs/note/golang/design/microkernel","draft":false,"unlisted":false,"editUrl":"https://github.com/weidongkl/weidongkl.github.io/tree/master/docs/note/golang/design/microkernel.md","tags":[],"version":"current","sidebarPosition":1,"frontMatter":{"sidebar_position":1},"sidebar":"note","previous":{"title":"golang\u7a0b\u5e8f\u8bbe\u8ba1","permalink":"/docs/category/golang\u7a0b\u5e8f\u8bbe\u8ba1"},"next":{"title":"Future-Proof \u673a\u5236","permalink":"/docs/note/golang/design/future_proof"}}');var l=r(4848),i=r(8453);const o={sidebar_position:1},s="microkernel \u8bbe\u8ba1",c={},d=[{value:"<strong>1. \u5fae\u5185\u6838\u6838\u5fc3\u8bbe\u8ba1</strong>",id:"1-\u5fae\u5185\u6838\u6838\u5fc3\u8bbe\u8ba1",level:2},{value:"2. Go \u5b9e\u73b0 microkernel",id:"2-go-\u5b9e\u73b0-microkernel",level:2},{value:"2.1 \u5b9a\u4e49 Kernel\uff08\u6838\u5fc3\uff09",id:"21-\u5b9a\u4e49-kernel\u6838\u5fc3",level:3},{value:"2.2 \u5b9e\u73b0\u793a\u4f8b\u670d\u52a1\uff08LogService\uff09",id:"22-\u5b9e\u73b0\u793a\u4f8b\u670d\u52a1logservice",level:3},{value:"2.3 \u4e3b\u7a0b\u5e8f\uff08\u8fd0\u884c\u5fae\u5185\u6838 + \u670d\u52a1\uff09",id:"23-\u4e3b\u7a0b\u5e8f\u8fd0\u884c\u5fae\u5185\u6838--\u670d\u52a1",level:3},{value:"2.4 \u8fd0\u884c\u7ed3\u679c",id:"24-\u8fd0\u884c\u7ed3\u679c",level:3},{value:"3. \u6269\u5c55\u65b9\u5411",id:"3-\u6269\u5c55\u65b9\u5411",level:2},{value:"4. \u603b\u7ed3",id:"4-\u603b\u7ed3",level:2}];function g(n){const e={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.R)(),...n.components};return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(e.header,{children:(0,l.jsx)(e.h1,{id:"microkernel-\u8bbe\u8ba1",children:"microkernel \u8bbe\u8ba1"})}),"\n",(0,l.jsxs)(e.p,{children:["microkernel\uff08\u5fae\u5185\u6838\uff09\u67b6\u6784\u7684\u6838\u5fc3\u601d\u60f3\u662f ",(0,l.jsx)(e.strong,{children:"\u6838\u5fc3\u529f\u80fd\u6700\u5c0f\u5316"}),"\uff0c\u5176\u4ed6\u529f\u80fd\u4ee5\u63d2\u4ef6\u6216\u670d\u52a1\u7684\u5f62\u5f0f\u8fd0\u884c\u5728\u7528\u6237\u6001\uff0c\u901a\u8fc7 ",(0,l.jsx)(e.strong,{children:"\u8fdb\u7a0b\u95f4\u901a\u4fe1\uff08IPC\uff09"})," \u4e0e\u5185\u6838\u4ea4\u4e92\u3002"]}),"\n",(0,l.jsx)(e.hr,{}),"\n",(0,l.jsx)(e.h2,{id:"1-\u5fae\u5185\u6838\u6838\u5fc3\u8bbe\u8ba1",children:(0,l.jsx)(e.strong,{children:"1. \u5fae\u5185\u6838\u6838\u5fc3\u8bbe\u8ba1"})}),"\n",(0,l.jsx)(e.p,{children:(0,l.jsx)(e.strong,{children:"\u6838\u5fc3\u7ec4\u4ef6"})}),"\n",(0,l.jsxs)(e.ol,{children:["\n",(0,l.jsxs)(e.li,{children:[(0,l.jsx)(e.strong,{children:"Kernel\uff08\u5185\u6838\uff09"}),"\n",(0,l.jsxs)(e.ul,{children:["\n",(0,l.jsxs)(e.li,{children:["\u8d1f\u8d23 ",(0,l.jsx)(e.strong,{children:"\u670d\u52a1\u6ce8\u518c\u3001\u6d88\u606f\u8def\u7531\u3001\u751f\u547d\u5468\u671f\u7ba1\u7406"}),"\u3002"]}),"\n"]}),"\n"]}),"\n",(0,l.jsxs)(e.li,{children:[(0,l.jsx)(e.strong,{children:"Services\uff08\u670d\u52a1\uff09"}),"\n",(0,l.jsxs)(e.ul,{children:["\n",(0,l.jsxs)(e.li,{children:["\u72ec\u7acb\u6a21\u5757\uff08\u5982 ",(0,l.jsx)(e.code,{children:"LogService"}),"\u3001",(0,l.jsx)(e.code,{children:"StorageService"}),"\uff09\uff0c\u8fd0\u884c\u5728\u7528\u6237\u6001\u3002"]}),"\n"]}),"\n"]}),"\n",(0,l.jsxs)(e.li,{children:[(0,l.jsx)(e.strong,{children:"\u901a\u4fe1\u673a\u5236\uff08IPC\uff09"}),"\n",(0,l.jsxs)(e.ul,{children:["\n",(0,l.jsxs)(e.li,{children:["\u4f7f\u7528 Go \u7684 ",(0,l.jsx)(e.strong,{children:"Channel"})," \u6216 ",(0,l.jsx)(e.strong,{children:"gRPC"})," \u8fdb\u884c\u901a\u4fe1\u3002"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,l.jsx)(e.hr,{}),"\n",(0,l.jsx)(e.h2,{id:"2-go-\u5b9e\u73b0-microkernel",children:"2. Go \u5b9e\u73b0 microkernel"}),"\n",(0,l.jsx)(e.h3,{id:"21-\u5b9a\u4e49-kernel\u6838\u5fc3",children:"2.1 \u5b9a\u4e49 Kernel\uff08\u6838\u5fc3\uff09"}),"\n",(0,l.jsx)(e.pre,{children:(0,l.jsx)(e.code,{className:"language-go",children:'package microkernel\n\nimport (\n\t"context"\n\t"errors"\n\t"fmt"\n\t"sync"\n)\n\n// Service \u5b9a\u4e49\u5fae\u5185\u6838\u7684\u670d\u52a1\u63a5\u53e3\n// \u4f7f\u7528\u63a5\u53e3\u5b9a\u4e49\u4ee3\u66ff\u56fa\u5b9a\u7684struct,\u4f4e\u8026\u5408\u8bbe\u8ba1\u3002\ntype Service interface {\n\tStart() error\n\tStop() error\n\tName() string\n}\n\n// Kernel \u5fae\u5185\u6838\u6838\u5fc3\ntype Kernel struct {\n    // \u6ce8\u518c\u7684\u670d\u52a1\u901a\u9053\n\tservices map[string]Service\n    // \u4fdd\u62a4 services \u7684\u5e76\u53d1\u8bbf\u95ee\n\tmutex   sync.RWMutex\n    // \u5168\u5c40\u4e8b\u4ef6\u603b\u7ebf\n\teventCh chan Event\n}\n\n// Event \u5b9a\u4e49\u5185\u6838\u4e8b\u4ef6\uff08\u7528\u4e8e\u670d\u52a1\u95f4\u901a\u4fe1\uff09\ntype Event struct {\n\tFrom    string\n\tType    string\n\tContent string\n}\n\n// NewKernel \u521b\u5efa\u5fae\u5185\u6838\u5b9e\u4f8b\nfunc NewKernel() *Kernel {\n\treturn &Kernel{\n\t\tservices: make(map[string]Service),\n\t\teventCh:  make(chan Event, 100),\n\t}\n}\n\n// RegisterService \u6ce8\u518c\u670d\u52a1\nfunc (k *Kernel) RegisterService(s Service) error {\n\tk.mutex.Lock()\n\tdefer k.mutex.Unlock()\n\n\tname := s.Name()\n\tif _, ok := k.services[name]; ok {\n\t\treturn errors.New("service already registered")\n\t}\n\n\tk.services[name] = s\n\treturn nil\n}\n\n// StartAll \u542f\u52a8\u6240\u6709\u670d\u52a1\nfunc (k *Kernel) StartAll() error {\n\tk.mutex.RLock()\n\tdefer k.mutex.RUnlock()\n\n\tfor _, s := range k.services {\n\t\tif err := s.Start(); err != nil {\n\t\t\treturn err\n\t\t}\n\t}\n\treturn nil\n}\n\n// StopAll \u505c\u6b62\u6240\u6709\u670d\u52a1\nfunc (k *Kernel) StopAll() error {\n\tk.mutex.RLock()\n\tdefer k.mutex.RUnlock()\n\n\tvar err error\n\tfor _, s := range k.services {\n\t\tif e := s.Stop(); e != nil {\n\t\t\terr = e\n\t\t}\n\t}\n\treturn err\n}\n\n// SendEvent \u53d1\u9001\u4e8b\u4ef6\uff08\u6a21\u62df IPC\uff09\nfunc (k *Kernel) SendEvent(evt Event) {\n\tk.eventCh <- evt\n}\n\n// EventLoop \u4e8b\u4ef6\u5faa\u73af\uff08\u5904\u7406\u670d\u52a1\u95f4\u901a\u4fe1\uff09\nfunc (k *Kernel) EventLoop(ctx context.Context) {\n\tfor {\n\t\tselect {\n\t\tcase <-ctx.Done():\n\t\t\treturn\n\t\tcase evt := <-k.eventCh:\n\t\t\tfmt.Printf("[Kernel] Event from %s: %s - %s\\n", evt.From, evt.Type, evt.Content)\n\t\t}\n\t}\n}\n'})}),"\n",(0,l.jsx)(e.hr,{}),"\n",(0,l.jsx)(e.h3,{id:"22-\u5b9e\u73b0\u793a\u4f8b\u670d\u52a1logservice",children:"2.2 \u5b9e\u73b0\u793a\u4f8b\u670d\u52a1\uff08LogService\uff09"}),"\n",(0,l.jsx)(e.pre,{children:(0,l.jsx)(e.code,{className:"language-go",children:'package main\n\nimport (\n\t"context"\n\t"fmt"\n\t"goproject/microkernel"\n\t"time"\n)\n\n// LogService \u65e5\u5fd7\u670d\u52a1\ntype LogService struct {\n\tname    string\n\tkernel  *microkernel.Kernel\n\tlogCh   chan string\n\tstopCh  chan struct{}\n}\n\nfunc NewLogService(name string, kernel *microkernel.Kernel) *LogService {\n\treturn &LogService{\n\t\tname:   name,\n\t\tkernel: kernel,\n\t\tlogCh:  make(chan string, 100),\n\t\tstopCh: make(chan struct{}),\n\t}\n}\n\nfunc (l *LogService) Start() error {\n\tfmt.Printf("[%s] starting...\\n", l.name)\n\tgo l.run()\n\treturn nil\n}\n\nfunc (l *LogService) Stop() error {\n\tfmt.Printf("[%s] stopping...\\n", l.name)\n\tclose(l.stopCh)\n\treturn nil\n}\n\nfunc (l *LogService) Name() string {\n\treturn l.name\n}\n\nfunc (l *LogService) run() {\n\tfor {\n\t\tselect {\n\t\tcase <-l.stopCh:\n\t\t\treturn\n\t\tcase log := <-l.logCh:\n\t\t\tfmt.Printf("[%s] LOG: %s\\n", l.name, log)\n\t\t\t// \u6a21\u62df\u53d1\u9001\u4e8b\u4ef6\u5230\u5185\u6838\n\t\t\tl.kernel.SendEvent(microkernel.Event{\n\t\t\t\tFrom:    l.name,\n\t\t\t\tType:    "log",\n\t\t\t\tContent: log,\n\t\t\t})\n\t\t}\n\t}\n}\n\nfunc (l *LogService) Log(msg string) {\n\tl.logCh <- msg\n}\n'})}),"\n",(0,l.jsx)(e.hr,{}),"\n",(0,l.jsx)(e.h3,{id:"23-\u4e3b\u7a0b\u5e8f\u8fd0\u884c\u5fae\u5185\u6838--\u670d\u52a1",children:"2.3 \u4e3b\u7a0b\u5e8f\uff08\u8fd0\u884c\u5fae\u5185\u6838 + \u670d\u52a1\uff09"}),"\n",(0,l.jsx)(e.pre,{children:(0,l.jsx)(e.code,{className:"language-go",children:'package main\n\nimport (\n\t"context"\n\t"microkernel"\n\t"time"\n)\n\nfunc main() {\n\t// 1. \u521b\u5efa\u5fae\u5185\u6838\n\tkernel := microkernel.NewKernel()\n\n\t// 2. \u6ce8\u518c\u670d\u52a1\n\tlogSvc := NewLogService("logger", kernel)\n\tif err := kernel.RegisterService(logSvc); err != nil {\n\t\tpanic(err)\n\t}\n\n\t// 3. \u542f\u52a8\u6240\u6709\u670d\u52a1\n\tif err := kernel.StartAll(); err != nil {\n\t\tpanic(err)\n\t}\n\n\t// 4. \u542f\u52a8\u4e8b\u4ef6\u5faa\u73af\n\tctx, cancel := context.WithCancel(context.Background())\n\tdefer cancel()\n\tgo kernel.EventLoop(ctx)\n\n\t// 5. \u6d4b\u8bd5\u65e5\u5fd7\u670d\u52a1\n\tlogSvc.Log("Hello, Microkernel!")\n\ttime.Sleep(1 * time.Second)\n\n\t// 6. \u505c\u6b62\u6240\u6709\u670d\u52a1\n\tif err := kernel.StopAll(); err != nil {\n\t\tpanic(err)\n\t}\n}\n'})}),"\n",(0,l.jsx)(e.hr,{}),"\n",(0,l.jsx)(e.h3,{id:"24-\u8fd0\u884c\u7ed3\u679c",children:"2.4 \u8fd0\u884c\u7ed3\u679c"}),"\n",(0,l.jsx)(e.pre,{children:(0,l.jsx)(e.code,{children:"[logger] starting...\n[logger] LOG: Hello, Microkernel!\n[Kernel] Event from logger: log - Hello, Microkernel!\n[logger] stopping...\n"})}),"\n",(0,l.jsx)(e.hr,{}),"\n",(0,l.jsx)(e.h2,{id:"3-\u6269\u5c55\u65b9\u5411",children:"3. \u6269\u5c55\u65b9\u5411"}),"\n",(0,l.jsxs)(e.ol,{children:["\n",(0,l.jsxs)(e.li,{children:[(0,l.jsx)(e.strong,{children:"\u4f7f\u7528 gRPC \u66ff\u4ee3 Channel"}),"\uff08\u5b9e\u73b0\u8de8\u8fdb\u7a0b\u901a\u4fe1\uff09\u3002"]}),"\n",(0,l.jsxs)(e.li,{children:[(0,l.jsx)(e.strong,{children:"\u52a8\u6001\u52a0\u8f7d\u670d\u52a1"}),"\uff08\u5982\u63d2\u4ef6\u5316\u67b6\u6784\uff09\u3002"]}),"\n",(0,l.jsxs)(e.li,{children:[(0,l.jsx)(e.strong,{children:"\u589e\u52a0\u670d\u52a1\u53d1\u73b0\u673a\u5236"}),"\uff08\u5982 Consul/Etcd\uff09\u3002"]}),"\n",(0,l.jsxs)(e.li,{children:[(0,l.jsx)(e.strong,{children:"\u652f\u6301\u66f4\u590d\u6742\u7684\u4e8b\u4ef6\u8def\u7531"}),"\uff08\u5982\u57fa\u4e8e Topic \u7684 Pub/Sub\uff09\u3002"]}),"\n"]}),"\n",(0,l.jsx)(e.hr,{}),"\n",(0,l.jsx)(e.h2,{id:"4-\u603b\u7ed3",children:"4. \u603b\u7ed3"}),"\n",(0,l.jsxs)(e.ul,{children:["\n",(0,l.jsxs)(e.li,{children:[(0,l.jsx)(e.strong,{children:"\u5fae\u5185\u6838\u7684\u6838\u5fc3"}),"\uff1a",(0,l.jsx)(e.code,{children:"Kernel"})," \u53ea\u7ba1\u7406 ",(0,l.jsx)(e.code,{children:"Service"})," \u7684\u751f\u547d\u5468\u671f\u548c\u901a\u4fe1\u3002"]}),"\n",(0,l.jsxs)(e.li,{children:[(0,l.jsx)(e.strong,{children:"\u670d\u52a1\u72ec\u7acb"}),"\uff1a\u6bcf\u4e2a ",(0,l.jsx)(e.code,{children:"Service"})," \u8fd0\u884c\u5728\u81ea\u5df1\u7684 Goroutine \u4e2d\uff0c\u4e92\u4e0d\u5e72\u6270\u3002"]}),"\n",(0,l.jsxs)(e.li,{children:[(0,l.jsx)(e.strong,{children:"\u901a\u4fe1\u65b9\u5f0f"}),"\uff1a","\n",(0,l.jsxs)(e.ul,{children:["\n",(0,l.jsxs)(e.li,{children:["\u7b80\u5355\u573a\u666f\uff1a",(0,l.jsx)(e.code,{children:"Channel"}),"\uff08\u5982\u793a\u4f8b\uff09\u3002"]}),"\n",(0,l.jsxs)(e.li,{children:["\u590d\u6742\u573a\u666f\uff1a",(0,l.jsx)(e.code,{children:"gRPC"}),"\u3001",(0,l.jsx)(e.code,{children:"NATS"}),"\u3001",(0,l.jsx)(e.code,{children:"WebSocket"})," \u7b49\u3002"]}),"\n"]}),"\n"]}),"\n"]})]})}function a(n={}){const{wrapper:e}={...(0,i.R)(),...n.components};return e?(0,l.jsx)(e,{...n,children:(0,l.jsx)(g,{...n})}):g(n)}},8453:(n,e,r)=>{r.d(e,{R:()=>o,x:()=>s});var t=r(6540);const l={},i=t.createContext(l);function o(n){const e=t.useContext(i);return t.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function s(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(l):n.components||l:o(n.components),t.createElement(i.Provider,{value:e},n.children)}}}]);