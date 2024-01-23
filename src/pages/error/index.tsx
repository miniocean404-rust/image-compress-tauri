import { isRouteErrorResponse, useAsyncError, useRouteError } from "react-router-dom"

function ErrorPage() {
  const error = useRouteError()
  const async_error = useAsyncError()

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>路由错误响应!</h1>
        <h2>{error.status}</h2>
        <p>{error.statusText}</p>
        {error.data?.message && <p>{error.data.message}</p>}
      </div>
    )
  } else if (error) {
    return <div>错误原因：{error instanceof Error ? error.message : "未知错误"}</div>
  } else {
    return <div>Await组件 异步错误 {async_error instanceof Error ? async_error.message : "未知错误"}</div>
  }
}
export default ErrorPage
