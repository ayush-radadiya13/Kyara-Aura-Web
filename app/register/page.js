import Header from '@/components/Header';
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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <AuthSplitLayout
          imageSrc="/images/product-7.png"
          imageAlt="Elegant Kyara Aura necklace"
          eyebrow="Join us"
          headline="Create an account and discover pieces made to shine."
        >
          <AuthForm
            formType="register"
            fieldKeys={fieldKeys}
            title="Create New Account"
            subtitle=""
            submitLabel="Create Account"
            footerHref="/login"
            footerText="Already have an account?"
            footerLinkText="Login"
            redirectTo={redirectTo}
          />
        </AuthSplitLayout>
      </main>
    </div>
  );
}
