// Claude API client placeholder
// Full configuration will be added in a later task

import Anthropic from '@anthropic-ai/sdk'

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
