import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { VisitDiffInput, VisitDiffOutput } from '../lib/types';
import InputPane from '../components/InputPane';
import OutputPane from '../components/OutputPane';
import { generateVisitDiff } from '../lib/api';
import { useAppContext } from '../contexts/AppContext';
import { Button } from '../components/ui/button';

const VisitDiffPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  const { state, selectPatient } = useAppContext();
  const { patients, selectedTranscription } = state;

  const [input, setInput] = useState<VisitDiffInput>({
    prior_note: '',
    current_transcript: '',
    specialty: 'primary_care'
  });
  
  const [output, setOutput] = useState<VisitDiffOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set the selected patient based on the URL parameter
  useEffect(() => {
    if (patientId && patients.length > 0) {
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        selectPatient(patient);
      } else {
        // If patient not found, redirect to patient list
        navigate('/patients');
      }
    }
  // Only re-run when patientId or patients array changes, not on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, patients]);

  const handleGenerateDiff = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await generateVisitDiff(input, selectedTranscription?.id);
      setOutput(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPatients = () => {
    navigate('/patients');
  };

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="mb-4 flex items-center">
        <Button 
          onClick={handleBackToPatients}
          variant="outline"
          className="mr-4 cursor-pointer"
        >
          ← Back to Patients
        </Button>
        <h1 className="text-2xl font-semibold text-secondary">Visit Diff</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-8rem)] pb-8">
        {/* Input Pane */}
        <div className="h-full">
          <InputPane 
            input={input} 
            setInput={setInput}
            onSubmit={handleGenerateDiff}
            isLoading={isLoading}
          />
        </div>
        
        {/* Output Pane */}
        <div className="h-full">
          <OutputPane 
            output={output} 
            isLoading={isLoading} 
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default VisitDiffPage;
