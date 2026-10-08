import {
  BookOpen,
  Bot,
  BriefcaseBusiness,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { APP_NAME } from "../constants";
import type { ViewName } from "../types";

type SidebarProps = {
  activeView: ViewName;
  onChangeView: (view: ViewName) => void;
};

export default function Sidebar({ activeView, onChangeView }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="sidebar">
      <a className="brand" href="#home" aria-label={APP_NAME}>
        <span className="brand-mark">
          <Sparkles size={20} strokeWidth={2.2} />
        </span>
        <span className="brand-name">
          practice<span>studio</span>
        </span>
      </a>

      <div className="workspace-label">
        {t("common.workspace").toLocaleUpperCase()}
      </div>
      <nav className="primary-nav" aria-label={t("common.workspace")}>
        <button
          className={`nav-item ${activeView === "questions" ? "active" : ""}`}
          aria-label={t("common.questions")}
          onClick={() => onChangeView("questions")}
        >
          <BookOpen size={18} />
          <span>{t("common.questions")}</span>
          <ChevronRight className="nav-chevron" size={15} />
        </button>
        <button
          className={`nav-item ${activeView === "interview" ? "active" : ""}`}
          aria-label={t("common.mockInterview")}
          onClick={() => onChangeView("interview")}
        >
          <Bot size={18} />
          <span>{t("common.mockInterview")}</span>
          <ChevronRight className="nav-chevron" size={15} />
        </button>
      </nav>

      <div className="sidebar-note">
        <div className="note-icon">
          <BriefcaseBusiness size={17} />
        </div>
        <p>{t("common.nextOpportunity")}</p>
        <button onClick={() => onChangeView("interview")}>
          {t("common.startPractice")} <span>↗</span>
        </button>
      </div>
      <div className="sidebar-footer">
        <span className="status-dot" /> {t("common.localOnly")}
      </div>
    </aside>
  );
}
