import { ArrowLeft, Check, RotateCcw, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PASSING_SCORE_THRESHOLD } from "../constants";
import { getDifficultyKey, localizeQuestion } from "../i18n/question";
import type { InterviewSession, Language } from "../types";

type InterviewResultsProps = {
  session: InterviewSession;
  onStartNew: () => void;
  onExit: () => void;
};

export default function InterviewResults({
  session,
  onStartNew,
  onExit,
}: InterviewResultsProps) {
  const { t } = useTranslation();
  const language: Language = session.language;
  const evaluation = session.evaluation!;

  return (
    <main className="page-content results-page">
      <div className="page-heading results-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> {t("interview.resultsEyebrow")}
          </div>
          <h1>
            {t("interview.resultsTitleStart")}{" "}
            <span>{t("interview.resultsTitleAccent")}</span>
          </h1>
          <p className="page-subtitle">
            {session.options.role} · {session.questions.length}{" "}
            {t("interview.questionsCompleted")}
          </p>
        </div>
        <button className="button button-secondary" onClick={onExit}>
          <ArrowLeft size={15} /> {t("interview.backToSetup")}
        </button>
      </div>
      <section className={`score-summary ${evaluation.verdict}`}>
        <div className="score-ring">
          <strong>{evaluation.overallScore}</strong>
          <span>/ 100</span>
        </div>
        <div className="score-copy">
          <span className={`verdict-label ${evaluation.verdict}`}>
            {evaluation.verdict === "pass" ? (
              <Check size={14} />
            ) : (
              <X size={14} />
            )}
            {t(
              evaluation.verdict === "pass"
                ? "interview.pass"
                : "interview.fail",
            )}
          </span>
          <h2>{evaluation.summary}</h2>
          <p>
            {t("interview.passThreshold", { score: PASSING_SCORE_THRESHOLD })}
          </p>
        </div>
      </section>
      <div className="evaluation-columns">
        <section className="evaluation-section">
          <h2>{t("interview.overallStrengths")}</h2>
          <ul>
            {evaluation.strengths.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="evaluation-section">
          <h2>{t("interview.overallImprovements")}</h2>
          <ul>
            {evaluation.improvements.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
      <section className="answer-review-section">
        <div className="section-title-row">
          <div>
            <h2>{t("interview.answerReview")}</h2>
            <p>{t("interview.answerReviewDescription")}</p>
          </div>
        </div>
        <div className="answer-review-list">
          {session.questions.map((question, index) => {
            const result = evaluation.results.find(
              (item) => item.questionId === question.id,
            )!;
            const localized = localizeQuestion(question, language);
            const passed = result.score >= PASSING_SCORE_THRESHOLD;
            return (
              <article className="answer-review-item" key={question.id}>
                <div className="review-question-heading">
                  <span className="question-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="question-meta">
                      <span className="category-label">{question.topic}</span>
                      <span
                        className={`level-label level-${question.difficulty.toLocaleLowerCase()}`}
                      >
                        {t(getDifficultyKey(question.difficulty))}
                      </span>
                    </div>
                    <h3>{localized.question}</h3>
                  </div>
                  <span className={`verdict-label ${passed ? "pass" : "fail"}`}>
                    {passed ? <Check size={13} /> : <X size={13} />}
                    {t(passed ? "interview.pass" : "interview.fail")} ·{" "}
                    {result.score}
                  </span>
                </div>
                <div className="answer-review-body">
                  <div>
                    <span className="review-label">
                      {t("interview.yourAnswer")}
                    </span>
                    <p>{session.answers[index]}</p>
                  </div>
                  <div>
                    <span className="review-label">
                      {t("interview.feedback")}
                    </span>
                    <p>{result.feedback}</p>
                  </div>
                </div>
                <div className="evaluation-columns question-evaluation-columns">
                  <div>
                    <h4>{t("interview.questionStrengths")}</h4>
                    <ul>
                      {result.strengths.map((item, itemIndex) => (
                        <li key={`${itemIndex}-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>{t("interview.questionImprovements")}</h4>
                    <ul>
                      {result.improvements.map((item, itemIndex) => (
                        <li key={`${itemIndex}-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <div className="results-actions">
        <button className="button button-secondary" onClick={onExit}>
          <ArrowLeft size={15} /> {t("interview.backToSetup")}
        </button>
        <button className="button button-primary" onClick={onStartNew}>
          <RotateCcw size={15} /> {t("interview.startNew")}
        </button>
      </div>
    </main>
  );
}
