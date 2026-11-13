import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService, COLLECTIONS, Query } from '../../services/database';
import { Permission, Role } from 'appwrite';
import { UserProfile, LearningModule, Assignment, LearningProgress } from '../../types';
import {
  BookOpen,
  Users,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Loader2,
  AlertCircle,
  Plus,
  CheckCircle2,
} from 'lucide-react';

type InstructorTab = 'overview' | 'students' | 'assignments' | 'grading';

interface StudentProgress {
  profile: UserProfile;
  progress: number;
}

export const InstructorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const institutionId = profile?.institutionId;

  const [activeTab, setActiveTab] = useState<InstructorTab>('overview');
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<LearningModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
  });

  const loadStudents = async () => {
    if (!institutionId) return;

    const [studentProfiles, progressDocs] = await Promise.all([
      databaseService.listDocuments<UserProfile>(COLLECTIONS.PROFILES, [
        Query.equal('institutionId', institutionId),
        Query.equal('role', 'student'),
      ]),
      databaseService.listDocuments<LearningProgress>(COLLECTIONS.LEARNING_PROGRESS),
    ]);

    const progressByUser: Record<string, number[]> = {};
    progressDocs.forEach((doc) => {
      if (!progressByUser[doc.userId]) progressByUser[doc.userId] = [];
      progressByUser[doc.userId].push(doc.progressPercent || 0);
    });

    setStudents(
      studentProfiles.map((studentProfile) => {
        const values = progressByUser[studentProfile.userId] || [];
        const average =
          values.length > 0
            ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
            : 0;
        return { profile: studentProfile, progress: average };
      })
    );
  };

  const loadAssignments = async () => {
    if (!user) return;
    const queries = [Query.equal('instructorId', user.$id)];
    if (institutionId) {
      queries.push(Query.equal('institutionId', institutionId));
    }
    const result = await databaseService.listDocuments<Assignment>(COLLECTIONS.ASSIGNMENTS, queries);
    setAssignments(result);
  };

  const loadCourses = async () => {
    const result = await databaseService.listDocuments<LearningModule>(COLLECTIONS.LEARNING_MODULES);
    setCourses(result);
  };

  const loadData = async () => {
    if (!institutionId && activeTab !== 'assignments') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'overview' || activeTab === 'students') {
        await loadStudents();
      }
      if (activeTab === 'assignments' || activeTab === 'grading') {
        await loadAssignments();
      }
      if (activeTab === 'assignments') {
        await loadCourses();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load instructor data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, institutionId, user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleCreateAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!user) {
      setFormError('You must be signed in to create an assignment.');
      return;
    }

    setCreating(true);
    try {
      const permissions = [
        Permission.read(Role.users()),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ];

      await databaseService.createDocument(
        COLLECTIONS.ASSIGNMENTS,
        {
          title: assignmentForm.title,
          description: assignmentForm.description,
          courseId: assignmentForm.courseId,
          instructorId: user.$id,
          institutionId: institutionId || '',
          dueDate: assignmentForm.dueDate,
        },
        permissions
      );

      setAssignmentForm({ title: '', description: '', courseId: '', dueDate: '' });
      setFormSuccess('Assignment created successfully.');
      await loadAssignments();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create assignment.');
    } finally {
      setCreating(false);
    }
  };

  const displayName = profile?.fullName || user?.name || user?.email || 'Instructor';

  const navItems: { id: InstructorTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'My Students', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'grading', label: 'Grading', icon: GraduationCap },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900 p-6 md:block">
        <div className="mb-8 flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-brand-teal" />
          <div>
            <h1 className="text-lg font-bold">AutoFix AI</h1>
            <p className="text-xs text-slate-400">Instructor</p>
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
            <h2 className="text-xl font-bold capitalize">{activeTab}</h2>
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
          {!institutionId && activeTab !== 'assignments' && (
            <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              Your profile is not linked to a school yet. Ask a TVET admin to assign an
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
                <div className="grid gap-6 sm:grid-cols-2">
                  <StatCard label="Total Students Assigned" value={students.length} />
                  <StatCard label="Pending Assignments to Grade" value={assignments.length} />
                </div>
              )}

              {activeTab === 'students' && (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="border-b border-slate-800 px-6 py-4">
                    <h3 className="text-lg font-bold">My Students</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead className="bg-slate-800/60 text-slate-300">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Name</th>
                          <th className="px-6 py-3 font-semibold">Email</th>
                          <th className="px-6 py-3 font-semibold">Learning Progress</th>
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
                            <tr key={student.profile.$id} className="hover:bg-slate-800/40">
                              <td className="px-6 py-4 font-medium">{student.profile.fullName}</td>
                              <td className="px-6 py-4 text-slate-400">{student.profile.email}</td>
                              <td className="px-6 py-4 text-slate-400">{student.progress}%</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <h3 className="mb-4 text-lg font-bold">Create Assignment</h3>

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

                    <form onSubmit={handleCreateAssignment} className="grid gap-4 md:grid-cols-2">
                      <input
                        required
                        type="text"
                        placeholder="Assignment title"
                        value={assignmentForm.title}
                        onChange={(e) =>
                          setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                      <select
                        required
                        value={assignmentForm.courseId}
                        onChange={(e) =>
                          setAssignmentForm((prev) => ({ ...prev, courseId: e.target.value }))
                        }
                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      >
                        <option value="">Select course</option>
                        {courses.map((course) => (
                          <option key={course.$id} value={course.$id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                      <input
                        required
                        type="date"
                        value={assignmentForm.dueDate}
                        onChange={(e) =>
                          setAssignmentForm((prev) => ({ ...prev, dueDate: e.target.value }))
                        }
                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                      <textarea
                        required
                        placeholder="Assignment description"
                        value={assignmentForm.description}
                        onChange={(e) =>
                          setAssignmentForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                        className="md:col-span-2 min-h-[100px] rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          disabled={creating || !user}
                          className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-3 text-sm font-bold text-slate-950 transition-opacity disabled:opacity-50"
                        >
                          {creating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          Create Assignment
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                    <div className="border-b border-slate-800 px-6 py-4">
                      <h3 className="text-lg font-bold">Assignments</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="bg-slate-800/60 text-slate-300">
                          <tr>
                            <th className="px-6 py-3 font-semibold">Title</th>
                            <th className="px-6 py-3 font-semibold">Course</th>
                            <th className="px-6 py-3 font-semibold">Due Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {assignments.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                                No assignments created yet.
                              </td>
                            </tr>
                          ) : (
                            assignments.map((assignment) => (
                              <tr key={assignment.$id} className="hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-medium">{assignment.title}</td>
                                <td className="px-6 py-4 text-slate-400">
                                  {courses.find((course) => course.$id === assignment.courseId)?.title ||
                                    assignment.courseId}
                                </td>
                                <td className="px-6 py-4 text-slate-400">{assignment.dueDate}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'grading' && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                  Grading tools are coming soon.
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

export default InstructorDashboard;
