import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api/doctorApi';
import { HospitalKPIs } from '../types';
import { MetricCards } from '../components/admin/MetricCards';
import { AnalyticsCharts } from '../components/admin/AnalyticsCharts';
import { AuditLogsTable } from '../components/admin/AuditLogsTable';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ShieldCheck, BarChart3, History, RefreshCw, Calendar, TrendingUp } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [range, setRange] = useState<'today' | '7days' | '30days'>('7days');
  const [kpis, setKpis] = useState<HospitalKPIs | null>(null);
  const [charts, setCharts] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [kpiData, chartData] = await Promise.all([
        analyticsApi.getKPIs(range),
        analyticsApi.getCharts(range),
      ]);
      setKpis(kpiData);
      setCharts(chartData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Admin Header */}
      <div className="hospital-card p-6 sm:p-8 bg-white border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
              Operations Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hospital Operations & Analytics Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Persisted operational KPIs, doctor performance analytics, and immutable queue audit logging
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Range Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-soft">
            {(['today', '7days', '30days'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  range === r
                    ? 'bg-purple-600 text-white shadow-soft'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7days' ? 'Past 7 Days' : 'Past 30 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={loadAnalytics}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-soft"
            title="Refresh Analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={8} />
      ) : (
        <>
          {/* Executive KPI Metric Strip */}
          <MetricCards kpis={kpis} />

          {/* Interactive Recharts Visualizations */}
          <AnalyticsCharts chartData={charts} />

          {/* Immutable Queue Audit Trail */}
          <AuditLogsTable />
        </>
      )}
    </div>
  );
};
