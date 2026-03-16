import { useState, useEffect } from 'react';
import { employeeApi, attendanceApi } from '../api';
import { Card, Spinner, ErrorState } from '../components/ui';
import PageHeader from '../components/PageHeader';

function StatCard({ label, value, sub, color, icon }) {
  return (
    <Card className="p-5 flex items-start justify-between">
      <div>
        <p className="text-ink-600 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
        <p className="font-display font-bold text-ink-950 text-3xl">{value}</p>
        {sub && <p className="text-ink-600 text-xs mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </Card>
  );
}

function DeptRow({ dept, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-ink-800 font-medium">{dept}</span>
        <span className="text-xs text-ink-600 font-mono">{count} emp</span>
      </div>
      <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, summaryRes] = await Promise.all([
        employeeApi.getStats(),
        attendanceApi.getSummary(),
      ]);
      setStats(statsRes.data);
      setSummary(summaryRes.data);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Overview for ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Employees"
          value={stats.totalEmployees}
          sub="Active in system"
          color="bg-accent/10"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Present Today"
          value={stats.presentToday}
          sub={`out of ${stats.totalEmployees} employees`}
          color="bg-emerald-100"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
        <StatCard
          label="Attendance Records"
          value={stats.totalAttendanceRecords}
          sub="All time logs"
          color="bg-sky-100"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-ink-900 text-base mb-5">Department Breakdown</h2>
          {stats.departments.length === 0 ? (
            <p className="text-ink-600 text-sm text-center py-6">No departments yet</p>
          ) : (
            <div className="space-y-4">
              {stats.departments.map((d) => (
                <DeptRow key={d.department} dept={d.department} count={parseInt(d.count)} total={stats.totalEmployees} />
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-ink-900 text-base mb-5">Attendance Summary</h2>
          {summary.length === 0 ? (
            <p className="text-ink-600 text-sm text-center py-6">No attendance data yet</p>
          ) : (
            <div className="overflow-auto max-h-64 scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="text-ink-600 font-medium text-xs uppercase tracking-wide pb-3">Employee</th>
                    <th className="text-ink-600 font-medium text-xs uppercase tracking-wide pb-3 text-center">Present</th>
                    <th className="text-ink-600 font-medium text-xs uppercase tracking-wide pb-3 text-center">Absent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {summary.map((emp) => (
                    <tr key={emp.id} className="hover:bg-surface-100/50 transition-colors">
                      <td className="py-2.5">
                        <p className="font-medium text-ink-900">{emp.full_name}</p>
                        <p className="text-ink-600 text-xs font-mono">{emp.emp_code}</p>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="text-emerald-600 font-semibold">{emp.present_days}</span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="text-rose-500 font-semibold">{emp.absent_days}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
