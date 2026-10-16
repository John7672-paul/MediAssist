import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { ChatBubble } from '../../components/ai/ChatBubble';
import { SuggestedPrompts } from '../../components/ai/SuggestedPrompts';
import { DisclaimerBanner } from '../../components/ai/DisclaimerBanner';
import { Button } from '../../components/common/Button';
import { aiService } from '../../services/api';

export const AIAssistantPage = () => {
  const [conversationId, setConversationId] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'assistant',
      text: "Hi! I'm your MediAssist Appointment & Healthcare Navigation Assistant.\nHow can I help with finding specialists, checking available slots, or managing appointments today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const response = await aiService.sendChatMessage(query, conversationId);
      const text = typeof response === 'object' && response !== null ? response.reply : response;
      if (response?.conversationId) setConversationId(response.conversationId);
      if (typeof response?.isDemoMode === 'boolean') setIsDemoMode(response.isDemoMode);

      const assistantMsg = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`,
        sender: 'assistant',
        text: "I'm having trouble connecting to the backend right now. Please check your network and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-7rem)] flex flex-col space-y-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Appointment & Healthcare Navigation Assistant</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                isDemoMode ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
              }`}>
                {isDemoMode ? 'Demo / Fallback Mode' : 'AI Powered'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">Ask questions to find specialists, inspect timings, and manage visits</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => {
            setConversationId(null);
            setMessages([{
              id: 'm1',
              sender: 'assistant',
              text: "Hi! How can I help with your appointments or doctor search today?",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
          }}
        >
          Clear Chat
        </Button>
      </div>

      {/* Non-Diagnostic Medical Disclaimer */}
      <DisclaimerBanner className="shrink-0" />

      {/* Main Chat Log Box */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 overflow-y-auto shadow-subtle space-y-2">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.text}
            isUser={msg.sender === 'user'}
            timestamp={msg.timestamp}
          />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 p-3 bg-teal-50/50 rounded-xl w-max border border-teal-100 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            <span>AI Assistant is analyzing schedules...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Interactive Quick Prompt Suggestions */}
      <SuggestedPrompts onSelectPrompt={(prompt) => handleSendMessage(prompt)} />

      {/* Prompt Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-white rounded-2xl border border-slate-300 p-2 shadow-sm flex items-center gap-2 shrink-0 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. Find a dermatologist tomorrow at 10 AM..."
          className="flex-1 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 border-none bg-transparent focus:outline-none"
        />
        <Button
          type="submit"
          variant="primary"
          icon={Send}
          isLoading={loading}
          disabled={!inputText.trim()}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
        >
          Send
        </Button>
      </form>
    </div>
  );
};
