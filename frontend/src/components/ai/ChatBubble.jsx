import React from 'react';
import { Bot, User } from 'lucide-react';
import { Avatar } from '../common/Avatar';

export const ChatBubble = ({ message, isUser = false, timestamp }) => {
  return (
    <div className={`flex items-start gap-3 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar Icon */}
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <User className="w-4 h-4" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Message Bubble */}
      <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
        isUser
          ? 'bg-brand-600 text-white rounded-tr-xs'
          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
      }`}>
        <div className="whitespace-pre-wrap font-normal">
          {message}
        </div>
        {timestamp && (
          <div className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-brand-200' : 'text-slate-400'}`}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};
