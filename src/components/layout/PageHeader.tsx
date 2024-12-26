interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="bg-black text-white pt-28 pb-6 md:pt-32 md:pb-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">
            {title}
          </h1>
          {description && (
            <div 
              className="text-sm md:text-base lg:text-lg text-white/80"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
