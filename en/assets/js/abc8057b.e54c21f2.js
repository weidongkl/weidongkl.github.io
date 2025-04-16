"use strict";(self.webpackChunkweidongkl_github_io=self.webpackChunkweidongkl_github_io||[]).push([[397],{3902:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>s,default:()=>o,frontMatter:()=>l,metadata:()=>r,toc:()=>a});const r=JSON.parse('{"id":"note/golang/validator","title":"Golang Validator","description":"1. \u7b80\u4ecb","source":"@site/docs/note/golang/validator.md","sourceDirName":"note/golang","slug":"/note/golang/validator","permalink":"/en/docs/note/golang/validator","draft":false,"unlisted":false,"editUrl":"https://github.com/weidongkl/weidongkl.github.io/tree/master/docs/note/golang/validator.md","tags":[],"version":"current","frontMatter":{},"sidebar":"note","previous":{"title":"Golang sys/unix syscall","permalink":"/en/docs/note/golang/syscall"},"next":{"title":"Golang Unix Socket \u670d\u52a1","permalink":"/en/docs/note/golang/web_server_unix"}}');var d=t(4848),i=t(8453);const l={},s="Golang Validator",c={},a=[{value:"1. \u7b80\u4ecb",id:"1-\u7b80\u4ecb",level:2},{value:"2. \u5b89\u88c5",id:"2-\u5b89\u88c5",level:2},{value:"3. \u57fa\u672c\u4f7f\u7528",id:"3-\u57fa\u672c\u4f7f\u7528",level:2},{value:"4. \u5e38\u89c1\u7684\u5185\u7f6e\u9a8c\u8bc1\u6807\u7b7e",id:"4-\u5e38\u89c1\u7684\u5185\u7f6e\u9a8c\u8bc1\u6807\u7b7e",level:2},{value:"5. \u81ea\u5b9a\u4e49\u9a8c\u8bc1",id:"5-\u81ea\u5b9a\u4e49\u9a8c\u8bc1",level:2},{value:"6. \u7ed3\u6784\u4f53\u5d4c\u5957\u9a8c\u8bc1",id:"6-\u7ed3\u6784\u4f53\u5d4c\u5957\u9a8c\u8bc1",level:2},{value:"7. \u5904\u7406\u9519\u8bef\u4fe1\u606f",id:"7-\u5904\u7406\u9519\u8bef\u4fe1\u606f",level:2},{value:"8. \u7ed3\u8bba",id:"8-\u7ed3\u8bba",level:2}];function h(e){const n={code:"code",h1:"h1",h2:"h2",header:"header",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,i.R)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(n.header,{children:(0,d.jsx)(n.h1,{id:"golang-validator",children:"Golang Validator"})}),"\n",(0,d.jsx)(n.h2,{id:"1-\u7b80\u4ecb",children:"1. \u7b80\u4ecb"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"validator"})," \u662f Go \u8bed\u8a00\u4e2d\u4e00\u4e2a\u5f3a\u5927\u7684\u6570\u636e\u9a8c\u8bc1\u5e93\uff0c\u5b83\u63d0\u4f9b\u7ed3\u6784\u4f53\u5b57\u6bb5\u6807\u7b7e\u9a8c\u8bc1\u529f\u80fd\uff0c\u5e76\u652f\u6301\u81ea\u5b9a\u4e49\u9a8c\u8bc1\u89c4\u5219\u3002"]}),"\n",(0,d.jsx)(n.h2,{id:"2-\u5b89\u88c5",children:"2. \u5b89\u88c5"}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{className:"language-sh",children:"go get github.com/go-playground/validator/v10\n"})}),"\n",(0,d.jsx)(n.h2,{id:"3-\u57fa\u672c\u4f7f\u7528",children:"3. \u57fa\u672c\u4f7f\u7528"}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{className:"language-go",children:'package main\n\nimport (\n\t"fmt"\n\t"github.com/go-playground/validator/v10"\n)\n\ntype User struct {\n\tName  string `validate:"required"`\n\tAge   int    `validate:"gte=18,lte=65"`\n\tEmail string `validate:"required,email"`\n}\n\nfunc main() {\n\tvalidate := validator.New()\n\n\tuser := User{\n\t\tName:  "",\n\t\tAge:   17,\n\t\tEmail: "invalid-email",\n\t}\n\n\terr := validate.Struct(user)\n\tif err != nil {\n\t\tfor _, err := range err.(validator.ValidationErrors) {\n\t\t\tfmt.Println("Validation error:", err)\n\t\t}\n\t} else {\n\t\tfmt.Println("Validation passed")\n\t}\n}\n'})}),"\n",(0,d.jsx)(n.h2,{id:"4-\u5e38\u89c1\u7684\u5185\u7f6e\u9a8c\u8bc1\u6807\u7b7e",children:"4. \u5e38\u89c1\u7684\u5185\u7f6e\u9a8c\u8bc1\u6807\u7b7e"}),"\n",(0,d.jsxs)(n.table,{children:[(0,d.jsx)(n.thead,{children:(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.th,{children:"\u6807\u7b7e"}),(0,d.jsx)(n.th,{children:"\u63cf\u8ff0"})]})}),(0,d.jsxs)(n.tbody,{children:[(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"required"}),(0,d.jsx)(n.td,{children:"\u5fc5\u586b\u5b57\u6bb5"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"email"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u662f\u5408\u6cd5\u7684\u90ae\u7bb1\u683c\u5f0f"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"gte=X"}),(0,d.jsx)(n.td,{children:"\u5927\u4e8e\u7b49\u4e8e X"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"lte=X"}),(0,d.jsx)(n.td,{children:"\u5c0f\u4e8e\u7b49\u4e8e X"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"min=X"}),(0,d.jsx)(n.td,{children:"\u5b57\u7b26\u4e32\u3001\u5207\u7247\u3001\u6620\u5c04\u7684\u6700\u5c0f\u957f\u5ea6"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"max=X"}),(0,d.jsx)(n.td,{children:"\u5b57\u7b26\u4e32\u3001\u5207\u7247\u3001\u6620\u5c04\u7684\u6700\u5927\u957f\u5ea6"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"len=X"}),(0,d.jsx)(n.td,{children:"\u957f\u5ea6\u5fc5\u987b\u7b49\u4e8e X"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"url"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u662f\u5408\u6cd5\u7684 URL"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"numeric"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u662f\u6570\u5b57"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"alphanum"}),(0,d.jsx)(n.td,{children:"\u4ec5\u5141\u8bb8\u5b57\u6bcd\u548c\u6570\u5b57"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"alpha"}),(0,d.jsx)(n.td,{children:"\u4ec5\u5141\u8bb8\u5b57\u6bcd"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"contains=X"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u5305\u542b X \u5b50\u4e32"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"startswith=X"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u4ee5 X \u5f00\u5934"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"endswith=X"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u4ee5 X \u7ed3\u5c3e"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"lowercase"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u4e3a\u5c0f\u5199"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"uppercase"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u4e3a\u5927\u5199"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"ipv4"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u662f\u5408\u6cd5\u7684 IPv4 \u5730\u5740"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"ipv6"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u662f\u5408\u6cd5\u7684 IPv6 \u5730\u5740"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"boolean"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u662f\u5e03\u5c14\u503c"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"datetime=layout"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u662f\u6307\u5b9a\u683c\u5f0f\u7684\u65e5\u671f\u65f6\u95f4"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"base64"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u662f Base64 \u7f16\u7801\u683c\u5f0f"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"hexcolor"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u662f\u5341\u516d\u8fdb\u5236\u989c\u8272\u4ee3\u7801"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"uuid"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u662f\u5408\u6cd5\u7684 UUID"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"json"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u662f\u5408\u6cd5\u7684 JSON \u5b57\u7b26\u4e32"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"ascii"}),(0,d.jsx)(n.td,{children:"\u4ec5\u5141\u8bb8 ASCII \u5b57\u7b26"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"printascii"}),(0,d.jsx)(n.td,{children:"\u4ec5\u5141\u8bb8\u53ef\u6253\u5370 ASCII \u5b57\u7b26"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"multibyte"}),(0,d.jsx)(n.td,{children:"\u5141\u8bb8\u591a\u5b57\u8282\u5b57\u7b26"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"containsany=chars"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u5305\u542b chars \u4e2d\u7684\u81f3\u5c11\u4e00\u4e2a\u5b57\u7b26"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"excludesall=chars"}),(0,d.jsx)(n.td,{children:"\u4e0d\u80fd\u5305\u542b chars \u4e2d\u7684\u4efb\u4f55\u5b57\u7b26"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"excludes=X"}),(0,d.jsx)(n.td,{children:"\u4e0d\u80fd\u5305\u542b X \u5b50\u4e32"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"isdefault"}),(0,d.jsx)(n.td,{children:"\u5fc5\u987b\u662f\u5b57\u6bb5\u7c7b\u578b\u7684\u9ed8\u8ba4\u503c"})]}),(0,d.jsxs)(n.tr,{children:[(0,d.jsx)(n.td,{children:"dive"}),(0,d.jsx)(n.td,{children:"\u7528\u4e8e\u5207\u7247\u6216\u8005map\u7684\u9a8c\u8bc1"})]})]})]}),"\n",(0,d.jsx)(n.h2,{id:"5-\u81ea\u5b9a\u4e49\u9a8c\u8bc1",children:"5. \u81ea\u5b9a\u4e49\u9a8c\u8bc1"}),"\n",(0,d.jsx)(n.p,{children:'\u53ef\u4ee5\u81ea\u5b9a\u4e49\u9a8c\u8bc1\u89c4\u5219\uff0c\u4f8b\u5982\u9a8c\u8bc1\u5b57\u7b26\u4e32\u662f\u5426\u4e3a "hello":'}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{className:"language-go",children:'func helloValidator(fl validator.FieldLevel) bool {\n\treturn fl.Field().String() == "hello"\n}\n\nfunc main() {\n\tvalidate := validator.New()\n\tvalidate.RegisterValidation("hello", helloValidator)\n\n\ttype Test struct {\n\t\tMsg string `validate:"hello"`\n\t}\n\tt := Test{Msg: "world"}\n\n\terr := validate.Struct(t)\n\tif err != nil {\n\t\tfmt.Println("Validation failed:", err)\n\t} else {\n\t\tfmt.Println("Validation passed")\n\t}\n}\n'})}),"\n",(0,d.jsx)(n.h2,{id:"6-\u7ed3\u6784\u4f53\u5d4c\u5957\u9a8c\u8bc1",children:"6. \u7ed3\u6784\u4f53\u5d4c\u5957\u9a8c\u8bc1"}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{className:"language-go",children:'type Address struct {\n\tCity    string `validate:"required"`\n\tZipCode string `validate:"numeric"`\n}\n\ntype Person struct {\n\tName    string  `validate:"required"`\n\tAge     int     `validate:"gte=18"`\n\tAddress Address `validate:"required"`\n}\n'})}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"required"})," \u5173\u952e\u5b57\u8868\u793a\u6df1\u5165\u5230\u5d4c\u5957\u7ed3\u6784\u4f53\u4e2d\u8fdb\u884c\u9a8c\u8bc1\u3002"]}),"\n",(0,d.jsx)(n.h2,{id:"7-\u5904\u7406\u9519\u8bef\u4fe1\u606f",children:"7. \u5904\u7406\u9519\u8bef\u4fe1\u606f"}),"\n",(0,d.jsx)(n.pre,{children:(0,d.jsx)(n.code,{className:"language-go",children:"if err != nil {\n\tfor _, e := range err.(validator.ValidationErrors) {\n\t\tfmt.Printf(\"Field %s failed on '%s' tag\\n\", e.Field(), e.Tag())\n\t}\n}\n"})}),"\n",(0,d.jsx)(n.h2,{id:"8-\u7ed3\u8bba",children:"8. \u7ed3\u8bba"}),"\n",(0,d.jsxs)(n.p,{children:[(0,d.jsx)(n.code,{children:"validator"})," \u63d0\u4f9b\u4e86\u4e30\u5bcc\u7684\u9a8c\u8bc1\u529f\u80fd\uff0c\u9002\u7528\u4e8e Go \u9879\u76ee\u4e2d\u7684\u8f93\u5165\u6821\u9a8c\u573a\u666f\uff0c\u53ef\u4ee5\u7ed3\u5408 ",(0,d.jsx)(n.code,{children:"gin"})," \u6216\u5176\u4ed6 Web \u6846\u67b6\u8fdb\u884c API \u53c2\u6570\u9a8c\u8bc1\uff0c\u63d0\u9ad8\u6570\u636e\u7684\u53ef\u9760\u6027\u3002"]})]})}function o(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,d.jsx)(n,{...e,children:(0,d.jsx)(h,{...e})}):h(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>l,x:()=>s});var r=t(6540);const d={},i=r.createContext(d);function l(e){const n=r.useContext(i);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function s(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:l(e.components),r.createElement(i.Provider,{value:n},e.children)}}}]);