# requirements.md

## Product: Visit Diff — "What changed since last visit"

### Goal
Give clinicians a fast view of what changed between the last signed note and the current encounter transcript. Output a short delta summary plus a single documentation nudge. Keep scope tight and demo friendly.

### Success Criteria
- Paste prior note and paste or stream current transcript
- Delta Summary with at most 6 bullets
- Structured Changes table: new, resolved, worsened, improved, unchanged
- One Documentation Nudge with a short evidence quote
- Strict JSON that matches schema without manual edits
- End to end latency under 3 seconds on a cloud LLM for 2k tokens

### Non Goals
- Full clinical decision support
- EHR integration
- Real patient data
- Treatment recommendations

---

## User Story
As a clinician, I want a quick summary of what changed since the last visit so I can focus the note, confirm key items, and avoid missing documentation requirements.

---

## Primary User Flow
1. Paste prior note text.
2. Paste or live stream current transcript text.
3. Click Generate Visit Diff.
4. View Delta Summary, Changes table, and one Documentation Nudge.
5. Click Copy to Note or Download JSON.

---

## UX Scope
- Two panes: Inputs on the left, Output on the right.
- Inputs: textarea for prior note, textarea for current transcript, optional specialty preset.
- Output:
  - Card 1: Delta Summary bullets.
  - Card 2: Changes table.
  - Card 3: Documentation Nudge.
  - Buttons: Copy All, Copy Summary, Download JSON.
- Banner: "Demo only. Not for clinical use."

---

## Data Contracts

### Input
```json
{
  "prior_note": "string",
  "current_transcript": "string",
  "specialty": "primary_care"
}
```

### Output
```json
{
  "delta_summary": ["string bullet"],
  "changes": {
    "new": ["string"],
    "resolved": ["string"],
    "worsened": ["string"],
    "improved": ["string"],
    "unchanged": ["string"]
  },
  "nudges": [
    {
      "title": "string",
      "description": "string",
      "category": "billing_or_completeness",
      "evidence_span": "short quote"
    }
  ],
  "safe_disclaimer": "Demo only. Not for clinical use."
}
```

### Example Output
```json
{
  "delta_summary": [
    "New intermittent chest tightness on exertion",
    "Fatigue persists, now 2 weeks",
    "No edema or orthopnea",
    "Plan includes CBC and TSH, add echo referral",
    "Follow up in 2 weeks"
  ],
  "changes": {
    "new": ["chest tightness on exertion"],
    "resolved": ["ankle swelling"],
    "worsened": ["fatigue"],
    "improved": [],
    "unchanged": ["no medication changes"]
  },
  "nudges": [
    {
      "title": "E M code support: history details",
      "description": "Document pertinent negatives for cardiopulmonary ROS to support complexity.",
      "category": "billing_or_completeness",
      "evidence_span": "Denies edema, denies orthopnea"
    }
  ],
  "safe_disclaimer": "Demo only. Not for clinical use."
}
```

---

## Architecture

### Frontend
- React Vite.
- Two textareas with character count.
- Generate button calls POST /diff.
- JSON renders into three cards with copy and download helpers.

### Backend
- Node Express or Python FastAPI.
- POST /diff accepts Input JSON, returns Output JSON.
- JSON schema validation with zod or pydantic.
- LLM client configured for strict JSON output.

### Optional Streaming
- If adding STT later: buffer utterances by silence and call /diff on sliding windows.
- For the initial demo, static paste is enough.

---

## LLM Choice: Gemini 1.5

**Models**
- `gemini-1.5-flash` for fast demos.
- `gemini-1.5-pro` for tougher text.

**Structured Output**
- Use `response_mime_type: application/json` and a `response_schema` matching the Output contract.
- Retry once if validation fails.

**Why Gemini**
- Long context helps with longer prior notes.
- Good JSON control keeps the UI simple.
- Works for later streaming upgrades.

---

## Diff Logic

### Steps
1. **Normalization**
   - Lowercase copy for lexical cues.
   - Keep original for display and quotes.
   - Sentence split the current transcript.

2. **Seed Extraction**
   - Pull candidate clinical entities and events.
   - Option A: prompt the LLM to extract symptom, duration, tests, meds.
   - Option B: regex plus small term lists for demo stability.

3. **Alignment**
   - Map candidates from current transcript to prior note mentions.
   - Status labels:
     - New: present now, absent before.
     - Resolved: present before, absent now.
     - Worsened or Improved: degree language changed.
     - Unchanged: present in both without degree change.

4. **Summarization**
   - Provide aligned structure with short spans to the LLM.
   - Generate `delta_summary`, `changes`, and one `nudge` with an evidence quote.
   - Enforce JSON schema.

5. **Validation**
   - Server validates JSON. If invalid, retry once with a short reminder.

---

## Prompt Templates

### System
You are a clinical summarization assistant for a demo. Output strict JSON that matches the provided schema. No extra text.

### User
Prior note:
```
{{prior_note}}
```

Current transcript:
```
{{current_transcript}}
```

Task:
1. Identify changes since the prior note: new, resolved, worsened, improved, unchanged.
2. Produce a five bullet `delta_summary`.
3. Provide one documentation `nudge` that improves billing or completeness with a short evidence quote.
4. Return strict JSON only using this schema:
```
{ "delta_summary": [], "changes": { "new": [], "resolved": [], "worsened": [], "improved": [], "unchanged": [] }, "nudges": [ { "title": "", "description": "", "category": "billing_or_completeness", "evidence_span": "" } ], "safe_disclaimer": "Demo only. Not for clinical use." }
```

---

## Heuristics that help the model
- Provide cue words for stability:
  - Worsened: worse, increased, more frequent, progressed.
  - Improved: better, decreased, less frequent, controlled.
  - Resolved: resolved, gone, no longer present, denies today.
- Keep inputs under 2k tokens for speed.

---

## Minimal Tech Stack

**Option A: Cloud first**
- Frontend: React Vite.
- Backend: Node Express or Python FastAPI.
- LLM: Gemini 1.5 Flash or Pro with response schema JSON.
- Run locally for demo.

**Option B: Local only**
- Same frontend and backend.
- Smaller local LLM with JSON guardrails if no network.
- Trim input aggressively.

---

## Implementation Plan

### Setup
- Scaffold React and Express or FastAPI.
- Implement POST /diff with schema validation.
- Add the basic UI.

### Core
- Implement LLM call with JSON response.
- Render Delta Summary, Changes table, and Nudge.
- Copy and Download JSON buttons.

### Polish
- Add sample input pairs for instant demo.
- Add a specialty preset selector:
  - primary care
  - cardiology
  - pediatrics
- Toasts for validation errors.

---

## Latency Budget
- Combined input under 2k tokens.
- Single pass generation target under 3 seconds on Flash.
- One retry on invalid JSON with brief reminder.

---

## Quality Checks
- Schema validator rejects malformed fields.
- Golden tests for 3 fixture pairs.
- Confirm no PHI in fixtures.
- Delta Summary never exceeds 6 bullets.

---

## Risks and Mitigations
- Hallucinated changes: include `evidence_span` quotes.
- JSON drift: enforce response schema and retry once.
- Over long inputs: trim prior note to HPI or Assessment and Plan for demo.
- Compliance concerns: demo banner and mock data only.

---

## Sample Fixtures

### Prior note
Fatigue for 1 week. Ankle swelling present. No chest pain. Trial of lifestyle measures. Follow up PRN.

### Current transcript
I am still tired for two weeks now. No ankle swelling this week. I sometimes feel chest tightness when walking upstairs. Let us order CBC and TSH. Follow up in two weeks.

Expected highlights:
- New: chest tightness on exertion.
- Resolved: ankle swelling.
- Worsened: fatigue.
- Nudge: document pertinent negatives for cardiopulmonary ROS.

---

## API Sketch

```
POST /diff
Content-Type: application/json
Body: Input JSON
200: Output JSON
400: { "error": "validation_failed" }
500: { "error": "llm_failed" }
```

---

## Demo Script
Left pane shows prior note and today’s transcript. Click Generate. The system aligns mentions, classifies changes, and returns a five bullet delta summary, a changes table, and one documentation nudge with a short quote as evidence. Copy the summary into the note or download the JSON. This slots into a scribe workflow and reduces cognitive load by surfacing only what changed.

---

## Cut Scope Options
- Remove specialty presets.
- Show only Delta Summary and Nudge.
- Skip alignment heuristics and rely on the LLM with examples.

---

## Future Extensions
- Real time partial diff every 10 seconds during the visit.
- Templates for well child or heart failure follow up.
- CSV export of deltas for analytics.

---

## License and Safety
- Demo only, not for clinical use.
- No PHI in examples.
- Add MIT license to the demo repo.
