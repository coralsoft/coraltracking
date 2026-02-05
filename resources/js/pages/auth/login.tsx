import InputError from '@/components/input-error';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="mac-label">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@example.com"
                            className="mac-input"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="password" className="mac-label">
                                Password
                            </label>
                            {canResetPassword && (
                                <a href={route('password.request')} className="mac-link text-xs" tabIndex={5}>
                                    Forgot password?
                                </a>
                            )}
                        </div>
                        <input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="mac-input"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remember"
                            name="remember"
                            tabIndex={3}
                            className="mac-checkbox"
                            checked={data.remember}
                            onChange={() => setData('remember', !data.remember)}
                        />
                        <label htmlFor="remember" className="text-sm text-[var(--mac-text)] cursor-pointer">
                            Remember me
                        </label>
                    </div>

                    <button type="submit" className="mac-btn mt-6 w-full" tabIndex={4} disabled={processing} data-test="login-button">
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </button>
                </div>

                <div className="text-center text-sm text-[var(--mac-muted)] mt-6">
                    Don&apos;t have an account?{' '}
                    <a href={route('register')} className="mac-link" tabIndex={5}>
                        Sign up
                    </a>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
