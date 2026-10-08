import { LoaderCircle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

type GeminiLoadingOverlayProps = {
  titleKey: string;
  messageKey: string;
};

export default function GeminiLoadingOverlay({
  titleKey,
  messageKey,
}: GeminiLoadingOverlayProps) {
  const { t } = useTranslation();

  return (
    <div className="gemini-loading-overlay">
      <section
        className="gemini-loading-panel"
        role="status"
        aria-live="polite"
      >
        <span className="gemini-loading-mark">
          <Sparkles size={18} />
          <LoaderCircle size={34} className="gemini-loading-spinner" />
        </span>
        <span className="gemini-loading-label">GEMINI AI</span>
        <h2>{t(titleKey)}</h2>
        <p>{t(messageKey)}</p>
        <span className="gemini-loading-progress">
          <i />
          <i />
          <i />
        </span>
      </section>
    </div>
  );
}
