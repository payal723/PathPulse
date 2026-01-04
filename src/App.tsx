

import React, { useState, useEffect } from 'react';
import { generateCareerRoadmap, getAIRecommendations } from './services/geminiService';
import type { CareerGuide, AIRecommendation, DocSection } from './types';
import RoadmapVisual from './components/RoadmapVisual';
import InterviewRoom from './components/InterviewRoom';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'ROADMAP' | 'INTERVIEW'>('GUIDE');
  const [guide, setGuide] = useState<CareerGuide | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDocSection, setActiveDocSection] = useState(0);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio) {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
          if (selected) loadRecommendations();
        } else {
          setHasKey(true);
          loadRecommendations();
        }
      } catch (e) {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
      loadRecommendations();
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateCareerRoadmap(query);
      setGuide(data);
      setActiveDocSection(0);
      setActiveTab('GUIDE');
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err: any) {
      setError(err?.message || "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const recs = await getAIRecommendations("Tech, AI, Creative, Leadership");
      setRecommendations(recs);
    } catch (e) {}
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full p-10 rounded-[2.5rem] text-center space-y-8 shadow-2xl">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto rotate-3 text-white italic shadow-lg shadow-indigo-600/50">P</div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">System Sync</h1>
          <p className="text-slate-400 text-sm leading-relaxed">Initialize your AI engine by linking a project to unlock the career architect.</p>
          <div className="space-y-4 pt-4">
            <button onClick={handleSelectKey} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-xl">Connect Project</button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="block text-[10px] text-slate-600 hover:text-indigo-400 uppercase tracking-widest transition-colors">Billing Requirements</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-200">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-purple-900/10 blur-[120px] rounded-full" />
      </div>

      <header className="pt-24 pb-16 px-6 text-center max-w-4xl mx-auto space-y-10">
        <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
          Career Intelligence Agent v4
        </div>
        <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
          Map Your <br />
          <span className="gradient-text italic">Profession.</span>
        </h1>
        
        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
          <div className="relative flex flex-col md:flex-row gap-2">
            <input 
              type="text" 
              placeholder="What role do you aspire to?" 
              className="flex-1 bg-slate-900/60 backdrop-blur-3xl border border-slate-800 h-16 px-8 rounded-2xl md:rounded-l-2xl md:rounded-r-none text-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e.currentTarget.value)}
            />
            <button 
              onClick={(e) => handleSearch((e.currentTarget.previousSibling as HTMLInputElement).value)}
              disabled={loading}
              className="h-16 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl md:rounded-l-none md:rounded-r-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-2xl disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Generate Path'}
            </button>
          </div>
        </div>

        {!guide && !loading && recommendations.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {recommendations.map((rec, i) => (
              <button 
                key={i} 
                onClick={() => handleSearch(rec.role)}
                className="px-4 py-2 bg-slate-900/40 border border-slate-800/60 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-indigo-500/50 hover:bg-slate-900 transition-all"
              >
                {rec.role}
              </button>
            ))}
          </div>
        )}
      </header>

      {guide && (
        <main className="max-w-7xl mx-auto px-4 md:px-8 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <nav className="flex items-center justify-center p-1.5 bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-2xl sticky top-6 z-50 mb-16 shadow-2xl overflow-x-auto no-scrollbar">
            {[
              { id: 'GUIDE', label: 'Encyclopedia', icon: '📓' },
              { id: 'ROADMAP', label: 'Milestones', icon: '🛤️' },
              { id: 'INTERVIEW', label: 'Simulator', icon: '💡' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-6 md:px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="min-h-[500px]">
            {activeTab === 'GUIDE' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-3 lg:sticky lg:top-32 space-y-4 h-fit">
                  <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2">
                    {guide.detailedDocs.map((doc, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveDocSection(idx)}
                        className={`px-6 py-4 rounded-xl text-left text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                          activeDocSection === idx 
                            ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' 
                            : 'bg-slate-900/30 border-slate-800/40 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        Section 0{idx + 1}
                      </button>
                    ))}
                  </div>
                  <div className="hidden lg:block p-6 bg-slate-900/30 border border-slate-800/40 rounded-3xl space-y-4">
                    <div>
                      <h4 className="text-[9px] font-black uppercase text-slate-600 mb-1">Expectation</h4>
                      <div className="text-lg font-black text-white italic">{guide.salaryExpectation}</div>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black uppercase text-slate-600 mb-1">Growth</h4>
                      <div className="text-lg font-black text-indigo-400 italic">{guide.growthPotential}</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-8">
                  <article className="glass-card p-10 md:p-16 rounded-[2.5rem] border-slate-800/50 shadow-2xl">
                    <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-10 leading-tight">
                      {guide.detailedDocs[activeDocSection]?.title}
                    </h2>
                    <div className="prose prose-invert prose-lg max-w-none text-slate-400 font-light leading-relaxed whitespace-pre-wrap">
                      {guide.detailedDocs[activeDocSection]?.content}
                    </div>
                  </article>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                      <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6">Strengths</h4>
                      <ul className="space-y-4">
                        {guide.prosAndCons.pros.map((p, i) => (
                          <li key={i} className="text-sm text-slate-400 flex gap-3 italic"><span className="text-emerald-500">→</span> {p}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-3xl">
                      <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-6">Barriers</h4>
                      <ul className="space-y-4">
                        {guide.prosAndCons.cons.map((c, i) => (
                          <li key={i} className="text-sm text-slate-400 flex gap-3 italic"><span className="text-rose-500">!</span> {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-2">Reading Deck</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {guide.essentialReading.map((book, i) => (
                      <a key={i} href={book.link} target="_blank" className="p-6 bg-slate-900/30 border border-slate-800/40 rounded-2xl hover:border-indigo-500/50 transition-all group">
                        <div className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors uppercase italic mb-1">{book.title}</div>
                        <p className="text-[9px] text-slate-600 font-bold uppercase mb-3">{book.author || 'Contributor'}</p>
                        <p className="text-xs text-slate-500 line-clamp-3 italic leading-relaxed">{book.summary}</p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ROADMAP' && (
              <div className="max-w-4xl mx-auto py-4">
                <RoadmapVisual roadmap={guide.roadmap} />
              </div>
            )}

            {activeTab === 'INTERVIEW' && (
              <div className="max-w-3xl mx-auto py-4">
                <InterviewRoom role={guide.role} />
              </div>
            )}
          </div>
        </main>
      )}

      {error && (
        <div className="max-w-md mx-auto p-12 bg-rose-950/20 border border-rose-500/20 rounded-[2rem] text-center space-y-6">
          <div className="text-5xl">📡</div>
          <h3 className="text-xl font-black uppercase italic text-rose-500">Connection Failed</h3>
          <p className="text-slate-400 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="px-10 py-4 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Restart Agent</button>
        </div>
      )}
    </div>
  );
};

export default App;