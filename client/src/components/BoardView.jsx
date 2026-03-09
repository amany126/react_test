import { useCallback, useEffect, useState } from 'react'
import BoardPostCreatePanel from './BoardPostCreatePanel'
import BoardPostDetailPanel from './BoardPostDetailPanel'
import BoardPostListPanel from './BoardPostListPanel'

function BoardView({ language, authUser, authToken, onRequireLogin }) {
  const [posts, setPosts] = useState([])
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [screenMode, setScreenMode] = useState('list')
  const [selectedPost, setSelectedPost] = useState(null)
  const [comments, setComments] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editIsAnonymous, setEditIsAnonymous] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [newCommentContent, setNewCommentContent] = useState('')
  const [newCommentIsAnonymous, setNewCommentIsAnonymous] = useState(false)
  const [replyDraftById, setReplyDraftById] = useState({})
  const [replyAnonymousById, setReplyAnonymousById] = useState({})
  const [errorMessage, setErrorMessage] = useState('')

  const textByLanguage = {
    ko: {
      title: '게시판',
      listTitle: '게시글 목록',
      detailTitle: '상세보기',
      createTitle: '글 작성',
      postTitle: '제목',
      postContent: '내용',
      postAnonymous: '익명으로 작성',
      submitPost: '게시글 등록',
      editPost: '게시글 수정',
      savePost: '수정 저장',
      cancelEdit: '수정 취소',
      deletePost: '게시글 삭제',
      deleteConfirm: '이 게시글을 삭제하시겠습니까?',
      comments: '댓글',
      writeComment: '댓글 작성',
      submitComment: '댓글 등록',
      commentAnonymous: '익명으로 댓글 작성',
      replyAnonymous: '익명 답글',
      loginRequired: '로그인 후 게시글 작성과 댓글/대댓글 작성이 가능합니다.',
      toLogin: '로그인 페이지로 이동',
      goCreate: '작성하기',
      backToList: '목록으로',
      noPost: '게시글이 없습니다.',
      selectPost: '왼쪽 목록에서 게시글을 선택하세요.',
      anonymousAuthor: '익명',
      contentPlaceholder: '내용을 입력하세요.',
      commentPlaceholder: '댓글 내용을 입력하세요.',
      detailOpenInfo: '상세보기는 로그인 없이 가능합니다.',
      errorPrefix: '오류',
    },
    en: {
      title: 'Board',
      listTitle: 'Posts',
      detailTitle: 'Detail',
      createTitle: 'Create Post',
      postTitle: 'Title',
      postContent: 'Content',
      postAnonymous: 'Post anonymously',
      submitPost: 'Create Post',
      editPost: 'Edit Post',
      savePost: 'Save Changes',
      cancelEdit: 'Cancel',
      deletePost: 'Delete Post',
      deleteConfirm: 'Do you want to delete this post?',
      comments: 'Comments',
      writeComment: 'Write Comment',
      submitComment: 'Submit Comment',
      commentAnonymous: 'Comment anonymously',
      replyAnonymous: 'Anonymous reply',
      loginRequired: 'Login is required to write posts and comments/replies.',
      toLogin: 'Go to login',
      goCreate: 'Write Post',
      backToList: 'Back to list',
      noPost: 'No posts yet.',
      selectPost: 'Select a post from the list.',
      anonymousAuthor: 'Anonymous',
      contentPlaceholder: 'Enter content.',
      commentPlaceholder: 'Write your comment.',
      detailOpenInfo: 'Post detail is open without login.',
      errorPrefix: 'Error',
    },
  }

  const text = textByLanguage[language]

  const authHeaders = authToken
    ? {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    : {
        'Content-Type': 'application/json',
      }

  const fetchPosts = useCallback(async () => {
    const response = await fetch('/api/boards/posts')
    const data = await response.json()

    if (!response.ok || !data.ok) {
      throw new Error(data.message ?? 'Failed to load posts')
    }

    setPosts(data.posts)

    if (data.posts.length > 0) {
      const hasSelected = data.posts.some((item) => item.id === selectedPostId)
      if (!selectedPostId || !hasSelected) {
        setSelectedPostId(data.posts[0].id)
      }
    }

    if (data.posts.length === 0) {
      setSelectedPostId(null)
      setSelectedPost(null)
      setComments([])
    }
  }, [selectedPostId])

  const fetchPostDetail = useCallback(async (postId) => {
    const response = await fetch(`/api/boards/posts/${postId}`)
    const data = await response.json()

    if (!response.ok || !data.ok) {
      throw new Error(data.message ?? 'Failed to load post detail')
    }

    setSelectedPost(data.post)
    setComments(data.comments ?? [])
  }, [])

  useEffect(() => {
    const run = async () => {
      try {
        setErrorMessage('')
        await fetchPosts()
      } catch (error) {
        setErrorMessage(error.message)
      }
    }

    run()
  }, [fetchPosts])

  useEffect(() => {
    const run = async () => {
      if (!selectedPostId) {
        return
      }

      try {
        setErrorMessage('')
        await fetchPostDetail(selectedPostId)
      } catch (error) {
        setErrorMessage(error.message)
      }
    }

    run()
  }, [selectedPostId, fetchPostDetail])

  const handleCreatePost = async (event) => {
    event.preventDefault()

    if (!authUser) {
      onRequireLogin()
      return
    }

    try {
      setErrorMessage('')
      const response = await fetch('/api/boards/posts', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title,
          content,
          isAnonymous,
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? 'Failed to create post')
      }

      setTitle('')
      setContent('')
      setIsAnonymous(false)
      await fetchPosts()
      setSelectedPostId(data.post.id)
      setScreenMode('detail')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const handleStartEdit = () => {
    if (!selectedPost) {
      return
    }

    setEditTitle(selectedPost.title)
    setEditContent(selectedPost.content)
    setEditIsAnonymous(selectedPost.isAnonymous)
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
  }

  const handleUpdatePost = async (event) => {
    event.preventDefault()

    if (!authUser || !selectedPostId) {
      onRequireLogin()
      return
    }

    try {
      setErrorMessage('')
      const response = await fetch(`/api/boards/posts/${selectedPostId}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          isAnonymous: editIsAnonymous,
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? 'Failed to update post')
      }

      setIsEditMode(false)
      await fetchPosts()
      await fetchPostDetail(selectedPostId)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const handleDeletePost = async () => {
    if (!authUser || !selectedPostId) {
      onRequireLogin()
      return
    }

    if (!window.confirm(text.deleteConfirm)) {
      return
    }

    try {
      setErrorMessage('')
      const response = await fetch(`/api/boards/posts/${selectedPostId}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? 'Failed to delete post')
      }

      setIsEditMode(false)
      await fetchPosts()
      setScreenMode('list')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const isPostOwner = Boolean(authUser && selectedPost && authUser.id === selectedPost.authorId)

  const handleCreateComment = async (event) => {
    event.preventDefault()

    if (!authUser) {
      onRequireLogin()
      return
    }

    if (!selectedPostId) {
      return
    }

    try {
      setErrorMessage('')
      const response = await fetch(`/api/boards/posts/${selectedPostId}/comments`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          content: newCommentContent,
          isAnonymous: newCommentIsAnonymous,
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? 'Failed to create comment')
      }

      setNewCommentContent('')
      setNewCommentIsAnonymous(false)
      setComments(data.comments ?? [])
      await fetchPosts()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const handleCreateReply = async (parentCommentId) => {
    if (!authUser) {
      onRequireLogin()
      return
    }

    if (!selectedPostId) {
      return
    }

    const contentValue = replyDraftById[parentCommentId] ?? ''
    const isAnonymousValue = replyAnonymousById[parentCommentId] ?? false

    if (!contentValue.trim()) {
      return
    }

    try {
      setErrorMessage('')
      const response = await fetch(`/api/boards/posts/${selectedPostId}/comments`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          content: contentValue,
          parentCommentId,
          isAnonymous: isAnonymousValue,
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? 'Failed to create reply')
      }

      setReplyDraftById((prev) => ({ ...prev, [parentCommentId]: '' }))
      setReplyAnonymousById((prev) => ({ ...prev, [parentCommentId]: false }))
      setComments(data.comments ?? [])
      await fetchPosts()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <section className="board-view">
      <h1>{text.title}</h1>
      <p className="view-description">{text.detailOpenInfo}</p>

      {errorMessage && (
        <p className="board-error">
          {text.errorPrefix}: {errorMessage}
        </p>
      )}

      <div className="board-content-grid">
        {screenMode === 'list' ? (
          <BoardPostListPanel
            posts={posts}
            selectedPostId={selectedPostId}
            onSelectPost={(postId) => {
              setSelectedPostId(postId)
              setScreenMode('detail')
            }}
            onGoCreate={() => {
              setScreenMode('create')
            }}
            text={text}
          />
        ) : null}

        {screenMode === 'create' ? (
          <BoardPostCreatePanel
            authUser={authUser}
            title={title}
            content={content}
            isAnonymous={isAnonymous}
            onChangeTitle={setTitle}
            onChangeContent={setContent}
            onChangeAnonymous={setIsAnonymous}
            onSubmit={handleCreatePost}
            onRequireLogin={onRequireLogin}
            onBackToList={() => setScreenMode('list')}
            text={text}
          />
        ) : null}

        {screenMode === 'detail' ? (
          <BoardPostDetailPanel
            language={language}
            authUser={authUser}
            selectedPost={selectedPost}
            isEditMode={isEditMode}
            editTitle={editTitle}
            editContent={editContent}
            editIsAnonymous={editIsAnonymous}
            isPostOwner={isPostOwner}
            comments={comments}
            newCommentContent={newCommentContent}
            newCommentIsAnonymous={newCommentIsAnonymous}
            replyDraftById={replyDraftById}
            replyAnonymousById={replyAnonymousById}
            onChangeEditTitle={setEditTitle}
            onChangeEditContent={setEditContent}
            onChangeEditAnonymous={setEditIsAnonymous}
            onCancelEdit={handleCancelEdit}
            onStartEdit={handleStartEdit}
            onDeletePost={handleDeletePost}
            onSubmitEdit={handleUpdatePost}
            onSubmitComment={handleCreateComment}
            onChangeNewCommentContent={setNewCommentContent}
            onChangeNewCommentIsAnonymous={setNewCommentIsAnonymous}
            onChangeReplyDraft={(commentId, value) => {
              setReplyDraftById((prev) => ({ ...prev, [commentId]: value }))
            }}
            onChangeReplyAnonymous={(commentId, checked) => {
              setReplyAnonymousById((prev) => ({ ...prev, [commentId]: checked }))
            }}
            onSubmitReply={handleCreateReply}
            onBackToList={() => {
              setIsEditMode(false)
              setScreenMode('list')
            }}
            text={text}
          />
        ) : null}
      </div>
    </section>
  )
}

export default BoardView
