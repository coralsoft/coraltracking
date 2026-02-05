import { useLanguage, LanguageProvider, type Language } from '@/contexts/language-context';
import { useAppearance } from '@/hooks/use-appearance';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function ThemeToggle() {
    const { updateAppearance } = useAppearance();
    const { t } = useLanguage();
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === 'undefined') return false;
        return document.documentElement.classList.contains('dark');
    });

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        const currentIsDark = document.documentElement.classList.contains('dark');
        updateAppearance(currentIsDark ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="mac-btn text-xs flex items-center gap-1.5"
            aria-label={isDark ? t('theme.ariaLight') : t('theme.ariaDark')}
        >
            {isDark ? (
                <>
                    <Sun className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('theme.light')}</span>
                </>
            ) : (
                <>
                    <Moon className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('theme.dark')}</span>
                </>
            )}
        </button>
    );
}

function LanguageSelector() {
    const { language, setLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const options: { code: Language; labelKey: string }[] = [
        { code: 'en', labelKey: 'lang.english' },
        { code: 'es', labelKey: 'lang.spanish' },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="mac-btn text-xs flex items-center gap-1.5"
                aria-label="Select language"
            >
                <span>{language === 'es' ? '🇪🇸' : '🇬🇧'}</span>
                <span className="hidden sm:inline">{language === 'es' ? t('lang.spanish') : t('lang.english')}</span>
                <span className="text-[10px]">▼</span>
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
                    <div className="absolute right-0 mt-2 w-40 mac-card p-2 z-50 space-y-1">
                        {options.map((opt) => (
                            <button
                                key={opt.code}
                                onClick={() => {
                                    setLanguage(opt.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                                    language === opt.code
                                        ? 'bg-gradient-to-r from-[#C8246B]/10 to-[#D83278]/10 text-[var(--mac-text)] font-semibold'
                                        : 'hover:bg-gray-50 dark:hover:bg-white/5 text-[var(--mac-muted)]'
                                }`}
                            >
                                <span>{opt.code === 'es' ? '🇪🇸' : '🇬🇧'}</span>
                                <span>{t(opt.labelKey)}</span>
                                {language === opt.code && <span className="ml-auto">✓</span>}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function LandingContent({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;
    const { t } = useLanguage();
    const [scrollY, setScrollY] = useState(0);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const checkDarkMode = () => setIsDark(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const platformItems = useMemo(
        () => [
            {
                key: 'web',
                titleKey: 'platform.web',
                platforms: ['Chrome', 'Safari', 'Edge'],
                descriptionKey: 'platform.webDesc',
                icons: (
                    <div className="flex items-center justify-center gap-3">
                        <img src="/images/windows.svg?v=2" alt="Windows" className="w-8 h-8" />
                        <img src="/images/macos.svg?v=2" alt="macOS" className="w-8 h-8" />
                    </div>
                ),
            },
            {
                key: 'android',
                titleKey: 'platform.android',
                platforms: ['Android'],
                descriptionKey: 'platform.androidDesc',
                icons: <img src="/images/android.svg?v=2" alt="Android" className="w-12 h-12 mx-auto" />,
            },
            {
                key: 'ios',
                titleKey: 'platform.ios',
                platforms: ['iOS', 'iPadOS'],
                descriptionKey: 'platform.iosDesc',
                icons: <img src="/images/ios.svg?v=2" alt="iOS" className="w-12 h-12 mx-auto" />,
            },
        ],
        [],
    );

    const pricingPlans = useMemo(
        () => [
            {
                id: 'basic',
                nameKey: 'pricing.basic',
                featureKeys: ['pricing.basic.f1', 'pricing.basic.f2', 'pricing.basic.f3'],
                price: '$150',
                popular: false,
            },
            {
                id: 'intermediate',
                nameKey: 'pricing.intermediate',
                featureKeys: ['pricing.intermediate.f1', 'pricing.intermediate.f2', 'pricing.intermediate.f3'],
                price: '$299',
                popular: true,
            },
            {
                id: 'advanced',
                nameKey: 'pricing.advanced',
                featureKeys: ['pricing.advanced.f1', 'pricing.advanced.f2'],
                price: '$450',
                popular: false,
            },
        ],
        [],
    );

    const productFeatures1 = useMemo(() => [t('product.feature1'), t('product.feature2'), t('product.feature3')], [t]);
    const productFeatures2 = useMemo(
        () => [t('product.historical1'), t('product.historical2'), t('product.historical3')],
        [t],
    );

    return (
        <>
            <Head title={t('meta.title')}>
                <meta name="description" content={t('meta.description')} />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-[#f9f9fb] via-[#ffffff] to-[#f2f2f7] dark:from-[#1a1a1a] dark:via-[#2d2d2d] dark:to-[#1f1f1f]">
                <header
                    className="fixed top-0 left-0 right-0 z-50 px-4 pt-6 transition-all duration-300"
                    style={{
                        background:
                            scrollY > 50 ? (isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)') : 'transparent',
                        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
                        borderBottom:
                            scrollY > 50
                                ? isDark
                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                    : '1px solid rgba(0, 0, 0, 0.06)'
                                : 'none',
                    }}
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D83278] to-[#C8246B] flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-sm">C</span>
                                    </div>
                                    <span className="text-xl font-bold text-[var(--mac-text)]">CoralTracking</span>
                                </div>
                                <nav className="hidden lg:flex gap-1">
                                    <a href="#product" className="mac-btn text-xs">
                                        {t('nav.product')}
                                    </a>
                                    <a href="#platform" className="mac-btn text-xs">
                                        {t('nav.platforms')}
                                    </a>
                                    <a href="#pricing" className="mac-btn text-xs">
                                        {t('nav.pricing')}
                                    </a>
                                </nav>
                            </div>

                            <div className="flex items-center gap-2">
                                <ThemeToggle />
                                <LanguageSelector />
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="mac-btn primary">
                                        <span>{t('nav.dashboard')}</span>
                                        <span className="text-xs">→</span>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route('login')} className="mac-btn hidden sm:flex">
                                            {t('nav.login')}
                                        </Link>
                                        {canRegister && (
                                            <Link href={route('register')} className="mac-btn primary">
                                                {t('nav.signup')}
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <section className="relative px-4 pt-24 pb-12 md:pt-28 md:pb-16 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />

                    <div className="max-w-6xl mx-auto relative">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div className="space-y-5">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-[var(--mac-border)] rounded-full shadow-sm">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-xs text-[var(--mac-muted)]">{t('hero.badge')}</span>
                                </div>

                                <h1 className="text-3xl md:text-5xl font-bold text-[var(--mac-text)] leading-tight">
                                    {t('hero.title1')}
                                    <br />
                                    <span className="bg-gradient-to-r from-[#D83278] via-[#C8246B] to-[#D83278] bg-clip-text text-transparent">
                                        {t('hero.title2')}
                                    </span>
                                </h1>

                                <p className="text-base text-[var(--mac-muted)] leading-relaxed max-w-xl">
                                    {t('hero.description')}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    {auth.user ? (
                                        <Link href={route('dashboard')} className="mac-btn primary text-sm px-6 py-3 text-center">
                                            {t('hero.cta.dashboard')} <span className="text-base">→</span>
                                        </Link>
                                    ) : (
                                        <Link href={route('register')} className="mac-btn primary text-sm px-6 py-3 text-center">
                                            {t('hero.cta.start')} <span className="text-base">→</span>
                                        </Link>
                                    )}
                                    <a href="#product" className="mac-btn text-sm px-6 py-3 text-center">
                                        {t('hero.cta.features')}
                                    </a>
                                </div>

                                <div className="flex items-center gap-6 pt-3">
                                    <div>
                                        <div className="text-2xl font-bold text-[var(--mac-text)]">99.9%</div>
                                        <div className="text-xs text-[var(--mac-muted)]">{t('hero.uptime')}</div>
                                    </div>
                                    <div className="w-px h-8 bg-[var(--mac-border)]" />
                                    <div>
                                        <div className="text-2xl font-bold text-[var(--mac-text)]">24/7</div>
                                        <div className="text-xs text-[var(--mac-muted)]">{t('hero.monitoring')}</div>
                                    </div>
                                    <div className="w-px h-8 bg-[var(--mac-border)]" />
                                    <div>
                                        <div className="text-2xl font-bold text-[var(--mac-text)]">{t('hero.fleetReady')}</div>
                                        <div className="text-xs text-[var(--mac-muted)]">{t('hero.unitsGroups')}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="relative z-10">
                                    <div className="mac-card p-3 transform hover:scale-105 transition-transform duration-300">
                                        <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg aspect-[4/3] flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-white/50 dark:bg-black/30" />
                                            <div className="relative z-10 text-center p-4">
                                                <div className="text-4xl mb-2">🗺️</div>
                                                <div className="text-lg font-bold text-[var(--mac-text)] mb-1">{t('hero.liveMap')}</div>
                                                <div className="text-xs text-[var(--mac-muted)]">{t('hero.unitsStatus')}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute -bottom-6 -left-6 w-32 mac-card p-1.5 transform hover:scale-105 transition-transform duration-300">
                                        <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg aspect-[9/16] flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-white/50 dark:bg-black/30" />
                                            <div className="relative z-10 text-center p-2">
                                                <div className="text-2xl mb-1">📱</div>
                                                <div className="text-[10px] font-semibold text-[var(--mac-text)]">{t('hero.mobileReady')}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute -top-3 -right-3 mac-card p-2">
                                        <div className="text-2xl">⚡</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="platform" className="px-4 py-12 bg-white/40 dark:bg-black/20">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-[var(--mac-border)] rounded-full shadow-sm mb-4">
                                <span className="text-xs font-medium text-[var(--mac-text)]">{t('platform.badge')}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[var(--mac-text)]">{t('platform.title')}</h2>
                            <p className="text-base text-[var(--mac-muted)] max-w-2xl mx-auto">{t('platform.subtitle')}</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-10">
                            {platformItems.map((item) => (
                                <div key={item.key} className="mac-card group cursor-pointer">
                                    <div className="mb-3 transform group-hover:scale-110 transition-transform">{item.icons}</div>
                                    <h3 className="text-lg font-bold mb-2 text-[var(--mac-text)]">{t(item.titleKey)}</h3>
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {item.platforms.map((platform) => (
                                            <span
                                                key={platform}
                                                className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-[#C8246B]/10 to-[#D83278]/10 text-[var(--mac-text)] font-medium border border-[#C8246B]/20"
                                            >
                                                {platform}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-[var(--mac-muted)] mb-3">{t(item.descriptionKey)}</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-[var(--mac-border)]">
                                        <span className="text-xs text-[var(--mac-muted)]">{t('platform.availableNow')}</span>
                                        <div className="w-10 h-1 bg-gradient-to-r from-[#D83278] to-[#C8246B] rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="product" className="px-4 py-12">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[var(--mac-text)]">{t('product.title')}</h2>
                            <p className="text-base text-[var(--mac-muted)] max-w-2xl mx-auto">{t('product.subtitle')}</p>
                        </div>

                        <div className="space-y-12">
                            <div className="grid lg:grid-cols-2 gap-6 items-center">
                                <div className="order-2 lg:order-1 space-y-4">
                                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-500/10 dark:bg-blue-500/20 rounded-full">
                                        <span className="text-lg">🛰️</span>
                                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">{t('product.realtimeBadge')}</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-[var(--mac-text)]">{t('product.realtimeTitle')}</h3>
                                    <p className="text-sm text-[var(--mac-muted)] leading-relaxed">{t('product.realtimeDesc')}</p>
                                    <ul className="space-y-2">
                                        {productFeatures1.map((text) => (
                                            <li key={text} className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-green-500/20 dark:bg-green-500/30 flex items-center justify-center">
                                                    <span className="text-green-700 dark:text-green-400 text-xs">✓</span>
                                                </div>
                                                <span className="text-sm text-[var(--mac-text)]">{text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="order-1 lg:order-2">
                                    <div className="mac-card p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                                        <div className="aspect-video rounded-lg bg-white/60 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">📡</div>
                                                <div className="text-lg font-bold text-[var(--mac-text)]">{t('product.liveMonitoring')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-6 items-center">
                                <div className="mac-card p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                                    <div className="aspect-video rounded-lg bg-white/60 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">🧭</div>
                                            <div className="text-lg font-bold text-[var(--mac-text)]">{t('product.replayTitle')}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-purple-500/10 dark:bg-purple-500/20 rounded-full">
                                        <span className="text-lg">⏱️</span>
                                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">{t('product.historicalBadge')}</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-[var(--mac-text)]">{t('product.historicalTitle')}</h3>
                                    <p className="text-sm text-[var(--mac-muted)] leading-relaxed">{t('product.historicalDesc')}</p>
                                    <ul className="space-y-2">
                                        {productFeatures2.map((text) => (
                                            <li key={text} className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-purple-500/20 dark:bg-purple-500/30 flex items-center justify-center">
                                                    <span className="text-purple-700 dark:text-purple-400 text-xs">✓</span>
                                                </div>
                                                <span className="text-sm text-[var(--mac-text)]">{text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section - Same design as CoralPOS */}
                <section id="pricing" className="px-4 py-8 bg-gradient-to-b from-white/40 dark:from-black/20 to-transparent">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-[var(--mac-border)] rounded-full shadow-sm mb-3">
                                <span className="text-[10px] font-medium text-[var(--mac-text)]">{t('pricing.badge')}</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold mb-2 text-[var(--mac-text)]">
                                {t('pricing.title')}
                            </h2>
                            <p className="text-sm text-[var(--mac-muted)] max-w-2xl mx-auto mb-4">
                                {t('pricing.subtitle')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
                            {pricingPlans.map((plan, index) => (
                                <div
                                    key={plan.id}
                                    className={`mac-card relative overflow-hidden flex flex-col ${
                                        plan.popular ? 'ring-1 ring-orange-500 shadow-xl' : ''
                                    }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#D83278] to-[#C8246B] px-3 py-1 text-center">
                                            <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                                                {t('pricing.mostPopular')}
                                            </span>
                                        </div>
                                    )}

                                    <div className={`${plan.popular ? 'pt-6' : 'pt-3'} pb-3 flex flex-col flex-1`}>
                                        <div className="text-center mb-4">
                                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 mb-2">
                                                <span className="text-xl">
                                                    {index === 0 ? '🌱' : index === 1 ? '🚀' : '👑'}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold mb-1 text-[var(--mac-text)]">
                                                {t(plan.nameKey)}
                                            </h3>
                                            <p className="text-[10px] text-[var(--mac-muted)] mb-3">
                                                {t('pricing.priceMxn')}
                                            </p>
                                            <div className="mb-0.5">
                                                <span className="text-2xl font-bold bg-gradient-to-r from-[#D83278] to-[#C8246B] bg-clip-text text-transparent">
                                                    {plan.price}
                                                </span>
                                                <span className="text-xs text-[var(--mac-muted)] ml-1">
                                                    {t('pricing.perMonth')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 mb-4 flex-1">
                                            {plan.featureKeys.map((featureKey) => (
                                                <div key={featureKey} className="flex items-start gap-1.5">
                                                    <div className="flex-shrink-0 w-3.5 h-3.5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                                                        <svg className="w-2 h-2 text-green-600 dark:text-green-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-[10px] text-[var(--mac-text)] leading-relaxed">
                                                        {t(featureKey)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-auto">
                                            {auth.user ? (
                                                <Link
                                                    href={route('dashboard')}
                                                    className={`mac-btn w-full justify-center text-center text-xs ${
                                                        plan.popular ? 'primary !bg-gradient-to-r !from-[#D83278] !to-[#C8246B] !text-white !font-semibold' : ''
                                                    }`}
                                                >
                                                    {t('pricing.choosePlan')}
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={route('register')}
                                                    className={`mac-btn w-full justify-center text-center text-xs ${
                                                        plan.popular ? 'primary !bg-gradient-to-r !from-[#D83278] !to-[#C8246B] !text-white !font-semibold' : ''
                                                    }`}
                                                >
                                                    {plan.popular ? t('pricing.startNow') : t('pricing.choosePlan')}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <footer className="px-4 py-8 bg-white/40 dark:bg-black/20 backdrop-blur-xl border-t border-[var(--mac-border)]">
                    <div className="max-w-6xl mx-auto">
                        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
                            <p className="text-xs text-[var(--mac-muted)]">
                                © {new Date().getFullYear()} CoralTracking. {t('footer.copyright')}
                            </p>
                            <div className="flex gap-4 text-xs text-[var(--mac-muted)]">
                                <a href="#product" className="hover:text-[var(--mac-text)]">
                                    {t('footer.product')}
                                </a>
                                <a href="#platform" className="hover:text-[var(--mac-text)]">
                                    {t('footer.platforms')}
                                </a>
                                <a href="#pricing" className="hover:text-[var(--mac-text)]">
                                    {t('footer.pricing')}
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default function Landing(props: { canRegister?: boolean }) {
    return (
        <LanguageProvider>
            <LandingContent {...props} />
        </LanguageProvider>
    );
}
