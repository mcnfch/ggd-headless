import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

interface CategoryHeaderProps {
  title: string;
  description?: string;
}

export default function CategoryHeader({ title, description }: CategoryHeaderProps) {
  return (
    <div className="bg-[#997997] text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center py-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
            {title}
          </h1>
          {description && (
            <div 
              className="text-sm md:text-base lg:text-lg text-white/90"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
