
import React, { useState } from 'react';
import { generateInterviewQuestions, evaluateInterview } from '../services/geminiService';
import type { InterviewQuestion, InterviewFeedback } from '../types';

interface InterviewRoomProps {
  role: string;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({ role }) => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'STARTED' | 'EVALUATING' | 'FINISHED'>('IDLE');

  const startInterview = async () => {
    setLoading(true);
    try {
      const q = await generateInterviewQuestions(role, 'Mid-Level');
      setQuestions(q);
      setStatus('STARTED');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setStatus('EVALUATING');
      const qas = questions.map((q, i) => ({ question: q.question, answer: newAnswers[i] }));
      const result = await evaluateInterview(role, 'Mid-Level', qas);
      setFeedback(result);
      setStatus('FINISHED');
    }
  };

  if (status === 'IDLE') {
    return (
      <div className="glass-card p-16 rounded-[4rem] text-center space-y-10 border-slate-800">
        <div className="w-24 h-24 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-2xl">
          <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic">Mock Simulator</h2>
          <p className="text-slate-500 max-w-md mx-auto font-light text-lg">
            Challenge your expertise against our advanced career intelligence model for <span className="text-indigo-400 font-bold">{role}</span>.
          </p>
        </div>
        <button 
          onClick={startInterview}
          disabled={loading}
          className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all disabled:opacity-50 shadow-2xl shadow-indigo-600/30 active:scale-95"
        >
          {loading ? 'Booting Evaluation...' : 'Initiate Session'}
        </button>
      </div>
    );
  }

  if (status === 'STARTED') {
    const q = questions[currentIdx];
    return (
      <div className="glass-card p-16 rounded-[4rem] space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 border-slate-800">
        <div className="flex justify-between items-center border-b border-slate-800 pb-8">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Question Segment</span>
            <div className="text-2xl font-black text-indigo-400">0{currentIdx + 1} / 0{questions.length}</div>
          </div>
          <span className="text-[10px] px-5 py-2 bg-slate-800 rounded-full text-white border border-slate-700 font-black uppercase tracking-widest">{q?.category}</span>
        </div>
        
        <h3 className="text-3xl font-black leading-tight tracking-tighter">{q?.question}</h3>
        
        <div className="space-y-4">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Structured Response Input</label>
          <textarea 
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full h-56 bg-slate-950/50 border border-slate-800 rounded-[2rem] p-8 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none text-lg font-light leading-relaxed"
            placeholder="Outline your response here..."
          />
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleNext}
            disabled={!currentAnswer.trim()}
            className="px-10 py-5 bg-white text-indigo-900 rounded-2xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-50 flex items-center gap-3 hover:bg-indigo-50 active:scale-95 shadow-xl"
          >
            {currentIdx < questions.length - 1 ? 'Advance Segment' : 'Finalize Review'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    );
  }

  if (status === 'EVALUATING') {
    return (
      <div className="glass-card p-20 rounded-[4rem] text-center space-y-10 border-slate-800">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full animate-ping"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic">Synthesizing Feedback</h2>
          <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em] animate-pulse">Cross-referencing industry standards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-16 rounded-[4rem] space-y-16 border-slate-800">
      <div className="text-center space-y-4">
        <div className="text-xs font-black text-indigo-400 uppercase tracking-widest">Performance Score</div>
        <div className="text-8xl font-black gradient-text tracking-tighter italic">{feedback?.score}</div>
        <h2 className="text-2xl font-black uppercase tracking-widest mt-4">Evaluation Complete</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-10 rounded-[3rem]">
          <h3 className="text-emerald-400 font-black uppercase text-xs tracking-widest mb-8 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-sm">✓</span>
            Observed Strengths
          </h3>
          <ul className="space-y-6">
            {feedback?.strengths.map((s, i) => (
              <li key={i} className="text-slate-400 text-sm font-medium italic flex gap-4">
                <span className="text-emerald-500 font-black">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-rose-500/5 border border-rose-500/10 p-10 rounded-[3rem]">
          <h3 className="text-rose-400 font-black uppercase text-xs tracking-widest mb-8 flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-sm">!</span>
            Critical Improvements
          </h3>
          <ul className="space-y-6">
            {feedback?.weaknesses.map((w, i) => (
              <li key={i} className="text-slate-400 text-sm font-medium italic flex gap-4">
                <span className="text-rose-400 font-black">×</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/10 p-12 rounded-[3rem]">
        <h3 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-6">Expert Strategic Tips</h3>
        <p className="text-slate-300 italic leading-relaxed text-lg font-light">"{feedback?.improvementTips}"</p>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => {
            setStatus('IDLE');
            setAnswers([]);
            setCurrentIdx(0);
          }}
          className="px-12 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all border border-slate-700 shadow-xl"
        >
          Initialize New Evaluation
        </button>
      </div>
    </div>
  );
};

export default InterviewRoom;
