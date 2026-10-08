import { MAX_RESUME_CHARACTERS } from "../constants";

export async function extractResumeText(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  let text: string;

  if (extension === "pdf") {
    const [{ getDocument, GlobalWorkerOptions }, { default: workerUrl }] =
      await Promise.all([
        import("pdfjs-dist"),
        import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
      ]);
    GlobalWorkerOptions.workerSrc = workerUrl;
    const document = await getDocument({ data: await file.arrayBuffer() })
      .promise;
    const pages = await Promise.all(
      Array.from({ length: document.numPages }, async (_, index) => {
        const page = await document.getPage(index + 1);
        const content = await page.getTextContent();
        return content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
      }),
    );
    text = pages.join("\n");
  } else if (extension === "txt" || extension === "md") {
    text = await file.text();
  } else {
    throw new Error("errors.resumeUnsupported");
  }

  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) throw new Error("errors.resumeEmpty");
  return normalized.slice(0, MAX_RESUME_CHARACTERS);
}
