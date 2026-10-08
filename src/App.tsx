import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import QuestionLibrary from "./components/QuestionLibrary";
import Sidebar from "./components/Sidebar";
import { setAppLanguage } from "./i18n";
import { getQuestions, saveQuestions } from "./lib/questionStore";
import InterviewPage from "./pages/InterviewPage";
import type { Language, Question, ViewName } from "./types";

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeView, setActiveView] = useState<ViewName>("questions");
  const [questions, setQuestions] = useState<Question[]>(getQuestions);
  const language: Language = i18n.resolvedLanguage === "vi" ? "vi" : "en";

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function updateQuestions(nextQuestions: Question[]) {
    setQuestions(nextQuestions);
    saveQuestions(nextQuestions);
  }

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onChangeView={setActiveView} />
      <div className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">
            <span>{t("common.workspace")}</span>
            <span className="breadcrumb-slash">/</span>
            <strong>
              {activeView === "questions"
                ? t("common.questions")
                : t("common.mockInterview")}
            </strong>
          </div>
          <div className="topbar-right">
            <label className="language-control">
              <span className="visually-hidden">{t("common.language")}</span>
              <select
                className="language-select"
                value={language}
                onChange={(event) =>
                  setAppLanguage(event.target.value as Language)
                }
              >
                <option value="en">EN</option>
                <option value="vi">VI</option>
              </select>
            </label>
            <span className="date-display">
              <CalendarDays size={15} />{" "}
              {new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }).format(new Date())}
            </span>
            <span
              className="profile-button"
              aria-label={t("common.personalAccount")}
            >
              <span className="profile-avatar">K</span>
            </span>
          </div>
        </header>
        {activeView === "questions" ? (
          <QuestionLibrary
            questions={questions}
            onQuestionsChange={updateQuestions}
          />
        ) : (
          <InterviewPage questions={questions} />
        )}
        <footer className="app-footer">
          <span>
            PRACTICE STUDIO <b>·</b> {t("common.footerLabel")}
          </span>
          <span>
            {t("common.footerTagline")} <i>↗</i>
          </span>
        </footer>
      </div>
    </div>
  );
}
