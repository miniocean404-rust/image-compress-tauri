export interface ImageCompreessInfo {
  name: string
  state: CompressState
  origin: number
  compress: number
  rate: number
}

export enum CompressState {
  Ready,
  Compressing,
  Done,
}
