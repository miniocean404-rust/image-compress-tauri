export interface ImageCompreessInfo {
  name: string
  id: string

  state: CompressState
  origin: number
  compress: number
  rate: number

  path: string
  mem: number[]
  type: string
}

export enum CompressState {
  Compressing = "compressing",
  Done = "done",
}
