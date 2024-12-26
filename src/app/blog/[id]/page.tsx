import { getBlogPost } from '@/lib/woocommerce';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import '@/styles/wordpress.css';
import '@/styles/wordpress-blocks.css';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogPostPage({
  params,
  searchParams: _searchParams
}: Props) {
  const resolvedParams = await params;
  const post = await getBlogPost(parseInt(resolvedParams.id));

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {post.featured_media && post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
        <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image
            src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/placeholder.jpg'}
            alt={post.title.rendered}
            fill
            className="object-cover"
          />
        </div>
      ) : null}

      <h1 
        className="text-4xl font-bold mb-4"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />

      <time className="text-gray-500 block mb-8">
        {new Date(post.date).toLocaleDateString()}
      </time>

      <div 
        className="wp-content"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />
    </article>
  );
}