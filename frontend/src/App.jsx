import { startTransition, useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const HISTORY_KEY = "easy-learn-history";
const LANGUAGE_KEY = "easy-learn-language";
const THEME_KEY = "easy-learn-theme";

const sampleLinks = [
  "https://www.youtube.com/watch?v=3fumBcKC6RE",
  "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_is_JavaScript",
];

const emptyForm = {
  topic: "",
  urls: sampleLinks.join("\n"),
};

const translations = {
  en: {
    locale: "en-US",
    navProduct: "Product",
    navWorkspace: "Workspace",
    languageLabel: "Language",
    themeLabel: "Theme",
    languageRu: "RU",
    languageEn: "EN",
    themeLight: "Light",
    themeDark: "Dark",
    eyebrow: "Learning, remixed",
    heroTitle: "Turn scattered links into one learning path that actually feels teachable.",
    heroText:
      "Easy Learn collects YouTube videos and articles, then shapes them into a structured mini-course with modules, takeaways, and next steps for self-learners.",
    heroPrimary: "Build a course",
    heroSecondary: "See how it works",
    metricTypesValue: "2 types",
    metricTypesLabel: "YouTube + articles",
    metricModulesValue: "3-7",
    metricModulesLabel: "modules per course",
    metricLoginValue: "0 login",
    metricLoginLabel: "start instantly",
    exampleBadge: "Example output",
    exampleTitle: "AI Coding Fundamentals",
    exampleText:
      "A mini-course built from a YouTube tutorial and two practical articles, ready for a focused study session.",
    previewItem1: "Orientation and tooling",
    previewItem2: "Core prompting patterns",
    previewItem3: "Hands-on implementation workflow",
    previewItem4: "Practice roadmap",
    feature1Title: "Scatter to structure",
    feature1Text:
      "Drop in YouTube videos and article links, then get one coherent learning path instead of a chaotic reading list.",
    feature2Title: "Mini-course output",
    feature2Text:
      "Each generation returns a guided course with modules, takeaways, and next steps that are easy to follow.",
    feature3Title: "No account friction",
    feature3Text:
      "The MVP works instantly without registration and keeps recent generations in your browser history.",
    workspaceEyebrow: "Workspace",
    workspaceTitle: "Generate a mini-course from your learning sources",
    workspaceNote:
      "Add one link per line. The backend will combine supported sources and return a structured course.",
    topicLabel: "Optional topic",
    topicPlaceholder: "Example: Intro to product marketing",
    urlsLabel: "Source URLs",
    urlsPlaceholder: "Paste YouTube or article links, one per line",
    sourcesReady: "source(s) ready",
    loadSample: "Load sample",
    submitIdle: "Generate mini-course",
    submitLoading: "Generating course...",
    recentGenerations: "Recent generations",
    clear: "Clear",
    emptyHistory: "Your latest generated courses will appear here.",
    statusTitle: "Generation status",
    statusReady: "Ready",
    statusLoading: "Processing sources",
    statusText:
      "If Polza AI is unavailable, the backend still returns a fallback mini-course so the flow stays usable during MVP testing.",
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
      "Start by pasting a few YouTube or article links into the workspace. Your generated mini-course will appear here with modules, sources, and next steps.",
    errorMissingUrls: "Add at least one YouTube or article URL.",
    errorGenerationFailed: "Course generation failed. Please review your links and try again.",
    errorUnexpected: "Unexpected error",
  },
  ru: {
    locale: "ru-RU",
    navProduct: "О продукте",
    navWorkspace: "Конструктор",
    languageLabel: "Язык",
    themeLabel: "Тема",
    languageRu: "RU",
    languageEn: "EN",
    themeLight: "Светлая",
    themeDark: "Темная",
    eyebrow: "Обучение по-новому",
    heroTitle: "Превращайте разрозненные ссылки в единый учебный маршрут, который действительно удобно проходить.",
    heroText:
      "Easy Learn собирает YouTube-видео и статьи, а затем превращает их в структурированный мини-курс с модулями, выводами и следующими шагами для самостоятельного обучения.",
    heroPrimary: "Собрать курс",
    heroSecondary: "Как это работает",
    metricTypesValue: "2 формата",
    metricTypesLabel: "YouTube + статьи",
    metricModulesValue: "3-7",
    metricModulesLabel: "модулей в курсе",
    metricLoginValue: "0 входа",
    metricLoginLabel: "можно начать сразу",
    exampleBadge: "Пример результата",
    exampleTitle: "Основы AI Coding",
    exampleText:
      "Мини-курс, собранный из YouTube-урока и двух практических статей, готовый для сфокусированной учебной сессии.",
    previewItem1: "Ориентация и инструменты",
    previewItem2: "Базовые паттерны промптинга",
    previewItem3: "Практический рабочий процесс",
    previewItem4: "План дальнейшей практики",
    feature1Title: "От хаоса к структуре",
    feature1Text:
      "Добавьте YouTube-видео и статьи, а затем получите единый маршрут обучения вместо разрозненного списка материалов.",
    feature2Title: "Готовый мини-курс",
    feature2Text:
      "Каждая генерация возвращает понятный курс с модулями, выводами и следующими шагами, по которому легко идти.",
    feature3Title: "Без лишнего трения",
    feature3Text:
      "MVP работает сразу без регистрации и сохраняет последние генерации прямо в истории браузера.",
    workspaceEyebrow: "Конструктор",
    workspaceTitle: "Соберите мини-курс из ваших учебных источников",
    workspaceNote:
      "Добавляйте по одной ссылке на строку. Backend объединит поддерживаемые источники и вернет структурированный курс.",
    topicLabel: "Необязательная тема",
    topicPlaceholder: "Например: Введение в product marketing",
    urlsLabel: "Ссылки на источники",
    urlsPlaceholder: "Вставьте YouTube или ссылки на статьи, по одной в строке",
    sourcesReady: "источник(ов) готово",
    loadSample: "Загрузить пример",
    submitIdle: "Сгенерировать мини-курс",
    submitLoading: "Генерируем курс...",
    recentGenerations: "Последние генерации",
    clear: "Очистить",
    emptyHistory: "Здесь будут появляться последние сгенерированные курсы.",
    statusTitle: "Статус генерации",
    statusReady: "Готово",
    statusLoading: "Обрабатываем источники",
    statusText:
      "Если Polza AI недоступен, backend все равно вернет резервный мини-курс, чтобы MVP оставался рабочим во время тестирования.",
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
      "Начните с того, что вставьте несколько YouTube-ссылок или ссылок на статьи в конструктор. Здесь появится ваш мини-курс с модулями, источниками и следующими шагами.",
    errorMissingUrls: "Добавьте хотя бы одну YouTube-ссылку или ссылку на статью.",
    errorGenerationFailed: "Не удалось сгенерировать курс. Проверьте ссылки и попробуйте снова.",
    errorUnexpected: "Непредвиденная ошибка",
  },
};

function App() {
  const [language, setLanguage] = useState(() => window.localStorage.getItem(LANGUAGE_KEY) || "ru");
  const [theme, setTheme] = useState(() => window.localStorage.getItem(THEME_KEY) || "light");
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [course, setCourse] = useState(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const t = translations[language] || translations.en;

  useEffect(() => {
    const stored = window.localStorage.getItem(HISTORY_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setHistory(parsed);
        if (parsed[0]?.course) {
          setCourse(parsed[0].course);
          setSelectedHistoryId(parsed[0].id);
        }
      }
    } catch {
      window.localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const parsedUrls = useMemo(() => {
    return form.urls
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }, [form.urls]);

  const featureCards = useMemo(
    () => [
      {
        title: t.feature1Title,
        text: t.feature1Text,
      },
      {
        title: t.feature2Title,
        text: t.feature2Text,
      },
      {
        title: t.feature3Title,
        text: t.feature3Text,
      },
    ],
    [t],
  );

  async function handleSubmit(event) {
    event.preventDefault();

    if (parsedUrls.length === 0) {
      setError(t.errorMissingUrls);
      return;
    }

    setError("");
    setStatus("loading");

    try {
      const response = await fetch(`${API_BASE_URL}/api/course/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: form.topic.trim() || null,
          urls: parsedUrls,
        }),
      });

      if (!response.ok) {
        throw new Error(t.errorGenerationFailed);
      }

      const nextCourse = await response.json();
      const historyItem = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        topic: form.topic.trim() || nextCourse.title,
        course: nextCourse,
      };

      startTransition(() => {
        setCourse(nextCourse);
        setSelectedHistoryId(historyItem.id);
        setHistory((current) => {
          const updated = [historyItem, ...current].slice(0, 6);
          window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
          return updated;
        });
      });
      setStatus("success");
    } catch (submitError) {
      setStatus("error");
      setError(submitError.message || t.errorUnexpected);
    }
  }

  function loadHistoryItem(item) {
    setSelectedHistoryId(item.id);
    setCourse(item.course);
    setStatus("success");
    setError("");
  }

  function clearHistory() {
    setHistory([]);
    setCourse(null);
    setSelectedHistoryId(null);
    window.localStorage.removeItem(HISTORY_KEY);
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <nav className="topbar">
          <div className="brand-lockup">
            <span className="brand-mark">EL</span>
            <span className="brand-name">Easy Learn</span>
          </div>
          <div className="topbar-controls">
            <div className="topbar-links">
              <a href="#product">{t.navProduct}</a>
              <a href="#workspace">{t.navWorkspace}</a>
            </div>
            <div className="control-cluster">
              <ToggleGroup
                label={t.languageLabel}
                options={[
                  { value: "ru", label: t.languageRu },
                  { value: "en", label: t.languageEn },
                ]}
                value={language}
                onChange={setLanguage}
              />
              <ToggleGroup
                label={t.themeLabel}
                options={[
                  { value: "light", label: t.themeLight },
                  { value: "dark", label: t.themeDark },
                ]}
                value={theme}
                onChange={setTheme}
              />
            </div>
          </div>
        </nav>

        <div className="hero-grid">
          <section className="hero-copy">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>{t.heroTitle}</h1>
            <p className="hero-text">{t.heroText}</p>
            <div className="hero-actions">
              <a className="primary-button" href="#workspace">
                {t.heroPrimary}
              </a>
              <a className="ghost-button" href="#product">
                {t.heroSecondary}
              </a>
            </div>
            <div className="hero-metrics">
              <Metric value={t.metricTypesValue} label={t.metricTypesLabel} />
              <Metric value={t.metricModulesValue} label={t.metricModulesLabel} />
              <Metric value={t.metricLoginValue} label={t.metricLoginLabel} />
            </div>
          </section>

          <section className="hero-preview">
            <div className="glass-card preview-panel">
              <span className="panel-badge">{t.exampleBadge}</span>
              <h2>{t.exampleTitle}</h2>
              <p>{t.exampleText}</p>
              <ul className="preview-modules">
                <li>{t.previewItem1}</li>
                <li>{t.previewItem2}</li>
                <li>{t.previewItem3}</li>
                <li>{t.previewItem4}</li>
              </ul>
            </div>
          </section>
        </div>
      </header>

      <main>
        <section className="feature-strip" id="product">
          {featureCards.map((card) => (
            <article className="glass-card feature-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </section>

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

        <section className="result-section">
          <div className="result-head">
            <div>
              <p className="eyebrow">{t.resultEyebrow}</p>
              <h2>{t.resultTitle}</h2>
            </div>
          </div>

          {course ? <CourseView course={course} t={t} /> : <EmptyCourseState t={t} />}
        </section>
      </main>
    </div>
  );
}

function CourseView({ course, t }) {
  return (
    <div className="course-layout">
      <div className="glass-card course-summary">
        <span className="panel-badge">{t.overview}</span>
        <h3>{course.title}</h3>
        <p>{course.summary}</p>

        <div className="summary-grid">
          <ListBlock title={t.takeaways} items={course.takeaways} />
          <ListBlock title={t.nextSteps} items={course.next_steps} />
        </div>
      </div>

      <div className="course-main">
        <div className="module-list">
          {course.modules.map((module, index) => (
            <article className="glass-card module-card" key={`${module.title}-${index}`}>
              <div className="module-number">{t.modulePrefix} {index + 1}</div>
              <h3>{module.title}</h3>
              <p className="module-goal">{module.goal}</p>
              <p>{module.content}</p>
              <ListBlock title={t.keyPoints} items={module.key_points} />
            </article>
          ))}
        </div>
      </div>

      <aside className="course-sidebar">
        <div className="glass-card source-card">
          <h3>{t.sourcesTitle}</h3>
          <div className="source-list">
            {course.sources.map((source) => (
              <div className="source-item" key={source.url}>
                <span className={`source-kind ${source.kind}`}>{source.kind}</span>
                <strong>{source.title}</strong>
                <p>{source.excerpt}</p>
                <a href={source.url} rel="noreferrer" target="_blank">
                  {t.openSource}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card warning-card">
          <h3>{t.warningsTitle}</h3>
          {course.warnings.length === 0 ? (
            <p className="muted-text">{t.noWarnings}</p>
          ) : (
            <ul className="plain-list">
              {course.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

function EmptyCourseState({ t }) {
  return (
    <div className="glass-card empty-result">
      <h3>{t.emptyCourseTitle}</h3>
      <p>{t.emptyCourseText}</p>
    </div>
  );
}

function ListBlock({ title, items }) {
  return (
    <div>
      <h4>{title}</h4>
      <ul className="plain-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ value, label }) {
  return (
    <div className="metric-pill">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ToggleGroup({ label, options, value, onChange }) {
  return (
    <div className="toggle-group" aria-label={label}>
      <span className="toggle-label">{label}</span>
      <div className="toggle-options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`toggle-chip ${value === option.value ? "is-active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
