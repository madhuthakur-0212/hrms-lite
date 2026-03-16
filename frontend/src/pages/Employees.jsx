import { useState, useEffect } from 'react';
import { employeeApi } from '../api';
import { Card, Button, Input, Select, Modal, Spinner, EmptyState, ErrorState, Toast } from '../components/ui';
import PageHeader from '../components/PageHeader';
import { useToast } from '../hooks/useToast';

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Customer Support'];

function AddEmployeeModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({ employee_id: '', full_name: '', email: '', department: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.employee_id.trim()) e.employee_id = 'Employee ID is required';
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.department) e.department = 'Department is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await employeeApi.create(form);
      onSuccess('Employee added successfully.');
      setForm({ employee_id: '', full_name: '', email: '', department: '' });
      setErrors({});
      onClose();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to add employee.';
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
    <Modal open={open} onClose={onClose} title="Add New Employee">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-600">
            {errors.submit}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Employee ID"
            placeholder="EMP-001"
            value={form.employee_id}
            onChange={set('employee_id')}
            error={errors.employee_id}
          />
          <Select
            label="Department"
            value={form.department}
            onChange={set('department')}
            error={errors.department}
          >
            <option value="">Select...</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        </div>
        <Input
          label="Full Name"
          placeholder="Jane Smith"
          value={form.full_name}
          onChange={set('full_name')}
          error={errors.full_name}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="jane@company.com"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={loading} className="flex-1">Add Employee</Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteModal({ employee, onClose, onConfirm, loading }) {
  return (
    <Modal open={!!employee} onClose={onClose} title="Delete Employee">
      <p className="text-ink-700 text-sm mb-6">
        Are you sure you want to delete <span className="font-semibold text-ink-900">{employee?.full_name}</span>? This will also remove all their attendance records permanently.
      </p>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1">Delete</Button>
      </div>
    </Modal>
  );
}

function EmployeeRow({ employee, onDelete }) {
  const initials = employee.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-violet-100 text-violet-700', 'bg-sky-100 text-sky-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700'];
  const color = colors[employee.id % colors.length];

  return (
    <tr className="hover:bg-surface-100/50 transition-colors group">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${color}`}>
            {initials}
          </div>
          <div>
            <p className="font-medium text-ink-900 text-sm">{employee.full_name}</p>
            <p className="text-ink-600 text-xs">{employee.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <span className="font-mono text-xs bg-surface-100 text-ink-700 px-2 py-1 rounded">{employee.employee_id}</span>
      </td>
      <td className="py-3.5 px-4">
        <span className="text-sm text-ink-700">{employee.department}</span>
      </td>
      <td className="py-3.5 px-4">
        <span className="text-xs text-ink-600">{new Date(employee.created_at).toLocaleDateString('en-IN')}</span>
      </td>
      <td className="py-3.5 px-4 text-right">
        <button
          onClick={() => onDelete(employee)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:text-rose-700 p-1 rounded"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </td>
    </tr>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState('');
  const { toast, show, hide } = useToast();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeApi.getAll();
      setEmployees(res.data);
    } catch {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await employeeApi.delete(deleteTarget.id);
      setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      show('Employee deleted successfully.');
      setDeleteTarget(null);
    } catch {
      show('Failed to delete employee.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.full_name.toLowerCase().includes(q) ||
      e.employee_id.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} total employee${employees.length !== 1 ? 's' : ''}`}
        action={
          <Button onClick={() => setShowAdd(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Employee
          </Button>
        }
      />

      <Card>
        <div className="p-4 border-b border-surface-200">
          <div className="relative max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title={search ? 'No results found' : 'No employees yet'}
            description={search ? 'Try a different search term.' : 'Add your first employee to get started.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-3 px-4 text-xs font-medium text-ink-600 uppercase tracking-wide">Employee</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-ink-600 uppercase tracking-wide">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-ink-600 uppercase tracking-wide">Department</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-ink-600 uppercase tracking-wide">Joined</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map((emp) => (
                  <EmployeeRow key={emp.id} employee={emp} onDelete={setDeleteTarget} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AddEmployeeModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={(msg) => { show(msg); load(); }}
      />
      <DeleteModal
        employee={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}
    </div>
  );
}
