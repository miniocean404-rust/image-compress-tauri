// scripts/updatelog.mjs

import fs from "fs";
import path from "path";

const UPDATE_LOG = "UPDATE_LOG.md";

// 获取 UPDATE_LOG.md 的手写的版本日志
export default function updatelog(tag, type = "updater") {
  const file = path.join(process.cwd(), UPDATE_LOG);

  if (!fs.existsSync(file)) {
    console.log("不能找到文件 UPDATE_LOG.md");
    process.exit(1);
  }

  let _tag;
  const tagMap = {};
  const content = fs.readFileSync(file, { encoding: "utf8" }).split("\n");

  const reTag = /## v[\d\.]+/;

  content.forEach((line, index) => {
    if (reTag.test(line)) {
      _tag = line.slice(3).trim();

      if (!tagMap[_tag]) return (tagMap[_tag] = []);
    }

    if (_tag) tagMap[_tag].push(line);

    if (reTag.test(content[index + 1])) _tag = null;
  });

  if (!tagMap?.[tag]) {
    console.log(`${type === "release" ? "[UPDATE_LOG.md] " : ""}  Tag ${tag} 不存在`);
    process.exit(1);
  }

  return tagMap[tag].join("\n").trim() || "";
}
