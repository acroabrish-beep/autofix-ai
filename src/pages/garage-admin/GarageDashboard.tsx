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
  Car,
  Save,
} from 'lucide-react';

type GarageTab = 'overview' | 'mechanics' | 'requests' | 'workorders';

interface Counts {
  mechanics: number;
  pendingRequests: number;
}

interface RequestDetails {
  vehicle: any | null;
  owner: UserProfile | null;
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

  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [requestDetails, setRequestDetails] = useState<RequestDetails>({
    vehicle: null,
    owner: null,
  });
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);

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
      } else if (activeTab === 'requests' || activeTab === 'workorders') {
        await Promise.all([loadRequests(), loadMechanics()]);
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
      await profilesService.createProfile({
        userId: ID.unique(),
        fullName: mechanicForm.name,
        email: mechanicForm.email,
        role: 'mechanic' as any,
        garageId,
        phone: mechanicForm.phone,
        specialization: mechanicForm.specialization,
        privileged: true,
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

  const handleAssignMechanic = async (request: ServiceRequest, mechanicUserId: string) => {
    setActionId(request.$id);
    try {
      await databaseService.updateDocument(COLLECTIONS.SERVICE_REQUESTS, request.$id, {
        assignedMechanicId: mechanicUserId || null,
        status: mechanicUserId ? 'in_progress' : 'pending',
      });
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign mechanic.');
    } finally {
      setActionId(null);
    }
  };

  const handleCompleteJob = async (request: ServiceRequest) => {
    const cost = window.prompt('Enter final cost (e.g. 150.00)');
    if (cost === null) return;

    setActionId(request.$id);
    try {
      await databaseService.updateDocument(COLLECTIONS.SERVICE_REQUESTS, request.$id, {
        status: 'completed',
        finalCost: cost,
      });
      await loadRequests();
      await loadCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete job.');
    } finally {
      setActionId(null);
    }
  };

  const openRequestDetails = async (request: ServiceRequest) => {
    setSelectedRequest(request);
    setRequestDetails({ vehicle: null, owner: null });
    setDetailsLoading(true);
    setNoteDraft('');

    try {
      const vehicle = await databaseService.getDocument<any>(COLLECTIONS.VEHICLES, request.vehicleId);
      let owner: UserProfile | null = null;
      if (vehicle?.userId) {
        const profiles = await databaseService.listDocuments<UserProfile>(COLLECTIONS.PROFILES, [
          Query.equal('userId', vehicle.userId),
        ]);
        owner = profiles[0] || null;
      }
      setRequestDetails({ vehicle, owner });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load request details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAddNote = async (request: ServiceRequest) => {
    if (!noteDraft.trim()) return;

    setSavingNote(true);
    try {
      const author = profile?.fullName || user?.email || 'Garage Admin';
      const timestamp = new Date().toLocaleString();
      const updatedNotes = request.notes
        ? `${request.notes}\n[${timestamp}] ${author}: ${noteDraft.trim()}`
        : `[${timestamp}] ${author}: ${noteDraft.trim()}`;

      await databaseService.updateDocument(COLLECTIONS.SERVICE_REQUESTS, request.$id, {
        notes: updatedNotes,
      });

      const updatedRequest = { ...request, notes: updatedNotes };
      setSelectedRequest(updatedRequest);
      setRequests((prev) =>
        prev.map((item) => (item.$id === request.$id ? updatedRequest : item))
      );
      setNoteDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  const displayName = profile?.fullName || user?.name || user?.email || 'Garage Admin';

  const navItems: { id: GarageTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'mechanics', label: 'My Mechanics', icon: Users },
    { id: 'requests', label: 'Service Requests', icon: ClipboardList },
    { id: 'workorders', label: 'Work Orders', icon: Wrench },
  ];

  const mechanicName = (mechanicId?: string) =>
    mechanics.find((mechanic) => mechanic.userId === mechanicId)?.fullName || mechanicId || 'Unassigned';

  const timelineSteps = (request: ServiceRequest) => [
    { label: 'Requested', complete: true },
    { label: 'Mechanic Assigned', complete: Boolean(request.assignedMechanicId) },
    { label: 'In Progress', complete: request.status === 'in_progress' || request.status === 'completed' },
    { label: 'Completed', complete: request.status === 'completed' },
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
                <div className="space-y-6">
                  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                    <div className="border-b border-slate-800 px-6 py-4">
                      <h3 className="text-lg font-bold">Service Requests</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="bg-slate-800/60 text-slate-300">
                          <tr>
                            <th className="px-6 py-3 font-semibold">Title</th>
                            <th className="px-6 py-3 font-semibold">Vehicle</th>
                            <th className="px-6 py-3 font-semibold">Status</th>
                            <th className="px-6 py-3 font-semibold">Mechanic</th>
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
                                <td className="px-6 py-4">
                                  <select
                                    value={request.assignedMechanicId || ''}
                                    disabled={actionId === request.$id}
                                    onChange={(e) => handleAssignMechanic(request, e.target.value)}
                                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                                  >
                                    <option value="">Unassigned</option>
                                    {mechanics.map((mechanic) => (
                                      <option key={mechanic.$id} value={mechanic.userId}>
                                        {mechanic.fullName}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() => openRequestDetails(request)}
                                      className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800"
                                    >
                                      Details
                                    </button>
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
                                        onClick={() => handleCompleteJob(request)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-brand-teal/40 px-3 py-2 text-xs font-bold text-brand-teal transition-colors hover:bg-brand-teal/10 disabled:opacity-50"
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Complete Job
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

                  {selectedRequest && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold">Customer & Vehicle</h3>
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(null)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Close
                        </button>
                      </div>

                      {detailsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-brand-teal" />
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-xl bg-slate-800/60 p-4">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                              Customer
                            </p>
                            <p className="font-medium">{requestDetails.owner?.fullName || 'Unknown'}</p>
                            <p className="text-sm text-slate-400">{requestDetails.owner?.email || '—'}</p>
                            <p className="text-sm text-slate-400">{requestDetails.owner?.phone || '—'}</p>
                          </div>
                          <div className="rounded-xl bg-slate-800/60 p-4">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                              Vehicle
                            </p>
                            <p className="font-medium">
                              {requestDetails.vehicle
                                ? `${requestDetails.vehicle.make} ${requestDetails.vehicle.model}`
                                : 'Unknown'}
                            </p>
                            <p className="text-sm text-slate-400">
                              {requestDetails.vehicle
                                ? `${requestDetails.vehicle.year}${requestDetails.vehicle.engine ? ` • ${requestDetails.vehicle.engine}` : ''}`
                                : '—'}
                            </p>
                            <p className="text-sm text-slate-400">
                              Vehicle ID: {selectedRequest.vehicleId}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'workorders' && (
                <div className="space-y-6">
                  {requests.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                      No work orders found.
                    </div>
                  ) : (
                    requests.map((request) => (
                      <div
                        key={request.$id}
                        className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold">{request.title}</h3>
                            <p className="text-sm text-slate-400">
                              Vehicle: {request.vehicleId} • Mechanic: {mechanicName(request.assignedMechanicId)}
                            </p>
                          </div>
                          {request.finalCost && (
                            <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-bold text-brand-teal">
                              Final Cost: {request.finalCost}
                            </span>
                          )}
                        </div>

                        <div className="mb-6 grid gap-3 sm:grid-cols-4">
                          {timelineSteps(request).map((step) => (
                            <div
                              key={step.label}
                              className={`rounded-xl border px-4 py-3 text-center text-xs font-bold ${
                                step.complete
                                  ? 'border-brand-teal/40 bg-brand-teal/10 text-brand-teal'
                                  : 'border-slate-700 bg-slate-800 text-slate-400'
                              }`}
                            >
                              {step.label}
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Work Order Notes
                          </p>
                          <pre className="min-h-[80px] whitespace-pre-wrap rounded-xl bg-slate-800/60 p-4 text-sm text-slate-300">
                            {request.notes || 'No notes yet.'}
                          </pre>
                          {selectedRequest?.$id === request.$id ? (
                            <div className="space-y-3">
                              <textarea
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                placeholder="Add a note to this work order..."
                                className="min-h-[90px] w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                              />
                              <button
                                type="button"
                                disabled={savingNote || !noteDraft.trim()}
                                onClick={() => handleAddNote(request)}
                                className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-4 py-2 text-sm font-bold text-slate-950 transition-opacity disabled:opacity-50"
                              >
                                {savingNote ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                                Save Note
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequest(request);
                                setNoteDraft('');
                              }}
                              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
                            >
                              Add Note
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
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
