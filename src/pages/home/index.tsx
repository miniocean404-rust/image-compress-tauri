import styles from "./index.module.scss";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import { listen } from "@tauri-apps/api/event";

function Home() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    listen("tauri://file-drop", async (event) => {
      console.log(event);
    });
  }, []);

  async function greet() {
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
    </div>
  );
}
export default Home;
