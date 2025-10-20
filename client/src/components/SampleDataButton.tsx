import React from 'react';
import { Button } from './ui/button';
  import { getSampleData } from '../mocks/mockData';
import type { VisitDiffInput } from '../lib/types';

interface SampleDataButtonProps {
  setInput: React.Dispatch<React.SetStateAction<VisitDiffInput>>;
}

const SampleDataButton: React.FC<SampleDataButtonProps> = ({ setInput }) => {
  const loadSampleData = () => {
    const { priorNote, currentTranscript } = getSampleData();
    setInput(prev => ({
      ...prev,
      prior_note: priorNote,
      current_transcript: currentTranscript
    }));
  };

  return (
    <Button 
      onClick={loadSampleData} 
      variant="outline" 
      size="sm"
      className="w-full mt-2"
    >
      Load Sample Data
    </Button>
  );
};

export default SampleDataButton;
