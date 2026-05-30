import CategoryDetail from '@/components/CategoryDetail';

export default async function CategoryDetailPage({ params }) {
  const { slug } = await params;
  return <CategoryDetail slug={slug} />;
}
