import { startTransition, useEffect, useMemo, useState } from "react";
import { translations } from "./translations";
import {
  API_BASE_URL,
  HISTORY_KEY,
  LANGUAGE_KEY,
  THEME_KEY,
  emptyForm,
} from "./constants";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Workspace } from "./components/Workspace";
import { CourseView } from "./components/CourseView";

function App() {
  const [language, setLanguage] = useState(
    () => window.localStorage.getItem(LANGUAGE_KEY) || "ru"
  );
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem(THEME_KEY) || "light"
  );
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [course, setCourse] = useState(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const t = translations[language] || translations.en;

  useEffect(() => {
    const stored = window.localStorage.getItem(HISTORY_KEY);
    if (!stored) return;

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
      { title: t.feature1Title, text: t.feature1Text },
      { title: t.feature2Title, text: t.feature2Text },
      { title: t.feature3Title, text: t.feature3Text },
    ],
    [t]
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
        if (response.status === 429) {
          throw new Error("Too many requests. Please try again later.");
        }
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
        <Header
          t={t}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
        />
        <Hero t={t} />
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

        <Workspace
          t={t}
          form={form}
          setForm={setForm}
          handleSubmit={handleSubmit}
          status={status}
          error={error}
          parsedUrls={parsedUrls}
          history={history}
          selectedHistoryId={selectedHistoryId}
          loadHistoryItem={loadHistoryItem}
          clearHistory={clearHistory}
        />

        <section className="result-section">
          <div className="result-head">
            <div>
              <p className="eyebrow">{t.resultEyebrow}</p>
              <h2>{t.resultTitle}</h2>
            </div>
          </div>
          <CourseView course={course} t={t} />
        </section>
      </main>
    </div>
  );
}

export default App;
