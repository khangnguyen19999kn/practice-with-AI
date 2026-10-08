import {
  ArrowRight,
  FileText,
  LoaderCircle,
  Play,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_INTERVIEW_LENGTH,
  DEFAULT_ROLE,
  DIFFICULTIES,
  INTERVIEW_LENGTHS,
  MAX_JOB_DESCRIPTION_CHARACTERS,
} from "../constants";
import { getDifficultyKey } from "../i18n/question";
import { extractResumeText } from "../lib/resume";
import type { Difficulty, InterviewOptions, InterviewSession } from "../types";
import GeminiLoadingOverlay from "./GeminiLoadingOverlay";

type InterviewSetupProps = {
  availableTopics: string[];
  loading: boolean;
  error: string;
  savedSession: InterviewSession | null;
  onStart: (options: InterviewOptions, duration: string) => void;
  onContinue: () => void;
  onDiscard: () => void;
};

export default function InterviewSetup({
  availableTopics,
  loading,
  error,
  savedSession,
  onStart,
  onContinue,
  onDiscard,
}: InterviewSetupProps) {
  const { t } = useTranslation();
  const fileInput = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState(DEFAULT_ROLE);
  const [jobDescription, setJobDescription] = useState("");
  const [level, setLevel] = useState<Difficulty>("Middle");
  const [focus, setFocus] = useState("general");
  const [selectedTopics, setSelectedTopics] =
    useState<string[]>(availableTopics);
  const [duration, setDuration] = useState(DEFAULT_INTERVIEW_LENGTH);
  const [resume, setResume] = useState<{ name: string; text: string } | null>(
    null,
  );
  const [loadingFile, setLoadingFile] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleResume(file?: File) {
    if (!file) return;
    setFormError("");
    setLoadingFile(true);
    try {
      const text = await extractResumeText(file);
      setResume({ name: file.name, text });
    } catch (problem) {
      setFormError(
        problem instanceof Error && problem.message.startsWith("errors.")
          ? problem.message
          : "errors.resumeReadFailed",
      );
    } finally {
      setLoadingFile(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function startInterview() {
    setFormError("");
    if (selectedTopics.length === 0 && !jobDescription.trim()) {
      setFormError("errors.selectTopicOrJob");
      return;
    }
    onStart(
      {
        role: role.trim() || DEFAULT_ROLE,
        level,
        focus,
        topics: selectedTopics,
        jobDescription: jobDescription.trim(),
        resumeText: resume?.text ?? "",
        resumeName: resume?.name ?? "",
      },
      duration,
    );
  }

  return (
    <main className="page-content interview-setup-page" aria-busy={loading}>
      {loading && (
        <GeminiLoadingOverlay
          titleKey="interview.generatingOverlayTitle"
          messageKey="interview.generatingOverlayBody"
        />
      )}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> {t("interview.setupEyebrow")}
          </div>
          <h1>
            {t("interview.setupTitleStart")}{" "}
            <span>{t("interview.setupTitleAccent")}</span>
          </h1>
          <p className="page-subtitle">{t("interview.subtitle")}</p>
        </div>
        <div className="ai-status">
          <span className="status-dot" /> {t("interview.aiStatus")}
        </div>
      </div>

      {savedSession && (
        <section className="saved-session-strip">
          <div>
            <strong>
              {t(
                savedSession.evaluation
                  ? "interview.savedResults"
                  : "interview.savedSession",
              )}
            </strong>
            <p>
              {t("interview.savedSessionMeta", {
                role: savedSession.options.role,
                current: Math.min(
                  savedSession.currentIndex + 1,
                  savedSession.questions.length,
                ),
                total: savedSession.questions.length,
              })}
            </p>
          </div>
          <div className="saved-session-actions">
            <button className="button button-primary" onClick={onContinue}>
              <Play size={15} />{" "}
              {t(
                savedSession.evaluation
                  ? "interview.viewSavedResults"
                  : "interview.continueSaved",
              )}
            </button>
            <button
              className="icon-button"
              onClick={onDiscard}
              aria-label={t("interview.discardSaved")}
              title={t("interview.discardSaved")}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </section>
      )}

      <section className="setup-layout">
        <div className="setup-form">
          <div className="form-section-heading">
            <span className="step-number">01</span>
            <div>
              <h2>{t("interview.setupHeading")}</h2>
              <p>{t("interview.setupDescription")}</p>
            </div>
          </div>
          <label className="field-label" htmlFor="role">
            {t("interview.role")}
          </label>
          <input
            id="role"
            className="text-input"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder={t("interview.rolePlaceholder")}
          />
          <label
            className="field-label job-description-label"
            htmlFor="job-description"
          >
            {t("interview.jobDescription")}{" "}
            <span className="optional-label">{t("interview.optional")}</span>
          </label>
          <textarea
            id="job-description"
            className="text-input job-description-input"
            value={jobDescription}
            maxLength={MAX_JOB_DESCRIPTION_CHARACTERS}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder={t("interview.jobDescriptionPlaceholder")}
          />

          <div className="field-grid">
            <label className="field-label">
              {t("interview.level")}
              <select
                className="text-input"
                value={level}
                onChange={(event) => setLevel(event.target.value as Difficulty)}
              >
                {DIFFICULTIES.map((item) => (
                  <option key={item} value={item}>
                    {t(getDifficultyKey(item))}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-label">
              {t("interview.duration")}
              <select
                className="text-input"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              >
                {INTERVIEW_LENGTHS.map((item) => (
                  <option key={item} value={item}>
                    {t(`interview.duration${item}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="focus-fieldset">
            <legend className="field-label">{t("interview.focus")}</legend>
            <div className="focus-options">
              {[
                { value: "general", label: t("interview.focusGeneral") },
                { value: "technical", label: t("interview.focusTechnical") },
                { value: "behavioral", label: t("interview.focusBehavioral") },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`focus-option ${focus === option.value ? "selected" : ""}`}
                  onClick={() => setFocus(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="topics-fieldset">
            <legend className="field-label">{t("interview.topics")}</legend>
            <div className="topic-options">
              {availableTopics.map((topic) => (
                <label className="topic-option" key={topic}>
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic)}
                    onChange={() =>
                      setSelectedTopics((current) =>
                        current.includes(topic)
                          ? current.filter((item) => item !== topic)
                          : [...current, topic],
                      )
                    }
                  />
                  <span>{topic}</span>
                </label>
              ))}
            </div>
            <p className="topics-hint">{t("interview.topicsHint")}</p>
          </fieldset>

          <div className="resume-label-row">
            <span className="field-label">
              {t("interview.resume")}{" "}
              <span className="optional-label">{t("interview.optional")}</span>
            </span>
            {resume && (
              <button
                className="remove-resume"
                onClick={() => setResume(null)}
                aria-label={t("interview.removeResume")}
              >
                <X size={14} /> {t("interview.removeResume")}
              </button>
            )}
          </div>
          {resume ? (
            <div className="resume-file">
              <span className="file-icon">
                <FileText size={18} />
              </span>
              <span className="resume-file-name">
                {resume.name}
                <small>{t("interview.resumeExtracted")}</small>
              </span>
              <span className="file-ready">{t("interview.ready")}</span>
            </div>
          ) : (
            <button
              className="upload-zone"
              onClick={() => fileInput.current?.click()}
              disabled={loadingFile}
            >
              <span className="upload-icon">
                <Upload size={18} />
              </span>
              <span>
                <strong>
                  {loadingFile
                    ? t("interview.readingResume")
                    : t("interview.uploadResume")}
                </strong>
                <small>{t("interview.resumeLimit")}</small>
              </span>
              <span className="upload-browse">{t("interview.chooseFile")}</span>
              <input
                ref={fileInput}
                type="file"
                accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
                onChange={(event) => void handleResume(event.target.files?.[0])}
              />
            </button>
          )}
          {formError && (
            <p className="form-error" role="alert">
              {t(formError)}
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {t(error)}
            </p>
          )}
          <button
            className="button button-primary start-button"
            onClick={startInterview}
            disabled={loading || loadingFile}
          >
            {loading ? (
              <LoaderCircle size={17} className="spinner" />
            ) : (
              <Sparkles size={17} />
            )}{" "}
            {t(loading ? "interview.generatingQuestionSet" : "interview.start")}{" "}
            {!loading && <ArrowRight size={17} />}
          </button>
          <p className="privacy-note">{t("interview.privacy")}</p>
        </div>

        <aside className="setup-aside">
          <div className="aside-orbit orbit-one" />
          <div className="aside-orbit orbit-two" />
          <div className="aside-content">
            <span className="aside-spark">✳</span>
            <p className="aside-kicker">{t("interview.asideKicker")}</p>
            <h2>
              {t("interview.asideTitleStart")}{" "}
              <em>{t("interview.asideTitleAccent")}</em>{" "}
              {t("interview.asideTitleEnd")}
            </h2>
            <div className="aside-rule" />
            <p className="aside-description">
              {t("interview.asideDescription")}
            </p>
            <div className="aside-facts">
              <div>
                <span>01</span>
                <p>{t("interview.factRole")}</p>
              </div>
              <div>
                <span>02</span>
                <p>{t("interview.factResume")}</p>
              </div>
              <div>
                <span>03</span>
                <p>{t("interview.factFeedback")}</p>
              </div>
            </div>
          </div>
          <span className="aside-stamp">{t("interview.asideStamp")}</span>
        </aside>
      </section>
    </main>
  );
}
