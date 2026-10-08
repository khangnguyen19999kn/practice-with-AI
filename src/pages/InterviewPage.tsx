import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InterviewResults from "../components/InterviewResults";
import InterviewRoom from "../components/InterviewRoom";
import InterviewSetup from "../components/InterviewSetup";
import {
  clearInterviewSession,
  loadInterviewSession,
  saveInterviewSession,
} from "../lib/interviewSessionStore";
import {
  evaluateInterview,
  generateInterviewQuestionSet,
} from "../services/gemini";
import type {
  InterviewOptions,
  InterviewSession,
  Language,
  Question,
} from "../types";

type InterviewPageProps = {
  questions: Question[];
};

export default function InterviewPage({ questions }: InterviewPageProps) {
  const { i18n } = useTranslation();
  const language: Language = i18n.resolvedLanguage === "vi" ? "vi" : "en";
  const [session, setSession] = useState<InterviewSession | null>(
    loadInterviewSession,
  );
  const [view, setView] = useState<"setup" | "session">(
    session ? "session" : "setup",
  );
  const [generating, setGenerating] = useState(false);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState("");
  const availableTopics = [
    ...new Set(questions.map((question) => question.topic)),
  ];

  useEffect(() => {
    if (session) saveInterviewSession(session);
    else clearInterviewSession();
  }, [session]);

  async function start(options: InterviewOptions, duration: string) {
    setError("");
    setGenerating(true);
    try {
      const generatedQuestions = await generateInterviewQuestionSet(
        options,
        questions,
        duration,
        language,
      );
      const nextSession: InterviewSession = {
        id: crypto.randomUUID(),
        options: {
          role: options.role,
          level: options.level,
          focus: options.focus,
          topics: options.topics,
        },
        language,
        duration,
        questions: generatedQuestions,
        answers: generatedQuestions.map(() => ""),
        currentIndex: 0,
        evaluation: null,
        updatedAt: new Date().toISOString(),
      };
      setSession(nextSession);
      setView("session");
    } catch (problem) {
      setError(
        problem instanceof Error && problem.message.startsWith("errors.")
          ? problem.message
          : "errors.questionGenerationFailed",
      );
    } finally {
      setGenerating(false);
    }
  }

  function updateAnswer(answer: string) {
    setSession((current) => {
      if (!current || current.evaluation) return current;
      const answers = [...current.answers];
      answers[current.currentIndex] = answer;
      return { ...current, answers, updatedAt: new Date().toISOString() };
    });
    setError("");
  }

  async function submitAnswer() {
    if (!session || grading) return;
    const answers = [...session.answers];
    answers[session.currentIndex] = answers[session.currentIndex].trim();
    if (!answers[session.currentIndex]) {
      setError("errors.answerRequired");
      return;
    }

    if (session.currentIndex < session.questions.length - 1) {
      setSession({
        ...session,
        answers,
        currentIndex: session.currentIndex + 1,
        updatedAt: new Date().toISOString(),
      });
      setError("");
      return;
    }

    setSession({ ...session, answers, updatedAt: new Date().toISOString() });
    setError("");
    setGrading(true);
    try {
      const evaluation = await evaluateInterview(
        session.questions,
        answers,
        session.options.role,
        session.options.level,
        session.language,
      );
      setSession({
        ...session,
        answers,
        evaluation,
        updatedAt: new Date().toISOString(),
      });
    } catch (problem) {
      setError(
        problem instanceof Error && problem.message.startsWith("errors.")
          ? problem.message
          : "errors.evaluationFailed",
      );
    } finally {
      setGrading(false);
    }
  }

  function exitToSetup() {
    setView("setup");
    setError("");
  }

  function startNewInterview() {
    setSession(null);
    setView("setup");
    setError("");
  }

  if (view === "session" && session?.evaluation) {
    return (
      <InterviewResults
        session={session}
        onStartNew={startNewInterview}
        onExit={exitToSetup}
      />
    );
  }

  if (view === "session" && session) {
    const question = session.questions[session.currentIndex];
    return (
      <InterviewRoom
        question={question}
        options={session.options}
        duration={session.duration}
        questionNumber={session.currentIndex + 1}
        totalQuestions={session.questions.length}
        answer={session.answers[session.currentIndex] ?? ""}
        loading={grading}
        error={error}
        onAnswerChange={updateAnswer}
        onSubmit={() => void submitAnswer()}
        onEnd={exitToSetup}
      />
    );
  }

  return (
    <InterviewSetup
      availableTopics={availableTopics}
      loading={generating}
      error={error}
      savedSession={session}
      onStart={(options, duration) => void start(options, duration)}
      onContinue={() => {
        setView("session");
        setError("");
      }}
      onDiscard={startNewInterview}
    />
  );
}
