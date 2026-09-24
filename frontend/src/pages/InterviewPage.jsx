import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  History,
  RotateCcw,
  Sparkles,
  Award,
  Calendar,
  AlertCircle,
  Trash2
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import ScoreMeter from '../components/common/ScoreMeter';
import LoadingSpinner from '../components/common/LoadingSpinner';

const InterviewPage = () => {
  const { user } = useAuth();

  // Session configuration state
  const [role, setRole] = useState(user?.target_role || 'Software Engineer');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [numQuestions, setNumQuestions] = useState(3);

  // Active interview state
  const [interviewSession, setInterviewSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [gradingResult, setGradingResult] = useState(null);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Loading and history states
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('practice'); // 'practice' | 'history'
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/interview/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteInterview = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/interview/${id}`);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete interview:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setError('');
    setStarting(true);
    setGradingResult(null);
    setIsSessionComplete(false);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');

    try {
      const res = await api.post('/interview/start', {
        role,
        difficulty,
        num_questions: Number(numQuestions),
      });
      setInterviewSession(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start interview session.');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!currentAnswer.trim() || !interviewSession) return;

    setError('');
    setSubmitting(true);
    const activeQuestion = interviewSession.questions[currentQuestionIndex];

    try {
      const res = await api.post('/interview/answer', {
        interview_id: interviewSession.interview_id,
        question_id: activeQuestion.id,
        answer: currentAnswer,
      });
      setGradingResult(res.data);
      fetchHistory(); // Refresh history in background
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to evaluate answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!interviewSession) return;
    if (currentQuestionIndex + 1 < interviewSession.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
      setGradingResult(null);
    } else {
      setIsSessionComplete(true);
    }
  };

  const handleReset = () => {
    setInterviewSession(null);
    setGradingResult(null);
    setIsSessionComplete(false);
    setCurrentAnswer('');
    setCurrentQuestionIndex(0);
  };

  const currentQuestion = interviewSession?.questions[currentQuestionIndex];

  return (
    <div className="space-y-8 animate-fadeIn w-full min-w-0">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Interview Practice
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Simulate realistic technical and behavioral interviews with real-time scoring and feedback.
          </p>
        </div>

        <div className="flex items-center space-x-1 p-1 bg-slate-200/70 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'practice'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Practice Simulator
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              fetchHistory();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'practice' ? (
        !interviewSession ? (
          /* Step 1: Session Setup Panel */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center space-x-3 text-indigo-600 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Setup Interview Simulation
              </h2>
            </div>

            <form onSubmit={handleStartInterview} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Role / Position
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer, DevOps Engineer"
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="Junior">Junior / Entry Level</option>
                    <option value="Intermediate">Intermediate / Mid-Level</option>
                    <option value="Senior">Senior / Tech Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Question Count
                  </label>
                  <select
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value={3}>3 Questions </option>
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={30}>30 Questions</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={starting}
                className="w-full mt-4 inline-flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {starting ? (
                  <LoadingSpinner size="sm" text="" />
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Generate & Start Questions</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : isSessionComplete ? (
          /* Session Completed Summary */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Interview Completed!
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Great job completing your mock session for <strong>{interviewSession.role}</strong> ({interviewSession.difficulty}).
              </p>
            </div>

            {gradingResult && (
              <div className="py-4">
                <ScoreMeter score={gradingResult.average_score} size={130} label="Final Average Score" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start New Interview</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
              >
                View History
              </button>
            </div>
          </div>
        ) : (
          /* Active Question & Answer Experience */
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Progress Bar & Header */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
                  Question {currentQuestionIndex + 1} of {interviewSession.questions.length}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {interviewSession.role} &bull; {interviewSession.difficulty}
                </span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
              >
                Exit Session
              </button>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Interviewer Question:
              </h3>
              <p className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {currentQuestion?.question}
              </p>
            </div>

            {/* Answer Input or Feedback Display */}
            {!gradingResult ? (
              <form onSubmit={handleSubmitAnswer} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Your Answer:
                </label>
                <textarea
                  rows={6}
                  required
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Explain your thought process, architecture decisions, trade-offs, or concrete examples..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed transition-all"
                />
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    {currentAnswer.length} characters
                  </span>
                  <button
                    type="submit"
                    disabled={submitting || !currentAnswer.trim()}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <LoadingSpinner size="sm" text="" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Submit Answer for AI Grading</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Instant Grading Breakdown Card */
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      AI Feedback & Grading
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Graded against {interviewSession.difficulty} benchmark
                    </p>
                  </div>
                  <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 font-extrabold text-sm">
                    <span>Score:</span>
                    <span className="text-indigo-600 text-lg">{gradingResult.score}/100</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-800 text-sm leading-relaxed">
                  <strong>Assessment:</strong> {gradingResult.feedback}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Strengths</span>
                    </div>
                    <ul className="text-xs text-emerald-950 space-y-1.5 list-disc pl-4">
                      {gradingResult.strengths?.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
                    <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Improvements</span>
                    </div>
                    <ul className="text-xs text-amber-950 space-y-1.5 list-disc pl-4">
                      {gradingResult.improvements?.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <span>
                      {currentQuestionIndex + 1 < interviewSession.questions.length
                        ? 'Next Question'
                        : 'Finish Interview'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        /* History Log Tab */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Past Mock Interviews
          </h2>

          {loadingHistory ? (
            <LoadingSpinner text="Loading interview sessions..." />
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No past interviews recorded yet.</p>
              <button
                onClick={() => setActiveTab('practice')}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Start your first interview session &rarr;
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Questions</th>
                    <th className="py-3 px-4">Avg Score</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{item.role}</td>
                      <td className="py-3.5 px-4 text-slate-600">{item.difficulty}</td>
                      <td className="py-3.5 px-4 text-slate-500">{item.questions_count} questions</td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                          {item.score !== null && item.score !== undefined ? `${Math.round(item.score)}%` : '0%'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => handleDeleteInterview(item.id, e)}
                          title="Delete interview from history"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewPage;

