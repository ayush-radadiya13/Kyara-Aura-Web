import { noIndexMetadata } from '@/lib/seo';

export const metadata = noIndexMetadata({
  title: 'Forgot Password | Kayra Aura',
  description: 'Request a password reset OTP for your Kayra Aura account.',
  path: '/forgot-password',
});

export default function ForgotPasswordLayout({ children }) {
  return children;
}
