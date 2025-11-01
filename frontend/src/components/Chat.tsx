import { useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatProps {
  messages: Message[];
  loading: boolean;
  scrollTrigger: number;
}

export default function Chat({ messages, loading, scrollTrigger }: ChatProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only scroll when user sends a message (scrollTrigger changes)
  useEffect(() => {
    if (scrollTrigger > 0 && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [scrollTrigger]);

  const formatTime = (t: number) =>
    new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div ref={containerRef} className="h-[600px] overflow-y-auto p-6 space-y-4">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            <div className="whitespace-pre-wrap break-words">{m.content}</div>
            <div className={`text-xs mt-1 ${m.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
              {formatTime(m.timestamp)}
            </div>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start animate-fadeIn">
          <div className="bg-gray-100 rounded-2xl px-4 py-3">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}