import Anthropic from '@anthropic-ai/sdk'
import { getSystemPrompt, buildAgentPrompt } from '~/lib/prompts'
import type { AgentResponse, Command } from '~/types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.anthropicApiKey) {
    throw createError({
      statusCode: 500,
      message: 'ANTHROPIC_API_KEY not configured',
    })
  }

  const body = await readBody<{
    sceneState: string
    goal: string
    history: Command[]
  }>(event)

  if (!body.goal) {
    throw createError({
      statusCode: 400,
      message: 'Goal is required',
    })
  }

  const client = new Anthropic({
    apiKey: config.anthropicApiKey,
  })

  const systemPrompt = getSystemPrompt()
  const userPrompt = buildAgentPrompt(body.sceneState, body.goal, body.history || [])

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    // Extract text content
    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Parse JSON response
    let response: AgentResponse

    try {
      // Clean up the response - remove markdown code blocks if present
      let jsonStr = textContent.text.trim()
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7)
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3)
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3)
      }
      jsonStr = jsonStr.trim()

      response = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', textContent.text)
      throw new Error('Invalid JSON response from Claude')
    }

    // Validate response structure
    if (!response.thought || !response.command || !response.command.action) {
      throw new Error('Invalid response structure from Claude')
    }

    return response
  } catch (error: any) {
    console.error('Claude API error:', error)
    throw createError({
      statusCode: 500,
      message: `Claude API Error: ${error.message || 'Unknown error'} - ${error.status || ''} ${error.error?.message || ''}`.trim(),
    })
  }
})
