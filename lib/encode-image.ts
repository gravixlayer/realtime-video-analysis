import { OpenAI } from "openai"

export function encodeImageFromBuffer(imageBuffer: Buffer): string {
  return imageBuffer.toString("base64")
}

export async function analyzeImageWithAI(
  base64Image: string,
  prompt = "Analyze this image in detail. Describe what you see, including objects, people, activities, colors, and any notable features. STRICTLY LIMIT THE ANSWER TO ONE LINE.",
) {
  if (!process.env.GRAVIXLAYER_API_KEY) {
    throw new Error("GRAVIXLAYER_API_KEY environment variable is not set")
  }

  const client = new OpenAI({
    baseURL: "https://api.gravixlayer.com/v1/inference",
    apiKey: process.env.GRAVIXLAYER_API_KEY,
    dangerouslyAllowBrowser: true,
  })

  console.log("Making AI API call to GravixLayer...")

  try {
    const possibleModels = [
      "qwen/qwen-2.5-vl-7b-instruct"
    ]

    let lastError: any = null

    for (const model of possibleModels) {
      try {
        console.log(`Trying model: ${model}`)

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

        console.log(`AI API call successful with model: ${model}`)
        return stream
      } catch (error) {
        console.log(`Model ${model} failed:`, error)
        lastError = error
        continue
      }
    }

    throw lastError || new Error("All models failed")
  } catch (error) {
    console.error("AI API call failed:", error)
    throw error
  }
}
