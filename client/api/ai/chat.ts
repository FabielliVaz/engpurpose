// import { GoogleGenerativeAI } from '@google/generative-ai'

const systemInstruction = `Você é um Tutor de Inglês especialista, focado em ajudar estudantes brasileiros a aprenderem inglês de forma prática e envolvente.

REGRAS IMPORTANTES:
1. Sempre responda em português brasileiro.
2. Use markdown para formatar suas respostas.
3. Seja claro, paciente e objetivo.
4. Foque em vocabulário, gramática e pronúncia prática.
5. Use exemplos do dia a dia quando útil.
6. Corrija erros gentilmente e explique o porquê.
7. Mantenha respostas concisas, mas completas.

SEMPRE TERMINE SUAS RESPOSTAS COM:
💡 **Dica de estudo:** [uma dica prática para praticar o que foi ensinado]`

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const buildFallbackResponse = (input: string, reason: 'rate_limit' | 'unavailable' | 'missing_key') => {
  const normalized = input.trim()
  const lower = normalized.toLowerCase()

  const introByReason = {
    rate_limit: 'O tutor avançado está temporariamente sobrecarregado, então respondi com o modo de contingência.',
    unavailable: 'O provedor de IA está indisponível no momento, então respondi com o modo de contingência.',
    missing_key: 'A integração externa não está configurada neste ambiente, então respondi com o modo de contingência.',
  }

  let explanation = `Você perguntou: **${normalized}**\n\n`

  if (lower.includes('difference between') || lower.includes('diferença') || lower.includes('qual a diferença')) {
    explanation += [
      'Para comparar duas palavras ou estruturas em inglês, use este roteiro:',
      '1. Veja o significado principal de cada uma.',
      '2. Observe o contexto em que cada opção aparece.',
      '3. Monte uma frase curta com cada termo.',
      '4. Compare o tom: formal, informal, frequente ou específico.',
      '',
      '**Exemplo de estudo:**',
      '- Palavra A: use quando quiser falar de sentido mais geral.',
      '- Palavra B: use quando quiser um contexto mais específico.',
    ].join('\n')
  } else if (lower.includes('pronunciation') || lower.includes('pronúncia') || lower.includes('how do i say')) {
    explanation += [
      'Para praticar pronúncia em inglês:',
      '1. Separe a palavra em partes.',
      '2. Descubra qual sílaba recebe mais força.',
      '3. Fale devagar primeiro, depois em velocidade normal.',
      '4. Grave sua voz e compare com uma referência.',
      '',
      '**Estratégia prática:**',
      '- repita a palavra 5 vezes isolada',
      '- use a palavra em 3 frases simples',
      '- preste atenção ao ritmo, não só aos sons individuais',
    ].join('\n')
  } else if (lower.includes('sentence') || lower.includes('frase') || lower.includes('example')) {
    explanation += [
      'Aqui vai um modelo para estudar a estrutura:',
      '',
      '**Estrutura:** sujeito + verbo + complemento',
      '',
      '**Exemplo simples:**',
      '- *I use this word at work.*',
      '- *She used it in a conversation yesterday.*',
      '- *They are using it correctly now.*',
      '',
      'Troque o verbo ou o contexto e crie 3 novas frases suas.',
    ].join('\n')
  } else {
    explanation += [
      'Posso te ajudar mesmo no modo de contingência com este método:',
      '1. Identifique a palavra, expressão ou regra principal.',
      '2. Entenda o significado em português.',
      '3. Veja uma frase curta em inglês.',
      '4. Reescreva a frase com informação da sua rotina.',
      '',
      '**Exemplo de aplicação:**',
      '- significado',
      '- uso em contexto',
      '- erro comum',
      '- versão correta',
    ].join('\n')
  }

  return [
    '**Tutor em modo de contingência**',
    introByReason[reason],
    '',
    explanation,
    '',
    '💡 **Dica de estudo:** escreva 3 frases com o que você aprendeu e leia em voz alta para fixar a estrutura.',
  ].join('\n')
}

const createGroqRequest = async (input: string, apiKey: string) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: input },
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

const generateWithRetry = async (input: string, apiKey: string) => {
  const delays = [0, 500, 1500]
  let lastError: any = null

  for (const delay of delays) {
    if (delay > 0) {
      await sleep(delay)
    }

    try {
      const content = await createGroqRequest(input, apiKey)
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

  const { input, userId } = req.body ?? {}

  if (!input || !userId) {
    return res.status(400).json({ error: 'Input and userId are required.' })
  }

  const prompt = String(input).trim()
  if (!prompt) {
    return res.status(400).json({ error: 'Input and userId are required.' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(200).json({
      response: buildFallbackResponse(prompt, 'missing_key'),
      fallback: true,
      providerStatus: 'missing_key',
      message: 'Fallback tutor used because external AI is not configured.',
    })
  }

  try {
    const responseText = await generateWithRetry(prompt, apiKey)

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
    })

    return res.status(200).json({
      response: buildFallbackResponse(prompt, reason),
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
