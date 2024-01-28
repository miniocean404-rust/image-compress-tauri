import { Suspense } from "react"
import { createRoot } from "react-dom/client"

import { RouterProvider } from "react-router-dom"
import router from "@/router"

import "./css/base/base.scss"

const root = document.getElementById("root")!

createRoot(root).render(
  <Suspense fallback={<div>Loading...</div>}>
    <RouterProvider router={router} />
  </Suspense>,
)
