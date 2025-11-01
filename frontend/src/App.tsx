import { useState, useEffect, useRef } from 'react';
import Chat from './components/Chat';
import ProgressBar from './components/ProgressBar';
import VoiceInput from './components/VoiceInput';
import { createSession, sendMessage, getProgress } from './api/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
interface Progress {
  totalMessages: number;
  topicsDiscussed: string[];
  difficultyLevel: string;
  understandingScore: number;
}

function App() {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState('');
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Make sure page starts at the very top (title visible)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  // Initialize session
  useEffect(() => {
    (async () => {
      try {
        const res = await createSession();
        setSessionId(res.sessionId);
        setMessages([{
          role: 'assistant',
          content:
            "Hello! I'm your AI study buddy. Ask me anything about programming, CS, or math and we'll learn together!",
          timestamp: Date.now(),
        }]);
      } catch (e) {
        setError('Failed to start session. Please refresh.');
        console.error(e);
      }
    })();
  }, []);

  // Poll progress
  useEffect(() => {
    if (!sessionId) return;
    const load = async () => {
      try {
        const data = await getProgress(sessionId);
        setProgress({
          totalMessages: data.metrics.totalMessages,
          topicsDiscussed: data.metrics.topicsDiscussed,
          difficultyLevel: data.metrics.difficultyLevel,
          understandingScore: data.metrics.understandingScore,
        });
      } catch (e) {
        console.error('progress error', e);
      }
    };
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [sessionId]);

  // Auto-growing textarea based on actual content height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 160; // max-h-40 is 10rem = 160px
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [input]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !sessionId || loading) return;

    const userMsg: Message = { role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setError('');
    setLoading(true);
    
    // Trigger scroll only when user sends message
    setScrollTrigger(prev => prev + 1);

    try {
      const res = await sendMessage(sessionId, text);
      const aiMsg: Message = { role: 'assistant', content: res.response, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      await (async () => {
        try { const d = await getProgress(sessionId);
          setProgress({
            totalMessages: d.metrics.totalMessages,
            topicsDiscussed: d.metrics.topicsDiscussed,
            difficultyLevel: d.metrics.difficultyLevel,
            understandingScore: d.metrics.understandingScore,
          });
        } catch {}
      })();
    } catch (e) {
      setError('Failed to send message. Try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter without Shift = send message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
    // Shift+Enter = new line (default behavior)
  };

  const handleVoiceInput = (t: string) => setInput(t);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Study Buddy</h1>
          <p className="text-gray-600">Your adaptive learning assistant powered by Cloudflare AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <Chat messages={messages} loading={loading} scrollTrigger={scrollTrigger} />

              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything… (Shift+Enter for new line)"
                    rows={1}
                    disabled={loading || !sessionId}
                    className="flex-1 resize-none px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed max-h-40 overflow-y-auto input-scroll"
                    style={{ minHeight: '48px' }}
                  />

                  <VoiceInput onTranscript={handleVoiceInput} disabled={loading || !sessionId} />

                  <button
                    type="submit"
                    disabled={loading || !sessionId || !input.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Sending…' : 'Send'}
                  </button>
                </form>

                <p className="text-xs text-gray-500 mt-2">
                  Session ID: {sessionId || 'Initializing…'}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Progress</h2>
              {progress ? (
                <ProgressBar progress={progress} />
              ) : (
                <div className="text-center text-gray-500 py-8">Start chatting to see your progress!</div>
              )}
            </div>

            <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Ask follow-ups for deeper understanding</li>
                <li>• Request examples to see concepts in action</li>
                <li>• The AI adapts to your level as you learn</li>
                <li>• Use voice input for hands-free learning</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Built on Cloudflare Workers AI • Powered by Llama 3.3
        </div>
      </div>
    </div>
  );
}

export default App;