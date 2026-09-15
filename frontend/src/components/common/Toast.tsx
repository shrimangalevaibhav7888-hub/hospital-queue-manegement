import React from 'react';
import { Bell, X } from 'lucide-react';

interface ToastProps {
  title: string;
  message: string;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ title, message, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slide-up">
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-teal-200 shadow-elevated">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
          <Bell className="w-4 h-4 animate-bounce-subtle" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
