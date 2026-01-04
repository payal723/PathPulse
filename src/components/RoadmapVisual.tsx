
import React, { useState, useMemo } from 'react';
import type { RoadmapNode } from '../types';

interface RoadmapVisualProps {
  roadmap: RoadmapNode[];
}

const RoadmapVisual: React.FC<RoadmapVisualProps> = ({ roadmap }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());

  const progress = useMemo(() => {
    return roadmap.length > 0 ? Math.round((completedNodes.size / roadmap.length) * 100) : 0;
  }, [completedNodes, roadmap]);

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(completedNodes);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCompletedNodes(newSet);
  };

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'High': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="relative py-12 px-6">
      {/* Dynamic Progress Bar */}
      <div className="max-w-6xl mx-auto mb-20 px-4 md:px-12">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Mastery Achievement</h4>
            <div className="text-5xl font-black text-white italic tracking-tighter">{progress}%</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-black text-indigo-400 uppercase mb-2">Milestones</div>
            <div className="flex gap-1">
              {roadmap.map((node: RoadmapNode) => (
                <div 
                  key={node.id} 
                  className={`w-2 h-6 rounded-full transition-all duration-500 ${completedNodes.has(node.id) ? 'bg-indigo-500' : 'bg-slate-800'}`} 
                />
              ))}
            </div>
          </div>
        </div>
        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-1">
          <div 
            className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_30px_rgba(79,70,229,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col gap-20 relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block z-0 opacity-20">
          <div className="h-full w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-indigo-500" />
        </div>

        {roadmap.map((node: RoadmapNode, index: number) => {
          const isLeft = index % 2 === 0;
          const isCompleted = completedNodes.has(node.id);

          return (
            <div key={node.id} className={`flex flex-col md:flex-row items-center w-full relative z-10 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
              <div className="w-full md:w-5/12 group">
                <div 
                  className={`glass-card p-10 rounded-[3rem] border-t-4 transition-all duration-500 cursor-pointer relative
                    ${selectedNode === node.id ? 'ring-2 ring-indigo-500/50 shadow-2xl scale-[1.03]' : 'hover:-translate-y-2'}
                    ${isCompleted ? 'bg-indigo-600/10 border-indigo-400' : 'border-slate-800'}
                  `}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                >
                  <div className="flex justify-between items-center mb-6">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getImpactColor(node.salaryImpact)}`}>
                      Salary Impact: {node.salaryImpact}
                    </span>
                    <button 
                      onClick={(e) => toggleComplete(node.id, e)}
                      className={`w-10 h-10 rounded-2xl border transition-all flex items-center justify-center ${
                        isCompleted ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'
                      }`}
                    >
                      {isCompleted ? '✓' : '+'}
                    </button>
                  </div>

                  <h3 className="text-3xl font-black mb-4 tracking-tighter">{node.label}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8 font-light italic">"{node.description}"</p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {node.subskills.map((skill: string) => (
                      <span key={skill} className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {selectedNode === node.id && (
                    <div className="pt-8 mt-8 border-t border-slate-800 space-y-6 animate-in fade-in slide-in-from-top-6 duration-500">
                      <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20">
                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">🔥 Mastery Project</div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">{node.projectIdea}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Curated Resources</div>
                        {node.resources.map((res: any, i: number) => (
                          <a 
                            key={i} 
                            href={res.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition-all group/res"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-xl">{res.type === 'Video' ? '📽️' : '📚'}</span>
                              <span className="text-xs text-slate-300 font-bold uppercase tracking-tighter truncate max-w-[150px]">{res.name}</span>
                            </div>
                            <span className="text-[9px] font-black text-indigo-500 group-hover/res:translate-x-1 transition-transform">→</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10 w-20 h-20 my-12 md:my-0 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full animate-pulse opacity-20 ${isCompleted ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                <div className={`w-14 h-14 rounded-[1.5rem] border-4 border-slate-950 z-10 flex items-center justify-center font-black text-lg transition-all duration-700
                  ${isCompleted ? 'bg-indigo-600 text-white shadow-[0_0_25px_rgba(79,70,229,0.5)] rotate-[360deg]' : 'bg-slate-800 text-slate-500'}
                `}>
                  {isCompleted ? '✓' : index + 1}
                </div>
              </div>

              <div className="hidden md:block w-5/12" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapVisual;
