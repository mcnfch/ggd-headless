import { getCategories } from '@/lib/woocommerce';
import { Header } from './Header';

export async function HeaderWrapper() {
  const categories = await getCategories();
  return <Header categories={categories} />;
}
