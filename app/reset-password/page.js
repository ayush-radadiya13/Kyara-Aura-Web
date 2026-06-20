import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata = {
  title: 'Reset Password | Kayra Aura',
  description: 'Reset your Kayra Aura account password.',
};

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <main className="flex flex-1 items-center bg-white justify-center overflow-hidden px-4 py-4 sm:py-6">
        <AuthSplitLayout
          videoSrc="/vedio/logo_animation.mp4"
          videoLabel="Kayra Aura logo animation"
          eyebrow=""
          headline=""
          mediaClassName="h-[200px] min-h-[200px] w-full self-center sm:min-h-[200px] lg:min-h-[200px]"
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
