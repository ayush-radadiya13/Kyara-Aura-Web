import AuthForm from '@/components/auth/AuthForm';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { getAuthFieldKeys } from '@/lib/auth/get-auth-field-keys';
import { noIndexMetadata } from '@/lib/seo';

export const metadata = noIndexMetadata({
  title: 'Login | Kayra Aura',
  description: 'Sign in to your Kayra Aura account.',
  path: '/login',
});

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo =
    typeof params?.from === 'string' && params.from.startsWith('/')
      ? params.from
      : '/';

  const fieldKeys = await getAuthFieldKeys('login');

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
          <AuthForm
            formType="login"
            fieldKeys={fieldKeys}
            title="Login"
            subtitle="Welcome! Please login to continue"
            submitLabel="Login"
            redirectTo={redirectTo}
          />
        </AuthSplitLayout>
      </main>
    </div>
  );
}
