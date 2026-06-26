'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, ShieldCheck, User, UserRound } from 'lucide-react';
import { useProfile } from '@/hooks/auth';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { LoaderBlock } from '@/components/ui/loader';
import { APP_ROUTES, AUTH_PAGE_ROUTES, withRedirect } from '@/lib/routes';
import { useAuthStore } from '@/store/auth-store';

export default function UserProfile() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const profileQuery = useProfile();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(withRedirect(AUTH_PAGE_ROUTES.LOGIN, APP_ROUTES.PROFILE));
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated || !isAuthenticated || profileQuery.isLoading) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-12">
        <LoaderBlock />
      </section>
    );
  }

  const profile = profileQuery.data ?? {};
  const fullName = getProfileName(profile);
  const fields = getProfileFields(profile);

  return (
    <div className="flex flex-1 items-center justify-center bg-white px-4 py-4 sm:py-6">
      <AuthSplitLayout
        imageSrc="/assets/ka-logo.png"
        imageAlt="Kayra Aura"
        eyebrow=""
        headline=""
        mediaClassName="h-[200px] min-h-[200px] w-full self-center bg-white sm:min-h-[200px] lg:min-h-[200px]"
      >
        <div className="flex flex-col">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">User Profile</h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Your account information.
            </p>
          </header>

          <div className="mb-5 flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-950 text-white">
              <UserRound className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-gray-950">{fullName}</p>
              {profile.email ? (
                <p className="truncate text-sm font-medium text-gray-500">{profile.email}</p>
              ) : null}
            </div>
          </div>

          <dl className="divide-y divide-gray-100 border-t border-gray-100">
            {fields.map(({ label, value, Icon }) => (
              <div key={label} className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3 py-4">
                <dt className="flex h-6 items-center text-gray-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">{label}</span>
                </dt>
                <dd className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="mt-0.5 break-words text-sm font-semibold text-gray-800">{value || '-'}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </AuthSplitLayout>
    </div>
  );
}

function getProfileName(profile) {
  return (
    profile.name ||
    profile.full_name ||
    profile.fullName ||
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
    'Your account'
  );
}

function getProfileFields(profile) {
  const fields = [
    { label: 'Name', value: getProfileName(profile), Icon: User },
    { label: 'Email', value: profile.email, Icon: Mail },
    {
      label: 'Phone',
      value: profile.phone ?? profile.mobile ?? profile.phone_number,
      Icon: Phone,
    },
  ];

  const verified =
    profile.email_verified_at ?? profile.is_email_verified ?? profile.email_verified;
  if (verified) {
    fields.push({ label: 'Email status', value: 'Verified', Icon: ShieldCheck });
  }

  return fields;
}
