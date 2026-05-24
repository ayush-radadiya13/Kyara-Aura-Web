import Header from '@/components/Header';
import AuthForm from '@/components/auth/AuthForm';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';
import { getAuthFieldKeys } from '@/lib/auth/get-auth-field-keys';

export const metadata = {
  title: 'Login | Kyara Aura',
  description: 'Sign in to your Kyara Aura account.',
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const redirectTo =
    typeof params?.from === 'string' && params.from.startsWith('/')
      ? params.from
      : '/';

  const fieldKeys = await getAuthFieldKeys('login');

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <AuthSplitLayout
          imageSrc="/images/product-6.png"
          imageAlt="Kyara Aura jewellery collection"
          eyebrow="Welcome back"
          headline="Sign in to explore your favourites and orders."
        >
          <AuthForm
            formType="login"
            fieldKeys={fieldKeys}
            title="Login"
            subtitle="Welcome! Please login to continue"
            submitLabel="Login"
            footerHref="/register"
            footerText="Don't have an account?"
            footerLinkText="Create Now"
            redirectTo={redirectTo}
          />
        </AuthSplitLayout>
      </main>
    </div>
  );
}
