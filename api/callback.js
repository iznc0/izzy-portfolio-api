export default function handler(req, res) {
  const { code } = req.query

  if (!code) {
    return res.status(400).send('No authorization code provided')
  }

  res.status(200).send(`
    <html>
      <body>
        <h1>Authorization successful</h1>
        <p>Your authorization code is:</p>
        <code style="word-break: break-all; font-size: 14px;">${code}</code>
        <p>You can close this window.</p>
      </body>
    </html>
  `)
}
