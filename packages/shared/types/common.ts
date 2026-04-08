/**
 * types/common.ts
 * ----------------------------------------------------------------
 * Generic shared types used across plugins.
 */

/** Frame in API request format. */
export interface ApiFrame {
  id: string
  name: string
  imageBase64: string
}

/** Image exported from the Figma main thread. */
export interface ExportedImage {
  nodeId: string
  name: string
  bytes: Uint8Array
}

/** Information about the current selection in Figma. */
export interface SelectionInfo {
  count: number
  items: Array<{ id: string; name: string; type: string }>
  pageName: string
}
