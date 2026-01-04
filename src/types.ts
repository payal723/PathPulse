
export interface RoadmapNode {
  id: string;
  label: string;
  description: string;
  phase: 'Basic' | 'Intermediate' | 'Advanced';
  subskills: string[];
  duration: string;
  importance: 'Critical' | 'Recommended' | 'Optional';
  category?: 'Technical' | 'Soft Skill' | 'Tooling';
  resources: { name: string; url: string; type: 'Video' | 'Article' | 'Course' }[];
  salaryImpact: 'Low' | 'Medium' | 'High';        // ← add this
  projectIdea: string;  
}

export interface DocSection {
  title: string;
  content: string;
}

export interface CareerGuide {
  role: string;
  overview: string;
  salaryExpectation: string;
  difficulty: string;
  growthPotential: string;
  detailedDocs: DocSection[];
  prosAndCons: { pros: string[]; cons: string[] };
  essentialReading: { title: string; summary: string; link: string; author?: string }[];
  roadmap: RoadmapNode[];
}

export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
}

export interface InterviewFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string;
}

export interface AIRecommendation {
  role: string;
  reason: string;
  suitability: number;
}
