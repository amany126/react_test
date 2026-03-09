const express = require('express')
const cors = require('cors')
const crypto = require('crypto')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

const users = [
  { id: 1, username: 'admin', password: '1234', displayName: '관리자' },
  { id: 2, username: 'user', password: '1234', displayName: '일반사용자' },
]

const sessions = new Map()

const posts = [
  {
    id: 1,
    title: '첫 번째 공지 글',
    content: '로그인 없이 상세 조회가 가능한 게시글 예시입니다.',
    isAnonymous: false,
    authorName: '관리자',
    authorId: 1,
    createdAt: new Date().toISOString(),
  },
]

const comments = [
  {
    id: 1,
    postId: 1,
    parentCommentId: null,
    content: '첫 댓글입니다.',
    authorId: 2,
    authorName: '일반사용자',
    createdAt: new Date().toISOString(),
  },
]

let nextPostId = 2
let nextCommentId = 2

function createSession(user) {
  const token = crypto.randomUUID()
  sessions.set(token, {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
  })
  return token
}

function getSessionFromRequest(req) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim()
    return sessions.get(token)
  }

  const tokenFromHeader = req.headers['x-auth-token']
  if (typeof tokenFromHeader === 'string') {
    return sessions.get(tokenFromHeader)
  }

  return null
}

function requireAuth(req, res, next) {
  const session = getSessionFromRequest(req)

  if (!session) {
    return res.status(401).json({
      ok: false,
      message: '로그인이 필요합니다.',
    })
  }

  req.user = session
  return next()
}

function buildCommentTree(postId) {
  const postComments = comments
    .filter((comment) => comment.postId === postId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const byParent = new Map()

  for (const comment of postComments) {
    const parentKey = comment.parentCommentId ?? 'root'
    if (!byParent.has(parentKey)) {
      byParent.set(parentKey, [])
    }
    byParent.get(parentKey).push({ ...comment })
  }

  function attachChildren(parentId) {
    const key = parentId ?? 'root'
    const children = byParent.get(key) ?? []

    return children.map((child) => ({
      ...child,
      children: attachChildren(child.id),
    }))
  }

  return attachChildren(null)
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body ?? {}

  if (!username || !password) {
    return res.status(400).json({
      ok: false,
      message: '아이디와 비밀번호를 입력해주세요.',
    })
  }

  const user = users.find((item) => item.username === username && item.password === password)

  if (!user) {
    return res.status(401).json({
      ok: false,
      message: '로그인 정보가 올바르지 않습니다.',
    })
  }

  const token = createSession(user)

  return res.json({
    ok: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
  })
})

app.get('/api/auth/me', (req, res) => {
  const session = getSessionFromRequest(req)

  if (!session) {
    return res.status(401).json({
      ok: false,
      message: '인증 정보가 없습니다.',
    })
  }

  return res.json({
    ok: true,
    user: {
      id: session.userId,
      username: session.username,
      displayName: session.displayName,
    },
  })
})

app.post('/api/auth/logout', requireAuth, (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '').trim()
    : req.headers['x-auth-token']

  if (typeof token === 'string') {
    sessions.delete(token)
  }

  return res.json({ ok: true })
})

app.get('/api/boards/posts', (req, res) => {
  const items = [...posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((post) => ({
      ...post,
      commentCount: comments.filter((comment) => comment.postId === post.id).length,
    }))

  return res.json({ ok: true, posts: items })
})

app.get('/api/boards/posts/:id', (req, res) => {
  const postId = Number.parseInt(req.params.id, 10)
  const post = posts.find((item) => item.id === postId)

  if (!post) {
    return res.status(404).json({
      ok: false,
      message: '게시글을 찾을 수 없습니다.',
    })
  }

  return res.json({
    ok: true,
    post,
    comments: buildCommentTree(postId),
  })
})

app.post('/api/boards/posts', requireAuth, (req, res) => {
  const { title, content, isAnonymous } = req.body ?? {}

  if (!title || !content) {
    return res.status(400).json({
      ok: false,
      message: '제목과 내용을 입력해주세요.',
    })
  }

  const createdPost = {
    id: nextPostId,
    title: String(title).trim(),
    content: String(content).trim(),
    isAnonymous: Boolean(isAnonymous),
    authorName: isAnonymous ? '익명' : req.user.displayName,
    authorId: req.user.userId,
    createdAt: new Date().toISOString(),
  }

  nextPostId += 1
  posts.push(createdPost)

  return res.status(201).json({
    ok: true,
    post: createdPost,
  })
})

app.patch('/api/boards/posts/:id', requireAuth, (req, res) => {
  const postId = Number.parseInt(req.params.id, 10)
  const { title, content, isAnonymous } = req.body ?? {}
  const post = posts.find((item) => item.id === postId)

  if (!post) {
    return res.status(404).json({
      ok: false,
      message: '게시글을 찾을 수 없습니다.',
    })
  }

  if (post.authorId !== req.user.userId) {
    return res.status(403).json({
      ok: false,
      message: '본인 게시글만 수정할 수 있습니다.',
    })
  }

  if (!title || !String(title).trim() || !content || !String(content).trim()) {
    return res.status(400).json({
      ok: false,
      message: '제목과 내용을 입력해주세요.',
    })
  }

  post.title = String(title).trim()
  post.content = String(content).trim()
  post.isAnonymous = Boolean(isAnonymous)
  post.authorName = post.isAnonymous ? '익명' : req.user.displayName

  return res.json({
    ok: true,
    post,
  })
})

app.delete('/api/boards/posts/:id', requireAuth, (req, res) => {
  const postId = Number.parseInt(req.params.id, 10)
  const postIndex = posts.findIndex((item) => item.id === postId)

  if (postIndex < 0) {
    return res.status(404).json({
      ok: false,
      message: '게시글을 찾을 수 없습니다.',
    })
  }

  if (posts[postIndex].authorId !== req.user.userId) {
    return res.status(403).json({
      ok: false,
      message: '본인 게시글만 삭제할 수 있습니다.',
    })
  }

  posts.splice(postIndex, 1)

  for (let index = comments.length - 1; index >= 0; index -= 1) {
    if (comments[index].postId === postId) {
      comments.splice(index, 1)
    }
  }

  return res.json({ ok: true })
})

app.post('/api/boards/posts/:id/comments', requireAuth, (req, res) => {
  const postId = Number.parseInt(req.params.id, 10)
  const { content, parentCommentId, isAnonymous } = req.body ?? {}
  const postExists = posts.some((item) => item.id === postId)

  if (!postExists) {
    return res.status(404).json({
      ok: false,
      message: '게시글을 찾을 수 없습니다.',
    })
  }

  if (!content || !String(content).trim()) {
    return res.status(400).json({
      ok: false,
      message: '댓글 내용을 입력해주세요.',
    })
  }

  let normalizedParentCommentId = null

  if (parentCommentId !== null && parentCommentId !== undefined && parentCommentId !== '') {
    const parentId = Number.parseInt(parentCommentId, 10)
    const parent = comments.find((item) => item.id === parentId && item.postId === postId)

    if (!parent) {
      return res.status(400).json({
        ok: false,
        message: '부모 댓글을 찾을 수 없습니다.',
      })
    }

    normalizedParentCommentId = parent.id
  }

  const createdComment = {
    id: nextCommentId,
    postId,
    parentCommentId: normalizedParentCommentId,
    content: String(content).trim(),
    isAnonymous: Boolean(isAnonymous),
    authorId: req.user.userId,
    authorName: isAnonymous ? '익명' : req.user.displayName,
    createdAt: new Date().toISOString(),
  }

  nextCommentId += 1
  comments.push(createdComment)

  return res.status(201).json({
    ok: true,
    comment: createdComment,
    comments: buildCommentTree(postId),
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'backend',
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/weather', async (req, res) => {
  const latitude = Number.parseFloat(req.query.lat ?? '37.5665')
  const longitude = Number.parseFloat(req.query.lon ?? '126.978')
  const timezone = req.query.timezone ?? 'Asia/Seoul'

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid latitude or longitude value.',
    })
  }

  const apiUrl = new URL('https://api.open-meteo.com/v1/forecast')
  apiUrl.searchParams.set('latitude', String(latitude))
  apiUrl.searchParams.set('longitude', String(longitude))
  apiUrl.searchParams.set(
    'current',
    'temperature_2m,weather_code,wind_speed_10m,precipitation,pressure_msl',
  )
  apiUrl.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min')
  apiUrl.searchParams.set('timezone', timezone)
  apiUrl.searchParams.set('forecast_days', '7')

  try {
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`Open-Meteo error: HTTP ${response.status}`)
    }

    const data = await response.json()

    res.json({
      ok: true,
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
      },
      current: data.current,
      daily: data.daily,
    })
  } catch (error) {
    res.status(502).json({
      ok: false,
      message: 'Failed to fetch weather data from Open-Meteo.',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})