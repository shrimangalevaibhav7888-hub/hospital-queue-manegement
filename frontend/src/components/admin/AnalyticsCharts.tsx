import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

interface AnalyticsChartsProps {
  chartData: {
    dailyThroughput: any[];
    waitPerDoctor: any[];
    hourlyDistribution: any[];
    statusPie: any[];
  } | null;
}

const COLORS = ['#0d9488', '#0284c7', '#8b5cf6', '#ef4444', '#64748b'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ chartData }) => {
  if (!chartData) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Daily Throughput & Completion Trends */}
      <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">Daily Patient Throughput & Outcomes</h3>
          <p className="text-xs text-slate-500 font-medium">Completed vs No-shows & Cancellations over time</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.dailyThroughput} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="completed" name="Completed" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="noShow" name="No Show" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Peak Hours Patient Volume */}
      <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">Busiest Clinic Hours</h3>
          <p className="text-xs text-slate-500 font-medium">Hourly patient check-in load distribution</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData.hourlyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Area type="monotone" dataKey="patients" name="Patients" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorPatients)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Average Wait Time per Doctor */}
      <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">Average Wait Time by Doctor</h3>
          <p className="text-xs text-slate-500 font-medium">Comparison of patient waiting duration across clinics</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.waitPerDoctor} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} unit="m" />
              <YAxis dataKey="doctorName" type="category" stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="avgWaitMinutes" name="Avg Wait (Mins)" fill="#0284c7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Visit Status Distribution */}
      <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">Visit Status Breakdown</h3>
          <p className="text-xs text-slate-500 font-medium">Proportional distribution of visit states</p>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.statusPie}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.statusPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
