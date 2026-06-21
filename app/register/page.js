import AuthForm from '@/components/auth/AuthForm';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { getAuthFieldKeys } from '@/lib/auth/get-auth-field-keys';

export const metadata = {
  title: 'Create Account | Kayra Aura',
  description: 'Create your Kayra Aura account.',
};

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo =
    typeof params?.from === 'string' && params.from.startsWith('/')
      ? params.from
      : '/';

  const fieldKeys = await getAuthFieldKeys('register');

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden">
      <main className="flex h-full min-h-0 flex-1 justify-center overflow-hidden bg-white px-3 py-3 sm:px-4 sm:py-4">
        <AuthSplitLayout
          className="h-full w-full"
          scrollableForm
          videoSrc="/vedio/logo_animation.mp4"
          videoLabel="Kayra Aura logo animation"
          eyebrow=""
          headline=""
          mediaClassName="w-full lg:sticky lg:top-0"
        >
          <AuthForm
            formType="register"
            fieldKeys={fieldKeys}
            title="Create New Account"
            subtitle=""
            submitLabel="Create Account"
            redirectTo={redirectTo}
          />
        </AuthSplitLayout>
      </main>
    </div>
  );
}
