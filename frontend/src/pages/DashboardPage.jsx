import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  TrendingUp,
  BrainCircuit,
  Map,
  MessageSquareCode,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import ScoreMeter from '../components/common/ScoreMeter';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [resumeRes, interviewRes] = await Promise.allSettled([
          api.get('/resume'),
          api.get('/interview/history')
        ]);

        if (resumeRes.status === 'fulfilled') {
          setResume(resumeRes.value.data);
        }
        if (interviewRes.status === 'fulfilled') {
          setInterviews(interviewRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard info:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const resumeScore = resume?.analysis?.score || 0;
  const avgInterviewScore =
    interviews.length > 0
      ? Math.round(
          interviews.reduce((acc, i) => acc + (i.score || 0), 0) / interviews.length
        )
      : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Career Readiness Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Hello, {user?.name || 'Candidate'}!
            </h1>
            <p className="mt-2 text-slate-300 text-sm sm:text-base max-w-xl">
              Targeting{' '}
              <span className="font-semibold text-cyan-300">
                {user?.target_role || 'Software Engineer'}
              </span>
              . Here is your current real-time readiness breakdown.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/interview"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Start Mock Interview</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Resume Match */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Resume Match
            </p>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-800">
                {resume?.analysis ? `${resumeScore}%` : 'N/A'}
              </span>
              <span className="text-xs text-slate-500">
                {resume ? 'Analyzed' : 'No upload'}
              </span>
            </div>
            <Link
              to="/resume"
              className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              {resume ? 'View Analysis' : 'Upload Resume'} &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Logged Skills */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Target Skills
            </p>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-800">
                {user?.skills?.length || 0}
              </span>
              <span className="text-xs text-slate-500">profile tags</span>
            </div>
            <Link
              to="/profile"
              className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Manage Skills &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Interviews Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mock Sessions
            </p>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-800">
                {interviews.length}
              </span>
              <span className="text-xs text-slate-500">completed</span>
            </div>
            <Link
              to="/interview"
              className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Practice More &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Average Interview Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Avg Interview Score
            </p>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-800">
                {avgInterviewScore !== null ? `${avgInterviewScore}%` : 'N/A'}
              </span>
              <span className="text-xs text-slate-500">AI graded</span>
            </div>
            <Link
              to="/career"
              className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Skill Gap Check &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Feature Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Resume Analyzer */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-indigo-300 transition-all glow-card flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Resume Analyzer</h3>
            <p className="text-sm text-slate-500 mb-4">
              Extract and evaluate your PDF resume against job standards. Get actionable bullet rewrites.
            </p>
          </div>
          <Link
            to="/resume"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>Analyze Resume</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Career Skill Gap */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-cyan-300 transition-all glow-card flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Career Gap Analysis</h3>
            <p className="text-sm text-slate-500 mb-4">
              Discover which skills give you the highest return and explore standout portfolio projects.
            </p>
          </div>
          <Link
            to="/career"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
          >
            <span>Explore Gap Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: AI Interview Simulator */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-300 transition-all glow-card flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">AI Interview Simulator</h3>
            <p className="text-sm text-slate-500 mb-4">
              Practice real-time technical & behavioral questions. Receive immediate AI scores and feedback.
            </p>
          </div>
          <Link
            to="/interview"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <span>Launch Interview</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 4: Learning Roadmap */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-purple-300 transition-all glow-card flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Personalized Roadmap</h3>
            <p className="text-sm text-slate-500 mb-4">
              Follow a custom 6-week curriculum with tracked milestones to reach full competency.
            </p>
          </div>
          <Link
            to="/roadmap"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-purple-600 hover:text-purple-700"
          >
            <span>View Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 5: AI Career Mentor */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-blue-300 transition-all glow-card flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">AI Career Mentor</h3>
            <p className="text-sm text-slate-500 mb-4">
              Ask anything about interviews, salary negotiations, system design, or career advancement.
            </p>
          </div>
          <Link
            to="/learn"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Chat with Mentor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 6: Profile & Target Role */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-amber-300 transition-all glow-card flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Profile & Skills</h3>
            <p className="text-sm text-slate-500 mb-4">
              Update your target role and keep your skill inventory refreshed for accurate AI recommendations.
            </p>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center space-x-2 text-sm font-semibold text-amber-600 hover:text-amber-700"
          >
            <span>Edit Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

