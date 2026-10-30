# Practical 13: AI API Integration into a Web Application (Google Gemini API)

## 1. Practical Objective
The objective of this practical is to integrate Google's official **Gemini API** into the full-stack Task Management application. Using the official `@google/genai` Node.js SDK and the currently supported `gemini-2.5-flash` model, an **AI Task Description Generator** is implemented. The feature generates concise, professional 1-2 sentence task descriptions based on user-provided titles, while preserving system stability, rate limiting, human-in-the-loop editing, and graceful error handling.

---

## 2. Introduction to AI API Integration
Modern web applications leverage Large Language Model (LLM) APIs to provide context-aware text generation and automation.
- **Backend AI Proxy**: The frontend React app never communicates directly with external AI services. Instead, the Express.js backend acts as a secure intermediary. This protects secret credentials (such as the `GEMINI_API_KEY`), enforces rate limits, sanitizes user payloads, and prevents quota exhaustion.
- **Human-in-the-Loop Principle**: The AI suggestion is populated into an editable textarea rather than immediately creating or committing the task. The user retains complete authority to review, modify, or discard the suggestion before submission.

---

## 3. Architecture and Workflow

```
[ React Client (Frontend) ]
         │
         │  1. User enters task title & clicks "✨ Generate Description"
         ▼
[ POST /api/ai/generate-description ] (Express Backend)
         │
         │  2. Validates title (non-empty string)
         │  3. Enforces rate limiting (1 req/task/min)
         │  4. Injects system instructions & task title into prompt
         ▼
[ Google Gemini API: gemini-2.5-flash ] (External AI Service via @google/genai)
         │
         │  5. Generates concise 1-2 sentence description
         ▼
[ Express Backend ]
         │
         │  6. Validates & formats response: { "description": "..." }
         ▼
[ React Client ]
         │
         │  7. Populates editable textarea & shows success banner
         │  8. Displays Responsible AI disclaimer
         ▼
[ User Reviews / Edits & Clicks "+ Add Task" ]
```

---

## 4. Backend Implementation

### A. Environment Configuration & Security
- **API Key Storage**: Kept exclusively inside `task-manager-api/.env` as:
  ```env
  GEMINI_API_KEY=your_gemini_api_key_here
  ```
- **Git Protection**: Verified that `.env` is ignored by `.gitignore` to prevent credential leaks.
- **Example Template**: Provided in `task-manager-api/.env.example`:
  ```env
  GEMINI_API_KEY=your_gemini_api_key_here
  ```

### B. Gemini AI Service (`task-manager-api/services/aiService.js`)
Uses Google's official `@google/genai` SDK with `gemini-2.5-flash`:
```javascript
const { GoogleGenAI } = require('@google/genai');

async function generateTaskDescription(title) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.includes('your_')) {
        const error = new Error('Gemini API key not configured or set to placeholder.');
        error.code = 'GEMINI_KEY_MISSING';
        throw error;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Generate a single, clear, actionable, professional 1-2 sentence description for a task titled "${title}". Only return the description text without markdown quotes or conversational preamble.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: 'You are an assistant for a task management app that writes concise, professional 1-2 sentence task descriptions.',
            maxOutputTokens: 100,
            temperature: 0.7
        }
    });

    const description = response.text ? response.text.trim() : null;
    if (!description) {
        throw new Error('No content returned from Gemini API');
    }

    return description;
}
```

### C. AI Route & Rate Limiting (`task-manager-api/routes/aiRoutes.js`)
- **Endpoint**: `POST /api/ai/generate-description`
- **Payload Validation**: Returns `400 Bad Request` if `title` is missing or blank.
- **Rate Limiting**: Enforces a per-client, per-task rate limit of **1 request per minute** (`429 Too Many Requests`).
- **Graceful Failure & Fallback**: Catches all upstream Gemini API errors (e.g. invalid key, quota exhaustion, network issues) and returns a clean `503 Service Unavailable` with a safe message (`AI service currently unavailable. Please enter task description manually.`) without exposing API keys, error traces, or sensitive stack details.

---

## 5. Frontend Integration

### Component: `portfolio-24IT002/src/components/Projects.jsx`
1. **"✨ Generate Description" Button**:
   - Styled with gradient accents and placed adjacent to the task title field.
   - Triggers `handleGenerateDescription`.
2. **Interactive Loading State**:
   - Disables the button during the API call.
   - Displays an animated loading spinner and "Generating..." text.
3. **Editable Description Field**:
   - Upgraded to a multi-line `<textarea>`.
   - Populated automatically when the backend returns a generated description, allowing immediate manual editing.
4. **Visual Feedback & Fallback**:
   - Displays green success notification upon generation.
   - Displays friendly red warning banner if generation fails or times out, prompting manual input.
5. **Responsible AI Disclaimer**:
   - Permanently displays:
     > *"💡 Disclaimer: AI-generated suggestion: Please review and edit this content before creating your task."*

---

## 6. How to Configure the Google Gemini API Key

To use real AI generation:
1. Obtain a free API key from Google AI Studio at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
2. Open `task-manager-api/.env`.
3. Set your secret key:
   ```env
   GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxx
   ```
4. Restart the backend server.

---

## 7. Demonstration Procedures

### A. Successful AI Generation Demonstration
1. Ensure a valid `GEMINI_API_KEY` is present in `task-manager-api/.env`.
2. Start the backend (`npm start` in `task-manager-api`) and frontend (`npm run dev` in `portfolio-24IT002`).
3. Log in to the application and navigate to the **Task Manager** section.
4. Type a task title, e.g., `Complete database integration`.
5. Click **✨ Generate Description**.
6. Observe the loading state.
7. Verify that the generated description appears in the textarea:
   > *"Configure database connection strings, implement Mongoose models, and verify CRUD operations for tasks."*
8. Edit the text to add custom notes, select priority, and click **+ Add Task**.

---

### B. Graceful API Failure Demonstration (Fallback Behavior)
1. Open `task-manager-api/.env` and set an invalid or placeholder key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
2. Restart the backend if running.
3. In the frontend task creation form, enter a title: `Deploy Docker container stack`.
4. Click **✨ Generate Description**.
5. Observe the user experience:
   - The button shows the loading spinner, then cleanly restores.
   - The application **does not crash**; instead, a friendly red alert appears:
     > *"⚠️ AI service currently unavailable. Please enter task description manually."*
   - The user can simply type a description manually into the textarea.
   - Click **+ Add Task**: The task is created successfully in MongoDB, demonstrating that task creation continues working independently of AI availability.

---

## 8. Responsible AI Considerations
1. **Privacy & Data Minimization**: Only the task title string is sent to the Gemini API. Passwords, auth tokens, emails, and user IDs are never transmitted.
2. **Human Agency**: AI suggestions never create or submit tasks automatically. Users always have full editing control.
3. **Transparency**: The form includes an explicit AI disclaimer alerting users that generated text should be checked for accuracy.

---

## 9. Screenshot Evidence Checklist

Save captured lab screenshots to `docs/screenshots/`:
- `docs/screenshots/ai-prompt-entry.png` – Task creation form with task title entered and "Generate Description" button visible.
- `docs/screenshots/ai-loading-state.png` – "Generate Description" button in disabled loading state with spinning loader.
- `docs/screenshots/ai-generated-description.png` – Successfully populated description in editable textarea with green confirmation banner and disclaimer.
- `docs/screenshots/ai-failure-fallback.png` – Friendly red fallback message shown when using an invalid key, with task creation still functional.
- `docs/screenshots/ai-test-suite-pass.png` – Terminal showing `PASS tests/ai.test.js`, `PASS tests/auth.test.js`, and `PASS tests/tasks.test.js`.

---

## 10. Conclusion
Practical 13 successfully integrated Google Gemini API (`gemini-2.5-flash`) via `@google/genai` into the Task Management full-stack application. By implementing secure backend credential isolation, input validation, client rate limiting, human-in-the-loop editing, and graceful degradation, the application provides an enhanced developer experience while adhering to responsible AI and production software standards.
