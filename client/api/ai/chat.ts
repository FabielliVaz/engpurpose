// import { GoogleGenerativeAI } from '@google/generative-ai'

const systemInstruction = `You are an English tutor focused on helping Brazilian learners improve practical communication.

IMPORTANT RULES:
1. Always answer in English by default.
2. Use markdown formatting when useful.
3. Be clear, patient, and concise.
4. Focus on vocabulary, grammar, pronunciation, and natural phrasing.
5. Use practical day-to-day examples.
6. Correct mistakes gently and explain why.
7. Keep responses short but complete.

ALWAYS END YOUR RESPONSE WITH:
💡 **Study tip:** [one practical exercise the student can do right now]`

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const buildFallbackResponse = (
  input: string,
  reason: 'rate_limit' | 'unavailable' | 'missing_key',
  mode: 'chat' | 'translate'
) => {
  const normalized = input.trim()
  const lower = normalized.toLowerCase()

  if (mode === 'translate') {
    return [
      '**Translation mode fallback**',
      reason === 'missing_key'
        ? 'The external translator is not configured in this environment.'
        : 'The external translator is temporarily unavailable, so I could not translate this block automatically.',
      '',
      '**Original block:**',
      normalized,
      '',
      '💡 **Study tip:** translate one sentence by yourself first, then compare it with an automated translation later.',
    ].join('\n')
  }

  const introByReason = {
    rate_limit: 'The advanced tutor is temporarily overloaded, so I answered in contingency mode.',
    unavailable: 'The AI provider is temporarily unavailable, so I answered in contingency mode.',
    missing_key: 'The external AI integration is not configured in this environment, so I answered in contingency mode.',
  }

  let explanation = `You asked: **${normalized}**\n\n`

  if (lower.includes('difference between') || lower.includes('diferença') || lower.includes('qual a diferença')) {
    explanation += [
      'To compare two English words or structures, use this approach:',
      '1. Identify the main meaning of each one.',
      '2. Check the context where each option appears.',
      '3. Write one short sentence with each term.',
      '4. Compare the tone: formal, informal, frequent, or specific.',
      '',
      '**Study example:**',
      '- Word A: use it for a broader meaning.',
      '- Word B: use it for a more specific context.',
    ].join('\n')
  } else if (lower.includes('pronunciation') || lower.includes('pronúncia') || lower.includes('how do i say')) {
    explanation += [
      'To practice pronunciation in English:',
      '1. Break the word into parts.',
      '2. Identify the stressed syllable.',
      '3. Say it slowly first, then at normal speed.',
      '4. Record yourself and compare with a reference.',
      '',
      '**Practical strategy:**',
      '- repeat the word 5 times in isolation',
      '- use the word in 3 simple sentences',
      '- pay attention to rhythm, not only to individual sounds',
    ].join('\n')
  } else if (lower.includes('sentence') || lower.includes('frase') || lower.includes('example')) {
    explanation += [
      'Here is a simple pattern you can study:',
      '',
      '**Structure:** subject + verb + complement',
      '',
      '**Simple example:**',
      '- *I use this word at work.*',
      '- *She used it in a conversation yesterday.*',
      '- *They are using it correctly now.*',
      '',
      'Change the verb or context and create 3 new sentences of your own.',
    ].join('\n')
  } else {
    explanation += [
      'I can still help you in contingency mode with this method:',
      '1. Identify the key word, expression, or rule.',
      '2. Understand the meaning clearly.',
      '3. Look at one short example in English.',
      '4. Rewrite the example using your own routine or context.',
      '',
      '**Study checklist:**',
      '- meaning',
      '- use in context',
      '- common mistake',
      '- correct version',
    ].join('\n')
  }

  return [
    '**Tutor in contingency mode**',
    introByReason[reason],
    '',
    explanation,
    '',
    '💡 **Study tip:** write 3 sentences with what you learned and read them aloud to reinforce the structure.',
  ].join('\n')
}

const buildUserPrompt = (input: string, mode: 'chat' | 'translate') => {
  if (mode === 'translate') {
    return `Translate the following markdown block into Brazilian Portuguese. Preserve the markdown structure and keep the translation natural.\n\n${input}`
  }

  return input
}

const createGroqRequest = async (input: string, apiKey: string, mode: 'chat' | 'translate') => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      temperature: mode === 'translate' ? 0.2 : 0.4,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: buildUserPrompt(input, mode) },
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    const error = new Error(errorBody || 'Groq request failed') as Error & { status?: number }
    error.status = response.status
    throw error
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content as string | undefined
}

const generateWithRetry = async (input: string, apiKey: string, mode: 'chat' | 'translate') => {
  const delays = [0, 500, 1500]
  let lastError: any = null

  for (const delay of delays) {
    if (delay > 0) {
      await sleep(delay)
    }

    try {
      const content = await createGroqRequest(input, apiKey, mode)
      if (!content) {
        throw new Error('Groq returned an empty response')
      }
      return content
    } catch (error: any) {
      lastError = error
      const status = typeof error?.status === 'number' ? error.status : 500

      if (status !== 429 && status < 500) {
        break
      }
    }
  }

  throw lastError
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { input, userId, mode = 'chat' } = req.body ?? {}

  if (!input || !userId) {
    return res.status(400).json({ error: 'Input and userId are required.' })
  }

  const prompt = String(input).trim()
  if (!prompt) {
    return res.status(400).json({ error: 'Input and userId are required.' })
  }

  const requestMode = mode === 'translate' ? 'translate' : 'chat'
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return res.status(200).json({
      response: buildFallbackResponse(prompt, 'missing_key', requestMode),
      fallback: true,
      providerStatus: 'missing_key',
      message: 'Fallback tutor used because external AI is not configured.',
    })
  }

  try {
    const responseText = await generateWithRetry(prompt, apiKey, requestMode)

    return res.status(200).json({
      response: responseText,
      fallback: false,
      providerStatus: 'ok',
      message: 'External AI response generated successfully.',
    })
  } catch (error: any) {
    const status = typeof error?.status === 'number' ? error.status : 500
    const reason = status === 429 ? 'rate_limit' : 'unavailable'

    console.error('Erro no Tutor IA. Fallback ativado.', {
      provider: 'groq',
      status,
      message: error?.message,
      mode: requestMode,
    })

    return res.status(200).json({
      response: buildFallbackResponse(prompt, reason, requestMode),
      fallback: true,
      providerStatus: reason,
      message: 'Fallback tutor used because external AI was unavailable.',
    })
  }
}

/*
Fallback rápido para Gemini, caso precisemos voltar:

import { GoogleGenerativeAI } from '@google/generative-ai'

const createGeminiModel = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction,
  })
}

const generateWithGemini = async (input: string, apiKey: string) => {
  const model = createGeminiModel(apiKey)
  const result = await model.generateContent(input)
  return result.response.text()
}
*/
