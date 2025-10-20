import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import type { Patient, Transcription, AppState } from '../lib/types';
import { mockPatients } from '../mocks/mockData';
import { getPatients, getPatientTranscriptions } from '../lib/api';

// Create the context with an initial undefined value
const AppContext = createContext<{
  state: AppState;
  selectPatient: (patient: Patient | null) => void;
  selectTranscription: (transcription: Transcription | null) => void;
  setRecording: (isRecording: boolean) => void;
  refreshPatients: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}>({
  state: {
    patients: [],
    selectedPatient: null,
    selectedTranscription: null,
    isRecording: false,
    transcriptions: []
  },
  selectPatient: () => {},
  selectTranscription: () => {},
  setRecording: () => {},
  refreshPatients: async () => {},
  isLoading: false,
  error: null
});

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>({
    patients: [],
    selectedPatient: null,
    selectedTranscription: null,
    isRecording: false,
    transcriptions: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBackend, setUseBackend] = useState(true);

  // Fetch patients from API on mount
  useEffect(() => {
    refreshPatients();
  }, []);

  const refreshPatients = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get patients from the API
      if (useBackend) {
        const patients = await getPatients();
        setState(prev => ({
          ...prev,
          patients
        }));
      } else {
        // Fall back to mock data if API fails
        setState(prev => ({
          ...prev,
          patients: mockPatients
        }));
      }
    } catch (err) {
      console.error("Error fetching patients, using mock data instead", err);
      setError("Failed to connect to API, using mock data");
      setUseBackend(false);
      
      // Use mock data as fallback
      setState(prev => ({
        ...prev,
        patients: mockPatients
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const selectPatient = (patient: Patient | null) => {
    setState(prev => ({
      ...prev,
      selectedPatient: patient,
      selectedTranscription: null,
      transcriptions: []
    }));
    if (patient) {
      // fetch transcriptions for the patient
      getPatientTranscriptions(patient.id)
        .then((txs) => {
          setState(prev => ({
            ...prev,
            transcriptions: txs,
            selectedTranscription: txs[0] || null
          }));
        })
        .catch((err) => {
          console.error('Error fetching patient transcriptions:', err);
        });
    }
  };

  const selectTranscription = (transcription: Transcription | null) => {
    setState(prev => ({
      ...prev,
      selectedTranscription: transcription
    }));
  };

  const setRecording = (isRecording: boolean) => {
    setState(prev => ({
      ...prev,
      isRecording
    }));
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      selectPatient, 
      selectTranscription,
      setRecording,
      refreshPatients,
      isLoading,
      error
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for accessing the context
export const useAppContext = () => useContext(AppContext);

export default AppContext;