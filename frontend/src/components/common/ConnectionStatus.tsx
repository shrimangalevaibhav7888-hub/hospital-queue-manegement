import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Wifi, WifiOff } from 'lucide-react';

export const ConnectionStatus: React.FC = () => {
  const { isConnected, isReconnecting } = useSocket();

  if (isConnected) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold shadow-soft">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
        </span>
        <Wifi className="w-3.5 h-3.5 text-teal-600" />
        <span className="hidden sm:inline">Live Sync</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold animate-pulse shadow-soft">
      <WifiOff className="w-3.5 h-3.5 text-amber-600" />
      <span>{isReconnecting ? 'Reconnecting...' : 'Offline'}</span>
    </div>
  );
};
