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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Career Mentor (RAG)
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Knowledge-grounded career and interview guidance tailored for{' '}
          <span className="font-semibold text-indigo-600">{user?.target_role || 'Software Engineer'}</span>.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Suggested Prompt Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
          Try asking:
        </span>
        {SUGGESTED_QUESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 text-xs font-medium transition-colors shadow-2xs"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200/70 text-slate-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center flex-wrap gap-1 text-[11px] text-slate-500">
                    <BookmarkCheck className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                    <span>Sources:</span>
                    {msg.sources.map((src, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl px-4 py-3 text-xs text-slate-500">
                <LoadingSpinner size="sm" text="Consulting career knowledge base..." />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask for advice on interviews, algorithms, system design..."
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuestion.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center space-x-1"
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

