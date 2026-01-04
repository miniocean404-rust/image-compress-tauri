import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

try {
  const update = await check();

  if (update) {
    // You could show a dialog asking the user if they want to install the update here.
    console.log(`安装更新 ${update.version}, ${update.date}, ${update.body}`);

    let downloaded = 0;
    let contentLength = 0;

    // Install the update with progress callback
    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case "Started":
          contentLength = event.data.contentLength ?? 0;
          console.log("更新事件", "开始下载", `总大小: ${contentLength} bytes`);
          break;
        case "Progress":
          downloaded += event.data.chunkLength;
          console.log("更新事件", "下载中", `${downloaded} / ${contentLength}`);
          break;
        case "Finished":
          console.log("更新事件", "下载完成");
          break;
      }
    });

    console.log("更新已安装");

    // On macOS and Linux you will need to restart the app manually.
    // You could use this step to display another confirmation dialog.
    await relaunch();
  }
} catch (error) {
  console.error("更新错误", error);
}
