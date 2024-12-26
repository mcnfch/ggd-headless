import { getBlogPosts } from '@/lib/woocommerce';
import type { BlogPost } from '@/lib/woocommerce';
import Link from 'next/link';
import Image from 'next/image';

export default async function BlogPage() {
  const posts = await getBlogPosts();

  if (!posts || posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Blog</h1>
        <div className="text-center text-gray-600">
          No blog posts found. Check back later for new content!
        </div>
      </div>
    );
  }

  const renderPost = (post: BlogPost) => (
    <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
      {post.featured_media && post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
        <div className="relative h-64">
          <Image
            src={post._embedded['wp:featuredmedia'][0].source_url}
            alt={post.title.rendered}
            fill
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">
          <Link 
            href={`/blog/${post.id}`}
            className="hover:text-purple-600 transition-colors"
          >{post.title.rendered}</Link>
        </h2>
        <div 
          className="text-gray-600 mb-6 line-clamp-3 text-lg"
          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
        />
        <div className="flex justify-between items-center">
          <time className="text-sm text-gray-500">
            {new Date(post.date).toLocaleDateString()}
          </time>
          <Link
            href={`/blog/${post.id}`}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >Read More →</Link>
        </div>
      </div>
    </article>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Blog</h1>
      <div className="grid gap-8 max-w-3xl mx-auto">
        {posts.map(renderPost)}
      </div>
    </div>
  );
}