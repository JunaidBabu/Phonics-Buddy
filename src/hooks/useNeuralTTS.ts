import { useState, useEffect, useCallback } from 'react';
import { pipeline, env } from '@huggingface/transformers';

// Tell Transformers.js to only look for models on the Hugging Face Hub
env.allowLocalModels = false;

// We cache the pipeline instance globally so it only downloads and initializes once,
// even if the component re-renders or hot-reloads.
let ttsPipelinePromise: Promise<any> | null = null;
let globalAudioContext: AudioContext | null = null;

export function useNeuralTTS() {
  const [isReady, setIsReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!ttsPipelinePromise) {
      setIsDownloading(true);
      setErrorMsg(null);
      
      // Load the SpeechT5 Text-to-Speech model
      ttsPipelinePromise = pipeline('text-to-speech', 'Xenova/speecht5_tts', {
        dtype: 'q8', // V3 syntax: forces the ~84MB _quantized.onnx model instead of the 255MB one!
        progress_callback: (data: any) => {
          if (!mounted) return;
          if (data.status === 'progress') {
            setProgress(Math.round(data.progress));
          } else if (data.status === 'ready') {
            setIsDownloading(false);
            setIsReady(true);
          }
        }
      }).catch(err => {
        console.error("Failed to load TTS model", err);
        if (mounted) {
          setIsDownloading(false);
          setErrorMsg(err.message || 'Failed to download AI model');
        }
        ttsPipelinePromise = null; 
      });
    } else {
      ttsPipelinePromise.then(() => {
        if (mounted) setIsReady(true);
      });
    }

    return () => {
      mounted = false;
    };
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!ttsPipelinePromise) return;
    
    try {
      const synthesizer = await ttsPipelinePromise;
      
      // The KSP model from CMU Arctic is currently missing on this specific CDN deployment! 
      // Falling back to the SLT model (US Female) to ensure the AI pipeline doesn't crash.
      const speaker_embeddings = 'https://huggingface.co/datasets/Xenova/cmu-arctic-xvectors-extracted/resolve/main/cmu_us_slt_arctic-wav-arctic_a0001.bin';

      const result = await synthesizer(text, { speaker_embeddings });
      
      // Initialize the AudioContext if we haven't already
      if (!globalAudioContext) {
        globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Convert the Float32Array audio data into an AudioBuffer
      const audioBuffer = globalAudioContext.createBuffer(1, result.audio.length, result.sampling_rate);
      audioBuffer.getChannelData(0).set(result.audio);
      
      // Play it
      const source = globalAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(globalAudioContext.destination);
      source.start();
    } catch (e) {
      console.error("Neural TTS failed", e);
    }
  }, []);

  return { speak, isReady, isDownloading, progress, errorMsg };
}
