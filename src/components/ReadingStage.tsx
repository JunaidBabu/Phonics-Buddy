import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, ChevronRight, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { READING_PARAGRAPHS } from '../constants/readingData';

interface WordStatus {
  word: string;
  isCorrect: boolean;
  isCurrent: boolean;
}

export default function ReadingStage() {
  const [level, setLevel] = useState<'word' | 'sentence' | 'paragraph'>('word');
  const [content, setContent] = useState<{ text: string; words: string[] } | null>(null);
  const [wordStatuses, setWordStatuses] = useState<WordStatus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [successSound, setSuccessSound] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Preload a happy sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    setSuccessSound(audio);
    loadNewContent('word');
  }, []);

  const loadNewContent = useCallback((newLevel: 'word' | 'sentence' | 'paragraph') => {
    setIsLoading(true);
    
    // Pick a random paragraph
    const randomParagraph = READING_PARAGRAPHS[Math.floor(Math.random() * READING_PARAGRAPHS.length)].toLowerCase();
    
    let text = '';
    if (newLevel === 'word') {
      // Pick a random word from the paragraph (excluding punctuation)
      const words = randomParagraph.replace(/[.]/g, '').split(/\s+/);
      text = words[Math.floor(Math.random() * words.length)];
    } else if (newLevel === 'sentence') {
      // Pick the first sentence
      text = randomParagraph.split('.')[0] + '.';
    } else {
      // Full paragraph
      text = randomParagraph;
    }

    // Split text into words but keep punctuation attached for display
    const words = text.split(/\s+/);
    
    setContent({ text, words });
    setWordStatuses(words.map((w, i) => ({
      word: w,
      isCorrect: false,
      isCurrent: i === 0
    })));
    setCurrentIndex(0);
    setIsLoading(false);
  }, []);

  const handleNextWord = () => {
    if (!content) return;

    // Play success sound
    if (successSound) {
      successSound.currentTime = 0;
      successSound.play().catch(() => {});
    }

    // Party popper effect for every word
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FF69B4', '#00CED1', '#ADFF2F'],
      ticks: 100
    });

    setWordStatuses(prev => prev.map((status, i) => {
      if (i === currentIndex) return { ...status, isCorrect: true, isCurrent: false };
      if (i === currentIndex + 1) return { ...status, isCurrent: true };
      return status;
    }));

    if (currentIndex === content.words.length - 1) {
      // Finished all words! Big celebration
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#FFD700', '#FF69B4', '#00CED1', '#ADFF2F']
        });
      }, 200);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const completedCount = wordStatuses.filter((status) => status.isCorrect).length;
  const progress = content ? Math.round((completedCount / content.words.length) * 100) : 0;
  const isFinished = content && currentIndex === content.words.length - 1 && wordStatuses[currentIndex]?.isCorrect;

  return (
    <div className="min-h-screen bg-[#FFF9F0] p-6 flex flex-col items-center justify-center font-sans">
      {/* Level Selector */}
      <div className="flex gap-4 mb-12">
        {(['word', 'sentence', 'paragraph'] as const).map((l) => (
          <button
            key={l}
            onClick={() => { setLevel(l); loadNewContent(l); }}
            className={`px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider transition-all ${
              level === l 
                ? 'bg-[#FF6B6B] text-white shadow-lg scale-105' 
                : 'bg-white text-[#FF6B6B] border-2 border-[#FF6B6B] hover:bg-[#FFF0F0]'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Main Stage */}
      <div className="w-full max-w-4xl bg-white rounded-[40px] p-12 shadow-2xl border-b-8 border-[#E0E0E0] relative overflow-hidden min-h-[400px] flex items-center justify-center">
        {/* Decorative elements */}
        <div className="absolute top-4 left-4 text-[#FFD93D] opacity-20"><Sparkles size={48} /></div>
        <div className="absolute bottom-4 right-4 text-[#6BCB77] opacity-20"><Sparkles size={48} /></div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="animate-spin text-[#FF6B6B] mb-4" size={48} />
            <p className="text-[#888] font-medium">Getting your words ready...</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-8">
            {wordStatuses.map((status, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: status.isCurrent ? 1.25 : 1,
                  color: status.isCorrect ? '#6BCB77' : status.isCurrent ? '#FF6B6B' : '#2D3436'
                }}
                className={`text-5xl md:text-7xl font-black tracking-tight transition-all duration-300 ${
                  status.isCurrent ? 'underline decoration-8 underline-offset-12' : ''
                }`}
              >
                {status.word}
              </motion.span>
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl mt-8">
        <div className="flex items-center justify-between gap-4 mb-3 text-sm text-[#636E72]">
          <span>{content ? `${completedCount}/${content.words.length} words read` : 'Ready to read'}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-3 rounded-full bg-[#F0F0F0] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#4D96FF]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Parent Controls */}
      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="flex items-center gap-12">
          {!isFinished ? (
            <>
              <button
                onClick={handleNextWord}
                disabled={isLoading || !content}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-28 h-28 rounded-full bg-[#6BCB77] flex items-center justify-center text-white shadow-2xl transition-all group-hover:scale-110 group-active:scale-95 border-b-8 border-[#4DA858]">
                  <Play size={56} fill="currentColor" className="ml-2" />
                </div>
                <span className="text-[#4DA858] font-black uppercase tracking-widest text-xs">Next Word</span>
              </button>

              <button
                onClick={() => loadNewContent(level)}
                disabled={isLoading}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-20 h-20 rounded-full bg-[#B2BEC3] flex items-center justify-center text-white shadow-lg transition-all group-hover:scale-110 group-active:scale-95 border-b-4 border-[#7F8C8D]">
                  <RefreshCw size={32} />
                </div>
                <span className="text-[#7F8C8D] font-black uppercase tracking-widest text-[10px]">Skip to Next</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => loadNewContent(level)}
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-28 h-28 rounded-full bg-[#4D96FF] flex items-center justify-center text-white shadow-2xl transition-all group-hover:scale-110 group-active:scale-95 border-b-8 border-[#3A7BD5]">
                <ChevronRight size={56} className="ml-1" />
              </div>
              <span className="text-[#3A7BD5] font-black uppercase tracking-widest text-xs">New Set</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
