export interface SimpleDebugSocketModel {
  status: () => void
  reconnect: () => void
}

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    debugSocket?: SimpleDebugSocketModel
  }
}
