import { Router } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDatabase } from '../db/config.js';
import { sql } from 'drizzle-orm';

const router: Router = Router();

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Envia uma pergunta para o Tutor de Inglês
 *     description: Processa a dúvida e retorna a explicação formatada em Markdown.
 *     tags: [AI Tutor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               input:
 *                 type: string
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Resposta da IA gerada com sucesso.
 *       403:
 *         description: Limite diário de perguntas esgotado.
 *       429:
 *         description: Erro de cota (Too Many Requests).
 */
router.post('/chat', async (req, res) => {
    const { input, userId } = req.body;

    if (!input || !userId) {
        return res.status(400).json({ error: 'Input and userId are required.' });
    }

    try {
        const db = await getDatabase();

        const usageResult: any = await db.execute(sql`
            SELECT request_count FROM ai_usage 
            WHERE user_id = ${userId} AND usage_date = CURRENT_DATE
        `);

        const currentCount = usageResult[0]?.request_count || 0;

        if (currentCount >= 5) {
            return res.status(403).json({
                error: 'Daily limit reached',
                message: 'Você atingiu o limite de 5 mensagens diárias.'
            });
        }

        const model = getGeminiModel();
        const result = await model.generateContent(input);
        const responseText = result.response.text();

        await db.execute(sql`
            INSERT INTO ai_usage (user_id, usage_date, request_count) 
            VALUES (${userId}, CURRENT_DATE, 1) 
            ON DUPLICATE KEY UPDATE request_count = request_count + 1
        `);

        res.json({ response: responseText });

    } catch (err: any) {
        console.error("❌ Erro no Tutor IA:", err);

        if (err.status === 429) {
            return res.status(429).json({ error: 'Cota do Google excedida. Tente novamente em breve.' });
        }

        res.status(500).json({ error: 'Erro interno ao processar sua pergunta.' });
    }
});

/**
 * @swagger
 * /api/ai/limit/{userId}:
 *   get:
 *     summary: Verifica o limite restante
 *     description: Retorna a quantidade de perguntas que o usuário ainda pode fazer hoje.
 *     tags: [AI Tutor]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Limite recuperado com sucesso.
 */
router.get('/limit/:userId', async (req, res) => {
    const { userId } = req.params;
    const userIdNum = parseInt(userId, 10);

    if (isNaN(userIdNum)) {
        return res.status(400).json({ error: 'Invalid userId.' });
    }

    try {
        const db = await getDatabase();
        const result: any = await db.execute(sql`
            SELECT request_count FROM ai_usage 
            WHERE user_id = ${userIdNum} AND usage_date = CURRENT_DATE
        `);
        const count = result[0]?.request_count || 0;
        res.json({ remaining: Math.max(0, 5 - count) });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar limite' });
    }
});

const getGeminiModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key não encontrada!");
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        systemInstruction: `Você é um Tutor de Inglês especialista...` // Sua regra de markdown aqui
    });
};

export default router;