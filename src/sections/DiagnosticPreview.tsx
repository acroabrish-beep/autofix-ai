import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Send, User, Bot, Wrench, Info } from 'lucide-react';

export const DiagnosticPreview = () => {
  const { t } = useTranslation();

  return (
    <section id="diagnostics" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-brand-navy mb-4">
            {t('extras.diag_preview_title')}
          </h2>
          <p className="text-slate-600">{t('extras.diag_preview_subtitle')}</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border overflow-hidden">
          {/* Header */}
          <div className="bg-brand-blue p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <Bot className="text-white h-6 w-6" />
              </div>
              <div>
                <h3 className="text-white font-bold leading-none">{t('extras.diag_assistant')}</h3>
                <span className="text-white/60 text-xs flex items-center mt-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  {t('extras.diag_online')}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                {t('extras.diag_view_history')}
            </Button>
          </div>

          {/* Chat Interface */}
          <div className="p-8 flex flex-col gap-6 max-h-[500px] overflow-y-auto bg-slate-50/50">
            {/* User Message */}
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <User className="text-slate-500 h-5 w-5" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border">
                <p className="text-slate-800">{t('extras.diag_user_message')}</p>
              </div>
            </div>

            {/* AI Response */}
            <div className="flex gap-4 self-end flex-row-reverse max-w-[90%]">
              <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center shrink-0">
                <Bot className="text-white h-5 w-5" />
              </div>
              <div className="bg-brand-navy text-white p-5 rounded-2xl rounded-tr-none shadow-lg border border-brand-teal/30">
                <div className="mb-4 text-sm opacity-90">{t('extras.diag_response_intro')}</div>

                <div className="space-y-4 mb-6">
                   <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 text-xs font-bold border border-red-500/30">1</div>
                      <div>
                        <div className="font-semibold text-brand-teal">{t('extras.diag_cause1_title')}</div>
                        <div className="text-xs opacity-70">{t('extras.diag_cause1_desc')}</div>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 text-xs font-bold border border-red-500/30">2</div>
                      <div>
                        <div className="font-semibold text-brand-teal">{t('extras.diag_cause2_title')}</div>
                        <div className="text-xs opacity-70">{t('extras.diag_cause2_desc')}</div>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 text-xs font-bold border border-red-500/30">3</div>
                      <div>
                        <div className="font-semibold text-brand-teal">{t('extras.diag_cause3_title')}</div>
                        <div className="text-xs opacity-70">{t('extras.diag_cause3_desc')}</div>
                      </div>
                   </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-brand-teal text-sm font-bold">
                        <Wrench className="h-4 w-4" /> {t('extras.diag_first_check')}
                    </div>
                    <p className="text-sm">{t('extras.diag_first_check_text')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Input */}
          <div className="p-6 border-t bg-white">
            <div className="relative">
              <input
                type="text"
                placeholder={t('extras.diag_placeholder')}
                className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-brand-teal transition-all outline-none text-slate-700"
                readOnly
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center hover:bg-brand-blue/90 transition-colors shadow-lg">
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center text-[10px] text-slate-400">
                    <Info className="h-3 w-3 mr-1" /> {t('extras.diag_demo_note')}
                </div>
                <Button variant="secondary" size="sm">{t('extras.diag_try')}</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
