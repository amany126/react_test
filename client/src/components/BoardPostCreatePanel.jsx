function BoardPostCreatePanel({
  authUser,
  title,
  content,
  isAnonymous,
  onChangeTitle,
  onChangeContent,
  onChangeAnonymous,
  onSubmit,
  onRequireLogin,
  onBackToList,
  text,
}) {
  return (
    <section className="board-create-panel">
      <div className="board-panel-header">
        <h2>{text.createTitle}</h2>
        <button type="button" onClick={onBackToList}>
          {text.backToList}
        </button>
      </div>

      {!authUser ? (
        <div className="board-create-disabled">
          <p>{text.loginRequired}</p>
          <button type="button" onClick={onRequireLogin}>
            {text.toLogin}
          </button>
        </div>
      ) : (
        <form className="board-create-form" onSubmit={onSubmit}>
          <div className="board-title-field">
            <div className="board-title-label-row">
              <label htmlFor="board-post-title">{text.postTitle}</label>
            </div>
            <input
              id="board-post-title"
              value={title}
              onChange={(event) => onChangeTitle(event.target.value)}
              required
            />
          </div>
          <label>
            <span>{text.postContent}</span>
            <textarea
              value={content}
              onChange={(event) => onChangeContent(event.target.value)}
              placeholder={text.contentPlaceholder}
              required
            />
          </label>
          <div className="board-create-actions" style={{display:'inline'}}>
            <label className="board-anonymous-inline board-create-anonymous" htmlFor="board-post-anonymous" style={{ display: 'contents' }}>
              <input
                id="board-post-anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(event) => onChangeAnonymous(event.target.checked)}
              />
              <span>{text.postAnonymous}</span>
            </label>
            <button type="submit">{text.submitPost}</button>
          </div>
        </form>
      )}
    </section>
  )
}

export default BoardPostCreatePanel
