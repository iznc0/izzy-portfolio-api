const getNowPlaying = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token

  const nowPlayingResponse = await fetch(
    'https://api.spotify.com/v1/me/player/currently-playing',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (nowPlayingResponse.status === 204) {
    return { isPlaying: false }
  }

  const nowPlayingData = await nowPlayingResponse.json()

  if (!nowPlayingData || !nowPlayingData.item) {
    return { isPlaying: false }
  }

  return {
    isPlaying: nowPlayingData.is_playing,
    title: nowPlayingData.item.name,
    artist: nowPlayingData.item.artists.map(a => a.name).join(', '),
    album: nowPlayingData.item.album.name,
    albumArt: nowPlayingData.item.album.images[0]?.url,
    songUrl: nowPlayingData.item.external_urls.spotify,
  }
}

const getRecentlyPlayed = async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token

  const recentResponse = await fetch(
    'https://api.spotify.com/v1/me/player/recently-played?limit=1',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const recentData = await recentResponse.json()
  const track = recentData.items[0]?.track

  if (!track) return { isPlaying: false }

  return {
    isPlaying: false,
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    album: track.album.name,
    albumArt: track.album.images[0]?.url,
    songUrl: track.external_urls.spotify,
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')

  try {
    let data = await getNowPlaying()

    if (!data.isPlaying) {
      data = await getRecentlyPlayed()
    }

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Spotify data' })
  }
}
