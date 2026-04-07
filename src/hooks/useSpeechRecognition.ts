import { useState, useEffect, useCallback, useRef } from 'react';

// Using types for SpeechRecognition since they aren't built into standard TS definitions yet
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    // Check if the browser supports Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Google Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition() as ISpeechRecognition;
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Optimize for Indian accents

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentTranscript += transcriptPart + ' ';
        } else {
          currentTranscript += transcriptPart;
        }
      }
      setTranscript(currentTranscript.trim().toLowerCase());
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
         setError("Microphone permission denied.");
         setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Auto-restart to continuously listen, unless intentionally stopped
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // Ignore state errors if it's already starting
        }
      } else {
        setIsListening(false);
      }
    };

    if (isListeningRef.current) {
      try {
        recognition.start();
      } catch(e) {}
    }

    return () => {
      recognition.abort();
    };
  }, []); // Remove isListening dependency so we don't accidentally trash the instance when state updates

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    setIsListening(true);
    isListeningRef.current = true;
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch(e) {}
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    // Flush the internal memory cache of the OS recognition engine
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.abort(); 
      // It immediately stops, dropping old event.results, and onend will naturally reboot it!
    }
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isSupported: !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition)
  };
}
