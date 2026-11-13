import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDiagnostics } from '../../hooks/useDiagnostics';
import { DiagnosticForm } from '../../components/diagnostics/DiagnosticForm';
import { DiagnosticResult } from '../../components/diagnostics/DiagnosticResult';
import { databaseService, COLLECTIONS, Query } from '../../services/database';
import { ServiceRequest } from '../../types';
import {
  Wrench,
  ClipboardList,
  Bot,
  History,
  LayoutDashboard,
  LogOut,
  Loader2,
  AlertCircle,
} from 'lucide-react';

type MechanicTab = 'tasks' | 'diagnostic' | 'history';

export const MechanicDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { analyzeSymptoms, currentSession, loading: diagnosticLoading, error: diagnosticError, setCurrentSession } =
    useDiagnostics();

  const garageId = profile?.garageId;

  const [activeTab, setActiveTab] = useState<MechanicTab>('tasks');
  const [tasks, setTasks] = useState<ServiceRequest[]>([]);
  const [history, setHistory] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    if (!garageId) return;
    const result = await databaseService.listDocuments<ServiceRequest>(COLLECTIONS.SERVICE_REQUESTS, [
      Query.equal('garageId', garageId),
    ]);
    setTasks(result.filter((request) => request.status === 'pending' || request.status === 'in_progress'));
  };

  const loadHistory = async () => {
    if (!garageId) return;
    const result = await databaseService.listDocuments<ServiceRequest>(COLLECTIONS.SERVICE_REQUESTS, [
      Query.equal('garageId', garageId),
    ]);
    setHistory(result.filter((request) => request.status === 'completed'));
  };

  const loadData = async () => {
    if (!garageId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'tasks') {
        await loadTasks();
      } else if (activeTab === 'history') {
        await loadHistory();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mechanic data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, garageId]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.fullName || user?.name || user?.email || 'Mechanic';

  const navItems: { id: MechanicTab; label: string; icon: React.ElementType }[] = [
    { id: 'tasks', label: 'My Tasks', icon: ClipboardList },
    { id: 'diagnostic', label: 'AI Diagnostic', icon: Bot },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900 p-6 md:block">
        <div className="mb-8 flex items-center gap-3">
          <Wrench className="h-8 w-8 text-brand-teal" />
          <div>
            <h1 className="text-lg font-bold">AutoFix AI</h1>
            <p className="text-xs text-slate-400">Mechanic</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="text-xl font-bold capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-xs text-slate-400">
              {garageId ? `Garage: ${garageId}` : 'No garage linked'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {!garageId && activeTab !== 'diagnostic' && (
            <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              Your profile is not linked to a garage yet. Ask a garage admin to assign a
              garage ID.
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading && activeTab !== 'diagnostic' ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
            </div>
          ) : (
            <>
              {activeTab === 'tasks' && (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="border-b border-slate-800 px-6 py-4">
                    <h3 className="text-lg font-bold">My Tasks</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-slate-800/60 text-slate-300">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Title</th>
                          <th className="px-6 py-3 font-semibold">Vehicle</th>
                          <th className="px-6 py-3 font-semibold">Status</th>
                          <th className="px-6 py-3 font-semibold">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {tasks.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                              No pending tasks.
                            </td>
                          </tr>
                        ) : (
                          tasks.map((task) => (
                            <tr key={task.$id} className="hover:bg-slate-800/40">
                              <td className="px-6 py-4 font-medium">{task.title}</td>
                              <td className="px-6 py-4 text-slate-400">{task.vehicleId}</td>
                              <td className="px-6 py-4">
                                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                                  {task.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-400">
                                {task.createdAt
                                  ? new Date(task.createdAt).toLocaleDateString()
                                  : new Date(task.$createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'diagnostic' && (
                <div className="space-y-6">
                  {diagnosticError && (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                      {diagnosticError}
                    </div>
                  )}

                  {currentSession ? (
                    <DiagnosticResult response={currentSession.result} />
                  ) : (
                    <DiagnosticForm onSubmit={analyzeSymptoms} loading={diagnosticLoading} />
                  )}

                  {currentSession && (
                    <button
                      type="button"
                      onClick={() => setCurrentSession(null)}
                      className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
                    >
                      New Diagnosis
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="border-b border-slate-800 px-6 py-4">
                    <h3 className="text-lg font-bold">Completed Service Requests</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-slate-800/60 text-slate-300">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Title</th>
                          <th className="px-6 py-3 font-semibold">Vehicle</th>
                          <th className="px-6 py-3 font-semibold">Status</th>
                          <th className="px-6 py-3 font-semibold">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {history.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                              No completed requests.
                            </td>
                          </tr>
                        ) : (
                          history.map((request) => (
                            <tr key={request.$id} className="hover:bg-slate-800/40">
                              <td className="px-6 py-4 font-medium">{request.title}</td>
                              <td className="px-6 py-4 text-slate-400">{request.vehicleId}</td>
                              <td className="px-6 py-4 text-slate-400">{request.status}</td>
                              <td className="px-6 py-4 text-slate-400">
                                {request.createdAt
                                  ? new Date(request.createdAt).toLocaleDateString()
                                  : new Date(request.$createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MechanicDashboard;
