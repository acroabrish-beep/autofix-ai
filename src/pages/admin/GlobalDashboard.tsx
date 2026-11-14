import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService, COLLECTIONS, Query } from '../../services/database';
import { runAdminAction } from '../../services/ai/adminActions';
import { Application, UserProfile, School, Garage, AuditLog } from '../../types';
import { Permission, Role } from 'appwrite';
import {
  Shield,
  Building2,
  Users,
  LayoutDashboard,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'institutions'
  | 'applications'
  | 'users'
  | 'audit'
  | 'billing'
  | 'settings';

interface Counts {
  schools: number;
  garages: number;
  applications: number;
  users: number;
}

const navItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'institutions', label: 'Schools & Garages', icon: Building2 },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'audit', label: 'Audit Logs', icon: ClipboardList },
  { id: 'billing', label: 'Billing & Subscriptions', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const USER_ROLES = [
  'global_admin',
  'tvet_admin',
  'instructor',
  'student',
  'garage_admin',
  'mechanic',
];

export const GlobalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [counts, setCounts] = useState<Counts>({
    schools: 0,
    garages: 0,
    applications: 0,
    users: 0,
  });
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicantNames, setApplicantNames] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [subscriptions, setSubscriptions] = useState<
    { id: string; name: string; type: string; plan: string; status: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadOverview = async () => {
    const [schoolCount, garageCount, pendingApplications, userCount] = await Promise.all([
      databaseService.countDocuments(COLLECTIONS.SCHOOLS),
      databaseService.countDocuments(COLLECTIONS.GARAGES),
      databaseService.countDocuments(COLLECTIONS.APPLICATIONS, [
        Query.equal('status', 'pending'),
      ]),
      databaseService.countDocuments(COLLECTIONS.PROFILES),
    ]);

    setCounts({
      schools: schoolCount,
      garages: garageCount,
      applications: pendingApplications,
      users: userCount,
    });
  };

  const loadApplications = async () => {
    const [apps, profiles] = await Promise.all([
      databaseService.listDocuments<Application>(COLLECTIONS.APPLICATIONS, [
        Query.equal('status', 'pending'),
        Query.orderDesc('$createdAt'),
      ]),
      databaseService.listDocuments<UserProfile>(COLLECTIONS.PROFILES),
    ]);

    setApplications(apps);

    const nameMap: Record<string, string> = {};
    profiles.forEach((profile) => {
      nameMap[profile.userId] = profile.fullName || profile.email || profile.userId;
    });
    setApplicantNames(nameMap);
  };

  const loadUsers = async () => {
    const result = await databaseService.listDocuments<UserProfile>(COLLECTIONS.PROFILES);
    setUsers(result);
  };

  const loadInstitutions = async () => {
    const [schoolList, garageList] = await Promise.all([
      databaseService.listDocuments<School>(COLLECTIONS.SCHOOLS),
      databaseService.listDocuments<Garage>(COLLECTIONS.GARAGES),
    ]);
    setSchools(schoolList);
    setGarages(garageList);
  };

  const loadAuditLogs = async () => {
    const result = await databaseService.listDocuments<AuditLog>(COLLECTIONS.AUDIT_LOGS, [
      Query.orderDesc('timestamp'),
      Query.limit(50),
    ]);
    setAuditLogs(result);
  };

  const loadBilling = async () => {
    const [schoolList, garageList] = await Promise.all([
      databaseService.listDocuments<School>(COLLECTIONS.SCHOOLS),
      databaseService.listDocuments<Garage>(COLLECTIONS.GARAGES),
    ]);

    const plans = ['Basic', 'Pro', 'Enterprise'];
    setSubscriptions([
      ...schoolList.map((school, index) => ({
        id: school.$id,
        name: school.name,
        type: 'School',
        plan: plans[index % plans.length],
        status: school.status === 'active' ? 'Active' : 'Expired',
      })),
      ...garageList.map((garage, index) => ({
        id: garage.$id,
        name: garage.name,
        type: 'Garage',
        plan: plans[(index + 1) % plans.length],
        status: garage.status === 'active' ? 'Active' : 'Expired',
      })),
    ]);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'overview') {
        await loadOverview();
      } else if (activeTab === 'institutions') {
        await loadInstitutions();
      } else if (activeTab === 'applications') {
        await loadApplications();
      } else if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'audit') {
        await loadAuditLogs();
      } else if (activeTab === 'billing') {
        await loadBilling();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleApplicationStatus = async (
    application: Application,
    status: 'approved' | 'rejected'
  ) => {
    setActionId(application.$id);
    try {
      await runAdminAction(
        status === 'approved' ? 'approve_application' : 'reject_application',
        { applicationId: application.$id }
      );
      await loadApplications();
      await loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application.');
    } finally {
      setActionId(null);
    }
  };

  const handleUserRoleChange = async (profile: UserProfile, newRole: string) => {
    setActionId(profile.$id);
    try {
      await runAdminAction('change_role', {
        userId: profile.userId,
        role: newRole,
      });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role.');
    } finally {
      setActionId(null);
    }
  };

  const handleUserStatus = async (profile: UserProfile) => {
    const newStatus = profile.status === 'suspended' ? 'active' : 'suspended';
    setActionId(profile.$id);
    try {
      await runAdminAction(
        newStatus === 'suspended' ? 'suspend_user' : 'activate_user',
        { userId: profile.userId }
      );
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status.');
    } finally {
      setActionId(null);
    }
  };

  const handleInstitutionStatus = async (
    id: string,
    collection: string,
    newStatus: string
  ) => {
    setActionId(id);
    try {
      await runAdminAction('set_institution_status', {
        collectionId: collection,
        id,
        status: newStatus,
      });
      await loadInstitutions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update institution status.');
    } finally {
      setActionId(null);
    }
  };

  const handleRecordPayment = async (subscription: {
    id: string;
    name: string;
    type: string;
  }) => {
    setActionId(subscription.id);
    try {
      await databaseService.createDocument(COLLECTIONS.PAYMENTS, {
        institutionId: subscription.id,
        amount: '99.00',
        date: new Date().toISOString(),
        status: 'paid',
      }, [Permission.read(Role.users())]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment.');
    } finally {
      setActionId(null);
    }
  };

  const displayName = profile?.fullName || user?.name || user?.email || 'Admin';

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900 p-6 md:block">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-8 w-8 text-brand-teal" />
          <div>
            <h1 className="text-lg font-bold">AutoFix AI</h1>
            <p className="text-xs text-slate-400">Global Admin</p>
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
            <p className="text-xs text-slate-400">Platform administration console</p>
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
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Total TVET Schools" value={counts.schools} />
                  <StatCard label="Total Garages" value={counts.garages} />
                  <StatCard label="Pending Applications" value={counts.applications} />
                  <StatCard label="Total Platform Users" value={counts.users} />
                </div>
              )}

              {activeTab === 'institutions' && (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="border-b border-slate-800 px-6 py-4">
                    <h3 className="text-lg font-bold">Schools & Garages</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-slate-800/60 text-slate-300">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Name</th>
                          <th className="px-6 py-3 font-semibold">Type</th>
                          <th className="px-6 py-3 font-semibold">Location</th>
                          <th className="px-6 py-3 font-semibold">Status</th>
                          <th className="px-6 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {[...schools.map((s) => ({ ...s, type: 'School' })), ...garages.map((g) => ({ ...g, type: 'Garage' }))].length ===
                        0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                              No institutions found.
                            </td>
                          </tr>
                        ) : (
                          [...schools.map((s) => ({ ...s, type: 'School' })), ...garages.map((g) => ({ ...g, type: 'Garage' }))].map(
                            (item) => (
                              <tr key={item.$id} className="hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-medium">{item.name}</td>
                                <td className="px-6 py-4 text-slate-400">{item.type}</td>
                                <td className="px-6 py-4 text-slate-400">{item.location}</td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                                      item.status === 'active'
                                        ? 'bg-brand-teal/10 text-brand-teal'
                                        : 'bg-red-500/10 text-red-300'
                                    }`}
                                  >
                                    {item.status || 'active'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    type="button"
                                    disabled={actionId === item.$id}
                                    onClick={() =>
                                      handleInstitutionStatus(
                                        item.$id,
                                        item.type === 'School'
                                          ? COLLECTIONS.SCHOOLS
                                          : COLLECTIONS.GARAGES,
                                        item.status === 'suspended' ? 'active' : 'suspended'
                                      )
                                    }
                                    className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
                                      item.status === 'suspended'
                                        ? 'bg-brand-teal text-slate-950'
                                        : 'border border-red-500/40 text-red-300 hover:bg-red-500/10'
                                    }`}
                                  >
                                    {item.status === 'suspended' ? 'Activate' : 'Suspend'}
                                  </button>
                                </td>
                              </tr>
                            )
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'applications' && (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                    <h3 className="text-lg font-bold">Pending Applications</h3>
                    <button
                      type="button"
                      onClick={loadData}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-slate-800/60 text-slate-300">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Applicant Name</th>
                          <th className="px-6 py-3 font-semibold">Type</th>
                          <th className="px-6 py-3 font-semibold">Date</th>
                          <th className="px-6 py-3 font-semibold">Status</th>
                          <th className="px-6 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {applications.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                              No pending applications.
                            </td>
                          </tr>
                        ) : (
                          applications.map((application) => (
                            <tr key={application.$id} className="hover:bg-slate-800/40">
                              <td className="px-6 py-4 font-medium">
                                {applicantNames[application.applicantId] ||
                                  application.applicantId}
                              </td>
                              <td className="px-6 py-4 capitalize">{application.type}</td>
                              <td className="px-6 py-4 text-slate-400">
                                {new Date(application.$createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                                  {application.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    disabled={actionId === application.$id}
                                    onClick={() =>
                                      handleApplicationStatus(application, 'approved')
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg bg-brand-teal px-3 py-2 text-xs font-bold text-slate-950 transition-opacity disabled:opacity-50"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    disabled={actionId === application.$id}
                                    onClick={() =>
                                      handleApplicationStatus(application, 'rejected')
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-3 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Reject
                                  </button>
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

              {activeTab === 'users' && (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="border-b border-slate-800 px-6 py-4">
                    <h3 className="text-lg font-bold">Platform Users</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[880px] text-left text-sm">
                      <thead className="bg-slate-800/60 text-slate-300">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Name</th>
                          <th className="px-6 py-3 font-semibold">Email</th>
                          <th className="px-6 py-3 font-semibold">Role</th>
                          <th className="px-6 py-3 font-semibold">Institution</th>
                          <th className="px-6 py-3 font-semibold">Status</th>
                          <th className="px-6 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                              No users found.
                            </td>
                          </tr>
                        ) : (
                          users.map((profile) => (
                            <tr key={profile.$id} className="hover:bg-slate-800/40">
                              <td className="px-6 py-4 font-medium">{profile.fullName}</td>
                              <td className="px-6 py-4 text-slate-400">{profile.email}</td>
                              <td className="px-6 py-4">
                                <select
                                  value={profile.role}
                                  disabled={actionId === profile.$id}
                                  onChange={(event) =>
                                    handleUserRoleChange(profile, event.target.value)
                                  }
                                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                                >
                                  {USER_ROLES.map((role) => (
                                    <option key={role} value={role}>
                                      {role}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-4 text-slate-400">
                                {profile.institutionId || profile.garageId || '—'}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                                    profile.status === 'suspended'
                                      ? 'bg-red-500/10 text-red-300'
                                      : 'bg-brand-teal/10 text-brand-teal'
                                  }`}
                                >
                                  {profile.status || 'active'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  type="button"
                                  disabled={actionId === profile.$id}
                                  onClick={() => handleUserStatus(profile)}
                                  className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
                                    profile.status === 'suspended'
                                      ? 'bg-brand-teal text-slate-950'
                                      : 'border border-red-500/40 text-red-300 hover:bg-red-500/10'
                                  }`}
                                >
                                  {profile.status === 'suspended' ? 'Activate' : 'Suspend'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="border-b border-slate-800 px-6 py-4">
                    <h3 className="text-lg font-bold">Audit Logs</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-slate-800/60 text-slate-300">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Timestamp</th>
                          <th className="px-6 py-3 font-semibold">Actor</th>
                          <th className="px-6 py-3 font-semibold">Action</th>
                          <th className="px-6 py-3 font-semibold">Target</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {auditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                              No audit logs found.
                            </td>
                          </tr>
                        ) : (
                          auditLogs.map((log) => (
                            <tr key={log.$id} className="hover:bg-slate-800/40">
                              <td className="px-6 py-4 text-slate-400">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 font-medium">{log.actorId}</td>
                              <td className="px-6 py-4 text-slate-400">{log.action}</td>
                              <td className="px-6 py-4 text-slate-400">{log.targetId}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                    <div className="border-b border-slate-800 px-6 py-4">
                      <h3 className="text-lg font-bold">Subscribed Schools & Garages</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="bg-slate-800/60 text-slate-300">
                          <tr>
                            <th className="px-6 py-3 font-semibold">Name</th>
                            <th className="px-6 py-3 font-semibold">Type</th>
                            <th className="px-6 py-3 font-semibold">Plan</th>
                            <th className="px-6 py-3 font-semibold">Status</th>
                            <th className="px-6 py-3 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {subscriptions.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                                No subscriptions found.
                              </td>
                            </tr>
                          ) : (
                            subscriptions.map((subscription) => (
                              <tr key={subscription.id} className="hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-medium">{subscription.name}</td>
                                <td className="px-6 py-4 text-slate-400">{subscription.type}</td>
                                <td className="px-6 py-4 text-slate-400">{subscription.plan}</td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                                      subscription.status === 'Active'
                                        ? 'bg-brand-teal/10 text-brand-teal'
                                        : 'bg-red-500/10 text-red-300'
                                    }`}
                                  >
                                    {subscription.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    type="button"
                                    disabled={actionId === subscription.id}
                                    onClick={() => handleRecordPayment(subscription)}
                                    className="rounded-lg bg-brand-teal px-3 py-2 text-xs font-bold text-slate-950 transition-opacity disabled:opacity-50"
                                  >
                                    Record Payment
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-bold">Subscription Plans</h3>
                    <div className="grid gap-6 md:grid-cols-3">
                      {[
                        {
                          name: 'Basic',
                          price: '$29/mo',
                          features: ['Up to 50 users', 'Core diagnostics', 'Email support'],
                        },
                        {
                          name: 'Pro',
                          price: '$99/mo',
                          features: ['Up to 500 users', 'Advanced analytics', 'Priority support'],
                        },
                        {
                          name: 'Enterprise',
                          price: 'Custom',
                          features: ['Unlimited users', 'Dedicated support', 'Custom integrations'],
                        },
                      ].map((plan) => (
                        <div
                          key={plan.name}
                          className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                        >
                          <h4 className="text-xl font-bold">{plan.name}</h4>
                          <p className="mt-2 text-3xl font-bold text-brand-teal">{plan.price}</p>
                          <ul className="mt-4 space-y-2 text-sm text-slate-400">
                            {plan.features.map((feature) => (
                              <li key={feature}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab !== 'overview' &&
                activeTab !== 'institutions' &&
                activeTab !== 'applications' &&
                activeTab !== 'users' &&
                activeTab !== 'audit' &&
                activeTab !== 'billing' && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} management is coming soon.
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

export default GlobalDashboard;
