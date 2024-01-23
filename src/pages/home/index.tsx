import styles from "./index.module.scss";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import { listen } from "@tauri-apps/api/event";
import { BaseDirectory, readDir } from "@tauri-apps/api/fs";
import { readText } from "@tauri-apps/api/clipboard";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/api/notification";

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

  const sendMessage = async () => {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }

    if (permissionGranted) {
      sendNotification({ title: "TAURI", body: "Tauri is awesome!", icon: "" });
    }
  };

  async function greet() {
    const clipboardText = await readText();
    console.log(clipboardText);

    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className={styles.box}>
      {" "}
      <form
        className='row'
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input id='greet-input' onChange={(e) => setName(e.currentTarget.value)} placeholder='Enter a name...' />
        <button type='submit'>Greet</button>
      </form>
      <p>{greetMsg}</p>
      <button onClick={sendMessage}>发送通知</button>
    </div>
  );
}
export default Home;
