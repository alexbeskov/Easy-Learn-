import { startTransition, useEffect, useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const HISTORY_KEY = "easy-learn-history";

const featureCards = [
  {
    title: "Scatter to structure",
    text: "Drop in YouTube videos and article links, then get one coherent learning path instead of a chaotic reading list.",
  },
  {
    title: "Mini-course output",
    text: "Each generation returns a guided course with modules, takeaways, and next steps that are easy to follow.",
  },
  {
    title: "No account friction",
    text: "The MVP works instantly without registration and keeps recent generations in your browser history.",
  },
];

const sampleLinks = [
  "https://www.youtube.com/watch?v=3fumBcKC6RE",
  "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_is_JavaScript",
];

const emptyForm = {
  topic: "",
  urls: sampleLinks.join("\n"),
};

function App() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [course, setCourse] = useState(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

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

  const parsedUrls = useMemo(() => {
    return form.urls
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }, [form.urls]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (parsedUrls.length === 0) {
      setError("Add at least one YouTube or article URL.");
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
        throw new Error("Course generation failed. Please review your links and try again.");
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
      setError(submitError.message || "Unexpected error");
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
          <div className="topbar-links">
            <a href="#product">Product</a>
            <a href="#workspace">Workspace</a>
          </div>
        </nav>

        <div className="hero-grid">
          <section className="hero-copy">
            <p className="eyebrow">Learning, remixed</p>
            <h1>Turn scattered links into one learning path that actually feels teachable.</h1>
            <p className="hero-text">
              Easy Learn collects YouTube videos and articles, then shapes them into a structured
              mini-course with modules, takeaways, and next steps for self-learners.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#workspace">
                Build a course
              </a>
              <a className="ghost-button" href="#product">
                See how it works
              </a>
            </div>
            <div className="hero-metrics">
              <Metric value="2 types" label="YouTube + articles" />
              <Metric value="3-7" label="modules per course" />
              <Metric value="0 login" label="start instantly" />
            </div>
          </section>

          <section className="hero-preview">
            <div className="glass-card preview-panel">
              <span className="panel-badge">Example output</span>
              <h2>AI Coding Fundamentals</h2>
              <p>
                A mini-course built from a YouTube tutorial and two practical articles, ready for a
                focused study session.
              </p>
              <ul className="preview-modules">
                <li>Orientation and tooling</li>
                <li>Core prompting patterns</li>
                <li>Hands-on implementation workflow</li>
                <li>Practice roadmap</li>
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
              <p className="eyebrow">Workspace</p>
              <h2>Generate a mini-course from your learning sources</h2>
            </div>
            <p className="workspace-note">
              Add one link per line. The backend will combine supported sources and return a
              structured course.
            </p>
          </div>

          <div className="workspace-grid">
            <div className="glass-card builder-card">
              <form onSubmit={handleSubmit}>
                <label className="field-label" htmlFor="topic">
                  Optional topic
                </label>
                <input
                  id="topic"
                  className="text-input"
                  placeholder="Example: Intro to product marketing"
                  value={form.topic}
                  onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
                />

                <label className="field-label" htmlFor="urls">
                  Source URLs
                </label>
                <textarea
                  id="urls"
                  className="text-area"
                  rows="8"
                  placeholder="Paste YouTube or article links, one per line"
                  value={form.urls}
                  onChange={(event) => setForm((current) => ({ ...current, urls: event.target.value }))}
                />

                <div className="source-counter">
                  <span>{parsedUrls.length} source(s) ready</span>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setForm(emptyForm)}
                  >
                    Load sample
                  </button>
                </div>

                {error ? <p className="error-text">{error}</p> : null}

                <button className="primary-button full-width" disabled={status === "loading"} type="submit">
                  {status === "loading" ? "Generating course..." : "Generate mini-course"}
                </button>
              </form>
            </div>

            <div className="workspace-side">
              <div className="glass-card history-card">
                <div className="history-head">
                  <h3>Recent generations</h3>
                  {history.length > 0 ? (
                    <button className="link-button" onClick={clearHistory} type="button">
                      Clear
                    </button>
                  ) : null}
                </div>
                {history.length === 0 ? (
                  <p className="muted-text">Your latest generated courses will appear here.</p>
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
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card status-card">
                <h3>Generation status</h3>
                <p className="status-pill">{status === "loading" ? "Processing sources" : "Ready"}</p>
                <p className="muted-text">
                  If Polza AI is unavailable, the backend still returns a fallback mini-course so the
                  flow stays usable during MVP testing.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="result-section">
          <div className="result-head">
            <div>
              <p className="eyebrow">Result</p>
              <h2>Your structured mini-course</h2>
            </div>
          </div>

          {course ? <CourseView course={course} /> : <EmptyCourseState />}
        </section>
      </main>
    </div>
  );
}

function CourseView({ course }) {
  return (
    <div className="course-layout">
      <div className="glass-card course-summary">
        <span className="panel-badge">Overview</span>
        <h3>{course.title}</h3>
        <p>{course.summary}</p>

        <div className="summary-grid">
          <ListBlock title="Takeaways" items={course.takeaways} />
          <ListBlock title="Next steps" items={course.next_steps} />
        </div>
      </div>

      <div className="course-main">
        <div className="module-list">
          {course.modules.map((module, index) => (
            <article className="glass-card module-card" key={`${module.title}-${index}`}>
              <div className="module-number">Module {index + 1}</div>
              <h3>{module.title}</h3>
              <p className="module-goal">{module.goal}</p>
              <p>{module.content}</p>
              <ListBlock title="Key points" items={module.key_points} />
            </article>
          ))}
        </div>
      </div>

      <aside className="course-sidebar">
        <div className="glass-card source-card">
          <h3>Sources</h3>
          <div className="source-list">
            {course.sources.map((source) => (
              <div className="source-item" key={source.url}>
                <span className={`source-kind ${source.kind}`}>{source.kind}</span>
                <strong>{source.title}</strong>
                <p>{source.excerpt}</p>
                <a href={source.url} rel="noreferrer" target="_blank">
                  Open source
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card warning-card">
          <h3>Warnings</h3>
          {course.warnings.length === 0 ? (
            <p className="muted-text">No issues detected for this generation.</p>
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

function EmptyCourseState() {
  return (
    <div className="glass-card empty-result">
      <h3>No course yet</h3>
      <p>
        Start by pasting a few YouTube or article links into the workspace. Your generated
        mini-course will appear here with modules, sources, and next steps.
      </p>
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

export default App;
