'use client';

import LoginForm from '@/components/auth/LoginForm';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function LoginContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/profile';
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to profile or the requested page
    if (user) {
      router.push(from);
    }
  }, [user, from, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-start py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm redirectPath={from} />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
