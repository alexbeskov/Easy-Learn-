import { ToggleGroup } from "./Common";

export function Header({ t, language, setLanguage, theme, setTheme }) {
  return (
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
  );
}
