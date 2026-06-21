import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import ResetPasswordForm from './ResetPasswordForm';
import { noIndexMetadata } from '@/lib/seo';

export const metadata = noIndexMetadata({
  title: 'Reset Password | Kayra Aura',
  description: 'Reset your Kayra Aura account password.',
  path: '/reset-password',
});

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center bg-white px-4 py-4 sm:py-6">
        <AuthSplitLayout
          imageSrc="/assets/ka-logo.png"
          imageAlt="Kayra Aura"
          eyebrow=""
          headline=""
          mediaClassName="h-[200px] min-h-[200px] w-full self-center bg-white sm:min-h-[200px] lg:min-h-[200px]"
        >
          <ResetPasswordForm
            token={typeof params?.token === 'string' ? params.token : ''}
            email={typeof params?.email === 'string' ? params.email : ''}
          />
        </AuthSplitLayout>
      </main>
    </div>
  );
}
