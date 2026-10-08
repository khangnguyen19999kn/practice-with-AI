# Practice Studio

A browser-only React app for browsing interview questions and practicing with Gemini. The interface defaults to English and can be switched to Vietnamese; the choice is saved in this browser. It does not use a backend; imported question banks and preferences stay in this browser, while interview prompts and an uploaded resume are sent directly to Google's Gemini API when you start a session.

## Run locally

```sh
npm install
npm run dev
```

Add your Gemini API key to `.env.local`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Restart Vite after changing the environment file. Vite exposes `VITE_` variables in the client bundle, so this key is visible to anyone who can use the app. Restrict the key in Google AI Studio / Google Cloud and do not deploy this frontend publicly with an unrestricted key. A production app that must keep the key secret needs a backend or a serverless proxy.

## Question bank

The starter bank is split into topic files in `src/data/`, such as `react-question.json` and `nodejs-question.json`. Vite loads every `*-question.json` file there; each file exports an array of question records. Import another JSON file from the question library; it must be a non-empty array with this shape:

```json
[
  {
    "id": "react-001",
    "topic": "React",
    "difficulty": "Middle",
    "tags": ["hooks"],
    "translations": {
      "en": {
        "question": "Interview question",
        "answer": "Suggested answer"
      },
      "vi": {
        "question": "Câu hỏi phỏng vấn",
        "answer": "Gợi ý trả lời"
      }
    }
  }
]
```

Accepted `difficulty` values are `Fresher`, `Junior`, `Middle`, and `Senior`. `topic`, `difficulty`, and `tags` are shared metadata; `translations.en` and `translations.vi` contain only the localized question and answer. Both language entries are included in exports. Older records using `category` or legacy Vietnamese difficulty values are normalized during import and migrated in browser storage. Imported records with an existing `id` replace that question; new IDs are added. Mock interviews use the selected topics to scope their knowledge base. The starter bank includes React, Node.js, JavaScript, TypeScript, AWS, K8s, GCP, SQL / Databases, web fundamentals, performance, behavioral, and system design topics.

## Mock interview

The interview uses two Gemini requests instead of sending a growing chat history:

1. At setup, send the selected topics and/or job description, role, level, resume text, and matching question-bank references once. Gemini returns a validated JSON question set with bilingual question/answer fields and a scoring rubric. The requested question count is 4, 8, or 12 for 15, 30, or 45 minutes.
2. Ask the generated questions one at a time in the browser and save each answer locally. After the last answer, send only the question set, rubrics, and answers to Gemini for one evaluation request. The report shows a score and pass/fail for each answer, plus overall strengths and areas to improve. The pass threshold is 70/100.

The active question set and answers are stored in this browser's localStorage so an in-progress session can be resumed after reload. Raw resume text and job-description text are not persisted. PDF, TXT, and Markdown resumes are supported; PDF text extraction runs in the browser. Gemini calls are made directly from the browser, so the API key is exposed client-side.
