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

// Cap the exclusion list to avoid token bloat; DB skipDuplicates handles the rest
const MAX_EXISTING_WORDS_IN_PROMPT = 100

function buildPrompt(categoryName: string, existingWords: string[]): string {
  const wordSample =
    existingWords.length > MAX_EXISTING_WORDS_IN_PROMPT
      ? existingWords.slice(-MAX_EXISTING_WORDS_IN_PROMPT)
      : existingWords

  return `You are a vocabulary expert. Generate exactly 20 advanced/professional vocabulary words for the category: "${categoryName}".

${wordSample.length > 0 ? `Do NOT include any of these words that have already been generated: ${wordSample.join(", ")}` : ""}

For each word, provide:
1. The word itself
2. A clear, concise definition (1-2 sentences)
3. Phonetic pronunciation (e.g., /prəˌnʌnsiˈeɪʃən/)
4. An example usage in a realistic sentence or short paragraph (1-3 sentences)

Return ONLY a valid JSON array with exactly 20 objects, each having keys: "word", "definition", "pronunciation", "exampleUsage". No markdown, no extra text.`
}

function parseResponse(text: string): GeneratedWord[] {
  const parsed = JSON.parse(text)
  if (!Array.isArray(parsed) || parsed.length !== 20) {
    throw new Error(`Expected 20 words, got ${Array.isArray(parsed) ? parsed.length : "non-array"}`)
  }
  for (const item of parsed) {
    if (!item.word || !item.definition || !item.pronunciation || !item.exampleUsage) {
      throw new Error("Word object missing required fields")
    }
  }
  return parsed as GeneratedWord[]
}

export async function generateWords(
  categoryName: string,
  existingWords: string[]
): Promise<GeneratedWord[]> {
  const prompt = buildPrompt(categoryName, existingWords)

  const attempt = async () => {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
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
