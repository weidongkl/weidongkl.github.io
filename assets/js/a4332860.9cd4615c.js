"use strict";(self.webpackChunkweidongkl_github_io=self.webpackChunkweidongkl_github_io||[]).push([[286],{982:(n,e,s)=>{s.r(e),s.d(e,{assets:()=>h,contentTitle:()=>l,default:()=>x,frontMatter:()=>d,metadata:()=>o,toc:()=>i});const o=JSON.parse('{"id":"note/os/chroot","title":"chroot \u7528\u6cd5","description":"1. \u6982\u8ff0","source":"@site/docs/note/os/chroot.md","sourceDirName":"note/os","slug":"/note/os/chroot","permalink":"/docs/note/os/chroot","draft":false,"unlisted":false,"editUrl":"https://github.com/weidongkl/weidongkl.github.io/tree/master/docs/note/os/chroot.md","tags":[],"version":"current","frontMatter":{},"sidebar":"note","previous":{"title":"OS","permalink":"/docs/category/os"},"next":{"title":"\u50f5\u5c38\u8fdb\u7a0b","permalink":"/docs/note/os/zombie"}}');var c=s(4848),r=s(8453);const d={},l="chroot \u7528\u6cd5",h={},i=[{value:"1. <strong>\u6982\u8ff0</strong>",id:"1-\u6982\u8ff0",level:2},{value:"2. <strong>\u5de5\u4f5c\u539f\u7406</strong>",id:"2-\u5de5\u4f5c\u539f\u7406",level:2},{value:"3. <strong>\u57fa\u672c\u7528\u6cd5</strong>",id:"3-\u57fa\u672c\u7528\u6cd5",level:2},{value:"3.1. \u8fdb\u5165 <code>chroot</code> \u73af\u5883",id:"31-\u8fdb\u5165-chroot-\u73af\u5883",level:3},{value:"3.2. \u5728 <code>chroot</code> \u73af\u5883\u4e2d\u6267\u884c\u547d\u4ee4",id:"32-\u5728-chroot-\u73af\u5883\u4e2d\u6267\u884c\u547d\u4ee4",level:3},{value:"4. <strong>\u521b\u5efa\u4e00\u4e2a\u57fa\u672c\u7684 <code>chroot</code> \u73af\u5883</strong>",id:"4-\u521b\u5efa\u4e00\u4e2a\u57fa\u672c\u7684-chroot-\u73af\u5883",level:2},{value:"5. <strong>\u4f7f\u7528\u573a\u666f</strong>",id:"5-\u4f7f\u7528\u573a\u666f",level:2},{value:"5.1. <strong>\u7cfb\u7edf\u6062\u590d</strong>",id:"51-\u7cfb\u7edf\u6062\u590d",level:3},{value:"5.2. <strong>\u9694\u79bb\u73af\u5883\uff08Sandbox\uff09</strong>",id:"52-\u9694\u79bb\u73af\u5883sandbox",level:3},{value:"5.3. <strong>\u8f6f\u4ef6\u5305\u7f16\u8bd1</strong>",id:"53-\u8f6f\u4ef6\u5305\u7f16\u8bd1",level:3},{value:"5.4. <strong>\u8fd0\u884c\u7279\u5b9a\u7248\u672c\u7684\u5e94\u7528\u7a0b\u5e8f</strong>",id:"54-\u8fd0\u884c\u7279\u5b9a\u7248\u672c\u7684\u5e94\u7528\u7a0b\u5e8f",level:3},{value:"6. <strong>\u6ce8\u610f\u4e8b\u9879</strong>",id:"6-\u6ce8\u610f\u4e8b\u9879",level:2},{value:"7. <strong>\u603b\u7ed3</strong>",id:"7-\u603b\u7ed3",level:2}];function t(n){const e={blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",hr:"hr",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,r.R)(),...n.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(e.header,{children:(0,c.jsxs)(e.h1,{id:"chroot-\u7528\u6cd5",children:[(0,c.jsx)(e.code,{children:"chroot"})," \u7528\u6cd5"]})}),"\n",(0,c.jsxs)(e.h2,{id:"1-\u6982\u8ff0",children:["1. ",(0,c.jsx)(e.strong,{children:"\u6982\u8ff0"})]}),"\n",(0,c.jsxs)(e.p,{children:[(0,c.jsx)(e.code,{children:"chroot"})," \u662f\u4e00\u4e2a Linux \u547d\u4ee4\uff0c\u7528\u4e8e\u5c06\u8fdb\u7a0b\u548c\u5176\u5b50\u8fdb\u7a0b\u7684\u6839\u76ee\u5f55\uff08",(0,c.jsx)(e.code,{children:"/"}),"\uff09\u66f4\u6539\u4e3a\u6307\u5b9a\u7684\u76ee\u5f55\u3002\u6362\u53e5\u8bdd\u8bf4\uff0c\u5b83\u6539\u53d8\u4e86\u7a0b\u5e8f\u7684\u6839\u76ee\u5f55\u8def\u5f84\uff0c\u4f7f\u5f97\u7a0b\u5e8f\u65e0\u6cd5\u8bbf\u95ee\u66f4\u9ad8\u5c42\u7ea7\u7684\u6587\u4ef6\u7cfb\u7edf\u3002\u5e38\u7528\u4e8e\u9694\u79bb\u73af\u5883\u3001\u521b\u5efa\u6c99\u7bb1\u3001\u8fdb\u884c\u7cfb\u7edf\u6062\u590d\u7b49\u573a\u666f\u3002"]}),"\n",(0,c.jsxs)(e.h2,{id:"2-\u5de5\u4f5c\u539f\u7406",children:["2. ",(0,c.jsx)(e.strong,{children:"\u5de5\u4f5c\u539f\u7406"})]}),"\n",(0,c.jsxs)(e.p,{children:["\u4f7f\u7528 ",(0,c.jsx)(e.code,{children:"chroot"})," \u547d\u4ee4\u65f6\uff0c\u6307\u5b9a\u7684\u8def\u5f84\u5c06\u6210\u4e3a\u65b0\u7684\u6839\u76ee\u5f55\u3002\u8fdb\u7a0b\u8fd0\u884c\u65f6\uff0c\u6587\u4ef6\u7cfb\u7edf\u7684\u8bbf\u95ee\u5c06\u76f8\u5bf9\u4e8e\u65b0\u6839\u76ee\u5f55\uff08chroot \u76ee\u5f55\uff09\u8fdb\u884c\uff0c\u7cfb\u7edf\u7684\u5176\u4ed6\u90e8\u5206\u4e0d\u53ef\u89c1\u3002"]}),"\n",(0,c.jsx)(e.pre,{children:(0,c.jsx)(e.code,{className:"language-bash",children:"chroot <new_root> [command]\n"})}),"\n",(0,c.jsxs)(e.ul,{children:["\n",(0,c.jsxs)(e.li,{children:[(0,c.jsx)(e.code,{children:"<new_root>"}),"\uff1a\u6307\u5b9a\u65b0\u7684\u6839\u76ee\u5f55\u3002"]}),"\n",(0,c.jsxs)(e.li,{children:[(0,c.jsx)(e.code,{children:"[command]"}),"\uff1a\u53ef\u9009\u7684\u547d\u4ee4\uff0c\u8868\u793a\u5728\u65b0\u7684\u6839\u76ee\u5f55\u73af\u5883\u4e2d\u6267\u884c\u7684\u547d\u4ee4\u3002\u5982\u679c\u6ca1\u6709\u6307\u5b9a\u547d\u4ee4\uff0c\u5219\u9ed8\u8ba4\u5c06\u4f1a\u542f\u52a8\u4e00\u4e2a\u4ea4\u4e92\u5f0f shell\u3002"]}),"\n"]}),"\n",(0,c.jsxs)(e.h2,{id:"3-\u57fa\u672c\u7528\u6cd5",children:["3. ",(0,c.jsx)(e.strong,{children:"\u57fa\u672c\u7528\u6cd5"})]}),"\n",(0,c.jsxs)(e.h3,{id:"31-\u8fdb\u5165-chroot-\u73af\u5883",children:["3.1. \u8fdb\u5165 ",(0,c.jsx)(e.code,{children:"chroot"})," \u73af\u5883"]}),"\n",(0,c.jsx)(e.pre,{children:(0,c.jsx)(e.code,{className:"language-bash",children:"sudo chroot /path/to/new_root\n"})}),"\n",(0,c.jsxs)(e.p,{children:["\u6b64\u547d\u4ee4\u5c06\u5207\u6362\u6839\u76ee\u5f55\u5230 ",(0,c.jsx)(e.code,{children:"/path/to/new_root"}),"\uff0c\u5e76\u542f\u52a8\u4e00\u4e2a\u4ea4\u4e92\u5f0f shell\u3002"]}),"\n",(0,c.jsxs)(e.h3,{id:"32-\u5728-chroot-\u73af\u5883\u4e2d\u6267\u884c\u547d\u4ee4",children:["3.2. \u5728 ",(0,c.jsx)(e.code,{children:"chroot"})," \u73af\u5883\u4e2d\u6267\u884c\u547d\u4ee4"]}),"\n",(0,c.jsx)(e.pre,{children:(0,c.jsx)(e.code,{className:"language-bash",children:"sudo chroot /path/to/new_root /bin/bash\n"})}),"\n",(0,c.jsxs)(e.p,{children:["\u5728 ",(0,c.jsx)(e.code,{children:"/path/to/new_root"})," \u76ee\u5f55\u4e2d\u6267\u884c ",(0,c.jsx)(e.code,{children:"/bin/bash"}),"\uff0c\u5e76\u8fdb\u5165\u4e00\u4e2a\u65b0\u7684\u73af\u5883\u3002"]}),"\n",(0,c.jsxs)(e.h2,{id:"4-\u521b\u5efa\u4e00\u4e2a\u57fa\u672c\u7684-chroot-\u73af\u5883",children:["4. ",(0,c.jsxs)(e.strong,{children:["\u521b\u5efa\u4e00\u4e2a\u57fa\u672c\u7684 ",(0,c.jsx)(e.code,{children:"chroot"})," \u73af\u5883"]})]}),"\n",(0,c.jsxs)(e.ol,{children:["\n",(0,c.jsx)(e.li,{children:(0,c.jsx)(e.strong,{children:"\u521b\u5efa\u65b0\u7684\u6839\u76ee\u5f55"})}),"\n"]}),"\n",(0,c.jsx)(e.pre,{children:(0,c.jsx)(e.code,{className:"language-bash",children:"sudo mkdir -p /path/to/new_root\n"})}),"\n",(0,c.jsxs)(e.ol,{children:["\n",(0,c.jsx)(e.li,{children:(0,c.jsx)(e.strong,{children:"\u6302\u8f7d\u5fc5\u8981\u7684\u865a\u62df\u6587\u4ef6\u7cfb\u7edf"})}),"\n"]}),"\n",(0,c.jsxs)(e.p,{children:["\u6709\u4e9b\u7cfb\u7edf\u6587\u4ef6\uff0c\u5982 ",(0,c.jsx)(e.code,{children:"/proc"}),"\uff0c\u9700\u8981\u5728 chroot \u73af\u5883\u4e2d\u6302\u8f7d\u3002"]}),"\n",(0,c.jsx)(e.pre,{children:(0,c.jsx)(e.code,{className:"language-bash",children:"sudo mount -t proc /proc /path/to/new_root/proc\nsudo mount -t sysfs /sys /path/to/new_root/sys\nsudo mount -o bind /dev /path/to/new_root/dev\nsudo mount -o bind /dev/pts /path/to/new_root/dev/pts\n"})}),"\n",(0,c.jsxs)(e.blockquote,{children:["\n",(0,c.jsxs)(e.p,{children:["\u6302\u8f7d ",(0,c.jsx)(e.code,{children:"/proc"}),"\u3001",(0,c.jsx)(e.code,{children:"/sys"}),"\u3001",(0,c.jsx)(e.code,{children:"/dev"})," \u548c ",(0,c.jsx)(e.code,{children:"/dev/pts"})," \u7b49\u76ee\u5f55\u662f\u4e3a\u4e86\u786e\u4fdd\u8fdb\u7a0b\u80fd\u591f\u6b63\u786e\u8bbf\u95ee\u548c\u4f7f\u7528\u8fd9\u4e9b\u865a\u62df\u6587\u4ef6\u7cfb\u7edf\uff0c\u5b83\u4eec\u63d0\u4f9b\u4e86\u91cd\u8981\u7684\u7cfb\u7edf\u4fe1\u606f\u548c\u8bbe\u5907\u63a5\u53e3\u3002\u5982\u679c\u6ca1\u6709\u8fd9\u4e9b\u6302\u8f7d\uff0c\u67d0\u4e9b\u7a0b\u5e8f\u6216\u547d\u4ee4\u53ef\u80fd\u4f1a\u5931\u6548\uff0c\u56e0\u4e3a\u5b83\u4eec\u4f9d\u8d56\u4e8e\u8fd9\u4e9b\u76ee\u5f55\u4e2d\u7684\u6587\u4ef6\u6765\u83b7\u53d6\u7cfb\u7edf\u72b6\u6001\u6216\u4e0e\u786c\u4ef6\u4ea4\u4e92\u3002"]}),"\n",(0,c.jsxs)(e.p,{children:[(0,c.jsx)(e.code,{children:"/proc"})," \u662f\u4e00\u4e2a\u865a\u62df\u6587\u4ef6\u7cfb\u7edf\uff0c\u63d0\u4f9b\u6709\u5173\u7cfb\u7edf\u8fdb\u7a0b\u3001\u5185\u6838\u4fe1\u606f\u4ee5\u53ca\u5176\u4ed6\u8fd0\u884c\u65f6\u4fe1\u606f\u7684\u6570\u636e\u3002\u5728 ",(0,c.jsx)(e.code,{children:"chroot"})," \u73af\u5883\u4e2d\uff0c\u5982\u679c\u6ca1\u6709\u6302\u8f7d ",(0,c.jsx)(e.code,{children:"/proc"}),"\uff0c\u5f88\u591a\u7a0b\u5e8f\u548c\u547d\u4ee4\uff08\u5982 ",(0,c.jsx)(e.code,{children:"ps"}),"\u3001",(0,c.jsx)(e.code,{children:"top"}),"\u3001",(0,c.jsx)(e.code,{children:"free"})," \u7b49\uff09\u5c31\u65e0\u6cd5\u6b63\u5e38\u5de5\u4f5c\uff0c\u56e0\u4e3a\u5b83\u4eec\u4f9d\u8d56\u4e8e ",(0,c.jsx)(e.code,{children:"/proc"})," \u4e2d\u7684\u4fe1\u606f\u6765\u83b7\u53d6\u5173\u4e8e\u5f53\u524d\u7cfb\u7edf\u548c\u8fdb\u7a0b\u7684\u72b6\u6001\u3002"]}),"\n",(0,c.jsxs)(e.p,{children:[(0,c.jsx)(e.code,{children:"/sys"})," \u4e5f\u662f\u4e00\u4e2a\u865a\u62df\u6587\u4ef6\u7cfb\u7edf\uff0c\u5b83\u63d0\u4f9b\u4e86\u5173\u4e8e\u7cfb\u7edf\u786c\u4ef6\u3001\u5185\u6838\u53c2\u6570\u3001\u8bbe\u5907\u72b6\u6001\u7b49\u7684\u52a8\u6001\u4fe1\u606f\u3002\u8bb8\u591a\u8bbe\u5907\u9a71\u52a8\u7a0b\u5e8f\u548c\u7cfb\u7edf\u670d\u52a1\u4f9d\u8d56\u4e8e ",(0,c.jsx)(e.code,{children:"/sys"})," \u4e2d\u7684\u6587\u4ef6\u6765\u8fdb\u884c\u786c\u4ef6\u7ba1\u7406\u548c\u7cfb\u7edf\u914d\u7f6e\u3002\u6ca1\u6709\u6302\u8f7d ",(0,c.jsx)(e.code,{children:"/sys"}),"\uff0c\u67d0\u4e9b\u7a0b\u5e8f\u53ef\u80fd\u65e0\u6cd5\u83b7\u53d6\u786c\u4ef6\u4fe1\u606f\u6216\u65e0\u6cd5\u4e0e\u8bbe\u5907\u8fdb\u884c\u4ea4\u4e92\u3002"]}),"\n",(0,c.jsx)(e.p,{children:"\u4f8b\u5982\uff1a"}),"\n",(0,c.jsxs)(e.ul,{children:["\n",(0,c.jsx)(e.li,{children:"\u7cfb\u7edf\u7684 CPU \u6838\u5fc3\u6570"}),"\n",(0,c.jsx)(e.li,{children:"\u7f51\u7edc\u63a5\u53e3\u7684\u914d\u7f6e"}),"\n",(0,c.jsx)(e.li,{children:"\u7535\u6c60\u72b6\u6001\uff08\u5728\u7b14\u8bb0\u672c\u7535\u8111\u4e0a\uff09"}),"\n"]}),"\n",(0,c.jsxs)(e.p,{children:[(0,c.jsx)(e.code,{children:"/dev"})," \u76ee\u5f55\u5305\u542b\u4e86\u6240\u6709\u8bbe\u5907\u6587\u4ef6\uff08\u5982\u786c\u76d8\u3001\u7ec8\u7aef\u3001USB \u8bbe\u5907\u7b49\uff09\u3002\u8fd9\u4e9b\u8bbe\u5907\u6587\u4ef6\u662f\u7528\u6237\u7a7a\u95f4\u7a0b\u5e8f\u4e0e\u786c\u4ef6\u8bbe\u5907\u4ea4\u4e92\u7684\u63a5\u53e3\u3002\u5bf9\u4e8e\u5728 ",(0,c.jsx)(e.code,{children:"chroot"})," \u73af\u5883\u4e2d\u8fd0\u884c\u7684\u7a0b\u5e8f\u6765\u8bf4\uff0c\u8bbf\u95ee\u8bbe\u5907\u6587\u4ef6\u662f\u5fc5\u9700\u7684\u3002"]}),"\n",(0,c.jsx)(e.p,{children:"\u4f8b\u5982\uff1a"}),"\n",(0,c.jsxs)(e.ul,{children:["\n",(0,c.jsxs)(e.li,{children:[(0,c.jsx)(e.code,{children:"/dev/sda"}),"\uff1a\u786c\u76d8\u8bbe\u5907\u6587\u4ef6"]}),"\n",(0,c.jsxs)(e.li,{children:[(0,c.jsx)(e.code,{children:"/dev/null"}),"\uff1a\u4e22\u5f03\u6570\u636e\u7684\u8bbe\u5907"]}),"\n",(0,c.jsxs)(e.li,{children:[(0,c.jsx)(e.code,{children:"/dev/tty"}),"\uff1a\u7ec8\u7aef\u8bbe\u5907"]}),"\n"]}),"\n",(0,c.jsxs)(e.p,{children:["\u5982\u679c\u6ca1\u6709\u6302\u8f7d ",(0,c.jsx)(e.code,{children:"/dev"}),"\uff0c\u7a0b\u5e8f\u5c31\u65e0\u6cd5\u8bbf\u95ee\u786c\u4ef6\u8bbe\u5907\uff0c\u4e5f\u65e0\u6cd5\u4e0e\u7ec8\u7aef\u3001\u7f51\u7edc\u63a5\u53e3\u7b49\u8fdb\u884c\u4ea4\u4e92\u3002"]}),"\n",(0,c.jsxs)(e.p,{children:[(0,c.jsx)(e.code,{children:"/dev/pts"})," \u76ee\u5f55\u662f\u7528\u4e8e\u7ba1\u7406\u4f2a\u7ec8\u7aef\u8bbe\u5907\uff08pty\uff09\u3002\u5b83\u5b58\u50a8\u4e86\u4e0e\u7ec8\u7aef\u76f8\u5173\u7684\u8bbe\u5907\u6587\u4ef6\uff0c\u5982 ",(0,c.jsx)(e.code,{children:"/dev/pts/0"})," \u7b49\u3002\u8fd9\u5bf9\u4e8e\u652f\u6301\u591a\u7528\u6237\u3001\u591a\u7ec8\u7aef\u7cfb\u7edf\u975e\u5e38\u91cd\u8981\uff0c\u5c24\u5176\u662f\u5bf9\u4e8e\u8fd0\u884c\u4ea4\u4e92\u5f0f shell \u548c\u547d\u4ee4\u884c\u7a0b\u5e8f\u7684\u73af\u5883\u3002"]}),"\n",(0,c.jsxs)(e.p,{children:["\u4f8b\u5982\uff0c\u5f53\u4f60\u4f7f\u7528 ",(0,c.jsx)(e.code,{children:"ssh"})," \u6216 ",(0,c.jsx)(e.code,{children:"tmux"})," \u767b\u5f55\u5230\u7cfb\u7edf\u65f6\uff0c\u7ec8\u7aef\u8bbe\u5907\u901a\u5e38\u662f\u901a\u8fc7 ",(0,c.jsx)(e.code,{children:"/dev/pts"})," \u6765\u8868\u793a\u7684\u3002\u5982\u679c\u6ca1\u6709\u6302\u8f7d ",(0,c.jsx)(e.code,{children:"/dev/pts"}),"\uff0c\u4f60\u5c06\u65e0\u6cd5\u542f\u52a8\u6216\u4f7f\u7528\u4ea4\u4e92\u5f0f\u7ec8\u7aef\uff08\u6bd4\u5982\u5728 ",(0,c.jsx)(e.code,{children:"chroot"})," \u73af\u5883\u4e2d\u6267\u884c ",(0,c.jsx)(e.code,{children:"bash"})," \u6216 ",(0,c.jsx)(e.code,{children:"sh"})," \u547d\u4ee4\u65f6\uff09\u3002"]}),"\n"]}),"\n",(0,c.jsxs)(e.ol,{children:["\n",(0,c.jsx)(e.li,{children:(0,c.jsx)(e.strong,{children:"\u5b89\u88c5\u5fc5\u8981\u7684\u5e93\u548c\u547d\u4ee4"})}),"\n"]}),"\n",(0,c.jsx)(e.p,{children:"\u786e\u4fdd\u5728\u65b0\u7684\u6839\u76ee\u5f55\u4e2d\u5b89\u88c5\u4e86\u6240\u9700\u7684\u5e93\u548c\u7a0b\u5e8f\u3002\u4f60\u53ef\u80fd\u9700\u8981\u590d\u5236\u6216\u6302\u8f7d\u4e00\u4e9b\u6587\u4ef6\uff0c\u6765\u4f7f chroot \u73af\u5883\u80fd\u591f\u6b63\u5e38\u8fd0\u884c\u3002"}),"\n",(0,c.jsx)(e.pre,{children:(0,c.jsx)(e.code,{className:"language-bash",children:"sudo cp /bin/bash /path/to/new_root/bin/\nsudo cp /lib/x86_64-linux-gnu/libtinfo.so.6 /path/to/new_root/lib/x86_64-linux-gnu/\nsudo cp /lib/x86_64-linux-gnu/libc.so.6 /path/to/new_root/lib/x86_64-linux-gnu/\n"})}),"\n",(0,c.jsxs)(e.ol,{children:["\n",(0,c.jsx)(e.li,{children:(0,c.jsxs)(e.strong,{children:["\u8fdb\u5165 ",(0,c.jsx)(e.code,{children:"chroot"})," \u73af\u5883"]})}),"\n"]}),"\n",(0,c.jsx)(e.pre,{children:(0,c.jsx)(e.code,{className:"language-bash",children:"sudo chroot /path/to/new_root /bin/bash\n"})}),"\n",(0,c.jsxs)(e.p,{children:["\u6b64\u65f6\u4f60\u5df2\u7ecf\u8fdb\u5165\u4e86\u4e00\u4e2a\u65b0\u7684 chroot \u73af\u5883\uff0c\u6839\u76ee\u5f55\u4e3a ",(0,c.jsx)(e.code,{children:"/path/to/new_root"}),"\u3002"]}),"\n",(0,c.jsxs)(e.h2,{id:"5-\u4f7f\u7528\u573a\u666f",children:["5. ",(0,c.jsx)(e.strong,{children:"\u4f7f\u7528\u573a\u666f"})]}),"\n",(0,c.jsxs)(e.h3,{id:"51-\u7cfb\u7edf\u6062\u590d",children:["5.1. ",(0,c.jsx)(e.strong,{children:"\u7cfb\u7edf\u6062\u590d"})]}),"\n",(0,c.jsxs)(e.p,{children:["\u5f53\u7cfb\u7edf\u65e0\u6cd5\u542f\u52a8\u6216\u635f\u574f\u65f6\uff0c\u53ef\u4ee5\u4f7f\u7528 ",(0,c.jsx)(e.code,{children:"chroot"})," \u6765\u8fdb\u5165\u7cfb\u7edf\u5e76\u4fee\u590d\u95ee\u9898\u3002\u4f8b\u5982\uff0c\u901a\u8fc7 ",(0,c.jsx)(e.code,{children:"chroot"})," \u8fdb\u5165\u7cfb\u7edf\u7684\u6839\u6587\u4ef6\u7cfb\u7edf\uff0c\u91cd\u65b0\u5b89\u88c5\u5f15\u5bfc\u7a0b\u5e8f\u6216\u4fee\u590d\u635f\u574f\u7684\u6587\u4ef6\u3002"]}),"\n",(0,c.jsx)(e.pre,{children:(0,c.jsx)(e.code,{className:"language-bash",children:"sudo mount /dev/sda1 /mnt\nsudo mount --bind /dev /mnt/dev\nsudo mount --bind /proc /mnt/proc\nsudo mount --bind /sys /mnt/sys\nsudo chroot /mnt\n"})}),"\n",(0,c.jsxs)(e.h3,{id:"52-\u9694\u79bb\u73af\u5883sandbox",children:["5.2. ",(0,c.jsx)(e.strong,{children:"\u9694\u79bb\u73af\u5883\uff08Sandbox\uff09"})]}),"\n",(0,c.jsxs)(e.p,{children:[(0,c.jsx)(e.code,{children:"chroot"})," \u53ef\u4ee5\u7528\u6765\u521b\u5efa\u4e00\u4e2a\u53d7\u9650\u7684\u73af\u5883\uff0c\u9650\u5236\u67d0\u4e2a\u8fdb\u7a0b\u53ea\u80fd\u8bbf\u95ee\u7279\u5b9a\u76ee\u5f55\u3002\u5b83\u5e38\u7528\u4e8e\u5bb9\u5668\u5316\u6280\u672f\u7684\u57fa\u7840\u5b9e\u73b0\uff0c\u5c3d\u7ba1\u73b0\u4ee3\u5bb9\u5668\u4f7f\u7528\u66f4\u5f3a\u5927\u7684\u5de5\u5177\uff08\u5982 Docker\uff09\u6765\u63d0\u4f9b\u9694\u79bb\u3002"]}),"\n",(0,c.jsxs)(e.h3,{id:"53-\u8f6f\u4ef6\u5305\u7f16\u8bd1",children:["5.3. ",(0,c.jsx)(e.strong,{children:"\u8f6f\u4ef6\u5305\u7f16\u8bd1"})]}),"\n",(0,c.jsx)(e.p,{children:"\u5728\u6784\u5efa\u7279\u5b9a\u7248\u672c\u7684\u7a0b\u5e8f\u6216\u6d4b\u8bd5\u65f6\uff0c\u53ef\u4ee5\u521b\u5efa\u4e00\u4e2a\u5e72\u51c0\u7684\u73af\u5883\uff0c\u907f\u514d\u7cfb\u7edf\u4e2d\u73b0\u6709\u8f6f\u4ef6\u5305\u7684\u5f71\u54cd\u3002"}),"\n",(0,c.jsxs)(e.h3,{id:"54-\u8fd0\u884c\u7279\u5b9a\u7248\u672c\u7684\u5e94\u7528\u7a0b\u5e8f",children:["5.4. ",(0,c.jsx)(e.strong,{children:"\u8fd0\u884c\u7279\u5b9a\u7248\u672c\u7684\u5e94\u7528\u7a0b\u5e8f"})]}),"\n",(0,c.jsxs)(e.p,{children:["\u5982\u679c\u9700\u8981\u8fd0\u884c\u4e00\u4e2a\u7279\u5b9a\u7248\u672c\u7684\u7a0b\u5e8f\uff0c\u53ef\u4ee5\u4f7f\u7528 ",(0,c.jsx)(e.code,{children:"chroot"})," \u6765\u9694\u79bb\u65e7\u7248\u672c\u7684\u5e93\u548c\u4e8c\u8fdb\u5236\u6587\u4ef6\u3002"]}),"\n",(0,c.jsxs)(e.h2,{id:"6-\u6ce8\u610f\u4e8b\u9879",children:["6. ",(0,c.jsx)(e.strong,{children:"\u6ce8\u610f\u4e8b\u9879"})]}),"\n",(0,c.jsxs)(e.ol,{children:["\n",(0,c.jsx)(e.li,{children:(0,c.jsx)(e.strong,{children:"\u6743\u9650\u95ee\u9898"})}),"\n"]}),"\n",(0,c.jsxs)(e.p,{children:[(0,c.jsx)(e.code,{children:"chroot"})," \u9700\u8981\u5177\u6709\u8db3\u591f\u7684\u6743\u9650\uff0c\u901a\u5e38\u53ea\u6709 root \u7528\u6237\u624d\u80fd\u6267\u884c\u6b64\u64cd\u4f5c\u3002"]}),"\n",(0,c.jsxs)(e.ol,{start:"2",children:["\n",(0,c.jsx)(e.li,{children:(0,c.jsx)(e.strong,{children:"\u5b89\u5168\u6027"})}),"\n"]}),"\n",(0,c.jsxs)(e.p,{children:[(0,c.jsx)(e.code,{children:"chroot"})," \u53ea\u662f\u63d0\u4f9b\u4e86\u4e00\u79cd\u7b80\u5355\u7684\u9694\u79bb\u65b9\u5f0f\uff0c\u5e76\u4e0d\u80fd\u5b8c\u5168\u9632\u6b62\u8fdb\u7a0b\u9003\u9038\u6216\u8bbf\u95ee\u654f\u611f\u4fe1\u606f\u3002\u66f4\u5f3a\u7684\u5b89\u5168\u63aa\u65bd\uff08\u5982\u4f7f\u7528 ",(0,c.jsx)(e.code,{children:"namespaces"})," \u6216 ",(0,c.jsx)(e.code,{children:"containers"}),"\uff09\u5e94\u8be5\u7528\u4e8e\u9ad8\u5b89\u5168\u6027\u9700\u6c42\u7684\u73af\u5883\u3002"]}),"\n",(0,c.jsxs)(e.ol,{start:"3",children:["\n",(0,c.jsx)(e.li,{children:(0,c.jsx)(e.strong,{children:"\u6587\u4ef6\u7cfb\u7edf\u4f9d\u8d56"})}),"\n"]}),"\n",(0,c.jsxs)(e.p,{children:["\u67d0\u4e9b\u8fdb\u7a0b\u9700\u8981\u7279\u5b9a\u7684\u7cfb\u7edf\u6587\u4ef6\uff08\u5982 ",(0,c.jsx)(e.code,{children:"/dev"}),", ",(0,c.jsx)(e.code,{children:"/proc"}),", ",(0,c.jsx)(e.code,{children:"/sys"})," \u7b49\uff09\u3002\u5982\u679c\u6ca1\u6709\u6302\u8f7d\u8fd9\u4e9b\u865a\u62df\u6587\u4ef6\u7cfb\u7edf\uff0c\u7a0b\u5e8f\u53ef\u80fd\u4f1a\u5d29\u6e83\u6216\u65e0\u6cd5\u6b63\u5e38\u5de5\u4f5c\u3002"]}),"\n",(0,c.jsxs)(e.ol,{start:"4",children:["\n",(0,c.jsx)(e.li,{children:(0,c.jsx)(e.strong,{children:"\u65e0\u6cd5\u9003\u9038"})}),"\n"]}),"\n",(0,c.jsxs)(e.p,{children:[(0,c.jsx)(e.code,{children:"chroot"})," \u672c\u8eab\u5e76\u4e0d\u80fd\u9632\u6b62\u8fdb\u7a0b\u4ece chroot \u73af\u5883\u4e2d\u9003\u9038\uff0c\u56e0\u6b64\u5bf9\u4e8e\u9ad8\u5b89\u5168\u6027\u8981\u6c42\u7684\u573a\u666f\uff08\u5982\u6c99\u7bb1\u3001\u5bb9\u5668\uff09\u4e0d\u63a8\u8350\u5355\u72ec\u4f9d\u8d56 ",(0,c.jsx)(e.code,{children:"chroot"}),"\u3002"]}),"\n",(0,c.jsxs)(e.h2,{id:"7-\u603b\u7ed3",children:["7. ",(0,c.jsx)(e.strong,{children:"\u603b\u7ed3"})]}),"\n",(0,c.jsxs)(e.p,{children:[(0,c.jsx)(e.code,{children:"chroot"})," \u662f\u4e00\u4e2a\u5f3a\u5927\u7684\u5de5\u5177\uff0c\u7528\u4e8e\u5c06\u8fdb\u7a0b\u9694\u79bb\u5728\u7279\u5b9a\u7684\u76ee\u5f55\u6811\u4e2d\u3002\u5b83\u5728\u7cfb\u7edf\u6062\u590d\u3001\u9694\u79bb\u6d4b\u8bd5\u3001\u6784\u5efa\u73af\u5883\u7b49\u65b9\u9762\u975e\u5e38\u6709\u7528\u3002\u7136\u800c\uff0c\u5b83\u5e76\u4e0d\u662f\u4e00\u4e2a\u5b8c\u7f8e\u7684\u5b89\u5168\u9694\u79bb\u5de5\u5177\uff0c\u73b0\u4ee3\u5bb9\u5668\u5316\u6280\u672f\u63d0\u4f9b\u4e86\u66f4\u5f3a\u7684\u9694\u79bb\u548c\u5b89\u5168\u6027\u3002"]}),"\n",(0,c.jsx)(e.hr,{}),"\n",(0,c.jsx)(e.p,{children:"\u4f60\u53ef\u4ee5\u6839\u636e\u9700\u6c42\u6269\u5c55\u6587\u6863\u7684\u5185\u5bb9\uff0c\u5982\u6dfb\u52a0\u66f4\u8be6\u7ec6\u7684\u5b89\u5168\u6027\u8ba8\u8bba\u3001\u4f7f\u7528\u793a\u4f8b\u7b49\u3002"})]})}function x(n={}){const{wrapper:e}={...(0,r.R)(),...n.components};return e?(0,c.jsx)(e,{...n,children:(0,c.jsx)(t,{...n})}):t(n)}},8453:(n,e,s)=>{s.d(e,{R:()=>d,x:()=>l});var o=s(6540);const c={},r=o.createContext(c);function d(n){const e=o.useContext(r);return o.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function l(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(c):n.components||c:d(n.components),o.createElement(r.Provider,{value:e},n.children)}}}]);