import React from 'react';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import type { VisitDiffInput } from '../lib/types';
import TranscriptionSelector from './TranscriptionSelector';
import AudioRecorder from './AudioRecorder';
import { useAppContext } from '../contexts/AppContext';

interface InputPaneProps {
  input: VisitDiffInput;
  setInput: React.Dispatch<React.SetStateAction<VisitDiffInput>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputPane: React.FC<InputPaneProps> = ({ input, setInput, onSubmit, isLoading }) => {
  const { state } = useAppContext();
  const { selectedPatient, selectedTranscription } = state;

  const handleInputChange = (field: keyof VisitDiffInput, value: string) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const handleTranscriptionReceived = (text: string) => {
    handleInputChange('current_transcript', text);
  };

  // When selected transcription changes, update the prior note field
  React.useEffect(() => {
    if (selectedTranscription) {
      handleInputChange('prior_note', selectedTranscription.content);
    }
  }, [selectedTranscription]);

  return (
    <div className="h-full flex flex-col space-y-4 bg-background p-4 rounded-lg border border-border">
      {selectedPatient ? (
        <>
          <div className="flex flex-col space-y-2">
            <h2 className="text-2xl font-semibold text-secondary">
              Visit Diff - {selectedPatient.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              MRN: {selectedPatient.mrn} | DOB: {selectedPatient.dob} | Age: {selectedPatient.age}
            </p>
          </div>

          <div className="space-y-2">
            <TranscriptionSelector />
          </div>

          <div className="flex flex-col space-y-2 flex-grow">
            <Label htmlFor="prior_note">Prior Note</Label>
            <Textarea 
              id="prior_note"
              value={input.prior_note}
              onChange={(e) => handleInputChange('prior_note', e.target.value)}
              placeholder="Prior note content will appear here when you select a transcription..."
              className="flex-grow disabled:opacity-100"
              disabled={true}
            />
          </div>

          <div className="flex flex-col space-y-2 flex-grow">
            <div className="flex justify-between items-center">
              <Label htmlFor="current_transcript">Current Transcript</Label>
              <AudioRecorder onTranscriptionReceived={handleTranscriptionReceived} />
            </div>
            <Textarea 
              id="current_transcript"
              value={input.current_transcript}
              onChange={(e) => handleInputChange('current_transcript', e.target.value)}
              placeholder="Type or record current visit transcript..."
              className="flex-grow"
            />
            <div className="flex justify-end pt-2">
              <Button 
                onClick={onSubmit}
                disabled={!selectedTranscription || isLoading}
                className="cursor-pointer"
              >
                {isLoading ? 'Generating…' : 'Generate Visit Diff'}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-lg font-medium text-secondary">No Patient Selected</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please select a patient from the list to continue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InputPane;