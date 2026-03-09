function BoardPostListPanel({ posts, selectedPostId, onSelectPost, onGoCreate, text }) {
  return (
    <section className="board-post-list">
      <h2>{text.listTitle}</h2>
      {posts.length === 0 ? (
        <p>{text.noPost}</p>
      ) : (
        posts.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`board-post-item ${selectedPostId === item.id ? 'active' : ''}`}
            onClick={() => onSelectPost(item.id)}
          >
            <strong>{item.title}</strong>
            <span>
              {item.isAnonymous ? text.anonymousAuthor : item.authorName} · {item.commentCount}
            </span>
          </button>
        ))
      )}

      <div className="board-list-footer">
        <button type="button" onClick={onGoCreate}>
          {text.goCreate}
        </button>
      </div>
    </section>
  )
}

export default BoardPostListPanel
