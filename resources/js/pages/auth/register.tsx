import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="mac-label">
                            Full name
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Your name"
                            className="mac-input"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div>
                        <label htmlFor="email" className="mac-label">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="you@example.com"
                            className="mac-input"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div>
                        <label htmlFor="password" className="mac-label">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="mac-input"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="mac-label">
                            Confirm password
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="••••••••"
                            className="mac-input"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <button type="submit" className="mac-btn mt-6 w-full" tabIndex={5} disabled={processing} data-test="register-user-button">
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </button>
                </div>

                <div className="text-center text-sm text-[var(--mac-muted)] mt-6">
                    Already have an account?{' '}
                    <a href={route('login')} className="mac-link" tabIndex={6}>
                        Log in
                    </a>
                </div>
            </form>
        </AuthLayout>
    );
}
