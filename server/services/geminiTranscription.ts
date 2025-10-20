import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

type FinalTranscription = { text: string; isComplete: true };
type FinalOptions = { mimeType?: string };

export class GeminiTranscriptionService {
  private static instance: GeminiTranscriptionService | null = null;
  private audioBuffer: Buffer[] = [];
  private currentTranscript = "";
  private readonly genAI: GoogleGenerativeAI | null;
  private readonly isReady: boolean;
  private readonly modelName = "gemini-2.5-flash";

  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.isReady = !!this.genAI;
    if (!this.isReady) {
      console.warn("GEMINI_API_KEY not found. Audio transcription will fail.");
    }
  }

  static getInstance(): GeminiTranscriptionService {
    if (!GeminiTranscriptionService.instance) {
      GeminiTranscriptionService.instance = new GeminiTranscriptionService();
    }
    return GeminiTranscriptionService.instance;
  }

  resetSession(): void {
    this.audioBuffer = [];
    this.currentTranscript = "";
  }

  addAudioChunk(audioChunk: ArrayBuffer | Uint8Array): void {
    const uint8 = audioChunk instanceof Uint8Array ? audioChunk : new Uint8Array(audioChunk);
    this.audioBuffer.push(Buffer.from(uint8));
  }

  async getFinalTranscription(options?: FinalOptions): Promise<FinalTranscription> {
    if (!this.isReady || !this.genAI) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    if (this.audioBuffer.length === 0) {
      throw new Error("No audio received to transcribe");
    }

    const mimeType = options?.mimeType || "audio/webm";

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const combined = Buffer.concat(this.audioBuffer);
      const result = await model.generateContent([
        { text: "Transcribe the following audio to plain text. Return only the transcript." },
        {
          inlineData: {
            mimeType,
            data: combined.toString("base64"),
          },
        },
      ] as any);
      const response = result.response;
      const text = response.text().trim();
      this.currentTranscript = text;
      return { text, isComplete: true };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error transcribing audio with Gemini:", error);
      throw error;
    }
  }

  async generateTitle(transcriptText: string): Promise<string> {
    if (!this.isReady || !this.genAI) {
      // Fallback: first 8-10 words or Untitled
      const cleaned = transcriptText.trim().replace(/\s+/g, ' ');
      const firstSentenceEnd = cleaned.indexOf('.') >= 0 ? cleaned.indexOf('.') : cleaned.length;
      const firstSentence = cleaned.slice(0, firstSentenceEnd);
      const words = firstSentence.split(' ').slice(0, 10).join(' ');
      return words || 'Untitled';
    }

    const prompt = `Generate a concise, human-readable title for the following medical patient transcript.\n- Keep it under 8 words.\n- No quotes, no punctuation at the end.\n- Return ONLY the title.\n\nTranscript:\n${transcriptText}`;
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent([{ text: prompt }] as any);
      const title = result.response.text().trim();
      return title.replace(/^"|"$/g, '').replace(/[\.:!?]+$/g, '');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating title with Gemini:', error);
      const cleaned = transcriptText.trim().replace(/\s+/g, ' ');
      return cleaned.split(' ').slice(0, 8).join(' ') || 'Untitled';
    }
  }

  async generateVisitDiff(priorNote: string, currentTranscript: string): Promise<{ delta_summary: string[]; changes: { new: string[]; resolved: string[]; worsened: string[]; improved: string[]; unchanged: string[] }; nudges: any[]; safe_disclaimer: string; }> {
    if (!this.isReady || !this.genAI) {
      // Simple fallback diff
      const priorSentences = priorNote.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
      const currentSentences = currentTranscript.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
      const changesNew = currentSentences.filter(s => !priorSentences.includes(s)).slice(0, 25);
      const changesResolved = priorSentences.filter(s => !currentSentences.includes(s)).slice(0, 25);
      return {
        delta_summary: [
          `Added ${changesNew.length} new statements`,
          `Resolved ${changesResolved.length} statements`,
        ],
        changes: { new: changesNew, resolved: changesResolved, worsened: [], improved: [], unchanged: [] },
        nudges: [],
        safe_disclaimer: 'These results are AI-generated and should be reviewed by a clinician.'
      };
    }

    const sys = `You are a medical documentation assistant. Compare a prior note to a new transcript. Return STRICT JSON only with keys: delta_summary (string[]), changes (object with keys new, resolved, worsened, improved, unchanged as string[]), nudges (empty array), safe_disclaimer (string). No markdown, no code fences.`;
    const user = `PRIOR NOTE:\n${priorNote}\n\nCURRENT TRANSCRIPT:\n${currentTranscript}\n\nRespond with JSON only.`;
    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent([{ text: sys }, { text: user }] as any);
      const raw = result.response.text().trim();
      const jsonStr = this.extractJson(raw);
      const parsed = JSON.parse(jsonStr);
      // Basic shape guard
      return {
        delta_summary: Array.isArray(parsed.delta_summary) ? parsed.delta_summary : [],
        changes: {
          new: parsed?.changes?.new ?? [],
          resolved: parsed?.changes?.resolved ?? [],
          worsened: parsed?.changes?.worsened ?? [],
          improved: parsed?.changes?.improved ?? [],
          unchanged: parsed?.changes?.unchanged ?? [],
        },
        nudges: Array.isArray(parsed.nudges) ? parsed.nudges : [],
        safe_disclaimer: typeof parsed.safe_disclaimer === 'string' ? parsed.safe_disclaimer : 'These results are AI-generated and should be reviewed by a clinician.'
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating visit diff with Gemini:', error);
      // Fallback
      const priorSentences = priorNote.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
      const currentSentences = currentTranscript.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
      const changesNew = currentSentences.filter(s => !priorSentences.includes(s)).slice(0, 25);
      const changesResolved = priorSentences.filter(s => !currentSentences.includes(s)).slice(0, 25);
      return {
        delta_summary: [
          `Added ${changesNew.length} new statements`,
          `Resolved ${changesResolved.length} statements`,
        ],
        changes: { new: changesNew, resolved: changesResolved, worsened: [], improved: [], unchanged: [] },
        nudges: [],
        safe_disclaimer: 'These results are AI-generated and should be reviewed by a clinician.'
      };
    }
  }

  private extractJson(text: string): string {
    const fenceMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
    if (fenceMatch && fenceMatch[1]) {
      return fenceMatch[1];
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return text.slice(firstBrace, lastBrace + 1);
    }
    return text;
  }
}

export default GeminiTranscriptionService;


