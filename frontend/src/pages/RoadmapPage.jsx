import React, { useState, useEffect } from 'react';
import {
  Map,
  Sparkles,
  CheckCircle2,
  Circle,
  RefreshCw,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RoadmapPage = () => {
  const { user } = useAuth();
  const [roadmapData, setRoadmapData] = useState(null);
  const [completedItems, setCompletedItems] = useState(() => {
    const saved = localStorage.getItem('careerai_completed_roadmap_items');
    return saved ? JSON.parse(saved) : {};
  });
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchRoadmap = async () => {
    try {
      const res = await api.get('/roadmap');
      setRoadmapData(res.data);
    } catch (err) {
      // If no roadmap exists yet, auto generate
      await generateRoadmap();
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async () => {
    setError('');
    setRegenerating(true);
    try {
      const res = await api.post('/roadmap/generate', {
        target_role: user?.target_role || 'Software Engineer',
        current_skills: user?.skills || [],
      });
      setRoadmapData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate roadmap.');
    } finally {
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [user?.target_role]);

  const toggleItem = (key) => {
    const next = { ...completedItems, [key]: !completedItems[key] };
    setCompletedItems(next);
    localStorage.setItem('careerai_completed_roadmap_items', JSON.stringify(next));
  };

  // Calculate completion percentage
  const allSubtopics = roadmapData?.roadmap?.weeks?.flatMap((w) => w.subtopics) || [];
  const totalCount = allSubtopics.length;
  const completedCount = allSubtopics.filter((_, idx) => completedItems[`item_${idx}`]).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Personalized Learning Roadmap
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A step-by-step 6-week curriculum calibrated for{' '}
            <span className="font-semibold text-indigo-600">{user?.target_role || 'Software Engineer'}</span>.
          </p>
        </div>

        <button
          onClick={generateRoadmap}
          disabled={regenerating}
          className="self-start sm:self-auto inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-300/80 shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
          <span>Regenerate Curriculum</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-slate-700">Roadmap Progress</span>
          <span className="font-extrabold text-indigo-600">{progressPercent}% Completed</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 text-right">
          {completedCount} of {totalCount} topics mastered
        </p>
      </div>

      {loading || regenerating ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-xs">
          <LoadingSpinner size="lg" text="Architecting custom learning roadmap..." />
        </div>
      ) : roadmapData?.roadmap?.weeks ? (
        <div className="space-y-6">
          {roadmapData.roadmap.weeks.map((w, wIdx) => (
            <div
              key={w.week}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all glow-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center">
                    W{w.week}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Week {w.week}: {w.topic}
                    </h2>
                    <span className="text-xs font-semibold text-slate-400">
                      Phase {w.week} Milestones
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtopics Checklist */}
              <div className="space-y-2.5 mt-4 pt-4 border-t border-slate-100">
                {w.subtopics.map((sub, sIdx) => {
                  const itemKey = `week_${w.week}_sub_${sIdx}`;
                  const isChecked = !!completedItems[itemKey];

                  return (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => toggleItem(itemKey)}
                      className={`w-full text-left p-3 rounded-2xl text-sm flex items-center space-x-3 transition-all ${
                        isChecked
                          ? 'bg-emerald-50/60 border border-emerald-200/80 text-emerald-900 line-through opacity-80'
                          : 'bg-slate-50 border border-slate-200/70 hover:bg-indigo-50/40 text-slate-800'
                      }`}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                      )}
                      <span className="leading-snug">{sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default RoadmapPage;

