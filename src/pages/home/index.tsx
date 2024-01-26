import styles from "./index.module.scss";
import { useRef, useState } from "react";
import { useUnmount, useMount } from "ahooks";

import { invoke } from "@tauri-apps/api/tauri";
import { UnlistenFn } from "@tauri-apps/api/event";

import { appWindow } from "@tauri-apps/api/window";

function Home() {
  let unlistenRef = useRef<UnlistenFn | null>();
  const [isHover, setIsHover] = useState<boolean>(false);
  const [list, setList] = useState([{ name: "", state: "", origin: 32, compress: 16, rate: 0.5, action: "" }]);

  useMount(async () => {
    // 或者监听拖拽结束事件  listen("tauri://file-drop", () => {});
    unlistenRef.current = await appWindow.onFileDropEvent(async (event) => {
      switch (event.payload.type) {
        case "hover":
          setIsHover(true);
          break;
        case "cancel":
          setIsHover(false);
          break;
        case "drop":
          setIsHover(false);
          // 读取目录
          // const entries = await readDir(event.payload[0], { dir: BaseDirectory.AppData, recursive: true });
          await invoke("get_drag_files", { files: event.payload.paths });
          break;
      }
    });
  });

  useUnmount(() => {
    unlistenRef.current && unlistenRef.current();
  });

  return (
    <div className={styles.box} style={{ backgroundColor: isHover ? "red" : "" }}>
      <header className={styles.header}>
        <span>名称</span>
        <span>状态</span>
        <span>原始大小</span>
        <span>压缩后大小</span>
        <span>压缩率</span>
        <span>操作</span>
      </header>

      {list.map((info) => {
        return (
          <div className={styles.list}>
            <span>{info.name}</span>
            <span>{info.state}</span>
            <span>{info.origin}</span>
            <span>{info.compress}</span>
            <span>{info.rate}</span>
            <span>{info.action}</span>
          </div>
        );
      })}
    </div>
  );
}
export default Home;
