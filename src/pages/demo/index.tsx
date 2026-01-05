import { emit, listen } from "@tauri-apps/api/event";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";

function Home() {
  const handleGlobalEvent = async () => {
    const unlisten = await listen("click", (event) => {
      console.log(event);
    });

    emit("click", {
      theMessage: "Tauri is awesome!",
    });
  };

  const handleWindowEvent = () => {
    const appWindow = getCurrentWindow();
    appWindow.emit("event", { message: "Tauri is awesome!" });

    const webview = new WebviewWindow("window");
    webview.emit("event");
  };

  const handleSendNotification = async () => {
    let permissionGranted = await isPermissionGranted();

    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
      return;
    }

    await sendNotification({ title: "TAURI", body: "Tauri is awesome!" });
  };

  async function readClipboard() {
    const clipboardText = await readText();
    console.log(clipboardText);
  }

  return (
    <div className="w-full h-full bg-[var(--color-bg-demo)]">
      <button onClick={readClipboard}>读取剪贴板</button>
      <button onClick={handleSendNotification}>发送通知</button>
      <button onClick={handleGlobalEvent}>全局事件</button>
      <button onClick={handleWindowEvent}>特定于窗口的事件</button>
    </div>
  );
}
export default Home;
