export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const userId = Number(req.query?.userId)
  if (!Number.isFinite(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid userId.' })
  }

  return res.status(200).json({
    remaining: 999,
    mock: true,
    message: 'Running in mock mode without persistent usage limits.',
  })
}
