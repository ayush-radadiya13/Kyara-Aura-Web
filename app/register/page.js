import AuthForm from '@/components/auth/AuthForm';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { getAuthFieldKeys } from '@/lib/auth/get-auth-field-keys';
import { noIndexMetadata } from '@/lib/seo';

export const metadata = noIndexMetadata({
  title: 'Create Account | Kayra Aura',
  description: 'Create your Kayra Aura account.',
  path: '/register',
});

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo =
    typeof params?.from === 'string' && params.from.startsWith('/')
      ? params.from
      : '/';

  const fieldKeys = await getAuthFieldKeys('register');

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 justify-center bg-white px-3 py-3 sm:px-4 sm:py-4">
        <AuthSplitLayout
          className="w-full"
          imageSrc="/assets/ka-logo.png"
          imageAlt="Kayra Aura"
          eyebrow=""
          headline=""
          mediaClassName="h-[200px] min-h-[200px] w-full self-center bg-white sm:min-h-[200px] lg:min-h-[200px]"
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
