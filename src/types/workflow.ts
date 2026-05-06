import type { Node, Edge } from "@xyflow/react";
import type { HandleType } from "@/lib/constants";

export interface FieldDefinition {
  id: string;
  name: string;
  type: "text_field" | "image_field";
  value?: string;
}

export interface RequestInputsData {
  fields: FieldDefinition[];
  [key: string]: unknown;
}

export interface CropImageData {
  inputImage?: string;
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  outputImage?: string;
  [key: string]: unknown;
}

export interface GeminiData {
  model: string;
  prompt?: string;
  systemPrompt?: string;
  imageInputs?: string[];
  imageInputCount?: number;
  temperature?: number;
  maxTokens?: number;
  response?: string;
  [key: string]: unknown;
}

export interface ResponseData {
  result?: string;
  [key: string]: unknown;
}

export type WorkflowNode = Node<
  RequestInputsData | CropImageData | GeminiData | ResponseData
>;
export type WorkflowEdge = Edge;

export interface HandleDefinition {
  id: string;
  label: string;
  type: HandleType;
  direction: "input" | "output";
}

export interface SerializedWorkflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport?: { x: number; y: number; zoom: number };
}
