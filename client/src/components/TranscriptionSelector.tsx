import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { useAppContext } from '../contexts/AppContext';

const TranscriptionSelector: React.FC = () => {
  const { state, selectTranscription } = useAppContext();
  const { selectedPatient, selectedTranscription, transcriptions } = state;
  
  if (!selectedPatient) {
    return (
      <div className="p-3 text-sm text-muted-foreground bg-muted rounded-md">
        No past transcriptions available.
      </div>
    );
  }
  
  if (!transcriptions || transcriptions.length === 0) {
    return (
      <div className="p-3 text-sm text-muted-foreground bg-muted rounded-md">
        No past transcriptions available.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Past Transcriptions</label>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transcriptions.map((t) => (
              <TableRow key={t.id} className={selectedTranscription?.id === t.id ? 'bg-muted' : ''} onClick={() => selectTranscription(t)} style={{ cursor: 'pointer' }}>
                <TableCell>{t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</TableCell>
                <TableCell className="font-medium">{t.title || 'Untitled'}</TableCell>
                <TableCell className="text-muted-foreground truncate max-w-[32ch]">{t.content}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TranscriptionSelector;