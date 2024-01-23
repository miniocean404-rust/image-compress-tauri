import { window } from "@tauri-apps/api";

// 窗口置顶
function handleWindowTop() {
  let curWin = window.getCurrent();
  curWin.setAlwaysOnTop(true);
}
