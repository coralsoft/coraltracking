import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-svh px-6 py-12 md:p-10 bg-gradient-to-br from-[#f9f9fb] via-[#ffffff] to-[#f2f2f7] dark:from-[#1a1a1a] dark:via-[#2d2d2d] dark:to-[#1f1f1f]">
            <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
                <Link href={route('home')} className="flex items-center justify-center gap-2 self-center font-medium">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D83278] to-[#C8246B] flex items-center justify-center shadow-lg">
                        <AppLogoIcon className="size-5 fill-current text-white" />
                    </div>
                    <span className="sr-only">{title}</span>
                </Link>

                <div className="mac-card">
                    <div className="space-y-2 text-center mb-6">
                        <h1 className="text-xl font-semibold text-[var(--mac-text)]">{title}</h1>
                        <p className="text-sm text-[var(--mac-muted)]">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
