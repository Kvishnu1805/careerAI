import React, { useState } from 'react';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Bot,
  User,
  BookOpen,
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SUGGESTED_QUESTIONS = [
  'How should I structure bullet points on my resume to pass ATS filters?',
  'Explain how to answer system design questions using trade-offs.',
  'What is the STAR method and how do I apply it for behavioral questions?',
  'How do I prepare for a live coding interview in 2 weeks?'
];

const LearnPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello ${user?.name || 'there'}! I am your AI Career Mentor. Ask me any technical interview question, resume strategy, or system design concept.`,
      sources: ['CareerAI Engineering Playbook', 'Industry Best Practices']
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (qToSend) => {
    const question = (qToSend || inputQuestion).trim();
    if (!question) return;

    setError('');
    // Append user message
    const userMsg = { role: 'user', text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await api.post('/learn/ask', {
        question,
        topic: user?.target_role || 'Software Engineering'
      });

      const aiMsg = {
        role: 'assistant',
        text: res.data.answer,
        sources: res.data.sources || []
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get answer from mentor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AI Career Mentor (RAG)
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Knowledge-grounded career and interview guidance tailored for{' '}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.target_role || 'Software Engineer'}</span>.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Suggested Prompt Chips */}
      <div className="w-full min-w-0 overflow-hidden">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-shrink-0">
            Try asking:
          </span>
          {SUGGESTED_QUESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium transition-colors shadow-2xs"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[520px] w-full min-w-0 overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 w-full min-w-0">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 sm:space-x-3 w-full min-w-0 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl p-3.5 sm:p-4 text-sm leading-relaxed break-words overflow-hidden ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center flex-wrap gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <BookmarkCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 mr-1 flex-shrink-0" />
                    <span>Sources:</span>
                    {msg.sources.map((src, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                <LoadingSpinner size="sm" text="Consulting career knowledge base..." />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 w-full min-w-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2 w-full min-w-0"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask for advice on interviews, algorithms, system design..."
              className="flex-1 min-w-0 px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuestion.trim()}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center flex-shrink-0"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LearnPage;
