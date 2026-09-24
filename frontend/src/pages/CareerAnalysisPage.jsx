import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  ArrowRight,
  Briefcase,
  Layers,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CareerAnalysisPage = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalysis = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/career/analyze', {
        target_role: user?.target_role || 'Software Engineer',
        current_skills: user?.skills || [],
      });
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate career analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [user?.target_role]);

  return (
    <div className="space-y-8 animate-fadeIn w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Career & Skill Gap Analysis
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Compare your skillset against requirements for{' '}
            <span className="font-semibold text-indigo-600">{user?.target_role || 'Software Engineer'}</span>.
          </p>
        </div>

        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-300/80 shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-xs">
          <LoadingSpinner size="lg" text="Evaluating skill-gap requirements..." />
        </div>
      ) : analysis ? (
        <div className="space-y-8">
          {/* Strengths and Gaps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidate Strengths Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2.5 text-emerald-700 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Candidate Strengths
                  </h2>
                </div>

                <div className="space-y-3">
                  {analysis.strengths?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 text-emerald-950 text-sm flex items-start space-x-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* High-Priority Gaps to Improve */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2.5 text-amber-700 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Skills to Improve
                  </h2>
                </div>

                <div className="space-y-3">
                  {analysis.skills_to_improve?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100/80 text-amber-950 text-sm flex items-start space-x-3"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Portfolio Projects */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Standout Portfolio Projects
                </h2>
                <p className="text-xs text-slate-500">
                  Build these real-world projects to validate your skills and impress hiring managers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {analysis.recommended_projects?.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all glow-card flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 block">
                      Project {idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      {proj}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CareerAnalysisPage;

