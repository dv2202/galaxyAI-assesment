import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_NODES = [
  {
    id: "request-inputs-1",
    type: "request-inputs",
    position: { x: 50, y: 150 },
    data: {
      fields: [
        {
          id: "text_field_1",
          name: "text_field",
          type: "text_field",
          value:
            "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.",
        },
        {
          id: "image_field_1",
          name: "image_field",
          type: "image_field",
          value: "",
        },
      ],
    },
  },
  {
    id: "crop-image-1",
    type: "crop-image",
    position: { x: 400, y: 50 },
    data: {
      xPosition: 20,
      yPosition: 20,
      width: 60,
      height: 60,
    },
  },
  {
    id: "crop-image-2",
    type: "crop-image",
    position: { x: 400, y: 300 },
    data: {
      xPosition: 0,
      yPosition: 0,
      width: 100,
      height: 50,
    },
  },
  {
    id: "gemini-1",
    type: "gemini",
    position: { x: 400, y: 550 },
    data: {
      model: "gemini-2.5-pro",
      prompt: "",
      systemPrompt:
        "You are a marketing copywriter. Write a one-paragraph product description.",
    },
  },
  {
    id: "gemini-2",
    type: "gemini",
    position: { x: 750, y: 550 },
    data: {
      model: "gemini-2.5-pro",
      prompt: "",
      systemPrompt:
        "Condense the following product description into a tweet-length hook (under 240 characters).",
    },
  },
  {
    id: "gemini-3",
    type: "gemini",
    position: { x: 1050, y: 250 },
    data: {
      model: "gemini-2.5-pro",
      prompt: "",
      systemPrompt:
        "You are a social media manager. Combine the tweet hook and the two product crops into a final marketing post.",
    },
  },
  {
    id: "response-1",
    type: "response",
    position: { x: 1400, y: 250 },
    data: { result: undefined },
  },
];

const SAMPLE_EDGES = [
  {
    id: "edge-ri-text-gemini1",
    source: "request-inputs-1",
    target: "gemini-1",
    sourceHandle: "text_field_1-text-out",
    targetHandle: "gemini-1-prompt-text-in",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
  {
    id: "edge-ri-img-crop1",
    source: "request-inputs-1",
    target: "crop-image-1",
    sourceHandle: "image_field_1-image-out",
    targetHandle: "crop-image-1-inputImage-image-in",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
  {
    id: "edge-ri-img-crop2",
    source: "request-inputs-1",
    target: "crop-image-2",
    sourceHandle: "image_field_1-image-out",
    targetHandle: "crop-image-2-inputImage-image-in",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
  {
    id: "edge-gemini1-gemini2",
    source: "gemini-1",
    target: "gemini-2",
    sourceHandle: "gemini-1-response-text-out",
    targetHandle: "gemini-2-prompt-text-in",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
  {
    id: "edge-crop1-gemini3",
    source: "crop-image-1",
    target: "gemini-3",
    sourceHandle: "crop-image-1-outputImage-image-out",
    targetHandle: "gemini-3-image-image-in",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
  {
    id: "edge-crop2-gemini3",
    source: "crop-image-2",
    target: "gemini-3",
    sourceHandle: "crop-image-2-outputImage-image-out",
    targetHandle: "gemini-3-image-image-in",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
  {
    id: "edge-gemini2-gemini3",
    source: "gemini-2",
    target: "gemini-3",
    sourceHandle: "gemini-2-response-text-out",
    targetHandle: "gemini-3-prompt-text-in",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
  {
    id: "edge-gemini3-response",
    source: "gemini-3",
    target: "response-1",
    sourceHandle: "gemini-3-response-text-out",
    targetHandle: "response-1-result-text-in",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
];

async function main() {
  // Create sample workflow for a demo user
  // This will be created when the first user signs in via the dashboard
  console.log("Seeding sample workflow data...");

  // Upsert a sample workflow (without userId — will need to be claimed)
  const existing = await prisma.workflow.findFirst({
    where: { name: "Marketing Campaign Generator" },
  });

  if (!existing) {
    await prisma.workflow.create({
      data: {
        userId: "sample",
        name: "Marketing Campaign Generator",
        nodes: SAMPLE_NODES,
        edges: SAMPLE_EDGES,
      },
    });
    console.log("Sample workflow created.");
  } else {
    console.log("Sample workflow already exists.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
