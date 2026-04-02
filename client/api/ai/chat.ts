import { GoogleGenerativeAI } from '@google/generative-ai'

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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { input, userId } = req.body ?? {}

  if (!input || !userId) {
    return res.status(400).json({ error: 'Input and userId are required.' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'A variável GEMINI_API_KEY não está configurada no Vercel.',
    })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction,
    })

    const result = await model.generateContent(String(input))
    const responseText = result.response.text()

    return res.status(200).json({
      response: responseText,
      mock: true,
      message: 'Running without database-backed usage tracking.',
    })
  } catch (error: any) {
    const status = typeof error?.status === 'number' ? error.status : 500

    if (status === 429) {
      return res.status(429).json({
        error: 'Cota do Google excedida. Tente novamente em breve.',
      })
    }

    console.error('Erro no Tutor IA:', error)
    return res.status(500).json({
      error: 'Erro interno ao processar sua pergunta.',
    })
  }
}
