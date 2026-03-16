import { useState, useEffect } from 'react';
import { employeeApi, attendanceApi } from '../api';
import { Card, Button, Select, Modal, Spinner, EmptyState, ErrorState, Toast, Badge } from '../components/ui';
import PageHeader from '../components/PageHeader';
import { useToast } from '../hooks/useToast';

function MarkAttendanceModal({ open, onClose, employees, onSuccess }) {
  const [form, setForm] = useState({ employee_id: '', date: new Date().toISOString().split('T')[0], status: 'Present' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.employee_id) errs.employee_id = 'Select an employee';
    if (!form.date) errs.date = 'Date is required';
    if (!form.status) errs.status = 'Status is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await attendanceApi.mark({ ...form, employee_id: parseInt(form.employee_id) });
      onSuccess('Attendance marked successfully.');
      setForm({ employee_id: '', date: new Date().toISOString().split('T')[0], status: 'Present' });
      setErrors({});
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to mark attendance.';
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined, submit: undefined }));
  };

  return (
    <Modal open={open} onClose={onClose} title="Mark Attendance">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-600">
            {errors.submit}
          </div>
        )}
        <Select
          label="Employee"
          value={form.employee_id}
          onChange={set('employee_id')}
          error={errors.employee_id}
        >
          <option value="">Select employee...</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.full_name} ({e.employee_id})
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-800">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={set('date')}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 rounded-lg border text-sm bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all ${errors.date ? 'border-rose-400' : 'border-surface-200 focus:border-accent'}`}
            />
            {errors.date && <p className="text-xs text-rose-500">{errors.date}</p>}
          </div>
          <Select
            label="Status"
            value={form.status}
            onChange={set('status')}
            error={errors.status}
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </Select>
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={loading} className="flex-1">Mark Attendance</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMark, setShowMark] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const { toast, show, hide } = useToast();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recRes, empRes] = await Promise.all([
        attendanceApi.getAll(filterDate || undefined),
        employeeApi.getAll(),
      ]);
      setRecords(recRes.data);
      setEmployees(empRes.data);
    } catch {
      setError('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterDate]);

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Track and manage daily employee attendance"
        action={
          <Button onClick={() => setShowMark(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Mark Attendance
          </Button>
        }
      />

      <Card>
        <div className="p-4 border-b border-surface-200 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-ink-700">Filter by date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
          </div>
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="text-sm text-accent hover:text-accent-dark font-medium transition-colors"
            >
              Clear filter
            </button>
          )}
          {filterDate && (
            <span className="ml-auto text-sm text-ink-600">
              Showing <span className="font-medium text-ink-900">{records.length}</span> record{records.length !== 1 ? 's' : ''} for{' '}
              {new Date(filterDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : records.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No attendance records"
            description={filterDate ? 'No records found for this date.' : 'Start marking attendance for your employees.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-ink-600 uppercase tracking-wide">Employee</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-ink-600 uppercase tracking-wide">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-ink-600 uppercase tracking-wide">Department</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-ink-600 uppercase tracking-wide">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-ink-600 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-100/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-ink-900 text-sm">{r.full_name}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs bg-surface-100 text-ink-700 px-2 py-1 rounded">{r.emp_code}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-ink-700">{r.department}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm text-ink-700">
                        {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <MarkAttendanceModal
        open={showMark}
        onClose={() => setShowMark(false)}
        employees={employees}
        onSuccess={(msg) => { show(msg); load(); }}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
    </div>
  );
}
