import { type NextRequest, NextResponse } from "next/server"
import { analyzeImageWithAI, encodeImageFromBuffer } from "@/lib/encode-image"

export async function POST(request: NextRequest) {
  try {
    console.log("Analysis API called...")

    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      console.log("No image provided in request")
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    console.log("Image file received, size:", imageFile.size, "type:", imageFile.type)

    // Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log("Converting image to base64...")
    // Encode image to base64
    const base64Image = encodeImageFromBuffer(buffer)
    console.log("Base64 encoding complete, length:", base64Image.length)

    console.log("Starting AI analysis...")
    // Get AI analysis stream
    const stream = await analyzeImageWithAI(base64Image)

    // Create a readable stream for the response
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          console.log("Processing AI stream...")
          for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.content) {
              const content = chunk.choices[0].delta.content
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
          console.log("Stream processing complete")
        } catch (error) {
          console.error("Stream processing error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Analysis API error:", error)

    let errorMessage = "Analysis failed"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    )
  }
}
