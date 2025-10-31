import { useState, useEffect } from 'react';
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
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string>('');

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Load progress periodically
  useEffect(() => {
    if (sessionId) {
      loadProgress();
      const interval = setInterval(loadProgress, 10000);
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  const initializeSession = async () => {
    try {
      const response = await createSession();
      setSessionId(response.sessionId);
      
      setMessages([{
        role: 'assistant',
        content: 'Hello! I\'m your AI study buddy. Ask me anything about programming, computer science, or any topic you\'d like to learn about!',
        timestamp: Date.now(),
      }]);
    } catch (err: any) {
      setError('Failed to start session. Please refresh the page.');
      console.error('Session initialization error:', err);
    }
  };

  const loadProgress = async () => {
    if (!sessionId) return;
    
    try {
      const data = await getProgress(sessionId);
      setProgress({
        totalMessages: data.metrics.totalMessages,
        topicsDiscussed: data.metrics.topicsDiscussed,
        difficultyLevel: data.metrics.difficultyLevel,
        understandingScore: data.metrics.understandingScore,
      });
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !sessionId || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await sendMessage(sessionId, message);
      
      const aiMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiMessage]);
      await loadProgress();
    } catch (err: any) {
      setError('Failed to send message. Please try again.');
      console.error('Send message error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleVoiceInput = (transcript: string) => {
    setInput(transcript);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Study Buddy
          </h1>
          <p className="text-gray-600">
            Your adaptive learning assistant powered by Cloudflare AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <Chat messages={messages} loading={loading} />
              
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={loading || !sessionId}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  
                  <VoiceInput 
                    onTranscript={handleVoiceInput}
                    disabled={loading || !sessionId}
                  />
                  
                  <button
                    type="submit"
                    disabled={loading || !sessionId || !input.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </form>
                
                <p className="text-xs text-gray-500 mt-2">
                  Session ID: {sessionId || 'Initializing...'}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Your Progress
              </h2>
              
              {progress ? (
                <ProgressBar progress={progress} />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Start chatting to see your progress!</p>
                </div>
              )}
            </div>

            <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                💡 Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Ask follow-up questions for deeper understanding</li>
                <li>• Request examples to see concepts in action</li>
                <li>• The AI adapts to your learning level</li>
                <li>• Use voice input for hands-free learning</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Built on Cloudflare Workers AI • Powered by Llama 3.3
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;