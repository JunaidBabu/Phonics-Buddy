/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ReadingStage from './components/ReadingStage';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <header className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FF6B6B] rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
            <span className="text-2xl font-black">A</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#2D3436] tracking-tight">Phonics Buddy</h1>
            <p className="mt-1 text-sm text-[#636E72]">A playful reading coach for early learners.</p>
          </div>
        </div>
      </header>

      <main>
        <ReadingStage />
      </main>
    </div>
  );
}
