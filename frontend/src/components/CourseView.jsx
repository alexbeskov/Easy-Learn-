import { ListBlock } from "./Common";

export function CourseView({ course, t }) {
  if (!course) {
    return (
      <div className="glass-card empty-result">
        <h3>{t.emptyCourseTitle}</h3>
        <p>{t.emptyCourseText}</p>
      </div>
    );
  }

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
            {course.sources.map((source, index) => (
              <div className="source-item" key={`${source.url}-${index}`}>
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
              {course.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
