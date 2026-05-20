import { emptyForm } from "../constants";

export function Workspace({
  t,
  form,
  setForm,
  handleSubmit,
  status,
  error,
  parsedUrls,
  history,
  selectedHistoryId,
  loadHistoryItem,
  clearHistory,
}) {
  return (
    <section className="workspace" id="workspace">
      <div className="workspace-header">
        <div>
          <p className="eyebrow">{t.workspaceEyebrow}</p>
          <h2>{t.workspaceTitle}</h2>
        </div>
        <p className="workspace-note">{t.workspaceNote}</p>
      </div>

      <div className="workspace-grid">
        <div className="glass-card builder-card">
          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="topic">
              {t.topicLabel}
            </label>
            <input
              id="topic"
              className="text-input"
              placeholder={t.topicPlaceholder}
              value={form.topic}
              onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
            />

            <label className="field-label" htmlFor="urls">
              {t.urlsLabel}
            </label>
            <textarea
              id="urls"
              className="text-area"
              rows="8"
              placeholder={t.urlsPlaceholder}
              value={form.urls}
              onChange={(event) => setForm((current) => ({ ...current, urls: event.target.value }))}
            />

            <div className="source-counter">
              <span>{parsedUrls.length} {t.sourcesReady}</span>
              <button type="button" className="link-button" onClick={() => setForm(emptyForm)}>
                {t.loadSample}
              </button>
            </div>

            {error ? <p className="error-text">{error}</p> : null}

            <button className="primary-button full-width" disabled={status === "loading"} type="submit">
              {status === "loading" ? t.submitLoading : t.submitIdle}
            </button>
          </form>
        </div>

        <div className="workspace-side">
          <div className="glass-card history-card">
            <div className="history-head">
              <h3>{t.recentGenerations}</h3>
              {history.length > 0 ? (
                <button className="link-button" onClick={clearHistory} type="button">
                  {t.clear}
                </button>
              ) : null}
            </div>
            {history.length === 0 ? (
              <p className="muted-text">{t.emptyHistory}</p>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <button
                    className={`history-item ${selectedHistoryId === item.id ? "is-active" : ""}`}
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    type="button"
                  >
                    <strong>{item.topic}</strong>
                    <span>{new Date(item.createdAt).toLocaleString(t.locale)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card status-card">
            <h3>{t.statusTitle}</h3>
            <p className="status-pill">{status === "loading" ? t.statusLoading : t.statusReady}</p>
            <p className="muted-text">{t.statusText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
