"use strict";(self.webpackChunkweidongkl_github_io=self.webpackChunkweidongkl_github_io||[]).push([[206],{3638:(n,e,t)=>{t.r(e),t.d(e,{assets:()=>a,contentTitle:()=>s,default:()=>f,frontMatter:()=>c,metadata:()=>l,toc:()=>d});const l=JSON.parse('{"id":"note/golang/reflect","title":"Golang Reflect","description":"1. \u53cd\u5c04\uff08Reflect\uff09\u6982\u8ff0","source":"@site/docs/note/golang/reflect.md","sourceDirName":"note/golang","slug":"/note/golang/reflect","permalink":"/docs/note/golang/reflect","draft":false,"unlisted":false,"editUrl":"https://github.com/weidongkl/weidongkl.github.io/tree/master/docs/note/golang/reflect.md","tags":[],"version":"current","frontMatter":{},"sidebar":"note","previous":{"title":"kingpin \u7528\u6cd5","permalink":"/docs/note/golang/kingpin"},"next":{"title":"Golang \u5e8f\u5217\u5316/\u53cd\u5e8f\u5217\u5316","permalink":"/docs/note/golang/serialization"}}');var i=t(4848),r=t(8453);const c={},s="Golang Reflect",a={},d=[{value:"1. \u53cd\u5c04\uff08Reflect\uff09\u6982\u8ff0",id:"1-\u53cd\u5c04reflect\u6982\u8ff0",level:2},{value:"2. \u53cd\u5c04\u7684\u57fa\u672c\u7c7b\u578b",id:"2-\u53cd\u5c04\u7684\u57fa\u672c\u7c7b\u578b",level:2},{value:"2.1 \u83b7\u53d6\u53d8\u91cf\u7684\u7c7b\u578b\u548c\u503c",id:"21-\u83b7\u53d6\u53d8\u91cf\u7684\u7c7b\u578b\u548c\u503c",level:2},{value:"3. \u53cd\u5c04\u4fee\u6539\u53d8\u91cf\u503c",id:"3-\u53cd\u5c04\u4fee\u6539\u53d8\u91cf\u503c",level:2},{value:"4. \u53cd\u5c04\u5904\u7406\u7ed3\u6784\u4f53",id:"4-\u53cd\u5c04\u5904\u7406\u7ed3\u6784\u4f53",level:2},{value:"4.1 \u83b7\u53d6\u7ed3\u6784\u4f53\u5b57\u6bb5\u4fe1\u606f",id:"41-\u83b7\u53d6\u7ed3\u6784\u4f53\u5b57\u6bb5\u4fe1\u606f",level:3},{value:"4.2 \u89e3\u6790\u7ed3\u6784\u4f53\u6807\u7b7e\uff08Tag\uff09",id:"42-\u89e3\u6790\u7ed3\u6784\u4f53\u6807\u7b7etag",level:3},{value:"5. \u53cd\u5c04\u8c03\u7528\u65b9\u6cd5",id:"5-\u53cd\u5c04\u8c03\u7528\u65b9\u6cd5",level:2},{value:"6. \u53cd\u5c04\u7684\u5c40\u9650\u6027",id:"6-\u53cd\u5c04\u7684\u5c40\u9650\u6027",level:2},{value:"7. \u53cd\u5c04\u6700\u4f73\u5b9e\u8df5",id:"7-\u53cd\u5c04\u6700\u4f73\u5b9e\u8df5",level:2}];function o(n){const e={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,r.R)(),...n.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(e.header,{children:(0,i.jsx)(e.h1,{id:"golang-reflect",children:"Golang Reflect"})}),"\n",(0,i.jsx)(e.h2,{id:"1-\u53cd\u5c04reflect\u6982\u8ff0",children:"1. \u53cd\u5c04\uff08Reflect\uff09\u6982\u8ff0"}),"\n",(0,i.jsxs)(e.p,{children:["\u53cd\u5c04\u662f Go \u8bed\u8a00\u4e2d\u7684\u4e00\u4e2a\u5f3a\u5927\u7279\u6027\uff0c\u5141\u8bb8\u7a0b\u5e8f\u5728\u8fd0\u884c\u65f6\u68c0\u67e5\u548c\u64cd\u4f5c\u53d8\u91cf\u7684\u7c7b\u578b\u548c\u503c\u3002 ",(0,i.jsx)(e.code,{children:"reflect"})," \u5305\u63d0\u4f9b\u4e86\u4e00\u7cfb\u5217 API\uff0c\u4f7f\u5f97\u5f00\u53d1\u8005\u53ef\u4ee5\u52a8\u6001\u83b7\u53d6\u53d8\u91cf\u7684\u4fe1\u606f\u3001\u4fee\u6539\u53d8\u91cf\u7684\u503c\uff0c\u5e76\u5728\u4e00\u5b9a\u7a0b\u5ea6\u4e0a\u5b9e\u73b0\u52a8\u6001\u8c03\u7528\u3002"]}),"\n",(0,i.jsx)(e.p,{children:(0,i.jsx)(e.strong,{children:"\u9002\u7528\u573a\u666f\uff1a"})}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:"\u5904\u7406\u63a5\u53e3\u7c7b\u578b\u7684\u53d8\u91cf"}),"\n",(0,i.jsx)(e.li,{children:"\u89e3\u6790\u7ed3\u6784\u4f53\u6807\u7b7e\uff08struct tag\uff09"}),"\n",(0,i.jsx)(e.li,{children:"\u751f\u6210\u901a\u7528\u5de5\u5177\uff0c\u5982\u5e8f\u5217\u5316\u3001\u53cd\u5e8f\u5217\u5316\u3001ORM \u6846\u67b6\u7b49"}),"\n"]}),"\n",(0,i.jsx)(e.p,{children:(0,i.jsx)(e.strong,{children:"reflect \u5305\u7684\u6838\u5fc3\u529f\u80fd\uff1a"})}),"\n",(0,i.jsxs)(e.ol,{children:["\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.strong,{children:"\u7c7b\u578b\u68c0\u67e5"}),"\uff1a\u83b7\u53d6\u53d8\u91cf\u7684\u7c7b\u578b\u4fe1\u606f\u3002"]}),"\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.strong,{children:"\u503c\u64cd\u4f5c"}),"\uff1a\u83b7\u53d6\u548c\u4fee\u6539\u53d8\u91cf\u7684\u503c\u3002"]}),"\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.strong,{children:"\u65b9\u6cd5\u8c03\u7528"}),"\uff1a\u52a8\u6001\u8c03\u7528\u7ed3\u6784\u4f53\u7684\u65b9\u6cd5\u3002"]}),"\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.strong,{children:"\u5b57\u6bb5\u64cd\u4f5c"}),"\uff1a\u52a8\u6001\u8bbf\u95ee\u548c\u4fee\u6539\u7ed3\u6784\u4f53\u7684\u5b57\u6bb5\u3002"]}),"\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.strong,{children:"\u521b\u5efa\u5b9e\u4f8b"}),"\uff1a\u901a\u8fc7\u53cd\u5c04\u521b\u5efa\u65b0\u7684\u53d8\u91cf\u5b9e\u4f8b\u3002"]}),"\n"]}),"\n",(0,i.jsx)(e.h2,{id:"2-\u53cd\u5c04\u7684\u57fa\u672c\u7c7b\u578b",children:"2. \u53cd\u5c04\u7684\u57fa\u672c\u7c7b\u578b"}),"\n",(0,i.jsxs)(e.p,{children:["\u5728 ",(0,i.jsx)(e.code,{children:"reflect"})," \u5305\u4e2d\uff0c\u4e3b\u8981\u6709\u4e24\u4e2a\u6838\u5fc3\u7c7b\u578b\uff1a"]}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.code,{children:"reflect.Type"}),"\uff1a\u8868\u793a\u53d8\u91cf\u7684\u7c7b\u578b\uff08",(0,i.jsx)(e.code,{children:"TypeOf"})," \u83b7\u53d6\uff09"]}),"\n",(0,i.jsxs)(e.li,{children:[(0,i.jsx)(e.code,{children:"reflect.Value"}),"\uff1a\u8868\u793a\u53d8\u91cf\u7684\u503c\uff08",(0,i.jsx)(e.code,{children:"ValueOf"})," \u83b7\u53d6\uff09"]}),"\n"]}),"\n",(0,i.jsx)(e.h2,{id:"21-\u83b7\u53d6\u53d8\u91cf\u7684\u7c7b\u578b\u548c\u503c",children:"2.1 \u83b7\u53d6\u53d8\u91cf\u7684\u7c7b\u578b\u548c\u503c"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-go",children:'package main\n\nimport (\n\t"fmt"\n\t"reflect"\n)\n\nfunc main() {\n\tvar num int = 42\n\ttypeInfo := reflect.TypeOf(num)\n\tvalueInfo := reflect.ValueOf(num)\n\n\tfmt.Println("Type:", typeInfo)   // int\n\tfmt.Println("Value:", valueInfo) // 42\n\ttypeInfo = reflect.TypeOf(&num)\n\tvalueInfo = reflect.ValueOf(&num)\n\tfmt.Println("Point Type:", typeInfo)   // *int\n\tfmt.Println("Point Value:", valueInfo) // 0xc00010a000\n}\n'})}),"\n",(0,i.jsx)(e.h2,{id:"3-\u53cd\u5c04\u4fee\u6539\u53d8\u91cf\u503c",children:"3. \u53cd\u5c04\u4fee\u6539\u53d8\u91cf\u503c"}),"\n",(0,i.jsxs)(e.p,{children:["\u53cd\u5c04\u53ef\u4ee5\u4fee\u6539\u53d8\u91cf\u7684\u503c\uff0c\u4f46\u524d\u63d0\u662f ",(0,i.jsx)(e.code,{children:"reflect.Value"})," \u5fc5\u987b\u662f\u53ef\u8bbe\u7f6e\u7684\uff08",(0,i.jsx)(e.code,{children:"CanSet()"})," \u65b9\u6cd5\u8fd4\u56de ",(0,i.jsx)(e.code,{children:"true"}),"\uff09\u3002"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-go",children:'package main\n\nimport (\n\t"fmt"\n\t"reflect"\n)\n\nfunc main() {\n\tvar num int = 42\n\t// \u4f20\u9012\u6307\u9488\u624d\u80fd\u4fee\u6539\u539f\u503c\n\t// \u6b64\u65f6\u7684valueInfo\u662f\u4e00\u4e2areflect.Value\u7c7b\u578b\u3002\u4ee3\u8868num\u6307\u9488\n\tvalueInfo := reflect.ValueOf(&num)\n\t// \u6b64\u65f6\u7684valueElem\u662f\u4e00\u4e2areflect.Value\u7c7b\u578b\u3002\u4ee3\u8868num\u7684\u503c\n\tvalueElem := valueInfo.Elem()\n\t/*\n\t * \u5f53\u4f60\u9700\u8981\u901a\u8fc7\u6307\u9488\u4fee\u6539\u539f\u59cb\u53d8\u91cf\u7684\u503c\u65f6\uff0c\u4f60\u9700\u8981\u5148\u83b7\u53d6\u6307\u9488\u7684 reflect.Value\uff0c\n\t * \u7136\u540e\u901a\u8fc7 .Elem() \u65b9\u6cd5\u83b7\u53d6\u5230\u5b9e\u9645\u7684\u503c\u5e76\u8fdb\u884c\u64cd\u4f5c\u3002\n\t */\n\tif valueElem.CanSet() {\n\t\tvalueElem.SetInt(100)\n\t}\n\tfmt.Println("Modified value:", num) // 100\n}\n'})}),"\n",(0,i.jsx)(e.h2,{id:"4-\u53cd\u5c04\u5904\u7406\u7ed3\u6784\u4f53",children:"4. \u53cd\u5c04\u5904\u7406\u7ed3\u6784\u4f53"}),"\n",(0,i.jsx)(e.h3,{id:"41-\u83b7\u53d6\u7ed3\u6784\u4f53\u5b57\u6bb5\u4fe1\u606f",children:"4.1 \u83b7\u53d6\u7ed3\u6784\u4f53\u5b57\u6bb5\u4fe1\u606f"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-go",children:'package main\n\nimport (\n\t"fmt"\n\t"reflect"\n)\n\ntype Person struct {\n\tName string\n\tAge  int\n}\n\nfunc main() {\n\tp := Person{Name: "Alice", Age: 30}\n\ttypeInfo := reflect.TypeOf(p)\n\t// NumField returns the number of fields in the struct.\n\t// It panics if the type of v is not a struct.\n\tfor i := 0; i < typeInfo.NumField(); i++ {\n\t\tfield := typeInfo.Field(i)\n\t\tfmt.Printf("Field Name: %s, Type: %s\\n", field.Name, field.Type)\n\t}\n}\n'})}),"\n",(0,i.jsx)(e.h3,{id:"42-\u89e3\u6790\u7ed3\u6784\u4f53\u6807\u7b7etag",children:"4.2 \u89e3\u6790\u7ed3\u6784\u4f53\u6807\u7b7e\uff08Tag\uff09"}),"\n",(0,i.jsx)(e.p,{children:"\u7ed3\u6784\u4f53\u5b57\u6bb5\u53ef\u4ee5\u5e26\u6709\u6807\u7b7e\uff0c\u7528\u4e8e\u5143\u6570\u636e\u5b58\u50a8\uff0c\u5982 JSON\u3001\u6570\u636e\u5e93\u6620\u5c04\u7b49\u3002"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-go",children:'package main\n\nimport (\n\t"fmt"\n\t"reflect"\n)\n\ntype User struct {\n\tID   int    `json:"id" yaml:"id"`\n\tName string `json:"name"`\n}\n\nfunc main() {\n\ttypeInfo := reflect.TypeOf(User{})\n\tfor i := 0; i < typeInfo.NumField(); i++ {\n\t\tfield := typeInfo.Field(i)\n\t\t// \u6253\u5370\u5b57\u6bb5\u6807\u7b7e\n\t\tfmt.Printf("Field Tag: %s\\n", field.Tag)\n\t\ttag := field.Tag.Get("json")\n\t\tfmt.Printf("Field: %s, JSON Tag: %s\\n", field.Name, tag)\n\t}\n}\n'})}),"\n",(0,i.jsx)(e.h2,{id:"5-\u53cd\u5c04\u8c03\u7528\u65b9\u6cd5",children:"5. \u53cd\u5c04\u8c03\u7528\u65b9\u6cd5"}),"\n",(0,i.jsx)(e.p,{children:"\u6709\u53c2\u6570\u8c03\u7528"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-go",children:'package main\n\nimport (\n\t"fmt"\n\t"reflect"\n)\n\ntype Calculator struct{}\n\nfunc (c Calculator) Add(a, b int) int {\n\treturn a + b\n}\n\nfunc main() {\n\tcalc := Calculator{}\n\tmethod := reflect.ValueOf(calc).MethodByName("Add")\n\targs := []reflect.Value{reflect.ValueOf(10), reflect.ValueOf(20)}\n\tresult := method.Call(args)\n\n\tfmt.Println("Result:", result[0].Int()) // 30\n}\n'})}),"\n",(0,i.jsx)(e.p,{children:"\u65e0\u53c2\u6570\u8c03\u7528"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-go",children:'package main\n\nimport (\n\t"fmt"\n\t"reflect"\n)\n\ntype User struct {\n\tName string\n}\n\nfunc (u User) SayHello() {\n\tfmt.Println("Hello,", u.Name)\n}\n\nfunc main() {\n\tu := User{Name: "Alice"}\n\tv := reflect.ValueOf(u)\n\tmethod := v.MethodByName("SayHello")\n\tmethod.Call(nil) // \u8f93\u51fa: Hello, Alice\n}\n'})}),"\n",(0,i.jsx)(e.h2,{id:"6-\u53cd\u5c04\u7684\u5c40\u9650\u6027",children:"6. \u53cd\u5c04\u7684\u5c40\u9650\u6027"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:"\u4ee3\u7801\u53ef\u8bfb\u6027\u964d\u4f4e\uff0c\u8c03\u8bd5\u96be\u5ea6\u589e\u5927"}),"\n",(0,i.jsx)(e.li,{children:"\u6027\u80fd\u635f\u8017\uff0c\u76f8\u6bd4\u666e\u901a\u65b9\u6cd5\u8c03\u7528\u616210\u500d\u4ee5\u4e0a"}),"\n"]}),"\n",(0,i.jsx)(e.h2,{id:"7-\u53cd\u5c04\u6700\u4f73\u5b9e\u8df5",children:"7. \u53cd\u5c04\u6700\u4f73\u5b9e\u8df5"}),"\n",(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:"\u53ea\u6709\u5728\u52a8\u6001\u9700\u6c42\u65f6\u4f7f\u7528\u53cd\u5c04\uff0c\u907f\u514d\u6ee5\u7528"}),"\n",(0,i.jsxs)(e.li,{children:["\u4f7f\u7528 ",(0,i.jsx)(e.code,{children:"interface{}"})," \u548c ",(0,i.jsx)(e.code,{children:"switch"})," \u8bed\u53e5\u4f5c\u4e3a\u53cd\u5c04\u7684\u66ff\u4ee3\u65b9\u6848"]}),"\n",(0,i.jsxs)(e.li,{children:["\u7ed3\u5408 ",(0,i.jsx)(e.code,{children:"json"}),"\u3001",(0,i.jsx)(e.code,{children:"protobuf"})," \u7b49\u5e93\u65f6\uff0c\u5408\u7406\u5229\u7528 ",(0,i.jsx)(e.code,{children:"reflect"})," \u63d0\u53d6\u5b57\u6bb5\u4fe1\u606f"]}),"\n"]})]})}function f(n={}){const{wrapper:e}={...(0,r.R)(),...n.components};return e?(0,i.jsx)(e,{...n,children:(0,i.jsx)(o,{...n})}):o(n)}},8453:(n,e,t)=>{t.d(e,{R:()=>c,x:()=>s});var l=t(6540);const i={},r=l.createContext(i);function c(n){const e=l.useContext(r);return l.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function s(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(i):n.components||i:c(n.components),l.createElement(r.Provider,{value:e},n.children)}}}]);