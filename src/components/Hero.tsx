import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <div className="relative w-full min-h-[300px] md:min-h-[500px] flex bg-black">
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

      <div className="container mx-auto px-4 relative z-10 flex flex-col justify-end pb-4 md:pb-8">
        <div className="flex justify-start items-end gap-4">
          {/* Text Content */}
          <div className="max-w-[600px] md:max-w-[500px] lg:max-w-[600px]">
            {/* Social Proof */}
            <p className="text-[12px] md:text-[15px] text-white/80 mb-[4px] md:mb-[8px] font-bold">
              Over 1,000 festival-goers rave about our custom designs
            </p>

            {/* Main Heading */}
            <h2 className="text-[32px] md:text-[45px] font-bold text-white mb-[8px] md:mb-[12px] mt-0 leading-[1.1] md:leading-[1.2]">
              Never blend in at{" "}
              <br /> 
              a festival again
            </h2>

            {/* Supporting Text */}
            <p className="text-[1rem] md:text-[1.5rem] text-white/90 leading-[1.3] md:leading-[1.4] mr-[10%] md:mr-[20%] mb-[8px] md:mb-[16px]">
              Our unique, artfully crafted{" "}
              <br /> 
              designs ensure you shine.
            </p>

            {/* CTA Buttons */}
            <div className="mt-[8px] md:mt-[16px]">
              <div className="flex gap-3 md:gap-4">
                <Link
                  href="/shop"
                  className="inline-block px-4 md:px-6 py-2 md:py-3 bg-[#997997] text-white text-[1rem] md:text-[1.2rem] font-bold 
                    rounded-[5px] no-underline transition-all duration-300 hover:bg-[#886886]"
                >
                  Learn More
                </Link>
                <Link
                  href="/shop"
                  className="inline-block px-4 md:px-6 py-2 md:py-3 bg-[#997997] text-white text-[1rem] md:text-[1.2rem] font-bold 
                    rounded-[5px] no-underline transition-all duration-300 hover:bg-[#886886]"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Hero Model Image */}
          <div className="relative w-[240px] md:w-[320px] h-[168px] md:h-[384px] -mr-4 md:-mr-8">
            <Image
              src="/images/hero-model.png?v=1"
              alt="Festival model"
              fill
              className="object-contain object-left"
              sizes="(max-width: 768px) 240px, 320px"
              priority
              loading="eager"
              quality={90}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
