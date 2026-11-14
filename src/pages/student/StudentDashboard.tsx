import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { learningService } from '../../services/database/learning';
import { databaseService, COLLECTIONS, Query } from '../../services/database';
import { generateChatReply } from '../../services/ai/chat';
import { storageService, BUCKETS } from '../../services/storage';
import { Permission, Role } from 'appwrite';
import { LearningModule, Assignment, Submission, Certificate, CourseMaterial } from '../../types';
import {
  BookOpen,
  ClipboardList,
  Bot,
  Award,
  LayoutDashboard,
  LogOut,
  Loader2,
  Send,
  X,
  AlertCircle,
  Mic,
  MicOff,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type StudentTab = 'courses' | 'assignments' | 'tutor' | 'certificates';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, profile, signOut } = useAuth();

  const institutionId = profile?.institutionId;

  const [activeTab, setActiveTab] = useState<StudentTab>('courses');
  const [courses, setCourses] = useState<LearningModule[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // --- AI Tutor state ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [courseList, assignmentList, materialList] = await Promise.all([
        learningService.listModules(),
        institutionId
          ? databaseService.listDocuments<Assignment>(COLLECTIONS.ASSIGNMENTS, [
              Query.equal('institutionId', institutionId),
            ])
          : databaseService.listDocuments<Assignment>(COLLECTIONS.ASSIGNMENTS),
        databaseService.listDocuments<CourseMaterial>(COLLECTIONS.COURSE_MATERIALS),
      ]);
      setCourses(courseList);
      setAssignments(assignmentList);
      setMaterials(materialList);

      if (user) {
        const [submissionList, certificateList] = await Promise.all([
          databaseService.listDocuments<Submission>(COLLECTIONS.SUBMISSIONS, [
            Query.equal('studentId', user.$id),
          ]),
          databaseService.listDocuments<Certificate>(COLLECTIONS.CERTIFICATES, [
            Query.equal('studentId', user.$id),
          ]),
        ]);
        setSubmissions(submissionList);
        setCertificates(certificateList);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load student data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutionId, user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getSubmission = (assignmentId: string) =>
    submissions.find((submission) => submission.assignmentId === assignmentId);

  const handleSubmitWork = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!submittingAssignment || !user || !submissionContent.trim()) return;

    setSubmitting(true);
    try {
      await databaseService.createDocument(
        COLLECTIONS.SUBMISSIONS,
        {
          assignmentId: submittingAssignment.$id,
          institutionId: profile?.institutionId || '',
          studentId: user.$id,
          studentName: profile?.fullName || user.name || user.email,
          content: submissionContent.trim(),
          status: 'pending',
          grade: '',
          feedback: '',
          submittedAt: new Date().toISOString(),
        },
        [Permission.read(Role.users()), Permission.update(Role.users())]
      );

      setSubmissionContent('');
      setSubmittingAssignment(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit work.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chatMessages, chatLoading]);

  const getSpeechLanguage = () => {
    const language = i18n.language || 'en';
    if (language === 'am') return 'am-ET';
    if (language === 'om') return 'om-ET';
    if (language === 'sid') return 'en-US';
    return 'en-US';
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLanguage();
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setVoiceError(null);
    const recognition = new SpeechRecognition();
    recognition.lang = getSpeechLanguage();
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript || '')
        .join('');
      setChatInput(transcript);
    };

    recognition.onerror = (event: any) => {
      setVoiceError(event?.error || 'Microphone permission denied or unavailable.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const handleSendTutorMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    setChatInput('');
    setChatError(null);
    setChatLoading(true);
    setChatMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}-user`, role: 'user', content: text },
    ]);

    try {
      const reply = await generateChatReply(
        `System: You are a TVET tutor. Help the student learn. User: ${text}`
      );
      setChatMessages((prev) => [
        ...prev,
        { id: `local-${Date.now()}-ai`, role: 'assistant', content: reply },
      ]);
      speakText(reply);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Failed to get AI response.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleClaimCertificate = async (course: LearningModule) => {
    if (!user) return;

    const alreadyClaimed = certificates.some((certificate) => certificate.courseId === course.$id);
    if (alreadyClaimed) return;

    try {
      await databaseService.createDocument(
        COLLECTIONS.CERTIFICATES,
        {
          studentId: user.$id,
          studentName: profile?.fullName || user.name || user.email,
          courseId: course.$id,
          courseName: course.title,
          issueDate: new Date().toISOString(),
          certificateUrl: '',
        },
        [Permission.read(Role.users())]
      );
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim certificate.');
    }
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

                  {materials.length > 0 && (
                    <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900 p-6">
                      <h3 className="mb-4 text-lg font-bold">Course Materials</h3>
                      <div className="space-y-3">
                        {materials.map((material) => (
                          <div
                            key={material.$id}
                            className="flex items-center justify-between rounded-xl bg-slate-800/60 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium">{material.title}</p>
                              <p className="text-xs text-slate-400">{material.description}</p>
                            </div>
                            <a
                              href={storageService.getFileView(BUCKETS.COURSE_MATERIALS, material.fileId)}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg bg-brand-teal px-3 py-2 text-xs font-bold text-slate-950"
                            >
                              View / Download
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="space-y-6">
                  {submittingAssignment && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold">
                          Submit Work: {submittingAssignment.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setSubmittingAssignment(null);
                            setSubmissionContent('');
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <form onSubmit={handleSubmitWork} className="space-y-4">
                        <textarea
                          required
                          value={submissionContent}
                          onChange={(e) => setSubmissionContent(e.target.value)}
                          placeholder="Enter your submission text..."
                          className="min-h-[150px] w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                        />
                        <button
                          type="submit"
                          disabled={submitting || !submissionContent.trim()}
                          className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-3 text-sm font-bold text-slate-950 transition-opacity disabled:opacity-50"
                        >
                          {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Submit
                        </button>
                      </form>
                    </div>
                  )}

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
                            <th className="px-6 py-3 font-semibold">Status</th>
                            <th className="px-6 py-3 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {assignments.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                                No assignments found.
                              </td>
                            </tr>
                          ) : (
                            assignments.map((assignment) => {
                              const submission = getSubmission(assignment.$id);
                              return (
                                <tr key={assignment.$id} className="hover:bg-slate-800/40">
                                  <td className="px-6 py-4 font-medium">{assignment.title}</td>
                                  <td className="px-6 py-4 text-slate-400">
                                    {courses.find((course) => course.$id === assignment.courseId)?.title ||
                                      assignment.courseId}
                                  </td>
                                  <td className="px-6 py-4 text-slate-400">{assignment.dueDate}</td>
                                  <td className="px-6 py-4">
                                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                                      {submission ? submission.status : 'pending'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    {!submission && (
                                      <button
                                        type="button"
                                        onClick={() => setSubmittingAssignment(assignment)}
                                        className="rounded-lg bg-brand-teal px-3 py-2 text-xs font-bold text-slate-950"
                                      >
                                        Submit Work
                                      </button>
                                    )}
                                    {submission?.status === 'graded' && (
                                      <span className="text-xs text-brand-teal">
                                        Grade: {submission.grade}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tutor' && (
                <div className="flex h-[600px] flex-col rounded-2xl border border-slate-800 bg-slate-900">
                  <div className="border-b border-slate-800 px-6 py-4">
                    <h3 className="text-lg font-bold">AI Tutor</h3>
                    <p className="text-xs text-slate-400">
                      Ask questions about your courses and learning modules.
                    </p>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto p-6">
                    {chatMessages.length === 0 && !chatLoading && (
                      <div className="text-center text-slate-400">
                        Start a conversation with your AI tutor.
                      </div>
                    )}

                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                            message.role === 'user'
                              ? 'bg-brand-blue text-white'
                              : 'bg-slate-800 text-slate-100'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}

                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-100">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}

                    {chatError && (
                      <div className="flex items-center gap-2 text-sm text-red-300">
                        <AlertCircle className="h-4 w-4" />
                        {chatError}
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {voiceError && (
                    <div className="px-4 pt-3 text-xs text-red-300">{voiceError}</div>
                  )}
                  {isListening && (
                    <div className="px-4 pt-3 text-xs text-brand-teal">Listening...</div>
                  )}

                  <form
                    onSubmit={handleSendTutorMessage}
                    className="border-t border-slate-800 p-4"
                  >
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`inline-flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                          isListening
                            ? 'border-red-500/40 bg-red-500/10 text-red-300'
                            : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask your tutor a question..."
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal"
                      />
                      <button
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-3 text-sm font-bold text-slate-950 transition-opacity disabled:opacity-50"
                      >
                        {chatLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'certificates' && (
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {certificates.length === 0 ? (
                      <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                        No certificates claimed yet.
                      </div>
                    ) : (
                      certificates.map((certificate) => (
                        <div
                          key={certificate.$id}
                          className="rounded-2xl border border-brand-teal/30 bg-slate-900 p-6 text-center"
                        >
                          <Award className="mx-auto mb-4 h-10 w-10 text-brand-teal" />
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            AutoFix AI Certified
                          </p>
                          <h3 className="mt-3 text-xl font-bold">{certificate.studentName}</h3>
                          <p className="mt-2 text-sm text-slate-300">{certificate.courseName}</p>
                          <p className="mt-4 text-xs text-slate-500">
                            Issued {new Date(certificate.issueDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <h3 className="mb-4 text-lg font-bold">Claim a Certificate</h3>
                    <div className="space-y-3">
                      {courses.map((course) => {
                        const claimed = certificates.some(
                          (certificate) => certificate.courseId === course.$id
                        );
                        return (
                          <div
                            key={course.$id}
                            className="flex items-center justify-between rounded-xl bg-slate-800/60 px-4 py-3"
                          >
                            <span className="text-sm font-medium">{course.title}</span>
                            <button
                              type="button"
                              disabled={claimed}
                              onClick={() => handleClaimCertificate(course)}
                              className="rounded-lg bg-brand-teal px-3 py-2 text-xs font-bold text-slate-950 transition-opacity disabled:opacity-50"
                            >
                              {claimed ? 'Claimed' : 'Claim Certificate'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
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

export default StudentDashboard;
