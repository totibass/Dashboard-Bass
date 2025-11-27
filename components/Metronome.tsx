import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';

interface MetronomeProps {
  onClose?: () => void;
}

const Metronome: React.FC<MetronomeProps> = ({ onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(90);
  const [measure, setMeasure] = useState(4); // 4 beats per bar
  const [subdivision, setSubdivision] = useState(1); // 1 = quarter, 2 = eighth, 3 = triplet, 4 = sixteenth
  const [soundType, setSoundType] = useState<'click' | 'wood' | 'beep'>('click');

  const audioContext = useRef<AudioContext | null>(null);
  const nextNoteTime = useRef<number>(0);
  const timerID = useRef<number | null>(null);
  const currentBeatInBar = useRef<number>(0);

  // Initialize Audio Context on user interaction
  const ensureAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  };

  const scheduleNote = (beatNumber: number, time: number) => {
    if (!audioContext.current) return;
    const osc = audioContext.current.createOscillator();
    const envelope = audioContext.current.createGain();

    // Frequency logic
    const isFirstBeat = beatNumber % (measure * subdivision) === 0;
    const isQuarterNote = beatNumber % subdivision === 0;

    let frequency = 880; // Default High
    if (soundType === 'click') frequency = isFirstBeat ? 1200 : (isQuarterNote ? 800 : 600);
    if (soundType === 'wood') frequency = isFirstBeat ? 400 : (isQuarterNote ? 300 : 250);
    if (soundType === 'beep') frequency = isFirstBeat ? 2000 : 1000;

    osc.frequency.value = frequency;

    // Type of sound
    if (soundType === 'wood') osc.type = 'sine';
    else osc.type = 'square';

    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(envelope);
    envelope.connect(audioContext.current.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  };

  const scheduler = useCallback(() => {
    if (!audioContext.current) return;
    
    // While there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    const lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
    const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

    while (nextNoteTime.current < audioContext.current.currentTime + scheduleAheadTime) {
      scheduleNote(currentBeatInBar.current, nextNoteTime.current);

      const secondsPerBeat = 60.0 / bpm;
      const secondsPerSubdivision = secondsPerBeat / subdivision;
      
      nextNoteTime.current += secondsPerSubdivision;
      
      currentBeatInBar.current++;
      if (currentBeatInBar.current >= measure * subdivision) {
        currentBeatInBar.current = 0;
      }
    }
    timerID.current = window.setTimeout(scheduler, lookahead);
  }, [bpm, measure, subdivision, soundType]);

  useEffect(() => {
    if (isPlaying) {
      ensureAudioContext();
      currentBeatInBar.current = 0;
      if (audioContext.current) {
        nextNoteTime.current = audioContext.current.currentTime + 0.05;
      }
      scheduler();
    } else {
      if (timerID.current) window.clearTimeout(timerID.current);
    }
    return () => {
      if (timerID.current) window.clearTimeout(timerID.current);
    };
  }, [isPlaying, scheduler]);

  return (
    <div className="bg-surface border border-surfaceHighlight rounded-lg p-4 shadow-xl w-full max-w-xs mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-primary font-bold flex items-center gap-2">
          Métronome
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-subtext hover:text-white text-sm">Fermer</button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* BPM Display and Control */}
        <div className="flex items-center justify-between bg-background p-2 rounded">
          <button 
            className="text-2xl text-primaryHover hover:text-primary transition"
            onClick={() => setBpm(b => Math.max(30, b - 5))}
          >-</button>
          <div className="text-center">
            <span className="text-3xl font-mono font-bold text-white block leading-none">{bpm}</span>
            <span className="text-xs text-subtext uppercase">BPM</span>
          </div>
          <button 
            className="text-2xl text-primaryHover hover:text-primary transition"
            onClick={() => setBpm(b => Math.min(300, b + 5))}
          >+</button>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-subtext">
            <div className="flex flex-col gap-1">
                <label>Signature</label>
                <select 
                    value={measure} 
                    onChange={(e) => setMeasure(Number(e.target.value))}
                    className="bg-surfaceHighlight text-white p-1 rounded border border-transparent focus:border-primary outline-none"
                >
                    <option value="3">3/4</option>
                    <option value="4">4/4</option>
                    <option value="5">5/4</option>
                    <option value="6">6/8</option>
                    <option value="7">7/8</option>
                </select>
            </div>
            <div className="flex flex-col gap-1">
                <label>Subdivision</label>
                <select 
                    value={subdivision} 
                    onChange={(e) => setSubdivision(Number(e.target.value))}
                    className="bg-surfaceHighlight text-white p-1 rounded border border-transparent focus:border-primary outline-none"
                >
                    <option value="1">Noire (1)</option>
                    <option value="2">Croche (2)</option>
                    <option value="3">Triolet (3)</option>
                    <option value="4">Double (4)</option>
                </select>
            </div>
             <div className="flex flex-col gap-1 col-span-2">
                <label>Son</label>
                <div className="flex gap-2">
                    {['click', 'wood', 'beep'].map((s) => (
                        <button 
                            key={s}
                            onClick={() => setSoundType(s as any)}
                            className={`flex-1 p-1 rounded capitalize border ${soundType === s ? 'bg-primary text-white border-primary' : 'bg-transparent border-surfaceHighlight hover:border-subtext'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Main Action */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-full py-3 rounded-md font-bold text-white flex justify-center items-center gap-2 transition-all ${
            isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primaryHover'
          }`}
        >
          {isPlaying ? <Pause /> : <Play />}
          {isPlaying ? 'STOP' : 'START'}
        </button>
      </div>
    </div>
  );
};

export default Metronome;