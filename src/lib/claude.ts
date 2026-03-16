import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export type GeneratedWord = {
  word: string
  definition: string
  pronunciation: string
  exampleUsage: string
}

function buildPrompt(categoryName: string, size: number = 20): string {
  return `You are a vocabulary expert. Generate exactly ${size} advanced/professional vocabulary words for the category: "${categoryName}". Your audience is somebody who wants to be professional in the ${categoryName} field.

For each word, provide:
1. The word itself
2. A clear, concise definition (1-2 sentences)
3. Phonetic pronunciation (e.g., /prəˌnʌnsiˈeɪʃən/)
4. An example usage in a realistic sentence or short paragraph (1-3 sentences)

Return ONLY a valid JSON array with exactly ${size} objects, each having keys: "word", "definition", "pronunciation", "exampleUsage". No markdown, no extra text.`
}

function parseResponse(text: string): GeneratedWord[] {
  let jsonText = text.trim()

  // If the JSON was truncated, try to salvage complete objects
  if (!jsonText.endsWith("]")) {
    const lastComplete = jsonText.lastIndexOf("}")
    if (lastComplete !== -1) {
      jsonText = jsonText.substring(0, lastComplete + 1) + "]"
    }
  }

  const parsed = JSON.parse(jsonText)
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(`Expected an array of words, got ${Array.isArray(parsed) ? "empty array" : "non-array"}`)
  }
  return parsed.filter(
    (item: Record<string, unknown>) => item.word && item.definition && item.pronunciation && item.exampleUsage
  ) as GeneratedWord[]
}

export async function generateWords(
  categoryName: string,
  size: number = 2,
): Promise<GeneratedWord[]> {
  const prompt = buildPrompt(categoryName, size)

  const attempt = async () => {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      messages: [{ role: "user", content: prompt }],
    })
    const text = response.content[0].type === "text" ? response.content[0].text : ""
    return parseResponse(text)
  }

  try {
    return await attempt()
  } catch {
    // Retry once on parse failure
    return await attempt()
  }
}
