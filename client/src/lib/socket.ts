import { io, Socket } from 'socket.io-client';
import type { AudioTranscriptionResponse } from './types';

// Create a singleton socket instance for the audio transcription
class AudioSocketService {
  private socket: Socket | null = null;
  private sessionId: string | null = null;
  private callbacks: {
    onTranscriptionResult?: (result: AudioTranscriptionResponse) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
  } = {};

  // Initialize socket connection
  connect() {
    if (this.socket) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // Generate a stable session id for this tab/session
    this.sessionId = this.sessionId || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

    this.socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    // Set up event listeners
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      // Register a stable session so server can emit to this logical client across reconnects
      if (this.sessionId) {
        this.socket?.emit('register-session', { sessionId: this.sessionId });
      }
      if (this.callbacks.onConnect) this.callbacks.onConnect();
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      if (this.callbacks.onDisconnect) this.callbacks.onDisconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (this.callbacks.onError) this.callbacks.onError(error);
    });

    this.socket.on('transcription-result', (result: AudioTranscriptionResponse) => {
      console.log('Received transcription result:', result);
      if (this.callbacks.onTranscriptionResult) this.callbacks.onTranscriptionResult(result);
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Register callback for transcription results
  onTranscriptionResult(callback: (result: AudioTranscriptionResponse) => void) {
    this.callbacks.onTranscriptionResult = callback;
  }

  // Register callback for socket connection
  onConnect(callback: () => void) {
    this.callbacks.onConnect = callback;
  }

  // Register callback for socket disconnection
  onDisconnect(callback: () => void) {
    this.callbacks.onDisconnect = callback;
  }

  // Register callback for socket errors
  onError(callback: (error: Error) => void) {
    this.callbacks.onError = callback;
  }

  // Start recording session
  startRecording(patientId?: string, mimeType?: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('start-recording', { patientId, mimeType });
      return true;
    }
    return false;
  }

  // Stop recording session
  stopRecording() {
    if (this.socket && this.socket.connected) {
      this.socket.emit('stop-recording');
      return true;
    }
    return false;
  }

  // Send audio data
  sendAudioData(audioChunk: ArrayBuffer) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('audio-data', { audioChunk });
      return true;
    }
    return false;
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const audioSocket = new AudioSocketService();
