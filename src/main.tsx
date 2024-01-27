import React, { Suspense } from "react"
import ReactDOM, { createRoot } from "react-dom/client"

import { RouterProvider } from "react-router-dom"
import router from "@/router"

import "./css/base/base.scss"

const root = document.getElementById("root")!

createRoot(root).render(
  <React.StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>,
)
