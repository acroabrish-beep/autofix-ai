import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Menu, X, User, Search, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStorage } from '../../hooks/useStorage';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { key: 'nav.home', href: '#home' },
  { key: 'nav.features', href: '#features' },
  { key: 'nav.modules', href: '#modules' },
  { key: 'nav.about', href: '#about' },
  { key: 'nav.contact', href: '#contact' },
] as const;

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState<string>('#home');

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, isAuthenticated } = useAuth();
  const { getFilePreview, BUCKETS } = useStorage();

  /* Elevate the bar once the user leaves the top of the page. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Scroll-spy: highlight the section currently in view. */
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHref(`#${entry.target.id}`);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /* Lock body scroll while the mobile sheet is open. */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAnchorClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      event.preventDefault();
      setIsOpen(false);

      const target = document.getElementById(href.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      setActiveHref(href);
    },
    []
  );

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav
        className={cn(
          'w-full border-b transition-all duration-300',
          scrolled
            ? 'border-white/10 bg-ink/95 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.75)] backdrop-blur-xl'
            : 'border-white/[0.06] bg-ink'
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex shrink-0 items-center rounded-lg outline-none ring-brand-teal/60 transition-opacity hover:opacity-90 focus-visible:ring-2"
              aria-label={t('common.home_aria')}
            >
              <Logo tone="dark" />
            </Link>

            {/* Desktop navigation */}
            <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 lg:flex">
              {NAV_LINKS.map((link) => {
                const isActive = activeHref === link.href;
                return (
                  <a
                    key={link.key}
                    href={link.href}
                    onClick={(event) => handleAnchorClick(event, link.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 xl:px-4',
                      isActive
                        ? 'text-white'
                        : 'text-slate-300/80 hover:text-white'
                    )}
                  >
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-inset ring-brand-teal/30" />
                    )}
                    <span className="relative">{t(link.key)}</span>
                  </a>
                );
              })}
            </div>

            {/* Desktop actions */}
            <div className="hidden items-center gap-2 lg:flex xl:gap-3">
              <LanguageSwitcher className="mr-1" />

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/search')}
                    aria-label={t('common.search')}
                    className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    aria-label={t('nav.profile')}
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 transition-colors hover:border-brand-teal/50"
                  >
                    {profile?.avatarFileId ? (
                      <img
                        src={getFilePreview(BUCKETS.AVATARS, profile.avatarFileId)}
                        alt={t('common.avatar')}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-slate-300" />
                    )}
                  </button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="rounded-full bg-brand-teal font-semibold text-ink hover:bg-brand-teal/90"
                  >
                    {t('common.dashboard')}
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
                  >
                    {t('common.login')}
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => navigate('/register')}
                    aria-label={t('common.get_started')}
                    className="group h-10 rounded-full bg-brand-teal px-4 font-semibold text-ink shadow-glow transition-all hover:bg-brand-teal/90 hover:shadow-glow-lg xl:px-5"
                  >
                    <span className="hidden xl:inline">{t('common.get_started')}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 xl:ml-1.5" />
                  </Button>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? t('common.close_menu') : t('common.open_menu')}
              aria-expanded={isOpen}
              className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sheet */}
      <div
        className={cn(
          'fixed inset-x-0 top-16 z-40 origin-top border-b border-white/10 bg-ink/95 px-4 pb-6 pt-4 backdrop-blur-xl transition-all duration-300 lg:hidden',
          isOpen
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-3 opacity-0'
        )}
      >
        <div className="space-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              onClick={(event) => handleAnchorClick(event, link.href)}
              className={cn(
                'block rounded-xl px-4 py-3 text-base font-medium transition-colors',
                activeHref === link.href
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              )}
            >
              {t(link.key)}
            </a>
          ))}
        </div>

        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <LanguageSwitcher fullWidth />

          {isAuthenticated ? (
            <Button
              onClick={() => {
                setIsOpen(false);
                navigate('/dashboard');
              }}
              className="h-12 w-full rounded-xl bg-brand-teal font-semibold text-ink hover:bg-brand-teal/90"
            >
              {t('nav.go_to_dashboard')}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/register');
                }}
                className="h-12 w-full rounded-xl bg-brand-teal font-semibold text-ink hover:bg-brand-teal/90"
              >
                {t('common.get_started')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/login');
                }}
                className="h-12 w-full rounded-xl border-white/20 bg-white/5 font-semibold text-white hover:bg-white/10 hover:text-white"
              >
                {t('common.login')}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
