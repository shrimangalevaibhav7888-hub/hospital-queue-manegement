import React, { useState, useEffect } from 'react';
import { doctorApi } from '../api/doctorApi';
import { Department, Doctor } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Building2, Stethoscope, MapPin, Users, HeartPulse, Sparkles, ChevronRight } from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [depts, docs] = await Promise.all([
          doctorApi.listDepartments(),
          doctorApi.listAll(),
        ]);
        setDepartments(depts);
        setDoctors(docs);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="hospital-card p-6 bg-white border border-slate-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              Hospital Clinical Wings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hospital Departments & Clinics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Directory of specialty departments, assigned medical teams, building locations & clinic suites
          </p>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const deptDocs = doctors.filter((d) => d.departmentId === dept.id);

          return (
            <div
              key={dept.id}
              className="hospital-card p-6 bg-white border border-slate-200 shadow-soft flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{dept.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      Code: {dept.code}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  {dept.description || 'Comprehensive clinical care and outpatient evaluation suite.'}
                </p>

                <div className="text-xs text-teal-800 font-bold flex items-center gap-1.5 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>{dept.location || 'Building A, Ground Floor'}</span>
                </div>

                {/* Assigned Physicians */}
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2 block">
                    Attending Physicians ({deptDocs.length}):
                  </span>
                  <div className="space-y-1.5">
                    {deptDocs.map((doc) => (
                      <div key={doc.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{doc.name}</span>
                        <span className="text-[11px] text-teal-700 font-bold">{doc.roomNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-bold">
                <button
                  onClick={() => {
                    window.location.hash = 'appointments';
                  }}
                  className="hover:underline flex items-center gap-1"
                >
                  <span>Book in Department</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
