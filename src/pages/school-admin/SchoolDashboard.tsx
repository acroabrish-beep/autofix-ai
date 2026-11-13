import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../hooks/useRole';
import { ID } from '../../lib/appwrite';
import { profilesService } from '../../services/database/profiles';
import { databaseService, COLLECTIONS, Query } from '../../services/database';
import { UserProfile } from '../../types';
import {
  GraduationCap,
  Users,
  BookOpen,
  LayoutDashboard,
  UserPlus,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

type SchoolTab = 'overview' | 'instructors' | 'students' | 'courses';

interface Counts {
  students: number;
  instructors: number;
  courses: number;
}

export const SchoolDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { role } = useRole();

  const institutionId = profile?.institutionId;

  const [activeTab, setActiveTab] = useState<SchoolTab>('overview');
  const [counts, setCounts] = useState<Counts>({
    students: 0,
    instructors: 0,
    courses: 0,
  });
  const [instructors, setInstructors] = useState<UserProfile[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [instructorForm, setInstructorForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const loadCounts = async () => {
    if (!institutionId) return;

    const [studentCount, instructorCount, courseCount] = await Promise.all([
      databaseService.countDocuments(COLLECTIONS.PROFILES, [
        Query.equal('institutionId', institutionId),
        Query.equal('role', 'student'),
      ]),
      databaseService.countDocuments(COLLECTIONS.PROFILES, [
        Query.equal('institutionId', institutionId),
        Query.equal('role', 'instructor'),
      ]),
      databaseService.countDocuments(COLLECTIONS.LEARNING_MODULES),
    ]);

    setCounts({
      students: studentCount,
      instructors: instructorCount,
      courses: courseCount,
    });
  };

  const loadInstructors = async () => {
    if (!institutionId) return;
    const result = await databaseService.listDocuments<UserProfile>(COLLECTIONS.PROFILES, [
      Query.equal('institutionId', institutionId),
      Query.equal('role', 'instructor'),
    ]);
    setInstructors(result);
  };

  const loadStudents = async () => {
    if (!institutionId) return;
    const result = await databaseService.listDocuments<UserProfile>(COLLECTIONS.PROFILES, [
      Query.equal('institutionId', institutionId),
      Query.equal('role', 'student'),
    ]);
    setStudents(result);
  };

  const loadData = async () => {
    if (!institutionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'overview') {
        await loadCounts();
      } else if (activeTab === 'instructors') {
        await loadInstructors();
      } else if (activeTab === 'students') {
        await loadStudents();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load school data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, institutionId]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleAddInstructor = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!institutionId) {
      setFormError('Your account is not linked to a school.');
      return;
    }

    setCreating(true);
    try {
      // Demo mode: create a profile record only. In production this would
      // send an email invite and create the Appwrite Auth account separately.
      await profilesService.createProfile({
        userId: ID.unique(),
        fullName: instructorForm.name,
        email: instructorForm.email,
        role: 'instructor' as any,
        institutionId,
        phone: instructorForm.phone,
      });

      setInstructorForm({ name: '', email: '', phone: '' });
      setFormSuccess('Instructor created successfully.');
      await loadInstructors();
      await loadCounts();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create instructor.');
    } finally {
      setCreating(false);
    }
  };

  const displayName = profile?.fullName || user?.name || user?.email || 'TVET Admin';

  const navItems: { id: SchoolTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'instructors', label: 'Manage Instructors', icon: UserPlus },
    { id: 'students', label: 'Manage Students', icon: Users },
    { id: 'courses', label: 'Manage Courses', icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900 p-6 md:block">
        <div className="mb-8 flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-brand-teal" />
          <div>
            <h1 className="text-lg font-bold">AutoFix AI</h1>
            <p className="text-xs text-slate-400">TVET Admin</p>
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
              {institutionId ? `Institution: ${institutionId}` : 'No institution linked'}
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
          {!institutionId && (
            <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              Your profile is not linked to a school yet. Ask a global admin to assign an
              institution ID.
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
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  <StatCard label="Total Students" value={counts.students} />
                  <StatCard label="Total Instructors" value={counts.instructors} />
                  <StatCard label="Total Active Courses" value={counts.courses} />
                </div>
              )}

              {activeTab === 'instructors' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <h3 className="mb-4 text-lg font-bold">Add New Instructor</h3>

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

                    <form onSubmit={handleAddInstructor} className="grid gap-4 md:grid-cols-2">
                      <input
                        required
                        type="text"
                        placeholder="Full name"
                        value={instructorForm.name}
                        onChange={(e) =>
                          setInstructorForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                      <input
                        required
                        type="email"
                        placeholder="Email address"
                        value={instructorForm.email}
                        onChange={(e) =>
                          setInstructorForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={instructorForm.phone}
                        onChange={(e) =>
                          setInstructorForm((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                      <p className="md:col-span-2 text-xs text-slate-400">
                        Note: For the demo, this creates a profile record. In production, this will send an email invite.
                      </p>
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={creating || !institutionId}
                          className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-3 text-sm font-bold text-slate-950 transition-opacity disabled:opacity-50"
                        >
                          {creating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                          Add Instructor
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                    <div className="border-b border-slate-800 px-6 py-4">
                      <h3 className="text-lg font-bold">Instructors</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="bg-slate-800/60 text-slate-300">
                          <tr>
                            <th className="px-6 py-3 font-semibold">Name</th>
                            <th className="px-6 py-3 font-semibold">Email</th>
                            <th className="px-6 py-3 font-semibold">Phone</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {instructors.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                                No instructors found.
                              </td>
                            </tr>
                          ) : (
                            instructors.map((instructor) => (
                              <tr key={instructor.$id} className="hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-medium">{instructor.fullName}</td>
                                <td className="px-6 py-4 text-slate-400">{instructor.email}</td>
                                <td className="px-6 py-4 text-slate-400">
                                  {instructor.phone || '—'}
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

              {activeTab === 'students' && (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="border-b border-slate-800 px-6 py-4">
                    <h3 className="text-lg font-bold">Students</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead className="bg-slate-800/60 text-slate-300">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Name</th>
                          <th className="px-6 py-3 font-semibold">Email</th>
                          <th className="px-6 py-3 font-semibold">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {students.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                              No students found.
                            </td>
                          </tr>
                        ) : (
                          students.map((student) => (
                            <tr key={student.$id} className="hover:bg-slate-800/40">
                              <td className="px-6 py-4 font-medium">{student.fullName}</td>
                              <td className="px-6 py-4 text-slate-400">{student.email}</td>
                              <td className="px-6 py-4 text-slate-400">—</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'courses' && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                  Course management is coming soon.
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

export default SchoolDashboard;
