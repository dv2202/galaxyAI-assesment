export const NODE_TYPES = {
  REQUEST_INPUTS: "request-inputs",
  CROP_IMAGE: "crop-image",
  GEMINI: "gemini",
  RESPONSE: "response",
  STICKY_NOTE: "sticky-note",
} as const;

export const HANDLE_TYPES = {
  IMAGE: "image",
  TEXT: "text",
} as const;

export type HandleType = (typeof HANDLE_TYPES)[keyof typeof HANDLE_TYPES];
export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

export const NON_DELETABLE_NODES: string[] = [
  NODE_TYPES.REQUEST_INPUTS,
  NODE_TYPES.RESPONSE,
];

export const LINKEDIN_URL = "https://www.linkedin.com/in/devansh-v";
