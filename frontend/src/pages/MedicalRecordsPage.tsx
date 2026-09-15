import React, { useState } from 'react';
import { AuditLogsTable } from '../components/admin/AuditLogsTable';
import { FileText, ShieldCheck, Pill, Stethoscope, Printer, Download } from 'lucide-react';

export const MedicalRecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'audit' | 'clinical'>('audit');

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              Electronic Health Records (EHR) & Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medical Records & Queue Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Clinical summaries, prescriptions, diagnostic assessments & immutable queue mutation logs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-soft flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Records</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Audit Trail vs Clinical Overview */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-max shadow-soft">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-teal-600 text-white shadow-soft'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Immutable Audit Trail</span>
        </button>

        <button
          onClick={() => setActiveTab('clinical')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'clinical'
              ? 'bg-teal-600 text-white shadow-soft'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Clinical Prescriptions & EHR Standards</span>
        </button>
      </div>

      {/* Tab 1: Audit Log Table */}
      {activeTab === 'audit' && <AuditLogsTable />}

      {/* Tab 2: Clinical Summary Standard Details */}
      {activeTab === 'clinical' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mb-3">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Diagnosis Classification</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Standardized ICD-10 diagnostic entries persisted across consultations. Direct integration with doctor prescribers and clinical outcome tracking.
            </p>
          </div>

          <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mb-3">
              <Pill className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">E-Prescriptions & Dosage</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Real-time prescription summaries issued during OPD finalization. Accessible directly by patients in their portal and archived in permanent EHR.
            </p>
          </div>

          <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Compliance & Privacy</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Full role-based access control (RBAC). Audit entries are append-only and cryptographically isolated per patient code and physician authorization.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
