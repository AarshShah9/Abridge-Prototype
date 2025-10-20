// Define types according to the requirements

export interface Nudge {
  title: string;
  description: string;
  category: 'billing_or_completeness';
  evidence_span: string;
}

export interface Changes {
  new: string[];
  resolved: string[];
  worsened: string[];
  improved: string[];
  unchanged: string[];
}

export interface VisitDiffInput {
  prior_note: string;
  current_transcript: string;
  specialty?: string;
}

export interface VisitDiffOutput {
  delta_summary: string[];
  changes: Changes;
  nudges: Nudge[];
  safe_disclaimer: string;
}

export interface Transcription {
  id: string;
  content: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  patientId: string;
  analysis?: TranscriptionAnalysis;
}

export interface TranscriptionAnalysis {
  id: string;
  deltaSummary: string[];
  changesNew: string[];
  changesResolved: string[];
  changesWorsened: string[];
  changesImproved: string[];
  changesUnchanged: string[];
  transcriptionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  mrn: string;
  gender: string;
  dob: string;
  age: number;
  email?: string;
  phone?: string;
  doctorId?: string;
  createdAt: string;
  updatedAt: string;
  transcriptions?: Transcription[];
}

export interface AppState {
  patients: Patient[];
  selectedPatient: Patient | null;
  selectedTranscription: Transcription | null;
  isRecording: boolean;
  transcriptions: Transcription[];
}

export interface AudioTranscriptionResponse {
  text: string;
  isComplete: boolean;
}