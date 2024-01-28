import { RouteObject, createBrowserRouter } from "react-router-dom"
import { lazy } from "react"

import App from "../App"
import NotFound from "@/pages/404"
import ErrorPage from "@/pages/error"

const Compress = lazy(() => import("@/pages/compress/index"))
import Splash from "@/pages/splash/index"
import Demo from "@/pages/demo/index"

type BrowserRouterType = ReturnType<typeof createBrowserRouter>

const routes: RouteObject[] = [
  {
    id: "root",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      // 子路由需要在其父路由的页面中添加 <Outlet />
      {
        path: "/",
        element: <Compress />,
      },
      {
        path: "/demo",
        element: <Demo />,
      },
      {
        path: "/splash",
        element: <Splash />,
      },
    ],
  },
  // 404找不到
  { path: "*", element: <NotFound /> },
]

// 也可以使用 useRoutes
const router: BrowserRouterType = createBrowserRouter(routes, { basename: "/" })

export default router
