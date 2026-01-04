import { getCurrentWindow } from "@tauri-apps/api/window";

// 窗口置顶
function handleWindowTop() {
  let curWin = getCurrentWindow();
  curWin.setAlwaysOnTop(true);
}
