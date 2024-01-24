// scripts/updater.mjs

import { getOctokit, context } from "@actions/github";
import fs from "fs";
import axios from "axios";

import updatelog from "./updatelog.mjs";

const token = process.env.GITHUB_TOKEN;

updater().catch(console.error);

async function updater() {
  console.log(token);
  if (!token) {
    console.log("GITHUB_TOKEN 是必须的");
    process.exit(1);
  }

  // 用户名，仓库名
  const options = { owner: context.repo.owner, repo: context.repo.repo };
  // 获取 Github 客户端 可以方便地发起对 GitHub API 的请求，执行诸如创建仓库、添加评论、发布版本等操作。这样可以避免直接操作原始的 HTTP 请求，从而简化和加速与 GitHub API 的集成开发
  const github = getOctokit(token);

  // 使用客户端的 Rest Api 获取 tag 列表
  // 获取 tag
  const { data: tags } = await github.rest.repos.listTags({
    ...options,
    per_page: 10, // 获取返回的数量
    page: 1,
  });

  // 过滤包含 `v` 版本信息的 tag
  const tag = tags.find((t) => t.name.startsWith("v"));
  // console.log(`${JSON.stringify(tag, null, 2)}`);

  if (!tag) return;

  // 获取此 tag 的详细信息
  const { data: latestRelease } = await github.rest.repos.getReleaseByTag({
    ...options,
    tag: tag.name,
  });

  // 需要生成的静态 json 文件数据，根据自己的需要进行调整
  let updateData = {
    version: tag.name,
    // 使用 UPDATE_LOG.md，如果不需要版本更新日志，则将此字段置空
    // notes: updatelog(tag.name),
    pub_date: new Date().toISOString(),
    platforms: {
      win64: { signature: "", url: "" }, // compatible with older formats
      linux: { signature: "", url: "" }, // compatible with older formats
      darwin: { signature: "", url: "" }, // compatible with older formats
      "darwin-aarch64": { signature: "", url: "" },
      "darwin-x86_64": { signature: "", url: "" },
      "linux-x86_64": { signature: "", url: "" },
      "windows-x86_64": { signature: "", url: "" },
      // 'windows-i686': { signature: '', url: '' }, // no supported
    },
  };

  await Promise.allSettled(
    latestRelease.assets.map(async (asset) => {
      // windows
      updateData = await setAsset(asset, /.msi.zip/, ["win64", "windows-x86_64"], updateData);

      // darwin
      updateData = await setAsset(asset, /.app.tar.gz/, ["darwin", "darwin-x86_64", "darwin-aarch64"]);

      // linux
      updateData = await setAsset(asset, /.AppImage.tar.gz/, ["linux", "linux-x86_64"]);
    }),
  );

  if (!fs.existsSync("updater")) fs.mkdirSync("updater");
  fs.writeFileSync("./updater/install.json", JSON.stringify(updateData, null, 2));

  console.log("生成 updater/install.json");
}

async function setAsset(asset, reg, platforms, updateData) {
  let sig = "";
  if (/.sig$/.test(asset.name)) sig = await getSignature(asset.browser_download_url);

  platforms.forEach((platform) => {
    if (reg.test(asset.name)) {
      // 设置平台签名，检测应用更新需要验证签名
      if (sig) return (updateData.platforms[platform].signature = sig);

      // 设置下载链接
      updateData.platforms[platform].url = asset.browser_download_url;
    }
  });
}

// 获取签名内容
async function getSignature(url) {
  try {
    const res = await axios.get(url, { headers: { "Content-Type": "application/octet-stream" }, responseType: "text" });
    return res.data;
  } catch (_) {
    return "";
  }
}
