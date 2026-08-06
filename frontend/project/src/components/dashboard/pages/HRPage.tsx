import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Users,
  DollarSign,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  ChevronUp,
  ChevronDown,
  UserCheck,
  Loader2,
  Download,
  Pencil,
  Trash2,
} from 'lucide-react';
import { GlassCard, GlassButton } from '../../ui';
import { api, ApiError, downloadFile } from '../../../lib/api';

/* ─── API types ──────────────────────────────────────────────────────────── */

type Employee = { id: number; user: number; username: string; full_name: string; position: string; hire_date: string; base_salary: string; is_active: boolean; ip_address: string | null; last_login_at: string | null };
type Attendance = { id: number; employee: number; employee_name: string; date: string; check_in: string | null; check_out: string | null; status: string; hours_worked: number; approval_status: 'pending' | 'approved' | 'rejected'; marked_by: number | null; marked_by_name: string | null; approved_by: number | null; approved_by_name: string | null };
type Payslip = { id: number; employee: number; employee_name: string; period_start: string; period_end: string; base_salary: string; overtime_amount: string; bonus: string; deductions: string; net_salary: string; generated_at: string };
type Leave = { id: number; employee: number; employee_name: string; leave_type: string; start_date: string; end_date: string; reason: string; status: string };

type SortField = 'name' | 'salary' | 'attendance';
type SortDir = 'asc' | 'desc';

function unwrap<T>(res: { results?: T[] } | T[]): T[] {
  return Array.isArray(res) ? res : res.results ?? [];
}

export function HRPage() {
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'payroll' | 'leave'>('employees');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<Leave[]>([]);

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showGeneratePayslip, setShowGeneratePayslip] = useState(false);
  const [showNewLeave, setShowNewLeave] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get<{ results?: Employee[] } | Employee[]>('/hr/employees/'),
      api.get<{ results?: Attendance[] } | Attendance[]>('/hr/attendance/'),
      api.get<{ results?: Payslip[] } | Payslip[]>('/payroll/payslips/'),
      api.get<{ results?: Leave[] } | Leave[]>('/hr/leave/'),
    ])
      .then(([e, a, p, l]) => {
        setEmployees(unwrap(e));
        setAttendance(unwrap(a));
        setPayslips(unwrap(p));
        setLeaveRequests(unwrap(l));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  function toggleSort(f: SortField) {
    if (sortField === f) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(f); setSortDir('asc'); }
  }

  // Only approval_status === 'approved' records count toward attendance stats — a Staff
  // self-check-in sits as "pending" until a Manager/Admin accepts it, so it shouldn't
  // inflate the numbers before that happens.
  const attendancePctByEmployee = useMemo(() => {
    const map = new Map<number, number>();
    for (const emp of employees) {
      const records = attendance.filter((a) => a.employee === emp.id && a.approval_status === 'approved');
      if (records.length === 0) continue;
      const present = records.filter((a) => a.status === 'present').length;
      map.set(emp.id, Math.round((present / records.length) * 100));
    }
    return map;
  }, [employees, attendance]);

  const sorted = [...employees].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'name') return mul * (a.full_name || a.username).localeCompare(b.full_name || b.username);
    if (sortField === 'salary') return mul * (Number(a.base_salary) - Number(b.base_salary));
    return mul * ((attendancePctByEmployee.get(a.id) ?? -1) - (attendancePctByEmployee.get(b.id) ?? -1));
  });

  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendance.filter((a) => a.date === today);
  const pendingCount = attendance.filter((a) => a.approval_status === 'pending').length;
  const approvedToday = todayAttendance.filter((a) => a.approval_status === 'approved');
  const presentToday = approvedToday.filter((a) => a.status === 'present').length;
  const absentToday = approvedToday.filter((a) => a.status === 'absent').length;
  const onLeaveToday = approvedToday.filter((a) => a.status === 'on_leave').length;
  const attendanceRate = approvedToday.length ? Math.round((presentToday / approvedToday.length) * 100) : null;

  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthPayslips = payslips.filter((p) => p.period_start.slice(0, 7) === thisMonth || p.period_end.slice(0, 7) === thisMonth);
  const monthlyPayroll = monthPayslips.length
    ? monthPayslips.reduce((s, p) => s + Number(p.net_salary), 0)
    : employees.reduce((s, e) => s + Number(e.base_salary), 0);
  const payrollIsEstimate = monthPayslips.length === 0;

  const avgAttendance = attendancePctByEmployee.size
    ? Math.round([...attendancePctByEmployee.values()].reduce((s, v) => s + v, 0) / attendancePctByEmployee.size)
    : null;

  const openLeaves = leaveRequests.filter((l) => l.status === 'pending').length;

  const kpis = [
    { label: 'Total Employees', value: String(employees.length), icon: Users, sub: `${employees.filter((e) => e.is_active).length} active` },
    { label: 'Monthly Payroll', value: `OMR ${monthlyPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, sub: payrollIsEstimate ? 'estimated from base salaries' : 'from generated payslips' },
    { label: 'Avg Attendance', value: avgAttendance != null ? `${avgAttendance}%` : '—', icon: UserCheck, sub: 'all-time, per employee' },
    { label: 'Open Leaves', value: String(openLeaves), icon: Calendar, sub: 'pending approval' },
  ];

  async function approveLeave(id: number) {
    await api.post(`/hr/leave/${id}/approve/`);
    load();
  }
  async function rejectLeave(id: number) {
    await api.post(`/hr/leave/${id}/reject/`);
    load();
  }

  async function deleteEmployee(employee: Employee) {
    if (!window.confirm(`Remove ${employee.full_name || employee.username} from HR? Their attendance, leave and payslip history go with them, and their login is deactivated (so they also disappear from the POS "Taken by" list). This can be undone in the Django admin if needed.`)) return;
    try {
      await api.delete(`/hr/employees/${employee.id}/`);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete employee.');
    }
  }

  const todayByEmployee = useMemo(() => {
    const map = new Map<number, Attendance>();
    for (const a of todayAttendance) map.set(a.employee, a);
    return map;
  }, [todayAttendance]);

  // Attendance is now self-service (Staff check themselves in/out from their own HR page)
  // — Admin/Manager no longer mark it on someone's behalf here, they only accept/decline
  // what staff submitted.
  async function approveAttendance(id: number) {
    try {
      await api.post(`/hr/attendance/${id}/approve/`);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to approve attendance.');
    }
  }
  async function rejectAttendance(id: number) {
    try {
      await api.post(`/hr/attendance/${id}/reject/`);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to reject attendance.');
    }
  }

  if (loading) {
    return <div className="grid h-96 place-items-center"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <GlassCard key={k.label} sheen hover className="p-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
                <Icon className="h-5 w-5" />
              </span>
              <div className="mt-4 font-display text-2xl font-bold text-ink-900">{k.value}</div>
              <div className="text-xs text-ink-500">{k.label}</div>
              <div className="mt-0.5 text-[10px] text-ink-400">{k.sub}</div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-2xl bg-white/40 p-1">
              {(['employees', 'attendance', 'payroll', 'leave'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={['rounded-xl px-4 py-1.5 text-sm font-semibold transition-all capitalize', activeTab === tab ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow' : 'text-ink-600 hover:bg-white/60'].join(' ')}
                >
                  {tab === 'leave' ? 'Leave' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            {activeTab !== 'attendance' && (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={() => {
                  if (activeTab === 'employees') setShowAddEmployee((v) => !v);
                  else if (activeTab === 'payroll') setShowGeneratePayslip((v) => !v);
                  else setShowNewLeave((v) => !v);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                {activeTab === 'employees' ? 'Add employee' : activeTab === 'payroll' ? 'Generate payslip' : 'New request'}
              </GlassButton>
            )}
          </div>

          {activeTab === 'employees' && showAddEmployee && (
            <AddEmployeeForm onSaved={() => { setShowAddEmployee(false); load(); }} onCancel={() => setShowAddEmployee(false)} />
          )}
          {activeTab === 'employees' && editingEmployee && (
            <EditEmployeeForm employee={editingEmployee} onSaved={() => { setEditingEmployee(null); load(); }} onCancel={() => setEditingEmployee(null)} />
          )}
          {activeTab === 'payroll' && showGeneratePayslip && (
            <GeneratePayslipForm employees={employees} onSaved={() => { setShowGeneratePayslip(false); load(); }} onCancel={() => setShowGeneratePayslip(false)} />
          )}
          {activeTab === 'leave' && showNewLeave && (
            <NewLeaveForm employees={employees} onSaved={() => { setShowNewLeave(false); load(); }} onCancel={() => setShowNewLeave(false)} />
          )}

          {activeTab === 'employees' && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-ink-400">
                    <th className="pb-3 font-semibold">Employee</th>
                    <th className="pb-3 font-semibold">Position</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <SortTh label="Salary" field="salary" active={sortField} dir={sortDir} onToggle={toggleSort} />
                    <SortTh label="Attendance" field="attendance" active={sortField} dir={sortDir} onToggle={toggleSort} />
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {sorted.map((e) => (
                    <tr key={e.id} className="transition-colors hover:bg-white/30">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-[11px] font-bold text-white">
                            {(e.full_name || e.username).slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <div className="font-semibold text-ink-900">{e.full_name || e.username}</div>
                            <div className="text-[11px] text-ink-400">{e.position}</div>
                            <div className="font-mono text-[10px] text-ink-300" title="Last known login IP">
                              {e.ip_address ?? 'Never logged in'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-ink-600">{e.position}</td>
                      <td className="py-3"><StatusPill active={e.is_active} /></td>
                      <td className="py-3 text-right font-medium text-ink-900">OMR {Number(e.base_salary).toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <AttendanceBar pct={attendancePctByEmployee.get(e.id) ?? null} />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingEmployee(e)}
                            title="Edit"
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-white/60 hover:text-ink-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteEmployee(e)}
                            title="Delete"
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sorted.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-sm text-ink-400">No employees yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="mt-5 overflow-x-auto">
              <p className="mb-3 text-xs text-ink-500">
                {today} · employees check themselves in/out from their own HR page — accept or decline what they submit here
                {pendingCount > 0 && <span className="ml-2 rounded-full bg-amber-100/70 px-2 py-0.5 text-[11px] font-semibold text-amber-700">{pendingCount} pending</span>}
              </p>
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-ink-400">
                    <th className="pb-3 font-semibold">Employee</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Check-in</th>
                    <th className="pb-3 font-semibold">Check-out</th>
                    <th className="pb-3 font-semibold">Approval</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {employees.map((e) => {
                    const record = todayByEmployee.get(e.id);
                    return (
                      <tr key={e.id} className="transition-colors hover:bg-white/30">
                        <td className="py-3 font-semibold text-ink-900">{e.full_name || e.username}</td>
                        <td className="py-3">{record ? <AttendanceStatusPill status={record.status} /> : <span className="text-xs text-ink-400">Not marked</span>}</td>
                        <td className="py-3 text-ink-600">{record?.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                        <td className="py-3 text-ink-600">{record?.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                        <td className="py-3">{record ? <ApprovalStatusPill status={record.approval_status} /> : <span className="text-xs text-ink-300">—</span>}</td>
                        <td className="py-3 text-right">
                          {record?.approval_status === 'pending' && (
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => approveAttendance(record.id)} className="rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-200">Accept</button>
                              <button onClick={() => rejectAttendance(record.id)} className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-200">Decline</button>
                            </div>
                          )}
                          {record?.approval_status === 'approved' && record.check_out && (
                            <span className="text-xs text-ink-400">Completed · {record.hours_worked}h</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {employees.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-sm text-ink-400">No employees yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-ink-400">
                    <th className="pb-3 font-semibold">Employee</th>
                    <th className="pb-3 font-semibold">Period</th>
                    <th className="pb-3 text-right font-semibold">Base</th>
                    <th className="pb-3 text-right font-semibold">Overtime</th>
                    <th className="pb-3 text-right font-semibold">Net</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {payslips.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-white/30">
                      <td className="py-3 font-semibold text-ink-900">{p.employee_name}</td>
                      <td className="py-3 text-ink-600">{p.period_start} → {p.period_end}</td>
                      <td className="py-3 text-right text-ink-600">OMR {Number(p.base_salary).toFixed(2)}</td>
                      <td className="py-3 text-right text-ink-600">OMR {Number(p.overtime_amount).toFixed(2)}</td>
                      <td className="py-3 text-right font-semibold text-brand-700">OMR {Number(p.net_salary).toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => downloadFile(`/payroll/payslips/${p.id}/pdf/`, `payslip-${p.id}.pdf`)} className="grid h-7 w-7 place-items-center rounded-lg text-ink-400 hover:bg-white/60 hover:text-ink-700">
                          <Download className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {payslips.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-sm text-ink-400">No payslips generated yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'leave' && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[580px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-ink-400">
                    <th className="pb-3 font-semibold">Employee</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">From</th>
                    <th className="pb-3 font-semibold">To</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {leaveRequests.map((l) => (
                    <tr key={l.id} className="transition-colors hover:bg-white/30">
                      <td className="py-3 font-semibold text-ink-900">{l.employee_name}</td>
                      <td className="py-3 text-ink-600 capitalize">{l.leave_type}</td>
                      <td className="py-3 text-ink-600">{l.start_date}</td>
                      <td className="py-3 text-ink-600">{l.end_date}</td>
                      <td className="py-3"><LeaveStatusPill status={l.status} /></td>
                      <td className="py-3">
                        {l.status === 'pending' && (
                          <div className="flex gap-1.5">
                            <button onClick={() => approveLeave(l.id)} className="rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-200 transition-colors">Approve</button>
                            <button onClick={() => rejectLeave(l.id)} className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-200 transition-colors">Deny</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {leaveRequests.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-sm text-ink-400">No leave requests.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-ink-900">Today's Attendance</h3>
            <p className="text-xs text-ink-500">{today}</p>
          </div>
        </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Present', value: presentToday, icon: CheckCircle, color: 'text-brand-600', bg: 'bg-brand-100/70' },
              { label: 'Absent', value: absentToday, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-100/70' },
              { label: 'On Leave', value: onLeaveToday, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100/70' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`flex flex-col items-center gap-2 rounded-2xl ${s.bg} border border-white/40 p-4`}>
                  <Icon className={`h-6 w-6 ${s.color}`} />
                  <div className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs font-medium text-ink-600">{s.label}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-ink-500">
              <span>Attendance rate</span>
              <span className="font-bold text-brand-600">{attendanceRate != null ? `${attendanceRate}%` : 'No records today'}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/50">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${attendanceRate ?? 0}%` }} />
            </div>
          </div>
      </GlassCard>
    </div>
  );
}

/* ─── inline forms ────────────────────────────────────────────────────────── */

function AddEmployeeForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('');
  const [hireDate, setHireDate] = useState(new Date().toISOString().slice(0, 10));
  const [salary, setSalary] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const user = await api.post<{ id: number }>('/accounts/users/', { username, password, role: 'staff' });
      await api.post('/hr/employees/', { user: user.id, position, hire_date: hireDate, base_salary: salary });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add employee.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-white/50 bg-white/40 p-4 sm:grid-cols-6">
      <input required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2" />
      <input required type="password" placeholder="Temp password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2" />
      <input required placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2" />
      <input required type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-3" />
      <input required type="number" step="0.001" placeholder="Base salary (OMR)" value={salary} onChange={(e) => setSalary(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-3" />
      {error && <p className="sm:col-span-6 text-sm text-rose-600">{error}</p>}
      <div className="flex gap-2 sm:col-span-6">
        <GlassButton type="submit" variant="primary" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</GlassButton>
        <GlassButton type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</GlassButton>
      </div>
    </form>
  );
}

function EditEmployeeForm({ employee, onSaved, onCancel }: { employee: Employee; onSaved: () => void; onCancel: () => void }) {
  const [position, setPosition] = useState(employee.position);
  const [hireDate, setHireDate] = useState(employee.hire_date);
  const [salary, setSalary] = useState(employee.base_salary);
  const [isActive, setIsActive] = useState(employee.is_active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/hr/employees/${employee.id}/`, { position, hire_date: hireDate, base_salary: salary, is_active: isActive });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-white/50 bg-white/40 p-4 sm:grid-cols-6">
      <div className="flex items-center rounded-xl border border-white/60 bg-white/50 px-3 py-2 text-sm text-ink-500 sm:col-span-2">{employee.full_name || employee.username}</div>
      <input required placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2" />
      <input required type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2" />
      <input required type="number" step="0.001" placeholder="Base salary (OMR)" value={salary} onChange={(e) => setSalary(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-3" />
      <label className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-ink-700 sm:col-span-3">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active
      </label>
      {error && <p className="sm:col-span-6 text-sm text-rose-600">{error}</p>}
      <div className="flex gap-2 sm:col-span-6">
        <GlassButton type="submit" variant="primary" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</GlassButton>
        <GlassButton type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</GlassButton>
      </div>
    </form>
  );
}

function GeneratePayslipForm({ employees, onSaved, onCancel }: { employees: Employee[]; onSaved: () => void; onCancel: () => void }) {
  const [employee, setEmployee] = useState(employees[0]?.id ?? 0);
  const [periodStart, setPeriodStart] = useState(new Date(new Date().setDate(1)).toISOString().slice(0, 10));
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().slice(0, 10));
  const [bonus, setBonus] = useState('0');
  const [deductions, setDeductions] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/payroll/payslips/', { employee, period_start: periodStart, period_end: periodEnd, bonus, deductions });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to generate payslip.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-white/50 bg-white/40 p-4 sm:grid-cols-6">
      <select value={employee} onChange={(e) => setEmployee(Number(e.target.value))} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2">
        {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name || e.username}</option>)}
      </select>
      <input required type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2" />
      <input required type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2" />
      <input type="number" step="0.001" placeholder="Bonus" value={bonus} onChange={(e) => setBonus(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-3" />
      <input type="number" step="0.001" placeholder="Deductions" value={deductions} onChange={(e) => setDeductions(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-3" />
      {error && <p className="sm:col-span-6 text-sm text-rose-600">{error}</p>}
      <div className="flex gap-2 sm:col-span-6">
        <GlassButton type="submit" variant="primary" size="sm" disabled={saving || !employee}>{saving ? 'Generating…' : 'Generate'}</GlassButton>
        <GlassButton type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</GlassButton>
      </div>
    </form>
  );
}

function NewLeaveForm({ employees, onSaved, onCancel }: { employees: Employee[]; onSaved: () => void; onCancel: () => void }) {
  const [employee, setEmployee] = useState(employees[0]?.id ?? 0);
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/hr/leave/', { employee, leave_type: leaveType, start_date: startDate, end_date: endDate, reason });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit leave request.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-white/50 bg-white/40 p-4 sm:grid-cols-6">
      <select value={employee} onChange={(e) => setEmployee(Number(e.target.value))} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2">
        {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name || e.username}</option>)}
      </select>
      <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2">
        <option value="annual">Annual</option>
        <option value="sick">Sick</option>
        <option value="unpaid">Unpaid</option>
        <option value="other">Other</option>
      </select>
      <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2" />
      <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-2" />
      <input placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm sm:col-span-4" />
      {error && <p className="sm:col-span-6 text-sm text-rose-600">{error}</p>}
      <div className="flex gap-2 sm:col-span-6">
        <GlassButton type="submit" variant="primary" size="sm" disabled={saving || !employee}>{saving ? 'Saving…' : 'Submit'}</GlassButton>
        <GlassButton type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</GlassButton>
      </div>
    </form>
  );
}

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function SortTh({ label, field, active, dir, onToggle }: { label: string; field: SortField; active: SortField; dir: SortDir; onToggle: (f: SortField) => void }) {
  const isActive = active === field;
  return (
    <th className="cursor-pointer pb-3 text-right font-semibold select-none" onClick={() => onToggle(field)}>
      <span className="inline-flex items-center justify-end gap-1">
        {label}
        {isActive ? (dir === 'asc' ? <ChevronUp className="h-3 w-3 text-brand-600" /> : <ChevronDown className="h-3 w-3 text-brand-600" />) : <ChevronUp className="h-3 w-3 text-ink-300" />}
      </span>
    </th>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${active ? 'bg-brand-100/70 text-brand-700 border-brand-200/60' : 'bg-rose-100/70 text-rose-600 border-rose-200/60'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function LeaveStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: 'bg-brand-100/70 text-brand-700 border-brand-200/60',
    pending: 'bg-amber-100/70 text-amber-700 border-amber-200/60',
    rejected: 'bg-rose-100/70 text-rose-600 border-rose-200/60',
  };
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${map[status] ?? map.pending}`}>{status}</span>;
}

function AttendanceStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    present: 'bg-brand-100/70 text-brand-700 border-brand-200/60',
    late: 'bg-amber-100/70 text-amber-700 border-amber-200/60',
    absent: 'bg-rose-100/70 text-rose-600 border-rose-200/60',
    on_leave: 'bg-amber-100/70 text-amber-700 border-amber-200/60',
  };
  const label = status === 'on_leave' ? 'On leave' : status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${map[status] ?? map.present}`}>{label}</span>;
}

function ApprovalStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: 'bg-brand-100/70 text-brand-700 border-brand-200/60',
    pending: 'bg-amber-100/70 text-amber-700 border-amber-200/60',
    rejected: 'bg-rose-100/70 text-rose-600 border-rose-200/60',
  };
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${map[status] ?? map.pending}`}>{status}</span>;
}

function AttendanceBar({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-xs text-ink-400">No records</span>;
  const color = pct >= 90 ? 'from-brand-400 to-brand-600' : pct >= 70 ? 'from-amber-400 to-amber-600' : 'from-rose-400 to-rose-600';
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/50">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-semibold text-ink-700">{pct}%</span>
    </div>
  );
}
