"use strict";(self.webpackChunkweidongkl_github_io=self.webpackChunkweidongkl_github_io||[]).push([[5818],{6064:(n,e,s)=>{s.r(e),s.d(e,{assets:()=>o,contentTitle:()=>l,default:()=>h,frontMatter:()=>d,metadata:()=>t,toc:()=>c});const t=JSON.parse('{"id":"note/golang/json","title":"Golang JSON \u89e3\u6790","description":"1. Golang \u9ed8\u8ba4 JSON \u89e3\u6790 (encoding/json)","source":"@site/docs/note/golang/json.md","sourceDirName":"note/golang","slug":"/note/golang/json","permalink":"/docs/note/golang/json","draft":false,"unlisted":false,"editUrl":"https://github.com/weidongkl/weidongkl.github.io/tree/master/docs/note/golang/json.md","tags":[],"version":"current","frontMatter":{},"sidebar":"note","previous":{"title":"goland \u95ee\u9898\u5904\u7406\u8bb0\u5f55","permalink":"/docs/note/golang/goland"},"next":{"title":"kingpin \u7528\u6cd5","permalink":"/docs/note/golang/kingpin"}}');var r=s(4848),i=s(8453);const d={},l="Golang JSON \u89e3\u6790",o={},c=[{value:"1. Golang \u9ed8\u8ba4 JSON \u89e3\u6790 (<code>encoding/json</code>)",id:"1-golang-\u9ed8\u8ba4-json-\u89e3\u6790-encodingjson",level:2},{value:"2. \u7b2c\u4e09\u65b9 JSON \u89e3\u6790\u5e93",id:"2-\u7b2c\u4e09\u65b9-json-\u89e3\u6790\u5e93",level:2},{value:"<strong>2.1 <code>github.com/tidwall/gjson</code>\uff08\u9ad8\u6548 JSON \u8bfb\u53d6\uff09</strong>",id:"21-githubcomtidwallgjson\u9ad8\u6548-json-\u8bfb\u53d6",level:3},{value:"<strong>\u4f18\u7f3a\u70b9\u5bf9\u6bd4</strong>",id:"\u4f18\u7f3a\u70b9\u5bf9\u6bd4",level:3},{value:"<strong>2.2 <code>github.com/json-iterator/go</code>\uff08\u9ad8\u6027\u80fd JSON \u89e3\u6790\uff09</strong>",id:"22-githubcomjson-iteratorgo\u9ad8\u6027\u80fd-json-\u89e3\u6790",level:3},{value:"<strong>\u4f18\u7f3a\u70b9\u5bf9\u6bd4</strong>",id:"\u4f18\u7f3a\u70b9\u5bf9\u6bd4-1",level:3},{value:"<strong>2.3 <code>github.com/buger/jsonparser</code>\uff08\u6d41\u5f0f JSON \u89e3\u6790\uff09</strong>",id:"23-githubcombugerjsonparser\u6d41\u5f0f-json-\u89e3\u6790",level:3},{value:"<strong>\u4f18\u7f3a\u70b9\u5bf9\u6bd4</strong>",id:"\u4f18\u7f3a\u70b9\u5bf9\u6bd4-2",level:3},{value:"3. JSON \u89e3\u6790\u5e93\u5bf9\u6bd4",id:"3-json-\u89e3\u6790\u5e93\u5bf9\u6bd4",level:2},{value:"<strong>\u603b\u7ed3\u4e0e\u63a8\u8350</strong>",id:"\u603b\u7ed3\u4e0e\u63a8\u8350",level:2}];function j(n){const e={code:"code",h1:"h1",h2:"h2",h3:"h3",header:"header",hr:"hr",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,i.R)(),...n.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(e.header,{children:(0,r.jsx)(e.h1,{id:"golang-json-\u89e3\u6790",children:"Golang JSON \u89e3\u6790"})}),"\n",(0,r.jsxs)(e.h2,{id:"1-golang-\u9ed8\u8ba4-json-\u89e3\u6790-encodingjson",children:["1. Golang \u9ed8\u8ba4 JSON \u89e3\u6790 (",(0,r.jsx)(e.code,{children:"encoding/json"}),")"]}),"\n",(0,r.jsxs)(e.p,{children:["Golang \u6807\u51c6\u5e93\u63d0\u4f9b ",(0,r.jsx)(e.code,{children:"encoding/json"})," \u5305\uff0c\u53ef\u7528\u4e8e\u89e3\u6790\u548c\u751f\u6210 JSON \u6570\u636e\u3002"]}),"\n",(0,r.jsx)(e.p,{children:(0,r.jsxs)(e.strong,{children:["\u793a\u4f8b\uff1a\u89e3\u6790 JSON \u5230 ",(0,r.jsx)(e.code,{children:"map[string]interface{}"})]})}),"\n",(0,r.jsx)(e.pre,{children:(0,r.jsx)(e.code,{className:"language-go",children:'package main\n\nimport (\n\t"encoding/json"\n\t"fmt"\n)\n\nfunc main() {\n\tjsonData := `{"name": "Alice", "age": 25}`\n\tvar result map[string]interface{}\n\terr := json.Unmarshal([]byte(jsonData), &result)\n\tif err != nil {\n\t\tfmt.Println("Error:", err)\n\t\treturn\n\t}\n\tfmt.Println("Name:", result["name"].(string))\n\tfmt.Println("Age:", result["age"].(float64))\n}\n'})}),"\n",(0,r.jsx)(e.p,{children:(0,r.jsx)(e.strong,{children:"\u4f18\u7f3a\u70b9\u5bf9\u6bd4"})}),"\n",(0,r.jsxs)(e.table,{children:[(0,r.jsx)(e.thead,{children:(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.th,{children:"\u4f18\u70b9"}),(0,r.jsx)(e.th,{children:"\u7f3a\u70b9"})]})}),(0,r.jsxs)(e.tbody,{children:[(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:"\u5b98\u65b9\u5e93\uff0c\u7a33\u5b9a\u53ef\u9760"}),(0,r.jsx)(e.td,{children:"\u9700\u8981\u624b\u52a8\u7c7b\u578b\u65ad\u8a00"})]}),(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:"\u65e0\u9700\u989d\u5916\u4f9d\u8d56"}),(0,r.jsx)(e.td,{children:"\u6027\u80fd\u76f8\u5bf9\u8f83\u4f4e"})]}),(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:"\u9002\u7528\u4e8e\u7b80\u5355 JSON \u89e3\u6790"}),(0,r.jsx)(e.td,{children:"\u89e3\u6790\u5927 JSON \u7ed3\u6784\u65f6\u6027\u80fd\u4e0d\u8db3"})]})]})]}),"\n",(0,r.jsx)(e.hr,{}),"\n",(0,r.jsx)(e.h2,{id:"2-\u7b2c\u4e09\u65b9-json-\u89e3\u6790\u5e93",children:"2. \u7b2c\u4e09\u65b9 JSON \u89e3\u6790\u5e93"}),"\n",(0,r.jsx)(e.h3,{id:"21-githubcomtidwallgjson\u9ad8\u6548-json-\u8bfb\u53d6",children:(0,r.jsxs)(e.strong,{children:["2.1 ",(0,r.jsx)(e.code,{children:"github.com/tidwall/gjson"}),"\uff08\u9ad8\u6548 JSON \u8bfb\u53d6\uff09"]})}),"\n",(0,r.jsx)(e.p,{children:(0,r.jsx)(e.strong,{children:"\u5b89\u88c5\uff1a"})}),"\n",(0,r.jsx)(e.pre,{children:(0,r.jsx)(e.code,{className:"language-sh",children:"go get github.com/tidwall/gjson\n"})}),"\n",(0,r.jsx)(e.p,{children:(0,r.jsx)(e.strong,{children:"\u793a\u4f8b\uff1a"})}),"\n",(0,r.jsx)(e.pre,{children:(0,r.jsx)(e.code,{className:"language-go",children:'package main\n\nimport (\n\t"fmt"\n\t"github.com/tidwall/gjson"\n)\n\nfunc main() {\n\tjsonData := `{"name": "Alice", "age": 25}`\n\tif !gjson.Valid(jsonData) {\n\t\tfmt.Println("Invalid JSON data")\n\t\treturn\n\t}\n\tif gjson.Get(jsonData, "name").Exists() {\n\t\tfmt.Println("Name field exists")\n\t} else {\n\t\tfmt.Println("Name field does not exist")\n\t}\n\tname := gjson.Get(jsonData, "name")\n\tage := gjson.Get(jsonData, "age").Int()\n\tfmt.Println("Name:", name.String())\n\tfmt.Println("Age:", age)\n}\n'})}),"\n",(0,r.jsx)(e.h3,{id:"\u4f18\u7f3a\u70b9\u5bf9\u6bd4",children:(0,r.jsx)(e.strong,{children:"\u4f18\u7f3a\u70b9\u5bf9\u6bd4"})}),"\n",(0,r.jsxs)(e.table,{children:[(0,r.jsx)(e.thead,{children:(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.th,{children:"\u4f18\u70b9"}),(0,r.jsx)(e.th,{children:"\u7f3a\u70b9"})]})}),(0,r.jsxs)(e.tbody,{children:[(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:"\u89e3\u6790\u901f\u5ea6\u5feb"}),(0,r.jsx)(e.td,{children:"\u4e0d\u80fd\u4fee\u6539 JSON"})]}),(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:"\u652f\u6301 JSONPath \u67e5\u8be2"}),(0,r.jsx)(e.td,{children:"\u9002\u7528\u4e8e\u53ea\u8bfb\u573a\u666f"})]}),(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:"\u4ee3\u7801\u7b80\u6d01"}),(0,r.jsx)(e.td,{children:"-"})]})]})]}),"\n",(0,r.jsx)(e.hr,{}),"\n",(0,r.jsx)(e.h3,{id:"22-githubcomjson-iteratorgo\u9ad8\u6027\u80fd-json-\u89e3\u6790",children:(0,r.jsxs)(e.strong,{children:["2.2 ",(0,r.jsx)(e.code,{children:"github.com/json-iterator/go"}),"\uff08\u9ad8\u6027\u80fd JSON \u89e3\u6790\uff09"]})}),"\n",(0,r.jsx)(e.p,{children:(0,r.jsx)(e.strong,{children:"\u5b89\u88c5\uff1a"})}),"\n",(0,r.jsx)(e.pre,{children:(0,r.jsx)(e.code,{className:"language-sh",children:"go get github.com/json-iterator/go\n"})}),"\n",(0,r.jsx)(e.p,{children:(0,r.jsx)(e.strong,{children:"\u793a\u4f8b\uff1a"})}),"\n",(0,r.jsx)(e.pre,{children:(0,r.jsx)(e.code,{className:"language-go",children:'package main\n\nimport (\n\t"fmt"\n\tjsoniter "github.com/json-iterator/go"\n)\n\nfunc main() {\n\tvar json = jsoniter.ConfigCompatibleWithStandardLibrary\n\tjsonData := `{"name": "Alice", "age": 25}`\n\tvar result map[string]interface{}\n\tjson.Unmarshal([]byte(jsonData), &result)\n\tfmt.Println("Name:", result["name"])\n\tfmt.Println("Age:", result["age"])\n}\n'})}),"\n",(0,r.jsx)(e.h3,{id:"\u4f18\u7f3a\u70b9\u5bf9\u6bd4-1",children:(0,r.jsx)(e.strong,{children:"\u4f18\u7f3a\u70b9\u5bf9\u6bd4"})}),"\n",(0,r.jsxs)(e.table,{children:[(0,r.jsx)(e.thead,{children:(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.th,{children:"\u4f18\u70b9"}),(0,r.jsx)(e.th,{children:"\u7f3a\u70b9"})]})}),(0,r.jsxs)(e.tbody,{children:[(0,r.jsxs)(e.tr,{children:[(0,r.jsxs)(e.td,{children:["\u517c\u5bb9 ",(0,r.jsx)(e.code,{children:"encoding/json"}),"\uff0c\u53ef\u76f4\u63a5\u66ff\u6362"]}),(0,r.jsxs)(e.td,{children:["\u89e3\u6790 JSON \u6570\u7ec4\u4e0d\u5982 ",(0,r.jsx)(e.code,{children:"gjson"})," \u7b80\u6d01"]})]}),(0,r.jsxs)(e.tr,{children:[(0,r.jsxs)(e.td,{children:["\u6027\u80fd\u6bd4 ",(0,r.jsx)(e.code,{children:"encoding/json"})," \u9ad8"]}),(0,r.jsx)(e.td,{children:"-"})]})]})]}),"\n",(0,r.jsx)(e.hr,{}),"\n",(0,r.jsx)(e.h3,{id:"23-githubcombugerjsonparser\u6d41\u5f0f-json-\u89e3\u6790",children:(0,r.jsxs)(e.strong,{children:["2.3 ",(0,r.jsx)(e.code,{children:"github.com/buger/jsonparser"}),"\uff08\u6d41\u5f0f JSON \u89e3\u6790\uff09"]})}),"\n",(0,r.jsx)(e.p,{children:(0,r.jsx)(e.strong,{children:"\u5b89\u88c5\uff1a"})}),"\n",(0,r.jsx)(e.pre,{children:(0,r.jsx)(e.code,{className:"language-sh",children:"go get github.com/buger/jsonparser\n"})}),"\n",(0,r.jsx)(e.p,{children:(0,r.jsx)(e.strong,{children:"\u793a\u4f8b\uff1a"})}),"\n",(0,r.jsx)(e.pre,{children:(0,r.jsx)(e.code,{className:"language-go",children:'package main\n\nimport (\n\t"fmt"\n\t"github.com/buger/jsonparser"\n)\n\nfunc main() {\n\tjsonData := []byte(`{"name": "Alice", "age": 25}`)\n\tname, _ := jsonparser.GetString(jsonData, "name")\n\tage, _ := jsonparser.GetInt(jsonData, "age")\n\tfmt.Println("Name:", name)\n\tfmt.Println("Age:", age)\n}\n'})}),"\n",(0,r.jsx)(e.h3,{id:"\u4f18\u7f3a\u70b9\u5bf9\u6bd4-2",children:(0,r.jsx)(e.strong,{children:"\u4f18\u7f3a\u70b9\u5bf9\u6bd4"})}),"\n",(0,r.jsxs)(e.table,{children:[(0,r.jsx)(e.thead,{children:(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.th,{children:"\u4f18\u70b9"}),(0,r.jsx)(e.th,{children:"\u7f3a\u70b9"})]})}),(0,r.jsxs)(e.tbody,{children:[(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:"\u9002\u7528\u4e8e\u5927 JSON \u6587\u4ef6\u89e3\u6790"}),(0,r.jsx)(e.td,{children:"\u4e0d\u80fd\u4fee\u6539 JSON"})]}),(0,r.jsxs)(e.tr,{children:[(0,r.jsxs)(e.td,{children:["\u76f4\u63a5\u64cd\u4f5c ",(0,r.jsx)(e.code,{children:"[]byte"}),"\uff0c\u6027\u80fd\u9ad8"]}),(0,r.jsxs)(e.td,{children:["\u4ee3\u7801\u8f83 ",(0,r.jsx)(e.code,{children:"gjson"})," \u590d\u6742"]})]})]})]}),"\n",(0,r.jsx)(e.hr,{}),"\n",(0,r.jsx)(e.h2,{id:"3-json-\u89e3\u6790\u5e93\u5bf9\u6bd4",children:"3. JSON \u89e3\u6790\u5e93\u5bf9\u6bd4"}),"\n",(0,r.jsxs)(e.table,{children:[(0,r.jsx)(e.thead,{children:(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.th,{children:"\u5e93"}),(0,r.jsx)(e.th,{children:"\u9002\u7528\u573a\u666f"}),(0,r.jsx)(e.th,{children:"\u4f18\u52bf"}),(0,r.jsx)(e.th,{children:"\u52a3\u52bf"})]})}),(0,r.jsxs)(e.tbody,{children:[(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:(0,r.jsx)(e.code,{children:"encoding/json"})}),(0,r.jsx)(e.td,{children:"\u666e\u901a JSON \u89e3\u6790"}),(0,r.jsx)(e.td,{children:"\u5b98\u65b9\u5e93\uff0c\u7a33\u5b9a"}),(0,r.jsx)(e.td,{children:"\u89e3\u6790\u901f\u5ea6\u8f83\u6162\uff0c\u9700\u8981\u7c7b\u578b\u65ad\u8a00"})]}),(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:(0,r.jsx)(e.code,{children:"gjson"})}),(0,r.jsx)(e.td,{children:"\u53ea\u8bfb JSON \u6570\u636e"}),(0,r.jsx)(e.td,{children:"\u8bed\u6cd5\u7b80\u6d01\uff0c\u6027\u80fd\u9ad8"}),(0,r.jsx)(e.td,{children:"\u4e0d\u80fd\u4fee\u6539 JSON"})]}),(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:(0,r.jsx)(e.code,{children:"json-iterator/go"})}),(0,r.jsx)(e.td,{children:"\u9ad8\u6027\u80fd JSON \u89e3\u6790"}),(0,r.jsx)(e.td,{children:"\u53ef\u76f4\u63a5\u66ff\u6362\u6807\u51c6\u5e93"}),(0,r.jsx)(e.td,{children:"\u89e3\u6790 JSON \u6570\u7ec4\u8f83\u7e41\u7410"})]}),(0,r.jsxs)(e.tr,{children:[(0,r.jsx)(e.td,{children:(0,r.jsx)(e.code,{children:"buger/jsonparser"})}),(0,r.jsx)(e.td,{children:"\u89e3\u6790\u5927 JSON"}),(0,r.jsxs)(e.td,{children:["\u76f4\u63a5\u64cd\u4f5c ",(0,r.jsx)(e.code,{children:"[]byte"}),"\uff0c\u6d41\u5f0f\u89e3\u6790"]}),(0,r.jsx)(e.td,{children:"\u4ee3\u7801\u8f83\u590d\u6742"})]})]})]}),"\n",(0,r.jsx)(e.hr,{}),"\n",(0,r.jsx)(e.h2,{id:"\u603b\u7ed3\u4e0e\u63a8\u8350",children:(0,r.jsx)(e.strong,{children:"\u603b\u7ed3\u4e0e\u63a8\u8350"})}),"\n",(0,r.jsxs)(e.ul,{children:["\n",(0,r.jsxs)(e.li,{children:[(0,r.jsx)(e.strong,{children:"\u53ea\u8bfb\u53d6 JSON \u6570\u636e"}),"\uff08\u4e0d\u4fee\u6539\uff09\uff1a\u2705 ",(0,r.jsx)(e.code,{children:"gjson"})]}),"\n",(0,r.jsxs)(e.li,{children:[(0,r.jsx)(e.strong,{children:"\u9700\u8981\u9ad8\u6027\u80fd JSON \u89e3\u6790"}),"\uff1a\u2705 ",(0,r.jsx)(e.code,{children:"json-iterator/go"})]}),"\n",(0,r.jsxs)(e.li,{children:[(0,r.jsx)(e.strong,{children:"\u89e3\u6790\u5927 JSON \u6587\u4ef6"}),"\uff08\u5982\u65e5\u5fd7\uff09\uff1a\u2705 ",(0,r.jsx)(e.code,{children:"buger/jsonparser"})]}),"\n",(0,r.jsxs)(e.li,{children:[(0,r.jsx)(e.strong,{children:"\u901a\u7528\u89e3\u6790\uff08\u517c\u5bb9\u6027\u597d\uff09"}),"\uff1a\u2705 ",(0,r.jsx)(e.code,{children:"encoding/json"})]}),"\n"]}),"\n",(0,r.jsx)(e.p,{children:"\u6839\u636e\u5177\u4f53\u9700\u6c42\u9009\u62e9\u5408\u9002\u7684\u5e93\uff0c\u4ee5\u63d0\u9ad8 JSON \u5904\u7406\u6548\u7387\u3002"})]})}function h(n={}){const{wrapper:e}={...(0,i.R)(),...n.components};return e?(0,r.jsx)(e,{...n,children:(0,r.jsx)(j,{...n})}):j(n)}},8453:(n,e,s)=>{s.d(e,{R:()=>d,x:()=>l});var t=s(6540);const r={},i=t.createContext(r);function d(n){const e=t.useContext(i);return t.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function l(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(r):n.components||r:d(n.components),t.createElement(i.Provider,{value:e},n.children)}}}]);