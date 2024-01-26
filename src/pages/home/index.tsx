import styles from "./index.module.scss";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import { emit, listen } from "@tauri-apps/api/event";
import { readText } from "@tauri-apps/api/clipboard";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/api/notification";
import { WebviewWindow, appWindow } from "@tauri-apps/api/window";

function Home() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    listen("tauri://file-drop", async (event) => {
      // 读取目录
      // const entries = await readDir(event.payload[0], { dir: BaseDirectory.AppData, recursive: true });

      await invoke("get_drag_files", { files: event.payload });
    });
  };

  const handleGlobalEvent = async () => {
    const unlisten = await listen("click", (event) => {
      console.log(event);
    });

    emit("click", {
      theMessage: "Tauri is awesome!",
    });
  };

  const handleWindowEvent = () => {
    appWindow.emit("event", { message: "Tauri is awesome!" });

    const webview = new WebviewWindow("window");
    webview.emit("event");
  };

  const handleSendNotification = async () => {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }

    if (permissionGranted) {
      sendNotification({ title: "TAURI", body: "Tauri is awesome!", icon: "" });
    }
  };

  async function readClipboard() {
    const clipboardText = await readText();
    console.log(clipboardText);
  }

  return (
    <div className={styles.box} style={{backgroundColor:"red"}}>
      {" "}
      <form
        className='row'
        onSubmit={(e) => {
          e.preventDefault();
          readClipboard();
        }}
      >
        <input id='greet-input' onChange={(e) => setName(e.currentTarget.value)} placeholder='Enter a name...' />
        <button type='submit'>Greet</button>
      </form>
      <p>{greetMsg}</p>
      <button onClick={handleSendNotification}>发送通知</button>
      <button onClick={handleGlobalEvent}>全局事件</button>
      <button onClick={handleWindowEvent}>特定于窗口的事件</button>
    </div>
  );
}
export default Home;
