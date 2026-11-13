import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ID } from '../../lib/appwrite';
import { profilesService } from '../../services/database/profiles';
import { databaseService, COLLECTIONS, Query } from '../../services/database';
import { UserProfile, ServiceRequest } from '../../types';
import {
  Wrench,
  Users,
  ClipboardList,
  LayoutDashboard,
  UserPlus,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';

type GarageTab = 'overview' | 'mechanics' | 'requests';

interface Counts {
  mechanics: number;
  pendingRequests: number;
}

export const GarageDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const garageId = profile?.garageId;

  const [activeTab, setActiveTab] = useState<GarageTab>('overview');
  const [counts, setCounts] = useState<Counts>({ mechanics: 0, pendingRequests: 0 });
  const [mechanics, setMechanics] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const [mechanicForm, setMechanicForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
  });

  const loadCounts = async () => {
    if (!garageId) return;

    const [mechanicCount, pendingCount] = await Promise.all([
      databaseService.countDocuments(COLLECTIONS.PROFILES, [
        Query.equal('garageId', garageId),
        Query.equal('role', 'mechanic'),
      ]),
      databaseService.countDocuments(COLLECTIONS.SERVICE_REQUESTS, [
        Query.equal('garageId', garageId),
        Query.equal('status', 'pending'),
      ]),
    ]);

    setCounts({ mechanics: mechanicCount, pendingRequests: pendingCount });
  };

  const loadMechanics = async () => {
    if (!garageId) return;
    const result = await databaseService.listDocuments<UserProfile>(COLLECTIONS.PROFILES, [
      Query.equal('garageId', garageId),
      Query.equal('role', 'mechanic'),
    ]);
    setMechanics(result);
  };

  const loadRequests = async () => {
    if (!garageId) return;
    const result = await databaseService.listDocuments<ServiceRequest>(COLLECTIONS.SERVICE_REQUESTS, [
      Query.equal('garageId', garageId),
    ]);
    setRequests(result);
  };

  const loadData = async () => {
    if (!garageId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'overview') {
        await loadCounts();
      } else if (activeTab === 'mechanics') {
        await loadMechanics();
      } else if (activeTab === 'requests') {
        await loadRequests();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load garage data.');
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

  const handleAddMechanic = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!garageId) {
      setFormError('Your account is not linked to a garage.');
      return;
    }

    setCreating(true);
    try {
      // Demo mode: create a profile record only. In production this would
      // send an email invite and create the Appwrite Auth account separately.
      await profilesService.createProfile({
        userId: ID.unique(),
        fullName: mechanicForm.name,
        email: mechanicForm.email,
        role: 'mechanic' as any,
        garageId,
        phone: mechanicForm.phone,
        specialization: mechanicForm.specialization,
      });

      setMechanicForm({ name: '', email: '', phone: '', specialization: '' });
      setFormSuccess('Mechanic registered successfully.');
      await loadMechanics();
      await loadCounts();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to register mechanic.');
    } finally {
      setCreating(false);
    }
  };

  const handleRequestStatus = async (request: ServiceRequest, status: string) => {
    setActionId(request.$id);
    try {
      await databaseService.updateDocument(COLLECTIONS.SERVICE_REQUESTS, request.$id, { status });
      await loadRequests();
      await loadCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service request.');
    } finally {
      setActionId(null);
    }
  };

  const displayName = profile?.fullName || user?.name || user?.email || 'Garage Admin';

  const navItems: { id: GarageTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'mechanics', label: 'My Mechanics', icon: Users },
    { id: 'requests', label: 'Service Requests', icon: ClipboardList },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900 p-6 md:block">
        <div className="mb-8 flex items-center gap-3">
          <Wrench className="h-8 w-8 text-brand-teal" />
          <div>
            <h1 className="text-lg font-bold">AutoFix AI</h1>
            <p className="text-xs text-slate-400">Garage Admin</p>
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
          {!garageId && (
            <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              Your profile is not linked to a garage yet. Ask a global admin to assign a
              garage ID.
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <StatCard label="Total Mechanics" value={counts.mechanics} />
                  <StatCard label="Pending Requests" value={counts.pendingRequests} />
                </div>
              )}

              {activeTab === 'mechanics' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <h3 className="mb-4 text-lg font-bold">Register New Mechanic</h3>

                    {formError && (
                      <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                        {formError}
                      </div>
                    )}
                    {formSuccess && (
                      <div className="mb-4 flex items-center gap-2 rounded-xl border border-brand-teal/30 bg-brand-teal/10 p-3 text-sm text-brand-teal">
                        <CheckCircle2 className="h-4 w-4" />
                        {formSuccess}
                      </div>
                    )}

                    <form onSubmit={handleAddMechanic} className="grid gap-4 md:grid-cols-2">
                      <input
                        required
                        type="text"
                        placeholder="Full name"
                        value={mechanicForm.name}
                        onChange={(e) =>
                          setMechanicForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                      <input
                        required
                        type="email"
                        placeholder="Email address"
                        value={mechanicForm.email}
                        onChange={(e) =>
                          setMechanicForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={mechanicForm.phone}
                        onChange={(e) =>
                          setMechanicForm((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                      <input
                        type="text"
                        placeholder="Specialization"
                        value={mechanicForm.specialization}
                        onChange={(e) =>
                          setMechanicForm((prev) => ({ ...prev, specialization: e.target.value }))
                        }
                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                      <p className="md:col-span-2 text-xs text-slate-400">
                        Note: For the demo, this creates a profile record. In production, this will send an email invite.
                      </p>
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={creating || !garageId}
                          className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-3 text-sm font-bold text-slate-950 transition-opacity disabled:opacity-50"
                        >
                          {creating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                          Register Mechanic
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                    <div className="border-b border-slate-800 px-6 py-4">
                      <h3 className="text-lg font-bold">Mechanics</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="bg-slate-800/60 text-slate-300">
                          <tr>
                            <th className="px-6 py-3 font-semibold">Name</th>
                            <th className="px-6 py-3 font-semibold">Email</th>
                            <th className="px-6 py-3 font-semibold">Phone</th>
                            <th className="px-6 py-3 font-semibold">Specialization</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {mechanics.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                                No mechanics found.
                              </td>
                            </tr>
                          ) : (
                            mechanics.map((mechanic) => (
                              <tr key={mechanic.$id} className="hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-medium">{mechanic.fullName}</td>
                                <td className="px-6 py-4 text-slate-400">{mechanic.email}</td>
                                <td className="px-6 py-4 text-slate-400">{mechanic.phone || '—'}</td>
                                <td className="px-6 py-4 text-slate-400">
                                  {mechanic.specialization || '—'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="border-b border-slate-800 px-6 py-4">
                    <h3 className="text-lg font-bold">Service Requests</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-sm">
                      <thead className="bg-slate-800/60 text-slate-300">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Title</th>
                          <th className="px-6 py-3 font-semibold">Vehicle</th>
                          <th className="px-6 py-3 font-semibold">Status</th>
                          <th className="px-6 py-3 font-semibold">Created</th>
                          <th className="px-6 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {requests.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                              No service requests found.
                            </td>
                          </tr>
                        ) : (
                          requests.map((request) => (
                            <tr key={request.$id} className="hover:bg-slate-800/40">
                              <td className="px-6 py-4 font-medium">{request.title}</td>
                              <td className="px-6 py-4 text-slate-400">{request.vehicleId}</td>
                              <td className="px-6 py-4">
                                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                                  {request.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-400">
                                {request.createdAt
                                  ? new Date(request.createdAt).toLocaleDateString()
                                  : new Date(request.$createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  {request.status === 'pending' && (
                                    <button
                                      type="button"
                                      disabled={actionId === request.$id}
                                      onClick={() => handleRequestStatus(request, 'in_progress')}
                                      className="inline-flex items-center gap-1 rounded-lg bg-brand-teal px-3 py-2 text-xs font-bold text-slate-950 transition-opacity disabled:opacity-50"
                                    >
                                      <PlayCircle className="h-3.5 w-3.5" />
                                      Accept
                                    </button>
                                  )}
                                  {request.status === 'in_progress' && (
                                    <button
                                      type="button"
                                      disabled={actionId === request.$id}
                                      onClick={() => handleRequestStatus(request, 'completed')}
                                      className="inline-flex items-center gap-1 rounded-lg border border-brand-teal/40 px-3 py-2 text-xs font-bold text-brand-teal transition-colors hover:bg-brand-teal/10 disabled:opacity-50"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      Complete
                                    </button>
                                  )}
                                </div>
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

const StatCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
    <p className="text-sm font-medium text-slate-400">{label}</p>
    <p className="mt-3 text-4xl font-bold text-white">{value}</p>
  </div>
);

export default GarageDashboard;
