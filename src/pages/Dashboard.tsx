import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { vehiclesService } from '../services/database/vehicles';
import { diagnosticsService } from '../services/database/diagnostics';
import { serviceHistoryService } from '../services/database/serviceHistory';
import { learningService } from '../services/database/learning';
import { chatService } from '../services/database/chat';
import { generateChatReply } from '../services/ai/chat';
import { localizeServiceType } from '../lib/localizeContent';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { Loading } from '../components/ui/Loading';
import { Badge } from '../components/ui/Badge';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher';
import {
  LogOut,
  LayoutDashboard,
  BookOpen,
  Activity,
  Car,
  Settings as SettingsIcon,
  User as UserIcon,
  ChevronRight,
  Clock,
  Plus,
  Play,
  Wrench,
  Search as SearchIcon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Heart,
  Brain,
  MessageSquare,
  Send,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { VehicleProfile, DiagnosticSession, LearningProgress, ServiceRecord } from '../types';
import { useStorage } from '../hooks/useStorage';
import { calculateVehicleHealth, generateReminders, MaintenanceReminder } from '../lib/maintenanceIntel';

interface EcosystemEvent {
  id: string;
  type: 'LEARNING' | 'DIAGNOSTIC' | 'SERVICE';
  date: string;
  title: string;
  subtitle: string;
  link: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFilePreview, BUCKETS } = useStorage();

  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticSession[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [feed, setFeed] = useState<EcosystemEvent[]>([]);

  // --- AI Chat state ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [userVehicles, userDiagnostics, userServices] = await Promise.all([
          vehiclesService.listUserVehicles(user.$id),
          diagnosticsService.listUserSessions(user.$id),
          serviceHistoryService.listUserRecords(user.$id)
        ]);

        setVehicles(userVehicles);
        setDiagnostics(userDiagnostics);
        setServices(userServices);

        // Generate Insights for Active Vehicle
        if (userVehicles.length > 0) {
          const active = userVehicles[0];
          const activeServices = userServices.filter(s => s.vehicleId === active.$id);
          const activeDiagnostics = userDiagnostics.filter(d => d.vehicleId === active.$id);
          setReminders(generateReminders(active, activeServices, activeDiagnostics));
        }

        // Build Unified Feed
        const events: EcosystemEvent[] = [
          ...userDiagnostics.slice(0, 3).map(d => ({
            id: d.$id,
            type: 'DIAGNOSTIC' as const,
            date: d.$createdAt,
            title: d.userInput,
            subtitle: t('diagnostics_result.match', { value: Math.round(d.result.confidence * 100) }),
            link: '/diagnostics/history'
          })),
          ...userServices.slice(0, 3).map(s => ({
            id: s.$id,
            type: 'SERVICE' as const,
            date: s.date,
            title: localizeServiceType(s.serviceType, t),
            subtitle: s.description || '',
            link: `/vehicles/${s.vehicleId}`
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setFeed(events);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, t]);

  // Load the user's saved chat history on mount.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const history = await chatService.listUserChats(user.$id);
        if (cancelled) return;
        // History comes newest-first; render oldest-first, one pair per record.
        const mapped: ChatMessage[] = history
          .slice()
          .reverse()
          .flatMap((record) => [
            { id: `${record.$id}-user`, role: 'user' as const, content: record.userMessage },
            { id: `${record.$id}-ai`, role: 'assistant' as const, content: record.aiResponse },
          ]);
        setChatMessages(mapped);
      } catch (error) {
        console.warn('Could not load chat history:', error);
        setChatError(t('dashboard.could_not_load_history'));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Keep the newest message in view.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chatMessages, chatLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || chatLoading || !user) return;

    setChatInput('');
    setChatError(null);
    setChatLoading(true);
    setChatMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}-user`, role: 'user', content: text },
    ]);

    try {
      const reply = await generateChatReply(text);
      setChatMessages((prev) => [
        ...prev,
        { id: `local-${Date.now()}-ai`, role: 'assistant', content: reply },
      ]);

      // Persist the exchange against the current user.
      await chatService.saveExchange({
        userId: user.$id,
        userMessage: text,
        aiResponse: reply,
      });
    } catch (error: any) {
      setChatError(error?.message || t('dashboard.failed_send'));
    } finally {
      setChatLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) return <Loading message={t('dashboard.syncing')} />;

  const activeVehicle = vehicles.length > 0 ? vehicles[0] : null;
  const health = activeVehicle ? calculateVehicleHealth(activeVehicle, services, diagnostics) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-navy text-white hidden lg:flex flex-col border-r border-white/5">
        <div className="p-6">
          <Logo className="brightness-0 invert" />
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {[
            { icon: LayoutDashboard, key: 'common.dashboard', active: true, href: '/dashboard' },
            { icon: BookOpen, key: 'nav.academy', active: false, href: '/learning' },
            { icon: Activity, key: 'nav.diagnostics', active: false, href: '/diagnostics' },
            { icon: Car, key: 'nav.my_garage', active: false, href: '/vehicles' },
            { icon: Wrench, key: 'nav.repairs', active: false, href: '/repairs' },
            { icon: SettingsIcon, key: 'nav.settings', active: false, href: '/settings' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => item.href !== '#' && navigate(item.href)}
              className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors ${
                item.active ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium text-sm">{t(item.key)}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">{t('common.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
             <h1 className="text-xl font-bold text-brand-navy lg:hidden flex items-center gap-2">
                <Logo className="h-6" />
             </h1>
             <div className="hidden lg:flex items-center gap-2 text-slate-400">
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">{t('dashboard.command_center')}</span>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <LanguageSwitcher tone="light" />
             <button onClick={() => navigate('/search')} className="p-2 text-slate-400 hover:text-brand-blue transition-colors">
                <SearchIcon className="w-5 h-5" />
             </button>
             <div className="w-px h-6 bg-slate-100"></div>
             <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900">{profile?.fullName || user?.email}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{profile?.role || t('common.user')}</div>
             </div>
             <div
                className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => navigate('/settings')}
             >
                {profile?.avatarFileId ? (
                  <img src={getFilePreview(BUCKETS.AVATARS, profile.avatarFileId)} alt={t('common.avatar')} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="h-6 w-6 text-slate-400" />
                )}
             </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Top Bar: Welcome & Quick Actions */}
            <div className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
               <div>
                  <h3 className="text-3xl font-extrabold text-brand-navy">
                     {t('dashboard.welcome_back', {
                       name: profile?.fullName?.split(' ')[0] || t('dashboard.technician'),
                     })}
                  </h3>
                  <p className="text-slate-600 mt-1">{t('dashboard.intelligence_status')} <span className="text-green-500 font-bold uppercase text-xs tracking-tighter">{t('dashboard.optimal')}</span></p>
               </div>
               <div className="flex flex-wrap gap-3">
                  <Button size="sm" variant="outline" className="gap-2 bg-white" onClick={() => navigate('/learning')}>
                     <BookOpen className="w-4 h-4" /> {t('dashboard.academy')}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 bg-white" onClick={() => navigate('/repairs')}>
                     <Wrench className="w-4 h-4" /> {t('dashboard.library')}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 bg-white" onClick={() => navigate('/vehicles')}>
                     <Car className="w-4 h-4" /> {t('dashboard.garage')}
                  </Button>
                  <Button size="sm" className="gap-2 shadow-lg shadow-brand-blue/20" onClick={() => navigate('/diagnostics')}>
                     <Activity className="w-4 h-4" /> {t('dashboard.new_diagnostic')}
                  </Button>
               </div>
            </div>

            {/* AI Assistant Chat */}
            <div className="mb-8 bg-white rounded-[32px] border shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-teal/10 rounded-xl text-brand-teal">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{t('dashboard.ai_assistant')}</h4>
                    <p className="text-xs text-slate-500">{t('dashboard.ai_assistant_subtitle')}</p>
                  </div>
                </div>
                <Badge variant="outline" className="uppercase text-[10px] hidden sm:inline-flex">{t('dashboard.chat')}</Badge>
              </div>

              <div className="max-h-80 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 && !chatLoading && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    {t('dashboard.no_conversations')}
                  </div>
                )}

                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                        message.role === 'user'
                          ? 'bg-brand-blue text-white rounded-br-sm'
                          : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 text-slate-500 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> {t('common.thinking')}
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {chatError && (
                <div className="px-6 pb-2 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {chatError}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="p-4 border-t bg-slate-50/50 flex items-center gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t('dashboard.chat_placeholder')}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all bg-white text-sm"
                />
                <Button
                  type="submit"
                  className="gap-2 shadow-lg shadow-brand-blue/20"
                  disabled={chatLoading || !chatInput.trim()}
                >
                  {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {t('common.send')}
                </Button>
              </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Main Column */}
               <div className="lg:col-span-2 space-y-8">

                  {/* Active Vehicle & Health Intelligence */}
                  <div className="bg-white rounded-[32px] border shadow-xl overflow-hidden">
                     <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
                              <Car className="w-6 h-6" />
                           </div>
                           <h4 className="font-bold text-slate-900">{t('dashboard.active_vehicle')}</h4>
                        </div>
                        {activeVehicle && (
                          <Badge variant="outline" className="border-brand-blue/20 text-brand-blue uppercase text-[10px]">{t('dashboard.primary_tracked')}</Badge>
                        )}
                     </div>
                     <div className="p-8">
                        {activeVehicle ? (
                           <div className="grid md:grid-cols-2 gap-12">
                              <div>
                                 <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden border shadow-sm shrink-0">
                                       {activeVehicle.imageFileId ? (
                                         <img src={getFilePreview(BUCKETS.VEHICLES, activeVehicle.imageFileId)} className="w-full h-full object-cover" alt={t('nav.vehicles')} />
                                       ) : (
                                         <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                            <Car className="w-8 h-8" />
                                         </div>
                                       )}
                                    </div>
                                    <div>
                                       <h5 className="text-2xl font-bold text-brand-navy">{activeVehicle.make} {activeVehicle.model}</h5>
                                       <p className="text-slate-500 font-medium">{activeVehicle.year} • {activeVehicle.engine}</p>
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                       <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('dashboard.mileage')}</div>
                                       <div className="font-bold text-brand-navy">
                                          {typeof activeVehicle.mileage === 'number'
                                            ? `${activeVehicle.mileage.toLocaleString()} KM`
                                            : '—'}
                                       </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                       <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('dashboard.last_service')}</div>
                                       <div className="font-bold text-brand-navy">
                                          {services.length > 0 ? new Date(services[0].date).toLocaleDateString() : t('common.none')}
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="flex flex-col justify-center items-center text-center p-8 bg-brand-navy rounded-[24px] text-white shadow-2xl relative overflow-hidden">
                                 <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Heart className="w-20 h-20" />
                                 </div>
                                 <div className="relative z-10">
                                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{t('dashboard.maintenance_health')}</div>
                                    <div className={`text-6xl font-black mb-2 ${health?.status === 'optimal' ? 'text-brand-teal' : health?.status === 'fair' ? 'text-brand-bright' : 'text-red-400'}`}>
                                       {health?.score ? `${health.score}%` : '--'}
                                    </div>
                                    <div className="text-sm font-bold uppercase tracking-tighter text-white/60">
                                       {t('dashboard.status')} <span className="text-white">{health ? t(`dashboard.health_${health.status}`) : ''}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="text-center py-12">
                              <p className="text-slate-500">{t('dashboard.no_vehicles')}</p>
                              <Button onClick={() => navigate('/vehicles')} className="mt-4">{t('dashboard.register_first_vehicle')}</Button>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Ecosystem Feed */}
                  <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden">
                     <div className="p-8 border-b flex justify-between items-center">
                        <h4 className="font-bold text-slate-900">{t('dashboard.ecosystem_stream')}</h4>
                        <Button variant="ghost" size="sm" className="text-brand-blue" onClick={() => navigate('/diagnostics/history')}>{t('dashboard.full_history')}</Button>
                     </div>
                     <div className="divide-y divide-slate-50">
                        {feed.length > 0 ? feed.map((event) => (
                           <div key={event.id} className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(event.link)}>
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                 event.type === 'DIAGNOSTIC' ? 'bg-blue-50 text-brand-blue' : 'bg-teal-50 text-brand-teal'
                              }`}>
                                 {event.type === 'DIAGNOSTIC' ? <Brain className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                              </div>
                              <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{event.type}</span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                    <span className="text-[10px] font-bold text-slate-400">{new Date(event.date).toLocaleDateString()}</span>
                                 </div>
                                 <h5 className="font-bold text-slate-900">{event.title}</h5>
                                 <p className="text-xs text-slate-500">{event.subtitle}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-200" />
                           </div>
                        )) : (
                           <div className="p-12 text-center text-slate-400 text-sm">
                              {t('dashboard.ecosystem_empty')}
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Right Column: Advisor & Academy */}
               <div className="space-y-8">
                  {/* Maintenance Advisor */}
                  <div className="bg-white rounded-[32px] border shadow-lg p-8">
                     <h4 className="font-bold text-brand-navy mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" /> {t('dashboard.maintenance_advisor')}
                     </h4>
                     <div className="space-y-4">
                        {reminders.length > 0 ? reminders.map((reminder) => (
                           <div key={reminder.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <div className="flex items-center gap-2 mb-2">
                                 <div className={`w-2 h-2 rounded-full ${
                                    reminder.type === 'critical' ? 'bg-red-500 animate-pulse' :
                                    reminder.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                 }`}></div>
                                 <span className="text-xs font-bold text-slate-900">{reminder.title}</span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed mb-3">{reminder.message}</p>
                              <div className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                                 <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                 <span className="text-[10px] text-slate-400 font-medium italic">{reminder.reason}</span>
                              </div>
                           </div>
                        )) : (
                           <div className="flex flex-col items-center justify-center py-8 text-center bg-green-50 rounded-[24px] border border-green-100">
                              <CheckCircle2 className="w-10 h-10 text-green-500 mb-3" />
                              <span className="text-sm font-bold text-green-800">{t('dashboard.no_immediate_actions')}</span>
                              <p className="text-[10px] text-green-600 mt-1">{t('dashboard.synchronized')}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Academy Progress */}
                  <div className="bg-brand-blue rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                     <div className="relative z-10">
                        <h4 className="font-bold mb-6 flex items-center gap-2">
                           <BookOpen className="w-5 h-5 text-brand-teal" /> {t('dashboard.academy_status')}
                        </h4>
                        <div className="mb-8">
                           <div className="flex justify-between items-center text-xs font-bold mb-3 opacity-60 uppercase tracking-widest">
                              <span>{t('dashboard.module_completion')}</span>
                              <span>0%</span>
                           </div>
                           <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-teal w-0"></div>
                           </div>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed mb-8">
                           {t('dashboard.academy_cta')}
                        </p>
                        <Button className="w-full bg-white text-brand-blue hover:bg-white/90 gap-2 py-6 font-black uppercase text-xs tracking-widest" onClick={() => navigate('/learning')}>
                           {t('dashboard.enter_academy')} <Play className="w-3 h-3 fill-current" />
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
