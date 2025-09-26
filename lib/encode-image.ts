import { OpenAI } from "openai"

export function encodeImageFromBuffer(imageBuffer: Buffer): string {
  return imageBuffer.toString("base64")
}

export async function analyzeImageWithAI(
  base64Image: string,
  prompt = "Analyze this image in detail. Describe what you see, including objects, people, activities, colors, and any notable features.",
) {
  if (!process.env.GRAVIXLAYER_API_KEY) {
    throw new Error("GRAVIXLAYER_API_KEY environment variable is not set")
  }

  const client = new OpenAI({
    baseURL: "https://api.gravixlayer.com/v1/inference",
    apiKey: process.env.GRAVIXLAYER_API_KEY,
    dangerouslyAllowBrowser: true,
  })

  console.log("[v0] Making AI API call to GravixLayer...")

  try {
    const possibleModels = [
      "qwen/qwen-2.5-vl-7b-instruct",
      "qwen2-vl-7b-instruct",
      "qwen-vl-chat",
      "gpt-4-vision-preview",
    ]

    let lastError: any = null

    for (const model of possibleModels) {
      try {
        console.log(`[v0] Trying model: ${model}`)

        const stream = await client.chat.completions.create({
          model: model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          stream: true,
          max_tokens: 500,
          temperature: 0.7,
        })

        console.log(`[v0] AI API call successful with model: ${model}`)
        return stream
      } catch (error) {
        console.log(`[v0] Model ${model} failed:`, error)
        lastError = error
        continue
      }
    }

    throw lastError || new Error("All models failed")
  } catch (error) {
    console.error("[v0] AI API call failed:", error)
    throw error
  }
}
