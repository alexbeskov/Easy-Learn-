(function () {
  const API_BASE_URL = window.location.origin;
  const HISTORY_KEY = "easy-learn-history";
  const LANGUAGE_KEY = "easy-learn-language";
  const THEME_KEY = "easy-learn-theme";
  const sampleLinks = [
    "https://www.youtube.com/watch?v=3fumBcKC6RE",
    "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_is_JavaScript",
  ];

  const translations = {
    en: {
      locale: "en-US",
      navWorkspace: "Workspace",
      navDocs: "API Docs",
      languageLabel: "Language",
      themeLabel: "Theme",
      languageRu: "RU",
      languageEn: "EN",
      themeLight: "Light",
      themeDark: "Dark",
      eyebrow: "Local preview",
      heroTitle: "Turn scattered links into one learning path that actually feels teachable.",
      heroText:
        "This preview runs without the Node frontend toolchain so you can review the MVP flow locally right now.",
      heroPrimary: "Build a course",
      heroSecondary: "Open API docs",
      previewBadge: "Preview mode",
      previewTitle: "Mini-course generator",
      previewText:
        "Paste YouTube and article links, call the local FastAPI backend, and inspect the structured output.",
      previewItem1: "Source validation",
      previewItem2: "Context extraction",
      previewItem3: "AI or fallback generation",
      previewItem4: "Local history",
      workspaceEyebrow: "Workspace",
      workspaceTitle: "Generate a mini-course from your learning sources",
      workspaceNote: "One URL per line. This preview talks directly to the local API.",
      topicLabel: "Optional topic",
      topicPlaceholder: "Example: Intro to product marketing",
      urlsLabel: "Source URLs",
      urlsPlaceholder: "Paste YouTube or article links, one per line",
      sourcesReady: "source(s) ready",
      loadSample: "Load sample",
      submitIdle: "Generate mini-course",
      submitLoading: "Generating course...",
      historyTitle: "Recent generations",
      clear: "Clear",
      emptyHistory: "Your latest generated courses will appear here.",
      statusTitle: "Generation status",
      statusReady: "Ready",
      statusLoading: "Processing sources",
      resultEyebrow: "Result",
      resultTitle: "Your structured mini-course",
      overview: "Overview",
      takeaways: "Takeaways",
      nextSteps: "Next steps",
      modulePrefix: "Module",
      keyPoints: "Key points",
      sourcesTitle: "Sources",
      openSource: "Open source",
      warningsTitle: "Warnings",
      noWarnings: "No issues detected for this generation.",
      emptyCourseTitle: "No course yet",
      emptyCourseText:
        "Start by pasting a few YouTube or article links into the workspace. Your generated mini-course will appear here.",
      errorMissingUrls: "Add at least one YouTube or article URL.",
      errorGenerationFailed: "Course generation failed. Please review your links and try again.",
      errorUnexpected: "Unexpected error",
      healthLabel: "Backend health:",
    },
    ru: {
      locale: "ru-RU",
      navWorkspace: "Конструктор",
      navDocs: "API Docs",
      languageLabel: "Язык",
      themeLabel: "Тема",
      languageRu: "RU",
      languageEn: "EN",
      themeLight: "Светлая",
      themeDark: "Темная",
      eyebrow: "Локальный предпросмотр",
      heroTitle: "Превращайте разрозненные ссылки в единый учебный маршрут, который действительно удобно проходить.",
      heroText:
        "Этот режим предпросмотра работает без Node-сборки frontend, чтобы ты мог быстро проверить MVP прямо локально.",
      heroPrimary: "Собрать курс",
      heroSecondary: "Открыть API docs",
      previewBadge: "Режим предпросмотра",
      previewTitle: "Генератор мини-курсов",
      previewText:
        "Вставляй YouTube и ссылки на статьи, обращайся к локальному FastAPI backend и сразу смотри структурированный результат.",
      previewItem1: "Проверка источников",
      previewItem2: "Извлечение контекста",
      previewItem3: "AI или резервная генерация",
      previewItem4: "Локальная история",
      workspaceEyebrow: "Конструктор",
      workspaceTitle: "Соберите мини-курс из ваших учебных источников",
      workspaceNote: "По одной ссылке на строку. Этот режим напрямую обращается к локальному API.",
      topicLabel: "Необязательная тема",
      topicPlaceholder: "Например: Введение в product marketing",
      urlsLabel: "Ссылки на источники",
      urlsPlaceholder: "Вставьте YouTube или ссылки на статьи, по одной в строке",
      sourcesReady: "источник(ов) готово",
      loadSample: "Загрузить пример",
      submitIdle: "Сгенерировать мини-курс",
      submitLoading: "Генерируем курс...",
      historyTitle: "Последние генерации",
      clear: "Очистить",
      emptyHistory: "Здесь будут появляться последние сгенерированные курсы.",
      statusTitle: "Статус генерации",
      statusReady: "Готово",
      statusLoading: "Обрабатываем источники",
      resultEyebrow: "Результат",
      resultTitle: "Ваш структурированный мини-курс",
      overview: "Обзор",
      takeaways: "Главные выводы",
      nextSteps: "Следующие шаги",
      modulePrefix: "Модуль",
      keyPoints: "Ключевые мысли",
      sourcesTitle: "Источники",
      openSource: "Открыть источник",
      warningsTitle: "Предупреждения",
      noWarnings: "Проблем при генерации не обнаружено.",
      emptyCourseTitle: "Курс пока не создан",
      emptyCourseText:
        "Начните с того, что вставьте несколько YouTube-ссылок или ссылок на статьи в конструктор. Здесь появится ваш мини-курс.",
      errorMissingUrls: "Добавьте хотя бы одну YouTube-ссылку или ссылку на статью.",
      errorGenerationFailed: "Не удалось сгенерировать курс. Проверьте ссылки и попробуйте снова.",
      errorUnexpected: "Непредвиденная ошибка",
      healthLabel: "Статус backend:",
    },
  };

  const state = {
    language: window.localStorage.getItem(LANGUAGE_KEY) || "ru",
    theme: window.localStorage.getItem(THEME_KEY) || "light",
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

  applyDocumentPreferences();

  function t() {
    return translations[state.language] || translations.en;
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

  function applyDocumentPreferences() {
    window.localStorage.setItem(LANGUAGE_KEY, state.language);
    window.localStorage.setItem(THEME_KEY, state.theme);
    document.documentElement.lang = state.language;
    document.documentElement.dataset.theme = state.theme;
    document.title = state.language === "ru" ? "Easy Learn Предпросмотр" : "Easy Learn Preview";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderControls(copy) {
    return `
      <div class="control-cluster">
        <div class="toggle-group" aria-label="${escapeHtml(copy.languageLabel)}">
          <span class="toggle-label">${escapeHtml(copy.languageLabel)}</span>
          <div class="toggle-options">
            <button type="button" class="toggle-chip ${state.language === "ru" ? "is-active" : ""}" data-language-option="ru">${escapeHtml(copy.languageRu)}</button>
            <button type="button" class="toggle-chip ${state.language === "en" ? "is-active" : ""}" data-language-option="en">${escapeHtml(copy.languageEn)}</button>
          </div>
        </div>
        <div class="toggle-group" aria-label="${escapeHtml(copy.themeLabel)}">
          <span class="toggle-label">${escapeHtml(copy.themeLabel)}</span>
          <div class="toggle-options">
            <button type="button" class="toggle-chip ${state.theme === "light" ? "is-active" : ""}" data-theme-option="light">${escapeHtml(copy.themeLight)}</button>
            <button type="button" class="toggle-chip ${state.theme === "dark" ? "is-active" : ""}" data-theme-option="dark">${escapeHtml(copy.themeDark)}</button>
          </div>
        </div>
      </div>
    `;
  }

  function render() {
    applyDocumentPreferences();
    const copy = t();
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
            <div class="topbar-controls">
              <div class="topbar-links">
                <a href="#workspace">${escapeHtml(copy.navWorkspace)}</a>
                <a href="/docs" target="_blank" rel="noreferrer">${escapeHtml(copy.navDocs)}</a>
              </div>
              ${renderControls(copy)}
            </div>
          </nav>

          <div class="hero-grid">
            <section class="hero-copy">
              <p class="eyebrow">${escapeHtml(copy.eyebrow)}</p>
              <h1>${escapeHtml(copy.heroTitle)}</h1>
              <p class="hero-text">${escapeHtml(copy.heroText)}</p>
              <div class="hero-actions">
                <a class="primary-button" href="#workspace">${escapeHtml(copy.heroPrimary)}</a>
                <a class="ghost-button" href="/docs" target="_blank" rel="noreferrer">${escapeHtml(copy.heroSecondary)}</a>
              </div>
            </section>

            <section class="hero-preview">
              <div class="glass-card preview-panel">
                <span class="panel-badge">${escapeHtml(copy.previewBadge)}</span>
                <h2>${escapeHtml(copy.previewTitle)}</h2>
                <p>${escapeHtml(copy.previewText)}</p>
                <ul class="preview-modules">
                  <li>${escapeHtml(copy.previewItem1)}</li>
                  <li>${escapeHtml(copy.previewItem2)}</li>
                  <li>${escapeHtml(copy.previewItem3)}</li>
                  <li>${escapeHtml(copy.previewItem4)}</li>
                </ul>
              </div>
            </section>
          </div>
        </header>

        <main>
          <section class="workspace" id="workspace">
            <div class="workspace-header">
              <div>
                <p class="eyebrow">${escapeHtml(copy.workspaceEyebrow)}</p>
                <h2>${escapeHtml(copy.workspaceTitle)}</h2>
              </div>
              <p class="workspace-note">${escapeHtml(copy.workspaceNote)}</p>
            </div>

            <div class="workspace-grid">
              <div class="glass-card builder-card">
                <form id="generator-form">
                  <label class="field-label" for="topic">${escapeHtml(copy.topicLabel)}</label>
                  <input id="topic" class="text-input" value="${escapeHtml(state.form.topic)}" placeholder="${escapeHtml(copy.topicPlaceholder)}" />

                  <label class="field-label" for="urls">${escapeHtml(copy.urlsLabel)}</label>
                  <textarea id="urls" class="text-area" rows="8" placeholder="${escapeHtml(copy.urlsPlaceholder)}">${escapeHtml(state.form.urls)}</textarea>

                  <div class="source-counter">
                    <span>${parsedUrls.length} ${escapeHtml(copy.sourcesReady)}</span>
                    <button type="button" class="link-button" id="load-sample">${escapeHtml(copy.loadSample)}</button>
                  </div>

                  ${state.error ? `<p class="error-text">${escapeHtml(state.error)}</p>` : ""}

                  <button class="primary-button full-width" ${state.status === "loading" ? "disabled" : ""} type="submit">
                    ${escapeHtml(state.status === "loading" ? copy.submitLoading : copy.submitIdle)}
                  </button>
                </form>
              </div>

              <div class="workspace-side">
                <div class="glass-card history-card">
                  <div class="history-head">
                    <h3>${escapeHtml(copy.historyTitle)}</h3>
                    ${state.history.length ? `<button class="link-button" id="clear-history" type="button">${escapeHtml(copy.clear)}</button>` : ""}
                  </div>
                  ${
                    state.history.length
                      ? `<div class="history-list">${state.history
                          .map(
                            (item) => `
                            <button class="history-item ${state.selectedHistoryId === item.id ? "is-active" : ""}" data-history-id="${item.id}" type="button">
                              <strong>${escapeHtml(item.topic)}</strong>
                              <span>${escapeHtml(new Date(item.createdAt).toLocaleString(copy.locale))}</span>
                            </button>`,
                          )
                          .join("")}</div>`
                      : `<p class="muted-text">${escapeHtml(copy.emptyHistory)}</p>`
                  }
                </div>

                <div class="glass-card status-card">
                  <h3>${escapeHtml(copy.statusTitle)}</h3>
                  <p class="status-pill">${escapeHtml(state.status === "loading" ? copy.statusLoading : copy.statusReady)}</p>
                  <p class="muted-text">${escapeHtml(copy.healthLabel)} <a href="/api/health" target="_blank" rel="noreferrer">/api/health</a></p>
                </div>
              </div>
            </div>
          </section>

          <section class="result-section">
            <div class="result-head">
              <div>
                <p class="eyebrow">${escapeHtml(copy.resultEyebrow)}</p>
                <h2>${escapeHtml(copy.resultTitle)}</h2>
              </div>
            </div>
            ${state.course ? renderCourse(state.course, copy) : renderEmpty(copy)}
          </section>
        </main>
      </div>
    `;

    bindEvents();
  }

  function renderCourse(course, copy) {
    return `
      <div class="course-layout">
        <div class="glass-card course-summary">
          <span class="panel-badge">${escapeHtml(copy.overview)}</span>
          <h3>${escapeHtml(course.title)}</h3>
          <p>${escapeHtml(course.summary)}</p>
          <div class="summary-grid">
            ${renderListBlock(copy.takeaways, course.takeaways || [])}
            ${renderListBlock(copy.nextSteps, course.next_steps || [])}
          </div>
        </div>

        <div class="course-main">
          <div class="module-list">
            ${(course.modules || [])
              .map(
                (module, index) => `
                <article class="glass-card module-card">
                  <div class="module-number">${escapeHtml(copy.modulePrefix)} ${index + 1}</div>
                  <h3>${escapeHtml(module.title)}</h3>
                  <p class="module-goal">${escapeHtml(module.goal)}</p>
                  <p>${escapeHtml(module.content)}</p>
                  ${renderListBlock(copy.keyPoints, module.key_points || [])}
                </article>`,
              )
              .join("")}
          </div>
        </div>

        <aside class="course-sidebar">
          <div class="glass-card source-card">
            <h3>${escapeHtml(copy.sourcesTitle)}</h3>
            <div class="source-list">
              ${(course.sources || [])
                .map(
                  (source) => `
                  <div class="source-item">
                    <span class="source-kind ${escapeHtml(source.kind)}">${escapeHtml(source.kind)}</span>
                    <strong>${escapeHtml(source.title)}</strong>
                    <p>${escapeHtml(source.excerpt || "")}</p>
                    <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(copy.openSource)}</a>
                  </div>`,
                )
                .join("")}
            </div>
          </div>

          <div class="glass-card warning-card">
            <h3>${escapeHtml(copy.warningsTitle)}</h3>
            ${
              course.warnings && course.warnings.length
                ? `<ul class="plain-list">${course.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>`
                : `<p class="muted-text">${escapeHtml(copy.noWarnings)}</p>`
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

  function renderEmpty(copy) {
    return `
      <div class="glass-card empty-result">
        <h3>${escapeHtml(copy.emptyCourseTitle)}</h3>
        <p>${escapeHtml(copy.emptyCourseText)}</p>
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

    document.querySelectorAll("[data-language-option]").forEach((button) => {
      button.addEventListener("click", function () {
        state.language = button.dataset.languageOption;
        render();
      });
    });

    document.querySelectorAll("[data-theme-option]").forEach((button) => {
      button.addEventListener("click", function () {
        state.theme = button.dataset.themeOption;
        render();
      });
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
        state.error = t().errorMissingUrls;
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
          throw new Error(t().errorGenerationFailed);
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
        state.error = error.message || t().errorUnexpected;
      }

      render();
    });
  }

  render();
})();
