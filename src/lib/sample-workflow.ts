import { NODE_TYPES } from "@/lib/constants";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

export const SAMPLE_NODES: WorkflowNode[] = [
  {
    id: "request-inputs-node",
    type: NODE_TYPES.REQUEST_INPUTS,
    position: { x: 60, y: 180 },
    data: {
      fields: [
        {
          id: "text_field",
          name: "text_field",
          type: "text_field",
          value:
            "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.",
        },
        {
          id: "image_field",
          name: "image_field",
          type: "image_field",
          value: "",
        },
      ],
    },
    deletable: false,
  },
  {
    id: "crop-image-1",
    type: NODE_TYPES.CROP_IMAGE,
    position: { x: 580, y: 20 },
    data: {
      xPosition: 20,
      yPosition: 20,
      width: 60,
      height: 60,
    },
  },
  {
    id: "crop-image-2",
    type: NODE_TYPES.CROP_IMAGE,
    position: { x: 580, y: 360 },
    data: {
      xPosition: 0,
      yPosition: 0,
      width: 100,
      height: 50,
    },
  },
  {
    id: "gemini-1",
    type: NODE_TYPES.GEMINI,
    position: { x: 580, y: 680 },
    data: {
      model: "gemini-2.5-flash",
      prompt: "",
      systemPrompt:
        "You are a marketing copywriter. Write a one-paragraph product description.",
    },
  },
  {
    id: "gemini-2",
    type: NODE_TYPES.GEMINI,
    position: { x: 1080, y: 680 },
    data: {
      model: "gemini-2.5-flash",
      prompt: "",
      systemPrompt:
        "Condense the following product description into a tweet-length hook (under 240 characters).",
    },
  },
  {
    id: "gemini-final",
    type: NODE_TYPES.GEMINI,
    position: { x: 1400, y: 240 },
    data: {
      model: "gemini-2.5-flash",
      prompt: "",
      systemPrompt:
        "You are a social media manager. Combine the tweet hook and the two product crops into a final marketing post.",
      imageInputCount: 2,
    },
  },
  {
    id: "response-node",
    type: NODE_TYPES.RESPONSE,
    position: { x: 1900, y: 280 },
    data: {
      result: "",
    },
    deletable: false,
  },
];

export const SAMPLE_EDGES: WorkflowEdge[] = [
  {
    id: "e-ri-img-crop1",
    source: "request-inputs-node",
    sourceHandle: "image_field-image-out",
    target: "crop-image-1",
    targetHandle: "crop-image-1-inputImage-image-in",
  },
  {
    id: "e-ri-img-crop2",
    source: "request-inputs-node",
    sourceHandle: "image_field-image-out",
    target: "crop-image-2",
    targetHandle: "crop-image-2-inputImage-image-in",
  },
  {
    id: "e-ri-txt-g1",
    source: "request-inputs-node",
    sourceHandle: "text_field-text-out",
    target: "gemini-1",
    targetHandle: "gemini-1-prompt-text-in",
  },
  {
    id: "e-g1-g2",
    source: "gemini-1",
    sourceHandle: "gemini-1-response-text-out",
    target: "gemini-2",
    targetHandle: "gemini-2-prompt-text-in",
  },
  {
    id: "e-crop1-gfinal",
    source: "crop-image-1",
    sourceHandle: "crop-image-1-outputImage-image-out",
    target: "gemini-final",
    targetHandle: "gemini-final-image_0-image-in",
  },
  {
    id: "e-crop2-gfinal",
    source: "crop-image-2",
    sourceHandle: "crop-image-2-outputImage-image-out",
    target: "gemini-final",
    targetHandle: "gemini-final-image_1-image-in",
  },
  {
    id: "e-g2-gfinal",
    source: "gemini-2",
    sourceHandle: "gemini-2-response-text-out",
    target: "gemini-final",
    targetHandle: "gemini-final-prompt-text-in",
  },
  {
    id: "e-gfinal-resp",
    source: "gemini-final",
    sourceHandle: "gemini-final-response-text-out",
    target: "response-node",
    targetHandle: "response-node-result-text-in",
  },
];
