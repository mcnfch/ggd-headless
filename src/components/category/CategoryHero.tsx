import type { WooCategory } from '@/lib/types';

interface CategoryHeroProps {
  category: WooCategory;
}

export function CategoryHero({ category }: CategoryHeroProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm py-12 mb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 font-orbitron tracking-[4px]">
          {category.name.toUpperCase()}
        </h1>
        {category.description && (
          <div 
            className="text-gray-600 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: category.description }}
          />
        )}
      </div>
    </div>
  );
}
