import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <div className="relative w-full min-h-[500px] flex bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/gg_banner.png?v=1"
          alt="Festival background"
          fill
          className="object-cover opacity-60"
          sizes="100vw"
          priority
          loading="eager"
          quality={75}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRseHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-6 relative z-10 flex flex-col justify-center">
        {/* Text Content with descending sizes */}
        <div className="max-w-[335px] sm:max-w-[600px] md:max-w-[800px]">
          <h1 className="text-[32px] sm:text-[38px] md:text-[45px] font-bold text-white mb-3 sm:mb-4 leading-[1.1]">
            Be Unique Choose Boutique
          </h1>
          
          <h2 className="text-[24px] sm:text-[28px] md:text-[30px] font-bold text-white mb-3 sm:mb-4 leading-[1.2]">
            Glow Up Your Rizz with Custom Drip
          </h2>
          
          <h3 className="text-[24px] sm:text-[28px] md:text-[30px] font-bold text-white mb-6 sm:mb-8 leading-[1.2]">
            Created by Us or Designed by You!
          </h3>

          {/* Buttons Container */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/learn"
              className="w-full sm:w-auto text-white text-sm md:text-base font-semibold px-5 py-2 md:px-6 md:py-2.5 
                bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                rounded-full transform transition-all duration-300 hover:scale-105 
                shadow-lg hover:shadow-xl border border-white/20 text-center"
            >
              Learn More
            </Link>
            <Link
              href="/explore"
              className="w-full sm:w-auto text-white text-sm md:text-base font-semibold px-5 py-2 md:px-6 md:py-2.5 
                bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 
                rounded-full transform transition-all duration-300 hover:scale-105 
                shadow-lg hover:shadow-xl border border-white/20 text-center"
            >
              Explore More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
