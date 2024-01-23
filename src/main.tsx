import React, { Suspense } from "react";
import ReactDOM, { createRoot } from "react-dom/client";

import { RouterProvider } from "react-router-dom";
import router from "@/router";

import "./css/base/base.scss";

import { invoke } from "@tauri-apps/api/tauri";

// DOM 内容加载完成之后，通过 invoke 调用 在 Rust 中已经注册的命令
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(async () => await invoke("close_splashscreen"), 1000);
});

const root = document.getElementById("root")!;

createRoot(root).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>,
);
