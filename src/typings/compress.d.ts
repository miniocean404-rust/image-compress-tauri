export interface ImageCompreessInfo {
  name: string
  state: CompressState
  origin: string
  compress: string
  rate: number
}

enum CompressState {
  Ready,
  Compressing,
  Done,
}
