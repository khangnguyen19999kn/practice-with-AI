import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  ChevronDown,
  CircleAlert,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DIFFICULTIES } from "../constants";
import { getDifficultyKey, localizeQuestion } from "../i18n/question";
import { downloadQuestions, importQuestions } from "../lib/questionStore";
import type { Language, Question } from "../types";

type QuestionLibraryProps = {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
};

export default function QuestionLibrary({
  questions,
  onQuestionsChange,
}: QuestionLibraryProps) {
  const { t, i18n } = useTranslation();
  const language: Language = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const fileInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("__all__");
  const [difficulty, setDifficulty] = useState("__all__");
  const [openAnswers, setOpenAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    key: string;
    count?: number;
  } | null>(null);
  const topics = [...new Set(questions.map((question) => question.topic))];
  const visibleQuestions = questions.filter((question) => {
    const query = search.trim().toLocaleLowerCase();
    const localized = localizeQuestion(question, language);
    const matchesSearch =
      !query ||
      `${question.topic} ${localized.question} ${localized.answer} ${localized.tags.join(" ")}`
        .toLocaleLowerCase()
        .includes(query);
    return (
      matchesSearch &&
      (topic === "__all__" || question.topic === topic) &&
      (difficulty === "__all__" || question.difficulty === difficulty)
    );
  });

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    }

    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  async function handleImport(file?: File) {
    if (!file) return;
    try {
      const nextQuestions = await importQuestions(file);
      onQuestionsChange(nextQuestions);
      setFeedback({
        key: "library.importComplete",
        count: nextQuestions.length,
      });
    } catch (error) {
      setFeedback({
        key:
          error instanceof Error && error.message.startsWith("library.errors.")
            ? error.message
            : "common.unknownError",
      });
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> {t("library.eyebrow")}
          </div>
          <h1>
            {t("library.titleStart")} <span>{t("library.titleAccent")}</span>
          </h1>
          <p className="page-subtitle">{t("library.subtitle")}</p>
        </div>
        <div className="heading-actions">
          <button
            className="button button-secondary"
            onClick={() => downloadQuestions(questions)}
          >
            <ArrowDownToLine size={16} /> {t("library.export")}
          </button>
          <button
            className="button button-primary"
            onClick={() => fileInput.current?.click()}
          >
            <ArrowUpFromLine size={16} /> {t("library.import")}
          </button>
          <input
            ref={fileInput}
            className="visually-hidden"
            type="file"
            accept=".json,application/json"
            aria-label={t("library.import")}
            onChange={(event) => void handleImport(event.target.files?.[0])}
          />
        </div>
      </div>

      <section className="stats-row" aria-label={t("library.bankTitle")}>
        <div className="stat-block">
          <span className="stat-number">
            {questions.length.toString().padStart(2, "0")}
          </span>
          <span className="stat-label">{t("library.questionCount")}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-block">
          <span className="stat-number">{topics.length}</span>
          <span className="stat-label">{t("library.topicCount")}</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-block">
          <span className="stat-number">
            {new Set(questions.map((question) => question.difficulty)).size}
          </span>
          <span className="stat-label">{t("library.levelCount")}</span>
        </div>
        <div className="stat-spacer" />
        <div className="stat-caption">
          <span className="stat-spark">✳</span> {t("library.encouragement")}
        </div>
      </section>

      <section className="library-section">
        <div className="section-title-row">
          <div>
            <h2>{t("library.bankTitle")}</h2>
            <p>
              {t("library.matchingQuestions", {
                count: visibleQuestions.length,
              })}
            </p>
          </div>
          <div className="filter-group">
            <label className="select-wrap">
              <SlidersHorizontal size={15} />
              <select
                aria-label={t("library.allTopics")}
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
              >
                <option value="__all__">{t("library.allTopics")}</option>
                {topics.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>
            <label className="select-wrap difficulty-select">
              <select
                aria-label={t("library.allLevels")}
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
              >
                <option value="__all__">{t("library.allLevels")}</option>
                {DIFFICULTIES.map((item) => (
                  <option key={item} value={item}>
                    {t(getDifficultyKey(item))}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
        </div>

        <label className="search-field">
          <Search size={17} />
          <input
            ref={searchInput}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("library.searchPlaceholder")}
          />
          <kbd>⌘ K</kbd>
        </label>

        {feedback && (
          <div className="inline-feedback" role="status">
            <CircleAlert size={15} />
            {t(
              feedback.key,
              feedback.count === undefined
                ? undefined
                : { count: feedback.count },
            )}
            <button
              onClick={() => setFeedback(null)}
              aria-label={t("library.dismiss")}
            >
              ×
            </button>
          </div>
        )}

        <div className="question-list">
          {visibleQuestions.length ? (
            visibleQuestions.map((question, index) => {
              const expanded = openAnswers.includes(question.id);
              const localized = localizeQuestion(question, language);
              return (
                <article
                  className={`question-row ${expanded ? "expanded" : ""}`}
                  key={question.id}
                >
                  <span className="question-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="question-main">
                    <div className="question-meta">
                      <span className="category-label">{question.topic}</span>
                      <span
                        className={`level-label level-${question.difficulty.toLocaleLowerCase()}`}
                      >
                        {t(getDifficultyKey(question.difficulty))}
                      </span>
                    </div>
                    <h3>{localized.question}</h3>
                    {expanded && (
                      <div className="answer-content">
                        <div className="answer-label">
                          <Check size={14} /> {t("library.answerHint")}
                        </div>
                        <p>{localized.answer}</p>
                      </div>
                    )}
                    <div className="tag-list">
                      {localized.tags.map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    className="answer-toggle"
                    onClick={() =>
                      setOpenAnswers((current) =>
                        expanded
                          ? current.filter((id) => id !== question.id)
                          : [...current, question.id],
                      )
                    }
                    aria-expanded={expanded}
                  >
                    {expanded ? t("library.collapse") : t("library.showAnswer")}
                    <ChevronDown size={15} />
                  </button>
                </article>
              );
            })
          ) : (
            <div className="empty-state">{t("library.noMatch")}</div>
          )}
        </div>
      </section>
    </main>
  );
}
