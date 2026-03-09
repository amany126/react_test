import { useState } from 'react'

function CommentNode({
  item,
  language,
  authUser,
  replyDraftById,
  replyAnonymousById,
  onChangeReplyDraft,
  onChangeReplyAnonymous,
  onSubmitReply,
}) {
  const [isReplyOpen, setIsReplyOpen] = useState(false)

  const textByLanguage = {
    ko: {
      reply: '답글',
      submitReply: '답글 등록',
      replyPlaceholder: '답글 내용을 입력하세요.',
      replyAnonymous: '익명 답글',
    },
    en: {
      reply: 'Reply',
      submitReply: 'Submit Reply',
      replyPlaceholder: 'Write your reply.',
      replyAnonymous: 'Anonymous reply',
    },
  }

  const text = textByLanguage[language]

  return (
    <div className="comment-item">
      <div className="comment-meta">
        <strong>{item.authorName}</strong>
        <span>{new Date(item.createdAt).toLocaleString()}</span>
      </div>
      <p className="comment-content">{item.content}</p>

      {authUser && (
        <button
          type="button"
          className="comment-reply-btn"
          onClick={() => setIsReplyOpen((prev) => !prev)}
        >
          {text.reply}
        </button>
      )}

      {authUser && isReplyOpen && (
        <form
          className="comment-reply-form"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmitReply(item.id)
            setIsReplyOpen(false)
          }}
        >
          <textarea
            value={replyDraftById[item.id] ?? ''}
            onChange={(event) => onChangeReplyDraft(item.id, event.target.value)}
            placeholder={text.replyPlaceholder}
            required
          />
          <label className="board-anonymous-check comment-anonymous-check">
            <input
              type="checkbox"
              checked={Boolean(replyAnonymousById[item.id])}
              onChange={(event) => onChangeReplyAnonymous(item.id, event.target.checked)}
            />
            <span>{text.replyAnonymous}</span>
          </label>
          <button type="submit">{text.submitReply}</button>
        </form>
      )}

      {item.children?.length > 0 && (
        <div className="comment-children">
          {item.children.map((child) => (
            <CommentNode
              key={child.id}
              item={child}
              language={language}
              authUser={authUser}
              replyDraftById={replyDraftById}
              replyAnonymousById={replyAnonymousById}
              onChangeReplyDraft={onChangeReplyDraft}
              onChangeReplyAnonymous={onChangeReplyAnonymous}
              onSubmitReply={onSubmitReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function BoardPostDetailPanel({
  language,
  authUser,
  selectedPost,
  isEditMode,
  editTitle,
  editContent,
  editIsAnonymous,
  isPostOwner,
  comments,
  newCommentContent,
  newCommentIsAnonymous,
  replyDraftById,
  replyAnonymousById,
  onChangeEditTitle,
  onChangeEditContent,
  onChangeEditAnonymous,
  onCancelEdit,
  onStartEdit,
  onDeletePost,
  onSubmitEdit,
  onSubmitComment,
  onChangeNewCommentContent,
  onChangeNewCommentIsAnonymous,
  onChangeReplyDraft,
  onChangeReplyAnonymous,
  onSubmitReply,
  onBackToList,
  text,
}) {
  return (
    <section className="board-detail">
      <div className="board-panel-header">
        <h2>{text.detailTitle}</h2>
        <button type="button" onClick={onBackToList}>
          {text.backToList}
        </button>
      </div>
      {!selectedPost ? (
        <p>{text.selectPost}</p>
      ) : (
        <>
          <article className="board-detail-card">
            {isEditMode ? (
              <form className="board-edit-form" onSubmit={onSubmitEdit}>
                <div className="board-title-row">
                  <label className="board-title-field">
                    <span>{text.postTitle}</span>
                    <input
                      value={editTitle}
                      onChange={(event) => onChangeEditTitle(event.target.value)}
                      required
                    />
                  </label>
                  <label className="board-anonymous-inline">
                    <input
                      type="checkbox"
                      checked={editIsAnonymous}
                      onChange={(event) => onChangeEditAnonymous(event.target.checked)}
                    />
                    <span>{text.postAnonymous}</span>
                  </label>
                </div>
                <label>
                  <span>{text.postContent}</span>
                  <textarea
                    value={editContent}
                    onChange={(event) => onChangeEditContent(event.target.value)}
                    required
                  />
                </label>
                <div className="board-post-actions">
                  <button type="submit">{text.savePost}</button>
                  <button type="button" onClick={onCancelEdit}>
                    {text.cancelEdit}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h3>{selectedPost.title}</h3>
                <div className="board-detail-meta">
                  <span>{selectedPost.isAnonymous ? text.anonymousAuthor : selectedPost.authorName}</span>
                  <span>{new Date(selectedPost.createdAt).toLocaleString()}</span>
                </div>
                <p>{selectedPost.content}</p>
                {isPostOwner && (
                  <div className="board-post-actions">
                    <button type="button" onClick={onStartEdit}>
                      {text.editPost}
                    </button>
                    <button type="button" onClick={onDeletePost}>
                      {text.deletePost}
                    </button>
                  </div>
                )}
              </>
            )}
          </article>

          <section className="board-comments">
            <h3>{text.comments}</h3>

            {authUser && (
              <form className="board-comment-form" onSubmit={onSubmitComment}>
                <textarea
                  value={newCommentContent}
                  onChange={(event) => onChangeNewCommentContent(event.target.value)}
                  placeholder={text.commentPlaceholder}
                  required
                />
                <label className="board-anonymous-check comment-anonymous-check">
                  <input
                    type="checkbox"
                    checked={newCommentIsAnonymous}
                    onChange={(event) => onChangeNewCommentIsAnonymous(event.target.checked)}
                  />
                  <span>{text.commentAnonymous}</span>
                </label>
                <button type="submit">{text.submitComment}</button>
              </form>
            )}

            <div className="comment-list">
              {comments.map((item) => (
                <CommentNode
                  key={item.id}
                  item={item}
                  language={language}
                  authUser={authUser}
                  replyDraftById={replyDraftById}
                  replyAnonymousById={replyAnonymousById}
                  onChangeReplyDraft={onChangeReplyDraft}
                  onChangeReplyAnonymous={onChangeReplyAnonymous}
                  onSubmitReply={onSubmitReply}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  )
}

export default BoardPostDetailPanel
