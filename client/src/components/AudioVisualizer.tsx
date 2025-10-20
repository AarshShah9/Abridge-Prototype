import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface AudioVisualizerProps {
  isRecording: boolean;
  audioStream?: MediaStream | null;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording, audioStream }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  
  // Initialize WaveSurfer
  useEffect(() => {
    let waveSurfer: WaveSurfer | null = null;
    
    if (containerRef.current) {
      // Destroy any existing instance
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
      }
      
      try {
        // Create new WaveSurfer instance
        waveSurfer = WaveSurfer.create({
          container: containerRef.current,
          waveColor: '#4CAF50',
          progressColor: '#0077CC',
          cursorColor: 'transparent',
          height: 50,
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
          // responsive: true,
        });
        
        waveSurferRef.current = waveSurfer;
      } catch (error) {
        console.error("Error creating WaveSurfer instance:", error);
      }
    }
    
    return () => {
      if (waveSurfer) {
        try {
          waveSurfer.destroy();
        } catch (error) {
          console.error("Error destroying WaveSurfer:", error);
        }
      }
    };
  }, []);
  
  // Handle audio stream changes
  useEffect(() => {
    if (!audioStream || !waveSurferRef.current) return;
    
    // Connect the audio stream to WaveSurfer
    waveSurferRef.current.setMuted(true); // We don't want to hear ourselves
    
    try {
      // Access the audio context directly rather than through the media element
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      
      // For real-time visualization, we'd need to do more here
      // This is simplified for demo purposes
    } catch (error) {
      console.error("Error connecting audio stream:", error);
    }
    
    return () => {
      // Clean up
    };
  }, [audioStream]);
  
  // Simulate waveform movement when recording
  useEffect(() => {
    let animationId: number;
    let barElements: HTMLElement[] = [];
    
    const simulateWaveform = () => {
      if (containerRef.current && isRecording) {
        // Get all wave bars if not already saved
        if (barElements.length === 0) {
          barElements = Array.from(
            containerRef.current.querySelectorAll('wave')
          ) as HTMLElement[];
        }
        
        // Animate each bar
        barElements.forEach((bar) => {
          const height = Math.random() * 30 + 5;
          if (bar.style) {
            bar.style.height = `${height}px`;
          }
        });
        
        animationId = requestAnimationFrame(simulateWaveform);
      }
    };
    
    if (isRecording) {
      simulateWaveform();
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isRecording]);
  
  return (
    <div className={`mt-2 p-2 border rounded-md ${isRecording ? 'border-primary' : 'border-border'}`}>
      <div 
        ref={containerRef} 
        className={`h-12 flex items-center justify-center ${!isRecording ? 'opacity-50' : ''}`}
      >
        {!isRecording && <div className="text-sm text-muted-foreground">Audio visualization will appear here</div>}
      </div>
    </div>
  );
};

export default AudioVisualizer;
