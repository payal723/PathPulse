
import React, { useState, useEffect } from 'react';
import { generateCareerRoadmap, getAIRecommendations } from './services/geminiService';
import type { CareerGuide, AIRecommendation, DocSection } from './types';
import RoadmapVisual from './components/RoadmapVisual';
import InterviewRoom from './components/InterviewRoom';

// Corrected global declaration to match the environment.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // Removed readonly modifier to match existing declarations and fix the identical modifiers error.
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'ROADMAP' | 'INTERVIEW'>('GUIDE');
  const [guide, setGuide] = useState<CareerGuide | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDocSection, setActiveDocSection] = useState(0);
  const [docSearch, setDocSearch] = useState('');
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // If API_KEY is already in the environment (from your .env), bypass the selector
      const existingKey = import.meta.env.VITE_API_KEY;
      if (existingKey && existingKey !== "YOUR_API_KEY" && existingKey.length > 10) {
        setHasKey(true);
        loadRecommendations();
        return;
      }

      try {
        if (window.aistudio) {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
          if (selected) {
            loadRecommendations();
          }
        } else {
          // If not in an environment with aistudio selector, assume key might be needed or handled elsewhere
          setHasKey(false);
        }
      } catch (e) {
        setHasKey(false);
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
    } catch (err: any) {
      const errorMessage = err?.message || "Unknown system failure.";
      if (errorMessage.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("API Session expired or Key invalid. Please re-select.");
      } else {
        setError(`Connection Error: ${errorMessage}`);
      }
      console.error("Gemini API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const recs = await getAIRecommendations("Tech Leadership, Quantitative Finance, AI Systems");
      setRecommendations(recs);
    } catch (e) {
      console.error("Recommendations Load Error:", e);
    }
  };

  if (hasKey === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="glass-card max-w-lg w-full p-12 rounded-[3rem] text-center space-y-8 border-slate-900 shadow-2xl">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center font-black text-4xl shadow-3xl shadow-indigo-600/50 italic mx-auto rotate-3">P</div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">Authentication Required</h1>
          <p className="text-slate-500 font-light leading-relaxed">
            PathPulse utilizes Gemini 3 intelligence. Even if configured in .env, this platform requires a manual link for paid project validation.
          </p>
          <div className="space-y-4">
            <button 
              onClick={handleSelectKey}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase text-xs tracking-[0.3em] transition-all shadow-2xl active:scale-95"
            >
              Link API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="block text-[10px] font-black uppercase tracking-widest text-slate-700 hover:text-indigo-400 transition-colors"
            >
              Setup Billing Documentation
            </a>
          </div>
        </div>
      </div>
    );
  }

  const filteredDocs = guide?.detailedDocs.filter((doc: DocSection) => 
    doc.title.toLowerCase().includes(docSearch.toLowerCase()) || 
    doc.content.toLowerCase().includes(docSearch.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-20">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/5 rounded-full blur-[200px]" />
      </div>

      <section className="pt-40 pb-24 px-8 relative">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="inline-block px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">
            Next-Gen Career Intelligence
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter italic uppercase leading-none">
            Define Your <br />
            <span className="gradient-text">Destiny.</span>
          </h1>
          
          <div className="relative max-w-3xl mx-auto mt-16 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <input 
              type="text" 
              placeholder="What is your career objective?" 
              className="relative w-full bg-slate-950/80 backdrop-blur-3xl border border-slate-800 h-24 pl-10 pr-56 rounded-[2.5rem] text-2xl focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-white placeholder-slate-700 shadow-2xl"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e.currentTarget.value)}
            />
            <button 
              onClick={(e) => handleSearch((e.currentTarget.previousSibling as HTMLInputElement).value)}
              disabled={loading}
              className="absolute right-3 top-3 bottom-3 px-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              {loading ? 'Synthesizing...' : 'Architect'}
            </button>
          </div>
        </div>
      </section>

      {loading && (
        <div className="max-w-4xl mx-auto p-24 text-center space-y-8 animate-in fade-in duration-500">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-2xl"></div>
          </div>
          <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Mapping Career Trajectories...</p>
        </div>
      )}

      {!guide && !loading && !error && recommendations.length > 0 && (
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h3 className="text-center text-xs font-black uppercase tracking-widest text-slate-500 mb-8">AI Suggestions For You</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, i) => (
              <button 
                key={i}
                onClick={() => handleSearch(rec.role)}
                className="glass-card p-6 rounded-3xl text-left hover:border-indigo-500/50 transition-all group"
              >
                <div className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-2">Recommendation {i+1}</div>
                <div className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors mb-2">{rec.role}</div>
                <div className="text-xs text-slate-500 leading-relaxed italic">{rec.reason}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {guide && !loading && !error && (
        <main className="max-w-[1400px] mx-auto px-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="flex flex-wrap items-center justify-between mb-16 bg-slate-950/50 backdrop-blur-3xl border border-slate-900 p-2 rounded-[2.5rem] sticky top-8 z-50 shadow-2xl">
            <div className="flex gap-1">
              {[
                { id: 'GUIDE', label: 'Encyclopedia', icon: '🏛️' },
                { id: 'ROADMAP', label: 'The Pipeline', icon: '🛣️' },
                { id: 'INTERVIEW', label: 'Evaluation', icon: '⚔️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-4 px-10 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all ${
                    activeTab === tab.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40' : 'text-slate-600 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="px-10 hidden lg:block">
              <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest mr-4">Blueprint For:</span>
              <span className="text-white font-black uppercase tracking-tighter text-lg italic">{guide.role}</span>
            </div>
          </div>

          <div className="min-h-[1000px]">
            {activeTab === 'GUIDE' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <aside className="lg:col-span-3">
                  <div className="glass-card p-10 rounded-[3rem] border-slate-900 sticky top-44 shadow-2xl">
                    <input 
                      type="text" 
                      placeholder="SEARCH DOCS"
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-[10px] font-black uppercase mb-8 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-indigo-400 placeholder-slate-700"
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                    />
                    <nav className="space-y-3">
                      {filteredDocs.map((doc: DocSection, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const originalIdx = guide.detailedDocs.findIndex(d => d.title === doc.title);
                            setActiveDocSection(originalIdx);
                          }}
                          className={`w-full text-left px-6 py-5 rounded-[1.5rem] transition-all text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-5
                            ${guide.detailedDocs[activeDocSection]?.title === doc.title ? 'bg-indigo-500 text-white shadow-xl rotate-[-2deg]' : 'text-slate-600 hover:text-slate-300 hover:bg-slate-900'}
                          `}
                        >
                          <span className="opacity-30">#0{idx + 1}</span>
                          <span className="truncate">{doc.title}</span>
                        </button>
                      ))}
                    </nav>

                    <div className="mt-12 pt-12 border-t border-slate-900 grid grid-cols-1 gap-4">
                      <div className="p-6 bg-slate-950 border border-slate-900 rounded-[2rem]">
                        <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Growth Index</div>
                        <div className="text-indigo-500 font-black text-lg italic tracking-tighter">{guide.growthPotential}</div>
                      </div>
                    </div>
                  </div>
                </aside>

                <div className="lg:col-span-6 space-y-12">
                  <article className="glass-card p-16 md:p-24 rounded-[5rem] border-slate-900 shadow-[0_40px_100px_rgba(0,0,0,0.5)] animate-in fade-in duration-700">
                    {guide.detailedDocs[activeDocSection] ? (
                      <>
                        <header className="mb-16 pb-16 border-b border-slate-900">
                          <h2 className="text-7xl font-black mb-10 tracking-tighter leading-[0.9] text-white italic uppercase">
                            {guide.detailedDocs[activeDocSection].title}
                          </h2>
                          <div className="flex gap-6">
                            <span className="px-6 py-2 bg-slate-900 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Segment Alpha</span>
                            <span className="px-6 py-2 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Validated</span>
                          </div>
                        </header>
                        <div className="prose prose-invert prose-2xl max-w-none">
                          <p className="text-slate-400 text-2xl font-light leading-[1.6] whitespace-pre-wrap">
                            {guide.detailedDocs[activeDocSection].content}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-700 italic font-black uppercase text-xs tracking-widest">
                        Data Stream Invalid / No Matches
                      </div>
                    )}
                  </article>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="glass-card p-12 rounded-[4rem] border-emerald-500/10 bg-emerald-500/5">
                      <h4 className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] mb-10 italic">Core Competitive Edge</h4>
                      <ul className="space-y-8">
                        {guide.prosAndCons.pros.map((p: string, i: number) => (
                          <li key={i} className="text-slate-400 text-sm font-light italic flex gap-6">
                            <span className="text-emerald-500 font-black">❯</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="glass-card p-12 rounded-[4rem] border-rose-500/10 bg-rose-500/5">
                      <h4 className="text-rose-500 font-black text-[10px] uppercase tracking-[0.4em] mb-10 italic">System Risk Factors</h4>
                      <ul className="space-y-8">
                        {guide.prosAndCons.cons.map((c: string, i: number) => (
                          <li key={i} className="text-slate-400 text-sm font-light italic flex gap-6">
                            <span className="text-rose-500 font-black">!</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <aside className="lg:col-span-3 space-y-12">
                  <div className="glass-card p-12 rounded-[4rem] border-slate-900 shadow-2xl">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-12 text-indigo-500">The Reading List</h3>
                    <div className="space-y-12">
                      {guide.essentialReading.map((book: any, i: number) => (
                        <div key={i} className="group cursor-pointer">
                          <a href={book.link} target="_blank" rel="noreferrer" className="block space-y-4">
                            <h4 className="font-black text-white group-hover:text-indigo-400 transition-colors uppercase text-sm tracking-tighter italic">
                              {book.title}
                            </h4>
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Authored By: {book.author || 'Architect'}</p>
                            <p className="text-xs text-slate-500 leading-relaxed font-light line-clamp-4">
                              {book.summary}
                            </p>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-12 rounded-[4rem] bg-indigo-600 shadow-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                    <h4 className="text-white text-4xl font-black mb-6 tracking-tighter italic uppercase leading-none">Skill Check</h4>
                    <p className="text-indigo-100 text-sm mb-12 font-light leading-relaxed">
                      Benchmark your technical parity against industry gold standards using our AI simulator.
                    </p>
                    <button 
                      onClick={() => setActiveTab('INTERVIEW')}
                      className="w-full py-6 bg-white text-indigo-900 rounded-3xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-slate-100 transition-all shadow-2xl active:scale-95"
                    >
                      Initialize Link
                    </button>
                  </div>
                </aside>
              </div>
            )}

            {activeTab === 'ROADMAP' && (
              <div className="animate-in fade-in zoom-in-95 duration-1000">
                <div className="glass-card rounded-[5rem] overflow-hidden border-slate-900 shadow-3xl">
                  <div className="p-20 border-b border-slate-900 bg-slate-950/50 backdrop-blur-3xl">
                    <h2 className="text-8xl font-black tracking-tighter mb-6 italic uppercase">The Pipeline</h2>
                    <p className="text-slate-600 text-2xl max-w-3xl font-light leading-relaxed">
                      A visual architecture of skills and developmental phases required for elite mastery of the {guide.role} landscape.
                    </p>
                  </div>
                  <RoadmapVisual roadmap={guide.roadmap} />
                </div>
              </div>
            )}

            {activeTab === 'INTERVIEW' && (
              <div className="max-w-5xl mx-auto py-12 animate-in slide-in-from-bottom-12 duration-1000">
                <InterviewRoom role={guide.role} />
              </div>
            )}
          </div>
        </main>
      )}

      {error && (
        <div className="max-w-2xl mx-auto mt-32 p-16 bg-rose-950/20 border border-rose-500/20 rounded-[4rem] text-rose-500 text-center animate-in zoom-in duration-500">
          <div className="text-8xl mb-10 opacity-50">☢️</div>
          <h4 className="text-2xl font-black uppercase tracking-[0.4em] mb-6">Link Interrupted</h4>
          <p className="text-sm opacity-60 font-medium leading-relaxed max-w-sm mx-auto mb-10">{error}</p>
          <button onClick={() => window.location.reload()} className="px-10 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-400 transition-all">Reset Sync</button>
        </div>
      )}

      <footer className="mt-96 border-t border-slate-900 py-48 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10 px-10">
          <div className="flex items-center justify-center gap-6 mb-16">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-3xl shadow-indigo-600/50 italic rotate-3">P</div>
            <span className="text-7xl font-black tracking-tighter uppercase italic text-white/90">PathPulse</span>
          </div>
          <p className="text-slate-600 font-light max-w-xl mx-auto leading-[1.8] text-xl italic">
            "Harnessing cognitive architecture to redefine professional trajectories in an era of exponential change."
          </p>
          <div className="mt-20 flex flex-wrap justify-center gap-16 text-slate-700 text-[10px] font-black uppercase tracking-[0.5em]">
            <a href="#" className="hover:text-indigo-500 transition-colors">Core API</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">Nexus Privacy</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">Neural Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
