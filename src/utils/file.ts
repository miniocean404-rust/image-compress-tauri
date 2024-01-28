export function formartFileSize(bytes: number) {
  if (bytes === 0) return "0 B"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

export const downloadUrl = (url: string, filename: string) => {
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
}
