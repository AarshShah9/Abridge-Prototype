import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { useAppContext } from '../contexts/AppContext';
import { Mic, Square, Loader2 } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import { audioSocket } from '../lib/socket';

interface AudioRecorderProps {
  onTranscriptionReceived: (text: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onTranscriptionReceived }) => {
  const { state, setRecording } = useAppContext();
  const { isRecording, selectedPatient } = state;
  
  // Removed unused state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketConnectedRef = useRef<boolean>(false);

  // Initialize socket connection
  useEffect(() => {
    // Connect socket
    audioSocket.connect();
    
    // Set up socket event handlers
    audioSocket.onConnect(() => {
      socketConnectedRef.current = true;
      setIsConnecting(false);
    });
    
    audioSocket.onDisconnect(() => {
      socketConnectedRef.current = false;
    });
    
    audioSocket.onError(() => {
      socketConnectedRef.current = false;
      setIsConnecting(false);
      setIsProcessing(false);
    });
    
    audioSocket.onTranscriptionResult((result) => {
      onTranscriptionReceived(result.text);
      
      // If the transcription is complete, stop processing
      if (result.isComplete) {
        setIsProcessing(false);
      }
    });
    
    return () => {
      // Keep socket connected across unmounts to preserve session delivery
      // (no-op cleanup)
    };
  // Only include onTranscriptionReceived in dependencies to avoid useEffect issues
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTranscriptionReceived]);

  const startRecording = async () => {
    try {
      setIsConnecting(true);
      
      // Ensure socket is connected
      if (!socketConnectedRef.current) {
        audioSocket.connect();
        await new Promise<void>((resolve) => {
          const checkConnection = () => {
            if (socketConnectedRef.current) {
              resolve();
            } else {
              setTimeout(checkConnection, 100);
            }
          };
          checkConnection();
        });
      }
      
      setIsProcessing(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      // Pick a supported mimeType for best fidelity
      const preferred = 'audio/webm;codecs=opus';
      const fallback = 'audio/webm';
      const chosenType = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(preferred))
        ? preferred
        : (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(fallback))
          ? fallback
          : undefined as unknown as string;

      const mediaRecorder = chosenType ? new MediaRecorder(stream, { mimeType: chosenType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Notify server that we're starting recording
      audioSocket.startRecording(selectedPatient?.id, mediaRecorder.mimeType);

      mediaRecorder.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          // Convert Blob to ArrayBuffer for socket transmission
          try {
            const arrayBuffer = await e.data.arrayBuffer();
            // Send audio data to the server
            audioSocket.sendAudioData(arrayBuffer);
          } catch (error) {
            console.error("Error converting audio data:", error);
          }
        }
      };

      // Set time slice to 500ms to send audio chunks frequently
      mediaRecorder.start(500);
      setRecording(true);
      setIsConnecting(false);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
      setIsConnecting(false);
    }
  };

  // Using useCallback to prevent recreation on every render
  const stopRecording = React.useCallback(() => {
    if (mediaRecorderRef.current) {
      setIsProcessing(true);
      
      const mr = mediaRecorderRef.current;
      // After stop, the final ondataavailable fires; delay stop signal slightly to flush
      mr.onstop = () => {
        setTimeout(() => {
          audioSocket.stopRecording();
        }, 50);
      };
      mr.stop();
      
      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      setAudioStream(null);
      setRecording(false);
    }
  }, [setRecording]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-2">
        {!isRecording && !isProcessing && !isConnecting && (
          <Button 
            onClick={startRecording} 
            className="bg-primary text-black cursor-pointer"
          >
            <Mic className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        )}
        
        {isRecording && !isProcessing && (
          <Button 
            onClick={stopRecording} 
            className="bg-destructive text-black cursor-pointer"
          >
            <Square className="mr-2 h-4 w-4" />
            Stop Recording
          </Button>
        )}
        
        {isConnecting && (
          <div className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="text-sm">Connecting...</span>
          </div>
        )}
        
        {isProcessing && (
          <div className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="text-sm">Processing audio...</span>
          </div>
        )}
        
        {isRecording && !isProcessing && (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full animate-pulse bg-destructive mr-2"></div>
            <span className="text-sm">Recording...</span>
          </div>
        )}
      </div>
      
      <AudioVisualizer isRecording={isRecording} audioStream={audioStream} />
    </div>
  );
};

export default AudioRecorder;