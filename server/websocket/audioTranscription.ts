import { Server, Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import type express from "express";
import GeminiTranscriptionService from "../services/geminiTranscription";
import { client } from "../prisma/client";

type ActiveSessions = Map<string, { patientId: string | null; mimeType: string | null; sessionId: string | null; } & { bufferCount: number }>;

export class AudioTranscriptionService {
  private readonly io: Server;
  private readonly gemini = GeminiTranscriptionService.getInstance();
  private readonly activeSessions: ActiveSessions = new Map();

  constructor(_app: express.Express, httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: { origin: "*", methods: ["GET", "POST"] },
    });
    this.setupSocketEvents();
  }

  private setupSocketEvents(): void {
    this.io.on("connection", (socket: Socket) => {
      // eslint-disable-next-line no-console
      console.log("[WS] Client connected:", socket.id, {
        transport: socket.conn.transport.name,
      });

      socket.on("register-session", (payload: { sessionId: string }) => {
        const { sessionId } = payload || { sessionId: null } as any;
        if (sessionId) {
          socket.join(sessionId);
        }
        const existing = this.activeSessions.get(socket.id) || { patientId: null, mimeType: null, sessionId: null, bufferCount: 0 };
        this.activeSessions.set(socket.id, { ...existing, sessionId: sessionId || existing.sessionId });
        // eslint-disable-next-line no-console
        console.log("[WS] register-session:", { socketId: socket.id, sessionId });
      });

      socket.on("start-recording", (payload?: { patientId?: string; mimeType?: string }) => {
        const patientId = payload?.patientId ?? null;
        const mimeType = payload?.mimeType ?? null;
        const prev = this.activeSessions.get(socket.id) || { sessionId: null, bufferCount: 0 } as any;
        this.activeSessions.set(socket.id, { patientId, mimeType, sessionId: prev.sessionId ?? null, bufferCount: 0 });
        this.gemini.resetSession();
        // eslint-disable-next-line no-console
        console.log("[WS] start-recording:", {
          socketId: socket.id,
          patientId,
          mimeType,
        });
      });

      socket.on("audio-data", (data: { audioChunk: ArrayBuffer }) => {
        if (!this.activeSessions.has(socket.id)) {
          this.activeSessions.set(socket.id, { patientId: null, mimeType: null, sessionId: null, bufferCount: 0 });
        }
        this.gemini.addAudioChunk(data.audioChunk);
        const session = this.activeSessions.get(socket.id)!;
        session.bufferCount += 1;
        // eslint-disable-next-line no-console
        console.log("[WS] audio-data:", {
          socketId: socket.id,
          chunkBytes: data?.audioChunk ? data.audioChunk.byteLength : 0,
          bufferCount: session.bufferCount,
        });
      });

      socket.on("stop-recording", async () => {
        const t0 = Date.now();
        try {
          const session = this.activeSessions.get(socket.id) || { patientId: null, mimeType: null, sessionId: null, bufferCount: 0 } as any;
          // eslint-disable-next-line no-console
          console.log("[WS] stop-recording received:", {
            socketId: socket.id,
            bufferCount: session.bufferCount,
          });
          // Use mimeType from client or fall back to generic WebM
          const finalTx = await this.gemini.getFinalTranscription({ mimeType: session.mimeType || "audio/webm" });
          // eslint-disable-next-line no-console
          console.log("[WS] Gemini final transcription ready:", {
            socketId: socket.id,
            textLength: finalTx.text?.length ?? 0,
            durationMs: Date.now() - t0,
          });

          // Persist to DB if patientId is provided
          let resolvedPatientId = session.patientId;
          if (!resolvedPatientId) {
            const fallbackPatient = await client.patient.findFirst({ select: { id: true } });
            resolvedPatientId = fallbackPatient?.id || null;
          }

          if (resolvedPatientId) {
            const created = await client.transcription.create({
              data: {
                content: finalTx.text,
                title: await this.gemini.generateTitle(finalTx.text),
                patientId: resolvedPatientId,
              },
              select: { id: true, patientId: true, createdAt: true, },
            });
            // eslint-disable-next-line no-console
            console.log("[WS] Transcription saved:", {
              socketId: socket.id,
              created,
            });
          } else {
            // eslint-disable-next-line no-console
            console.warn("[WS] No patientId resolved; transcription not persisted", {
              socketId: socket.id,
            });
          }

          const target = session.sessionId || socket.id;
          this.io.to(target).emit("transcription-result", finalTx);
          // eslint-disable-next-line no-console
          console.log("[WS] Emitted transcription-result to:", target);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error finalizing transcription:", error);
          const target = (this.activeSessions.get(socket.id)?.sessionId) || socket.id;
          this.io.to(target).emit("transcription-result", {
            text: "Error transcribing audio. Please try again.",
            isComplete: true,
          });
          // eslint-disable-next-line no-console
          console.log("[WS] Emitted error transcription-result to:", target);
        } finally {
          this.activeSessions.delete(socket.id);
          // eslint-disable-next-line no-console
          console.log("[WS] Session cleared:", socket.id);
        }
      });

      socket.on("disconnect", () => {
        this.activeSessions.delete(socket.id);
        // eslint-disable-next-line no-console
        console.log("[WS] Client disconnected:", socket.id);
      });
    });
  }
}

export default AudioTranscriptionService;


