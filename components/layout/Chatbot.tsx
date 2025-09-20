'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { askChatbot } from '@/app/actions/chatActions';

// Define the structure of a message for the UI
interface UIMessage {
  role: 'user' | 'model';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<UIMessage[]>([
    { role: 'model', text: 'Hello! How may I assist you with your Éclat Lingerie questions today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: UIMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Format the history for the server action
    const historyForApi = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const result = await askChatbot(historyForApi, input);
    
    if (result.error) {
        setMessages(prev => [...prev, { role: 'model', text: `Sorry, an error occurred: ${result.error}` }]);
    } else {
        setMessages(prev => [...prev, { role: 'model', text: result.response! }]);
    }
    
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 h-14 w-14 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700 transition-transform transform hover:scale-110"
        aria-label="Open chat"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col transition-all">
          {/* Header */}
          <div className="p-4 bg-gray-100 rounded-t-lg flex justify-between items-center border-b">
            <h3 className="font-semibold text-gray-800">Éclat Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot size={18} className="text-gray-600" />
                    </div>
                  )}
                  <div className={`p-3 rounded-lg max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-gray-800 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                   {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0"><Bot size={18} className="text-gray-600"/></div>
                    <div className="p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
                       <p className="text-sm animate-pulse">...</p>
                    </div>
                 </div>
              )}
            </div>
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-4 bg-gray-100 rounded-b-lg border-t">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button type="submit" className="h-8 w-8 bg-gray-800 text-white rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-700 disabled:bg-gray-400" disabled={isLoading}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
