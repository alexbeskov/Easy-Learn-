export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
export const HISTORY_KEY = "easy-learn-history";
export const LANGUAGE_KEY = "easy-learn-language";
export const THEME_KEY = "easy-learn-theme";

export const sampleLinks = [
  "https://www.youtube.com/watch?v=3fumBcKC6RE",
  "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_is_JavaScript",
];

export const emptyForm = {
  topic: "",
  urls: sampleLinks.join("\n"),
};
