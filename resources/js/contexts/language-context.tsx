import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Language = 'en' | 'es';

const STORAGE_KEY = 'coraltracking_lang';

const translations: Record<Language, Record<string, string>> = {
    en: {
        'nav.product': 'Product',
        'nav.platforms': 'Platforms',
        'nav.pricing': 'Pricing',
        'nav.dashboard': 'Dashboard',
        'nav.login': 'Log in',
        'nav.signup': 'Sign up',
        'theme.light': 'Light',
        'theme.dark': 'Dark',
        'theme.ariaLight': 'Switch to light mode',
        'theme.ariaDark': 'Switch to dark mode',
        'hero.badge': 'Live tracking & alerts',
        'hero.title1': 'Real-time GPS tracking',
        'hero.title2': 'for fleets and units',
        'hero.description': 'Monitor trucks, cars, and fleets in one place. Replay historical routes, manage geofences, and generate operational reports.',
        'hero.cta.dashboard': 'Open dashboard',
        'hero.cta.start': 'Get started',
        'hero.cta.features': 'See features',
        'hero.uptime': 'Uptime',
        'hero.monitoring': 'Monitoring',
        'hero.fleetReady': 'Fleet-ready',
        'hero.unitsGroups': 'Units & groups',
        'hero.liveMap': 'Live Map',
        'hero.unitsStatus': 'Units, status, and alerts',
        'hero.mobileReady': 'Mobile ready',
        'platform.badge': 'Platforms',
        'platform.title': 'Track from any device',
        'platform.subtitle': 'A unified experience for operators, supervisors, and drivers.',
        'platform.web': 'Web Console',
        'platform.android': 'Android App',
        'platform.ios': 'iOS App',
        'platform.webDesc': 'Operations center for fleets, alerts, geofences, and reporting.',
        'platform.androidDesc': 'Driver and supervisor app for live status, navigation, and events.',
        'platform.iosDesc': 'Mobile-friendly monitoring with quick actions and alerts.',
        'platform.availableNow': 'Available now',
        'product.title': 'Built for fleet operations',
        'product.subtitle': 'Real-time visibility, historical insights, and operational control in one place.',
        'product.realtimeBadge': 'Real-time',
        'product.realtimeTitle': 'Live map, status, and alerts',
        'product.realtimeDesc': 'See moving/stopped/offline states, last update, speed, and events. Keep operations informed with alerts and geofences.',
        'product.feature1': 'Unit status & health',
        'product.feature2': 'Geofences & event alerts',
        'product.feature3': 'Quick search and filters',
        'product.liveMonitoring': 'Live Monitoring',
        'product.historicalBadge': 'Historical',
        'product.historicalTitle': 'Playback, stops, and reports',
        'product.historicalDesc': 'Review past routes by date range, analyze stops and idle time, and export reports for audits and operations.',
        'product.replayTitle': 'Route Replay',
        'product.historical1': 'Route replay by date range',
        'product.historical2': 'Stops & idle analysis',
        'product.historical3': 'Export-ready reports',
        'pricing.badge': 'Pricing',
        'pricing.title': 'Plans',
        'pricing.subtitle': 'Approximate price in MXN. Scale with your fleet.',
        'pricing.serviceLevel': 'Service level',
        'pricing.keyFeatures': 'Key features',
        'pricing.priceMxn': 'Approx. price in MXN',
        'pricing.mostPopular': 'Most popular',
        'pricing.perMonth': '/ month',
        'pricing.basic': 'Basic',
        'pricing.basic.f1': 'Real-time GPS',
        'pricing.basic.f2': 'History',
        'pricing.basic.f3': 'Alerts',
        'pricing.intermediate': 'Intermediate',
        'pricing.intermediate.f1': 'Geofences',
        'pricing.intermediate.f2': 'Reports',
        'pricing.intermediate.f3': 'Platform',
        'pricing.advanced': 'Advanced',
        'pricing.advanced.f1': 'Support',
        'pricing.advanced.f2': 'Extra features',
        'pricing.choosePlan': 'Choose plan',
        'pricing.startNow': 'Start now',
        'footer.copyright': 'All rights reserved.',
        'footer.product': 'Product',
        'footer.platforms': 'Platforms',
        'footer.pricing': 'Pricing',
        'meta.title': 'CoralTracking - GPS Fleet Tracking',
        'meta.description': 'Real-time GPS fleet tracking with historical routes, geofences, alerts, and reports.',
        'lang.english': 'English',
        'lang.spanish': 'Español',
    },
    es: {
        'nav.product': 'Producto',
        'nav.platforms': 'Plataformas',
        'nav.pricing': 'Precios',
        'nav.dashboard': 'Panel',
        'nav.login': 'Iniciar sesión',
        'nav.signup': 'Registrarse',
        'theme.light': 'Claro',
        'theme.dark': 'Oscuro',
        'theme.ariaLight': 'Cambiar a modo claro',
        'theme.ariaDark': 'Cambiar a modo oscuro',
        'hero.badge': 'Seguimiento y alertas en vivo',
        'hero.title1': 'Rastreo GPS en tiempo real',
        'hero.title2': 'para flotillas y unidades',
        'hero.description': 'Monitorea camiones, carros y flotillas en un solo lugar. Reproduce rutas históricas, gestiona geocercas y genera reportes operativos.',
        'hero.cta.dashboard': 'Abrir panel',
        'hero.cta.start': 'Comenzar',
        'hero.cta.features': 'Ver funciones',
        'hero.uptime': 'Disponibilidad',
        'hero.monitoring': 'Monitoreo',
        'hero.fleetReady': 'Listo para flotas',
        'hero.unitsGroups': 'Unidades y grupos',
        'hero.liveMap': 'Mapa en vivo',
        'hero.unitsStatus': 'Unidades, estado y alertas',
        'hero.mobileReady': 'Listo para móvil',
        'platform.badge': 'Plataformas',
        'platform.title': 'Rastrea desde cualquier dispositivo',
        'platform.subtitle': 'Una experiencia unificada para operadores, supervisores y conductores.',
        'platform.web': 'Consola web',
        'platform.android': 'App Android',
        'platform.ios': 'App iOS',
        'platform.webDesc': 'Centro de operaciones para flotas, alertas, geocercas e informes.',
        'platform.androidDesc': 'App para conductores y supervisores: estado en vivo, navegación y eventos.',
        'platform.iosDesc': 'Monitoreo móvil con acciones rápidas y alertas.',
        'platform.availableNow': 'Disponible ahora',
        'product.title': 'Hecho para operaciones de flota',
        'product.subtitle': 'Visibilidad en tiempo real, historiales e control operativo en un solo lugar.',
        'product.realtimeBadge': 'Tiempo real',
        'product.realtimeTitle': 'Mapa en vivo, estado y alertas',
        'product.realtimeDesc': 'Ve estados en movimiento/detenido/sin señal, última actualización, velocidad y eventos. Mantén a operaciones informadas con alertas y geocercas.',
        'product.feature1': 'Estado y salud de unidades',
        'product.feature2': 'Geocercas y alertas de eventos',
        'product.feature3': 'Búsqueda y filtros rápidos',
        'product.liveMonitoring': 'Monitoreo en vivo',
        'product.historicalBadge': 'Histórico',
        'product.historicalTitle': 'Reproducción, paradas e informes',
        'product.historicalDesc': 'Revisa rutas pasadas por rango de fechas, analiza paradas y tiempo inactivo, y exporta reportes para auditorías y operaciones.',
        'product.replayTitle': 'Reproducción de rutas',
        'product.historical1': 'Reproducción por rango de fechas',
        'product.historical2': 'Análisis de paradas e inactividad',
        'product.historical3': 'Reportes listos para exportar',
        'pricing.badge': 'Precios',
        'pricing.title': 'Planes',
        'pricing.subtitle': 'Precio aproximado en MXN. Escala con tu flota.',
        'pricing.serviceLevel': 'Nivel de servicio',
        'pricing.keyFeatures': 'Funciones clave',
        'pricing.priceMxn': 'Precio aproximado en MXN',
        'pricing.mostPopular': 'Más popular',
        'pricing.perMonth': '/ mes',
        'pricing.basic': 'Básico',
        'pricing.basic.f1': 'GPS tiempo real',
        'pricing.basic.f2': 'Historial',
        'pricing.basic.f3': 'Alertas',
        'pricing.intermediate': 'Intermedio',
        'pricing.intermediate.f1': 'Geocercas',
        'pricing.intermediate.f2': 'Reporte',
        'pricing.intermediate.f3': 'Plataforma',
        'pricing.advanced': 'Avanzado',
        'pricing.advanced.f1': 'Soporte',
        'pricing.advanced.f2': 'Funciones extra',
        'pricing.choosePlan': 'Elegir plan',
        'pricing.startNow': 'Comenzar ahora',
        'footer.copyright': 'Todos los derechos reservados.',
        'footer.product': 'Producto',
        'footer.platforms': 'Plataformas',
        'footer.pricing': 'Precios',
        'meta.title': 'CoralTracking - Rastreo GPS de flotas',
        'meta.description': 'Rastreo GPS de flotas en tiempo real con rutas históricas, geocercas, alertas e informes.',
        'lang.english': 'English',
        'lang.spanish': 'Español',
    },
};

type LanguageContextValue = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getStoredLanguage(): Language {
    if (typeof window === 'undefined') return 'en';
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    return stored === 'es' || stored === 'en' ? stored : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(getStoredLanguage);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, lang);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, language);
        }
    }, [language]);

    const t = useCallback(
        (key: string): string => {
            const value = translations[language][key];
            return value ?? key;
        },
        [language],
    );

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage(): LanguageContextValue {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return ctx;
}
