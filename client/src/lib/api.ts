import type { VisitDiffInput, VisitDiffOutput, Patient } from './types';

// Base API URL - adjust as needed
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Generates a visit diff by sending prior note and current transcript to the API
 */
export async function generateVisitDiff(input: VisitDiffInput, transcriptionId?: string): Promise<VisitDiffOutput> {
  const response = await fetch(`${API_BASE_URL}/diff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...input, transcriptionId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get all patients
 */
export async function getPatients(): Promise<Patient[]> {
  const response = await fetch(`${API_BASE_URL}/patients`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get a single patient by ID
 */
export async function getPatientById(id: string): Promise<Patient> {
  const response = await fetch(`${API_BASE_URL}/patients/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  
  return response.json();
}

export async function getPatientTranscriptions(id: string) {
  const response = await fetch(`${API_BASE_URL}/patients/${id}/transcriptions`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
  return response.json();
}