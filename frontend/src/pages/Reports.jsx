import { useState, useEffect } from 'react';
import { attendanceApi } from '../api';
import { Card, Spinner, EmptyState, ErrorState, Badge } from '../components/ui';
import PageHeader from '../components/PageHeader';

function AttendanceBar({ present, total }) {
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-ink-600 w-8 text-right">{pct}%</span>
    </div>
  );
}

function EmployeeReportRow({ emp, onSelect, selected }) {
  return (
    <tr
      onClick={() => onSelect(selected ? null : emp.id)}
      className={`cursor-pointer transition-colors ${selected ? 'bg-accent/5' : 'hover:bg-surface-100/50'}`}
    >
      <td className="py-3.5 px-4">
        <p className="font-medium text-ink-900 text-sm">{emp.full_name}</p>
        <p className="text-ink-600 text-xs font-mono">{emp.emp_code}</p>
      </td>
      <td className="py-3.5 px-4 text-sm text-ink-700">{emp.department}</td>
      <td className="py-3.5 px-4 text-center">
        <span className="text-emerald-600 font-semibold text-sm">{emp.present_days}</span>
      </td>
      <td className="py-3.5 px-4 text-center">
        <span className="text-rose-500 font-semibold text-sm">{emp.absent_days}</span>
      </td>
      <td className="py-3.5 px-4 text-center">
        <span className="text-ink-700 text-sm">{emp.total_days}</span>
      </td>
      <td className="py-3.5 px-4 min-w-[140px]">
        <AttendanceBar present={parseInt(emp.present_days)} total={parseInt(emp.total_days)} />
      </td>
    </tr>
  );
}

function EmployeeDetail({ empId, employees }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const emp = employees.find((e) => e.id === empId);

  useEffect(() => {
    if (!empId) return;
    setLoading(true);
    attendanceApi.getByEmployee(empId)
      .then((r) => { setRecords(r.data); setError(null); })
      .catch(() => setError('Failed to load records.'))
      .finally(() => setLoading(false));
  }, [empId]);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-semibold text-ink-900">{emp?.full_name}</h3>
          <p className="text-ink-600 text-xs mt-0.5">{emp?.department} · {emp?.emp_code}</p>
        </div>
        <span className="text-xs text-ink-600 bg-surface-100 px-2 py-1 rounded">{records.length} logs</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Spinner /></div>
      ) : error ? (
        <p className="text-sm text-rose-500 text-center py-6">{error}</p>
      ) : records.length === 0 ? (
        <p className="text-sm text-ink-600 text-center py-6">No attendance records for this employee.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
              <span className="text-sm text-ink-800">
                {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <Badge status={r.status} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function Reports() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceApi.getSummary();
      setSummary(res.data);
    } catch {
      setError('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalPresent = summary.reduce((acc, e) => acc + parseInt(e.present_days), 0);
  const totalAbsent = summary.reduce((acc, e) => acc + parseInt(e.absent_days), 0);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Employee attendance summary and detailed logs"
      />

      {!loading && !error && summary.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Employees Tracked', value: summary.length, color: 'text-ink-900' },
            { label: 'Total Present Days', value: totalPresent, color: 'text-emerald-600' },
            { label: 'Total Absent Days', value: totalAbsent, color: 'text-rose-500' },
          ].map((s) => (
            <Card key={s.label} className="p-4 text-center">
              <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
              <p className="text-xs text-ink-600 mt-1">{s.label}</p>
            </Card>
          ))}
        </div>
      )}

      <div className={`grid gap-6 ${selectedEmp ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        <div className={selectedEmp ? 'lg:col-span-2' : ''}>
          <Card>
            <div className="p-4 border-b border-surface-200">
              <p className="text-sm text-ink-600">
                {selectedEmp ? 'Click a row to deselect · ' : ''}
                Click any row to view detailed attendance logs
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
            ) : error ? (
              <ErrorState message={error} onRetry={load} />
            ) : summary.length === 0 ? (
              <EmptyState icon="📊" title="No data yet" description="Add employees and mark attendance to generate reports." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="text-left py-3 px-4 text-xs font-medium text-ink-600 uppercase tracking-wide">Employee</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-ink-600 uppercase tracking-wide">Dept</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-emerald-600 uppercase tracking-wide">Present</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-rose-500 uppercase tracking-wide">Absent</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-ink-600 uppercase tracking-wide">Total</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-ink-600 uppercase tracking-wide">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {summary.map((emp) => (
                      <EmployeeReportRow
                        key={emp.id}
                        emp={emp}
                        onSelect={setSelectedEmp}
                        selected={selectedEmp === emp.id}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {selectedEmp && (
          <EmployeeDetail
            empId={selectedEmp}
            employees={summary.map((e) => ({ id: e.id, full_name: e.full_name, department: e.department, emp_code: e.emp_code }))}
          />
        )}
      </div>
    </div>
  );
}
