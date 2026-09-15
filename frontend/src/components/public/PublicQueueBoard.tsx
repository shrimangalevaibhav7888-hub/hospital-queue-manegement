import React, { useState, useEffect } from 'react';
import { queueApi } from '../../api/queueApi';
import { useSocket } from '../../context/SocketContext';
import { ConnectionStatus } from '../common/ConnectionStatus';
import { Activity, Tv, AlertCircle, Clock, Volume2, ArrowRight, ArrowLeft } from 'lucide-react';
import { formatTimeOnly } from '../../utils/formatters';

export const PublicQueueBoard: React.FC = () => {
  const [overview, setOverview] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { socket, joinPublicRoom } = useSocket();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOverview = async () => {
    try {
      const data = await queueApi.getPublicOverview();
      setOverview(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOverview();
    joinPublicRoom();
  }, [joinPublicRoom]);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchOverview();
    };
    socket.on('queue.updated', handleUpdate);
    socket.on('queue.patient_called', handleUpdate);
    return () => {
      socket.off('queue.updated', handleUpdate);
      socket.off('queue.patient_called', handleUpdate);
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 sm:p-10 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white p-6 rounded-2xl shadow-soft">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              window.location.hash = '';
            }}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-soft"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
            <Activity className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              CareFlow Hospital <span className="text-teal-600">Waiting Lounge Display</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Live OPD consultation queue status & room calling board</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <ConnectionStatus />
          <div className="text-right">
            <p className="text-2xl font-mono font-black text-slate-900 tracking-wider">
              {currentTime.toLocaleTimeString()}
            </p>
            <p className="text-xs text-slate-500 font-medium">{currentTime.toDateString()}</p>
          </div>
        </div>
      </header>

      {/* Main Clinic Grid */}
      <main className="my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {overview.map((doc) => {
          const currentToken = doc.currentCallingToken || doc.inConsultationToken;
          const isDelayed = doc.currentDelayMinutes > 0;

          return (
            <div
              key={doc.doctorId}
              className="hospital-card p-6 bg-white border border-slate-200/90 flex flex-col justify-between shadow-soft relative overflow-hidden"
            >
              {/* Doctor Header */}
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{doc.doctorName}</h3>
                    <p className="text-xs text-slate-500 font-medium">{doc.specialization}</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-black text-xs">
                    {doc.roomNumber}
                  </span>
                </div>

                {/* Serving Now Box */}
                <div className="mt-5 p-6 rounded-2xl bg-gradient-to-br from-teal-50/70 to-slate-50 border-2 border-teal-300 text-center shadow-soft">
                  <span className="text-[11px] uppercase tracking-wider text-teal-800 font-bold">
                    Now Serving in Room
                  </span>
                  <p className="text-4xl sm:text-5xl font-black text-teal-800 font-mono my-2 tracking-tight">
                    {currentToken || 'AVAILABLE'}
                  </p>
                  <p className="text-xs text-slate-600 font-medium flex items-center justify-center gap-1">
                    Please proceed to <strong>{doc.roomNumber}</strong>
                  </p>
                </div>

                {isDelayed && (
                  <div className="mt-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Doctor delayed by approx {doc.currentDelayMinutes} mins</span>
                  </div>
                )}
              </div>

              {/* Next in Line Preview (Privacy Protected Tokens Only) */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2 block">
                  Next Tokens in Line:
                </span>
                <div className="flex flex-wrap gap-2">
                  {doc.nextTokens?.length > 0 ? (
                    doc.nextTokens.map((t: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-800"
                      >
                        {t.tokenDisplay}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No waiting tokens</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Footer ticker */}
      <footer className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium">
        <p>🔒 Privacy Protected Display: Names are withheld in public lounge areas in compliance with patient privacy policies.</p>
        <p>Live audio alerts chime automatically when your token is called.</p>
      </footer>
    </div>
  );
};
