const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const output = execSync(
    `git log --name-only --pretty=format: --diff-filter=AM docs | grep .md  | uniq | head -n 25`
).toString();

const recentDocs = output
    .split("\n")
    .filter(Boolean)
    .filter((file) => fs.existsSync(file)) // ✅ 跳过不存在的文件
    .map((file) => {
        const content = fs.readFileSync(file, "utf-8");
        const title =
            content
                .split('\n')
                .find((line) => line.trim().startsWith('# '))  // 找第一个 # 开头的标题
                ?.replace(/^# /, '') || path.basename(file);        return {
            path: file.replace(/^docs\//, "").replace(/\.mdx?$/, ""),
            title,
        };
    });

fs.writeFileSync(
    path.join(__dirname, "../src/data/recentDocs.json"),
    JSON.stringify(recentDocs, null, 2)
);

console.log("✅ 最近文档生成完成：", recentDocs);