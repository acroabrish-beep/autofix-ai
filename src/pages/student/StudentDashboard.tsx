import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { learningService } from '../../services/database/learning';
import { databaseService, COLLECTIONS } from '../../services/database';
import { LearningModule, Assignment } from '../../types';
import {
  BookOpen,
  ClipboardList,
  Bot,
  Award,
  LayoutDashboard,
  LogOut,
  Loader2,
} from 'lucide-react';

type StudentTab = 'courses' | 'assignments' | 'tutor' | 'certificates';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<StudentTab>('courses');
  const [courses, setCourses] = useState<LearningModule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [courseList, assignmentList] = await Promise.all([
        learningService.listModules(),
        databaseService.listDocuments<Assignment>(COLLECTIONS.ASSIGNMENTS),
      ]);
      setCourses(courseList);
      setAssignments(assignmentList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load student data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.fullName || user?.name || user?.email || 'Student';

  const navItems: { id: StudentTab; label: string; icon: React.ElementType }[] = [
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'tutor', label: 'AI Tutor', icon: Bot },
    { id: 'certificates', label: 'Certificates', icon: Award },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900 p-6 md:block">
        <div className="mb-8 flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-brand-teal" />
          <div>
            <h1 className="text-lg font-bold">AutoFix AI</h1>
            <p className="text-xs text-slate-400">Student</p>
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
            <p className="text-xs text-slate-400">Student learning workspace</p>
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
              {activeTab === 'courses' && (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {courses.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                      No courses available yet.
                    </div>
                  ) : (
                    courses.map((course) => (
                      <div
                        key={course.$id}
                        className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                      >
                        <BookOpen className="mb-4 h-8 w-8 text-brand-teal" />
                        <h3 className="text-lg font-bold">{course.title}</h3>
                        <p className="mt-2 text-sm text-slate-400">{course.description}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="border-b border-slate-800 px-6 py-4">
                    <h3 className="text-lg font-bold">Pending Assignments</h3>
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
                              No pending assignments.
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
              )}

              {activeTab === 'tutor' && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                  AI Tutor integration is coming soon.
                </div>
              )}

              {activeTab === 'certificates' && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                  Certificates are coming soon.
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
