import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import ScoreMeter from '../components/common/ScoreMeter';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ResumeAnalyzerPage = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState('');
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const fetchExistingResume = async () => {
      try {
        const res = await api.get('/resume');
        setResumeData(res.data);
      } catch (err) {
        // No resume uploaded yet
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchExistingResume();
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e?.preventDefault();
    if (!file) return;

    setError('');
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResumeData(res.data);
      setFile(null);
      // Automatically trigger analysis if not analyzed
      await runAnalysis();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload resume.');
    } finally {
      setUploading(false);
    }
  };

  const runAnalysis = async () => {
    setError('');
    setAnalyzing(true);
    try {
      const res = await api.post('/resume/analyze', {
        target_role: user?.target_role || 'Software Engineer',
      });
      // Refresh full resume
      const fullRes = await api.get('/resume');
      setResumeData(fullRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze resume with AI.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loadingInitial) {
    return <LoadingSpinner text="Checking resume records..." />;
  }

  const analysis = resumeData?.analysis;

  return (
    <div className="space-y-8 animate-fadeIn w-full min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Resume Analyzer
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload your PDF resume to evaluate ATS readiness, extracted skills, and prioritized suggestions for{' '}
          <span className="font-semibold text-indigo-600">{user?.target_role || 'Software Engineer'}</span>.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
        className={`bg-white rounded-3xl p-8 border-2 border-dashed transition-all text-center ${
          dragOver
            ? 'border-indigo-500 bg-indigo-50/30'
            : 'border-slate-300 hover:border-indigo-400'
        }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center shadow-xs">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-800">
              {file ? file.name : 'Upload your resume PDF'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Drag and drop your file here, or click to browse (Max 5MB)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors">
              <span>{file ? 'Change PDF File' : 'Select PDF Document'}</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
              />
            </label>

            {file && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <LoadingSpinner size="sm" text="" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Upload & Analyze</span>
                  </>
                )}
              </button>
            )}
          </div>

          {resumeData && (
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-center space-x-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Current file on record: <strong>{resumeData.filename}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results View */}
      {analyzing ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-xs">
          <LoadingSpinner size="lg" text="Analyzing resume against industry standards..." />
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Top Row: Score + Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score Gauge Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                ATS Readiness Match
              </h3>
              <ScoreMeter score={analysis.score} size={140} label="Target Role Fit" />
              <button
                onClick={runAnalysis}
                className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Re-run Analysis &rarr;
              </button>
            </div>

            {/* Detected Skills Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
              <div className="flex items-center space-x-2 text-emerald-700 mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-sm font-bold">Detected Skills</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">Found in your uploaded resume:</p>
              <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-40">
                {analysis.detected_skills?.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
              <div className="flex items-center space-x-2 text-amber-700 mb-3">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-bold">Recommended Skills</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">Key skills to add for {user?.target_role || 'this role'}:</p>
              <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-40">
                {analysis.missing_skills?.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Suggestions Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="flex items-center space-x-2.5 text-indigo-700 mb-4">
              <Lightbulb className="w-5 h-5" />
              <h2 className="text-base font-bold text-slate-900">
                AI Optimization Suggestions
              </h2>
            </div>

            <div className="space-y-3">
              {analysis.suggestions?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-800 text-sm flex items-start space-x-3"
                >
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Text Drawer */}
          {resumeData?.resume_text && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <button
                onClick={() => setShowExtractedText(!showExtractedText)}
                className="w-full flex items-center justify-between text-slate-700 font-bold text-sm"
              >
                <span className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>View Extracted Resume Text</span>
                </span>
                {showExtractedText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showExtractedText && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed border border-slate-800">
                  {resumeData.resume_text}
                </div>
              )}
            </div>
          )}
        </div>
      ) : resumeData ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xs space-y-4">
          <p className="text-sm text-slate-600">
            Resume uploaded (<strong>{resumeData.filename}</strong>). Run the AI analysis to get full feedback.
          </p>
          <button
            onClick={runAnalysis}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Resume Now</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ResumeAnalyzerPage;

