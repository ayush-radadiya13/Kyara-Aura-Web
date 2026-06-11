import AuthForm from '@/components/auth/AuthForm';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { getAuthFieldKeys } from '@/lib/auth/get-auth-field-keys';

export const metadata = {
  title: 'Create Account | Kyara Aura',
  description: 'Create your Kyara Aura account.',
};

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo =
    typeof params?.from === 'string' && params.from.startsWith('/')
      ? params.from
      : '/';

  const fieldKeys = await getAuthFieldKeys('register');

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <main className="flex flex-1 items-center justify-center overflow-hidden px-4 py-4 sm:py-6">
        <AuthSplitLayout
          videoSrc="/vedio/logo_animation.mp4"
          videoLabel="Kyara Aura logo animation"
          eyebrow=""
          headline=""
          mediaClassName="h-[200px] min-h-[200px] w-full self-center sm:min-h-[200px] lg:min-h-[200px]"
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
