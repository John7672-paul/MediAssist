import React from 'react';
import { Sparkles } from 'lucide-react';

export const SuggestedPrompts = ({ prompts = [], onSelectPrompt }) => {
  const defaultPrompts = [
    "Find a doctor",
    "Check availability",
    "Show my appointments",
    "Help me reschedule"
  ];

  const list = prompts.length > 0 ? prompts : defaultPrompts;

  return (
    <div className="w-full flex flex-col gap-2 my-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
        <span>Suggested Prompts:</span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {list.map((promptText, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(promptText)}
            className="px-3 py-1.5 bg-teal-50/70 hover:bg-teal-100/80 text-teal-800 border border-teal-200/80 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 shadow-2xs hover:shadow-xs"
          >
            {promptText}
          </button>
        ))}
      </div>
    </div>
  );
};
