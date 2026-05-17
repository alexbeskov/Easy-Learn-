(function () {
  const API_BASE_URL = window.location.origin;
  const HISTORY_KEY = "easy-learn-history";
  const sampleLinks = [
    "https://www.youtube.com/watch?v=3fumBcKC6RE",
    "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_is_JavaScript",
  ];

  const state = {
    form: {
      topic: "",
      urls: sampleLinks.join("\n"),
    },
    status: "idle",
    error: "",
    course: null,
    history: loadHistory(),
    selectedHistoryId: null,
  };

  if (state.history[0]) {
    state.course = state.history[0].course;
    state.selectedHistoryId = state.history[0].id;
  }

  function loadHistory() {
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveHistory(history) {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function render() {
    const parsedUrls = state.form.urls
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);

    document.getElementById("app").innerHTML = `
      <div class="page-shell">
        <header class="hero">
          <nav class="topbar">
            <div class="brand-lockup">
              <span class="brand-mark">EL</span>
              <span class="brand-name">Easy Learn</span>
            </div>
            <div class="topbar-links">
              <a href="#workspace">Workspace</a>
              <a href="/docs" target="_blank" rel="noreferrer">API Docs</a>
            </div>
          </nav>

          <div class="hero-grid">
            <section class="hero-copy">
              <p class="eyebrow">Local preview</p>
              <h1>Turn scattered links into one learning path that actually feels teachable.</h1>
              <p class="hero-text">
                This preview runs without the Node frontend toolchain so you can review the MVP flow
                locally right now.
              </p>
              <div class="hero-actions">
                <a class="primary-button" href="#workspace">Build a course</a>
                <a class="ghost-button" href="/docs" target="_blank" rel="noreferrer">Open API docs</a>
              </div>
            </section>

            <section class="hero-preview">
              <div class="glass-card preview-panel">
                <span class="panel-badge">Preview mode</span>
                <h2>Mini-course generator</h2>
                <p>Paste YouTube and article links, call the local FastAPI backend, and inspect the structured output.</p>
                <ul class="preview-modules">
                  <li>Source validation</li>
                  <li>Context extraction</li>
                  <li>AI or fallback generation</li>
                  <li>Local history</li>
                </ul>
              </div>
            </section>
          </div>
        </header>

        <main>
          <section class="workspace" id="workspace">
            <div class="workspace-header">
              <div>
                <p class="eyebrow">Workspace</p>
                <h2>Generate a mini-course from your learning sources</h2>
              </div>
              <p class="workspace-note">One URL per line. This preview talks directly to the local API.</p>
            </div>

            <div class="workspace-grid">
              <div class="glass-card builder-card">
                <form id="generator-form">
                  <label class="field-label" for="topic">Optional topic</label>
                  <input id="topic" class="text-input" value="${escapeHtml(state.form.topic)}" placeholder="Example: Intro to product marketing" />

                  <label class="field-label" for="urls">Source URLs</label>
                  <textarea id="urls" class="text-area" rows="8" placeholder="Paste YouTube or article links, one per line">${escapeHtml(state.form.urls)}</textarea>

                  <div class="source-counter">
                    <span>${parsedUrls.length} source(s) ready</span>
                    <button type="button" class="link-button" id="load-sample">Load sample</button>
                  </div>

                  ${state.error ? `<p class="error-text">${escapeHtml(state.error)}</p>` : ""}

                  <button class="primary-button full-width" ${state.status === "loading" ? "disabled" : ""} type="submit">
                    ${state.status === "loading" ? "Generating course..." : "Generate mini-course"}
                  </button>
                </form>
              </div>

              <div class="workspace-side">
                <div class="glass-card history-card">
                  <div class="history-head">
                    <h3>Recent generations</h3>
                    ${state.history.length ? '<button class="link-button" id="clear-history" type="button">Clear</button>' : ""}
                  </div>
                  ${
                    state.history.length
                      ? `<div class="history-list">${state.history
                          .map(
                            (item) => `
                            <button class="history-item ${state.selectedHistoryId === item.id ? "is-active" : ""}" data-history-id="${item.id}" type="button">
                              <strong>${escapeHtml(item.topic)}</strong>
                              <span>${escapeHtml(new Date(item.createdAt).toLocaleString())}</span>
                            </button>`,
                          )
                          .join("")}</div>`
                      : '<p class="muted-text">Your latest generated courses will appear here.</p>'
                  }
                </div>

                <div class="glass-card status-card">
                  <h3>Generation status</h3>
                  <p class="status-pill">${state.status === "loading" ? "Processing sources" : "Ready"}</p>
                  <p class="muted-text">Backend health: <a href="/api/health" target="_blank" rel="noreferrer">/api/health</a></p>
                </div>
              </div>
            </div>
          </section>

          <section class="result-section">
            <div class="result-head">
              <div>
                <p class="eyebrow">Result</p>
                <h2>Your structured mini-course</h2>
              </div>
            </div>
            ${state.course ? renderCourse(state.course) : renderEmpty()}
          </section>
        </main>
      </div>
    `;

    bindEvents();
  }

  function renderCourse(course) {
    return `
      <div class="course-layout">
        <div class="glass-card course-summary">
          <span class="panel-badge">Overview</span>
          <h3>${escapeHtml(course.title)}</h3>
          <p>${escapeHtml(course.summary)}</p>
          <div class="summary-grid">
            ${renderListBlock("Takeaways", course.takeaways || [])}
            ${renderListBlock("Next steps", course.next_steps || [])}
          </div>
        </div>

        <div class="course-main">
          <div class="module-list">
            ${(course.modules || [])
              .map(
                (module, index) => `
                <article class="glass-card module-card">
                  <div class="module-number">Module ${index + 1}</div>
                  <h3>${escapeHtml(module.title)}</h3>
                  <p class="module-goal">${escapeHtml(module.goal)}</p>
                  <p>${escapeHtml(module.content)}</p>
                  ${renderListBlock("Key points", module.key_points || [])}
                </article>`,
              )
              .join("")}
          </div>
        </div>

        <aside class="course-sidebar">
          <div class="glass-card source-card">
            <h3>Sources</h3>
            <div class="source-list">
              ${(course.sources || [])
                .map(
                  (source) => `
                  <div class="source-item">
                    <span class="source-kind ${escapeHtml(source.kind)}">${escapeHtml(source.kind)}</span>
                    <strong>${escapeHtml(source.title)}</strong>
                    <p>${escapeHtml(source.excerpt || "")}</p>
                    <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Open source</a>
                  </div>`,
                )
                .join("")}
            </div>
          </div>

          <div class="glass-card warning-card">
            <h3>Warnings</h3>
            ${
              course.warnings && course.warnings.length
                ? `<ul class="plain-list">${course.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>`
                : '<p class="muted-text">No issues detected for this generation.</p>'
            }
          </div>
        </aside>
      </div>
    `;
  }

  function renderListBlock(title, items) {
    return `
      <div>
        <h4>${escapeHtml(title)}</h4>
        <ul class="plain-list">
          ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  function renderEmpty() {
    return `
      <div class="glass-card empty-result">
        <h3>No course yet</h3>
        <p>Start by pasting a few YouTube or article links into the workspace. Your generated mini-course will appear here.</p>
      </div>
    `;
  }

  function bindEvents() {
    const form = document.getElementById("generator-form");
    const topicInput = document.getElementById("topic");
    const urlsInput = document.getElementById("urls");
    const sampleButton = document.getElementById("load-sample");
    const clearButton = document.getElementById("clear-history");

    topicInput.addEventListener("input", function (event) {
      state.form.topic = event.target.value;
    });

    urlsInput.addEventListener("input", function (event) {
      state.form.urls = event.target.value;
      render();
    });

    sampleButton.addEventListener("click", function () {
      state.form.topic = "";
      state.form.urls = sampleLinks.join("\n");
      render();
    });

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        state.history = [];
        state.course = null;
        state.selectedHistoryId = null;
        saveHistory([]);
        render();
      });
    }

    document.querySelectorAll("[data-history-id]").forEach((button) => {
      button.addEventListener("click", function () {
        const item = state.history.find((entry) => entry.id === button.dataset.historyId);
        if (!item) {
          return;
        }
        state.course = item.course;
        state.selectedHistoryId = item.id;
        state.status = "success";
        state.error = "";
        render();
      });
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const urls = state.form.urls
        .split("\n")
        .map((entry) => entry.trim())
        .filter(Boolean);

      if (!urls.length) {
        state.error = "Add at least one YouTube or article URL.";
        render();
        return;
      }

      state.status = "loading";
      state.error = "";
      render();

      try {
        const response = await fetch(`${API_BASE_URL}/api/course/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: state.form.topic.trim() || null,
            urls,
          }),
        });

        if (!response.ok) {
          throw new Error("Course generation failed. Please review your links and try again.");
        }

        const course = await response.json();
        const historyItem = {
          id: (window.crypto && window.crypto.randomUUID && window.crypto.randomUUID()) || String(Date.now()),
          createdAt: new Date().toISOString(),
          topic: state.form.topic.trim() || course.title,
          course,
        };

        state.course = course;
        state.selectedHistoryId = historyItem.id;
        state.history = [historyItem].concat(state.history).slice(0, 6);
        saveHistory(state.history);
        state.status = "success";
      } catch (error) {
        state.status = "error";
        state.error = error.message || "Unexpected error";
      }

      render();
    });
  }

  render();
})();
