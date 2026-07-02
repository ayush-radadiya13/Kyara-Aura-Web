'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Edit3, Mail, Phone, ShieldCheck, User, UserRound, X } from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/hooks/auth';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { LoaderBlock } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { APP_ROUTES, AUTH_PAGE_ROUTES, withRedirect } from '@/lib/routes';
import { apiToast } from '@/lib/api-toast';
import { getApiErrorMessage } from '@/utils/api-error';
import { useAuthStore } from '@/store/auth-store';
import { useScrollLock } from '@/hooks/use-scroll-lock';

export default function UserProfile() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const profileQuery = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({ name: '', email: '', phone: '' });
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(withRedirect(AUTH_PAGE_ROUTES.LOGIN, APP_ROUTES.PROFILE));
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (profileQuery.data) {
      const profile = profileQuery.data;
      setFormValues({
        name: getProfileName(profile),
        email: profile.email ?? '',
        phone: profile.phone ?? profile.mobile ?? profile.phone_number ?? '',
      });
    }
  }, [profileQuery.data]);

  const currentPhone = useMemo(() => {
    const profile = profileQuery.data ?? {};
    return profile.phone ?? profile.mobile ?? profile.phone_number ?? '';
  }, [profileQuery.data]);

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

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setOtpCode('');
    setOtpError('');
    setIsOtpModalOpen(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setOtpCode('');
    setOtpError('');
    setPendingPhone('');
    setIsOtpModalOpen(false);
    setFormValues({
      name: getProfileName(profile),
      email: profile.email ?? '',
      phone: profile.phone ?? profile.mobile ?? profile.phone_number ?? '',
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextPayload = buildProfileUpdatePayload(profile, formValues);

    if (!Object.keys(nextPayload).length) {
      apiToast.error('Please update at least one field.');
      return;
    }

    setIsSubmitting(true);
    setOtpError('');
    try {
      const response = await updateProfileMutation.mutateAsync(nextPayload);
      const payload = response?.data ?? response;
      if (payload?.requires_otp || payload?.step === 'otp_required') {
        setPendingPhone(nextPayload.phone || '');
        setOtpCode('');
        setIsOtpModalOpen(true);
        apiToast.info(response?.message || 'OTP sent to your new mobile number');
      } else {
        await profileQuery.refetch();
        setIsEditing(false);
        apiToast.success(response?.message || 'Profile updated successfully.');
      }
    } catch (error) {
      apiToast.error(getApiErrorMessage(error, 'Unable to update profile. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async () => {
    const normalizedOtp = otpCode.trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      setOtpError('Please enter the 6-digit OTP.');
      return;
    }

    setIsSubmitting(true);
    setOtpError('');
    try {
      const response = await updateProfileMutation.mutateAsync({
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        phone: pendingPhone || formValues.phone.trim(),
        otp: normalizedOtp,
      });
      await profileQuery.refetch();
      setIsOtpModalOpen(false);
      setIsEditing(false);
      setOtpCode('');
      setPendingPhone('');
      apiToast.success(response?.message || 'Profile updated successfully.');
    } catch (error) {
      setOtpError(getApiErrorMessage(error, 'Unable to verify OTP. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <header className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">User Profile</h1>
              <p className="mt-1 text-sm font-medium text-gray-500">Your account information.</p>
            </div>
            {!isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditStart}
                className="h-9 rounded-full border-gray-200 px-3 text-sm font-semibold"
              >
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </Button>
            ) : null}
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

          {isEditing ? (
            <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-2xl border border-gray-200 p-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Name</label>
                <input
                  value={formValues.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  className="h-11 w-full rounded border border-gray-300 px-3 text-sm outline-none transition focus:border-gray-950"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="h-11 w-full rounded border border-gray-300 px-3 text-sm outline-none transition focus:border-gray-950"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={formValues.phone}
                  onChange={(event) => handleChange('phone', event.target.value)}
                  className="h-11 w-full rounded border border-gray-300 px-3 text-sm outline-none transition focus:border-gray-950"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" size="sm" disabled={isSubmitting} className="rounded-full">
                  {isSubmitting ? 'Saving...' : 'Save changes'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit} className="rounded-full">
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}

          {!isEditing ? (
            <dl className="divide-y divide-gray-100 border-t border-gray-100">
              {fields.map(({ label, value, Icon }) => (
                <div key={label} className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3 py-4">
                  <dt className="flex h-6 items-center text-gray-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">{label}</span>
                  </dt>
                  <dd className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
                    <p className="mt-0.5 wrap-break-word text-sm font-semibold text-gray-800">{value || '-'}</p>
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </AuthSplitLayout>

      {isOtpModalOpen ? createPortal(
        <OtpVerificationModal
          open={isOtpModalOpen}
          phone={pendingPhone || formValues.phone}
          currentPhone={currentPhone}
          otp={otpCode}
          error={otpError}
          loading={isSubmitting}
          onOtpChange={(value) => {
            const digits = value.replace(/\D/g, '').slice(0, 6);
            setOtpCode(digits);
            if (otpError) {
              setOtpError('');
            }
          }}
          onClose={() => {
            setIsOtpModalOpen(false);
            setOtpCode('');
            setOtpError('');
            setPendingPhone('');
          }}
          onSubmit={handleOtpSubmit}
        />,
        document.body,
      ) : null}
    </div>
  );
}

function OtpVerificationModal({ open, phone, currentPhone, otp, error, loading, onOtpChange, onClose, onSubmit }) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-labelledby="profile-otp-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" data-lenis-prevent>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="profile-otp-title" className="text-xl font-semibold text-gray-900">Verify OTP</h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the 6-digit OTP sent to <span className="font-semibold text-gray-950">{phone || currentPhone || 'your new mobile number'}</span> to complete the update.
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} className="text-sm font-medium text-gray-500 transition hover:text-gray-800 disabled:opacity-50" aria-label="Close OTP dialog">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="profile-otp" className="mb-1 block text-sm font-medium text-gray-700">OTP</label>
            <input
              id="profile-otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => onOtpChange(event.target.value)}
              disabled={loading}
              autoFocus
              className="h-11 w-full rounded border border-gray-300 px-3 text-sm outline-none transition focus:border-gray-950 disabled:opacity-60"
              placeholder="Enter 6-digit OTP"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="h-12 w-full rounded-none bg-[#C99B4D] text-primary-foreground hover:bg-[#C99B4D]/90"
          >
            {loading ? 'Verifying...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function buildProfileUpdatePayload(profile, formValues) {
  const payload = {};
  const currentName = getProfileName(profile);
  const currentEmail = profile.email ?? '';
  const currentPhone = profile.phone ?? profile.mobile ?? profile.phone_number ?? '';

  const nextName = (formValues.name || '').trim();
  if (nextName && nextName !== currentName) {
    payload.name = nextName;
  }

  const nextEmail = (formValues.email || '').trim();
  if (nextEmail && nextEmail !== currentEmail) {
    payload.email = nextEmail;
  }

  const nextPhone = (formValues.phone || '').trim();
  if (nextPhone && nextPhone !== currentPhone) {
    payload.phone = nextPhone;
  }

  return payload;
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
