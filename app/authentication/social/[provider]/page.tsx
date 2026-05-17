'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Provider = 'google' | 'github';

export default function SocialAuthPopup({ params }: { params: { provider: Provider } }) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Starting social authentication...');
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [providerName, setProviderName] = useState('');

  useEffect(() => {
    const provider = params.provider?.toLowerCase();
    setProviderName(provider === 'github' ? 'GitHub' : 'Google');
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    const doSocialAuth = async () => {
      try {
        const response = await fetch(`/api/auth/oauth/${provider}`, {
          method: 'POST',
          credentials: 'same-origin',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Social login failed.');
        }

        const user = data.user;
        if (user) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('authUser', JSON.stringify(user));
          }
          setUserName(user.name);
          setUserEmail(user.email);
        }

        const message = data.created
          ? `Signed up with ${providerName} as ${data.user.email}`
          : `Signed in with ${providerName} as ${data.user.email}`;

        setStatus(message);

        window.opener?.postMessage(
          {
            type: 'arfa:social-auth',
            user,
            message,
            provider,
            created: data.created,
          },
          window.location.origin
        );

        setTimeout(() => {
          window.close();
        }, 1000);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected auth error.';
        setError(message);
        setStatus('Social auth failed.');
      }
    };

    doSocialAuth();
  }, [params.provider, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080a12] text-white px-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
        <div className="text-sm uppercase tracking-[0.24em] text-[#7AB3FF] mb-4">{providerName} login</div>
        <div className="text-2xl font-semibold mb-3">{status}</div>
        {userName || userEmail ? (
          <div className="text-sm text-gray-300 mb-4">
            {userName ? <div>{userName}</div> : null}
            {userEmail ? <div>{userEmail}</div> : null}
          </div>
        ) : null}
        {error ? <div className="text-red-400 text-sm mb-4">{error}</div> : null}
        <div className="text-xs text-gray-400">
          If this window does not redirect automatically, <button className="underline" onClick={() => window.location.reload()}>retry</button> or close it.
        </div>
      </div>
    </div>
  );
}
