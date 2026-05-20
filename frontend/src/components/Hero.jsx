import { Metric } from "./Common";

export function Hero({ t }) {
  return (
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
  );
}
