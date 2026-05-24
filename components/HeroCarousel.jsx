'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const carouselImages = [
  {
    id: 1,
    src: '/images/hero-1.jpg',
    alt: 'Luxury Jewellery Collection',
    title: 'Timeless Elegance',
    subtitle: 'Exquisite craftsmanship meets modern design'
  },
  {
    id: 2,
    src: '/images/hero-2.jpg',
    alt: 'Diamond Jewellery',
    title: 'Brilliant Beauty',
    subtitle: 'Handcrafted with precision and care'
  },
  {
    id: 3,
    src: '/images/hero-3.jpg',
    alt: 'Fine Jewellery Display',
    title: 'Natural Radiance',
    subtitle: 'Premium gems and precious metals'
  },
  {
    id: 4,
    src: '/images/hero-4.jpg',
    alt: 'Luxury Jewellery Set',
    title: 'Exclusive Collection',
    subtitle: 'Limited edition masterpieces'
  },
  {
    id: 5,
    src: '/images/hero-5.jpg',
    alt: 'Jewellery Artistry',
    title: 'Modern Luxury',
    subtitle: 'Contemporary designs for every occasion'
  }
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const currentImage = carouselImages[currentIndex];

  return (
    <section className="relative w-full h-[50vh] sm:h-screen overflow-hidden bg-white">
      {/* Main Image Container */}
      <div className="relative w-full h-full">
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={currentImage.src}
            alt={currentImage.alt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-4xl">
              <h1 className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-light mb-2 sm:mb-4 tracking-wide">
                {currentImage.title}
              </h1>
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-light tracking-wider opacity-90">
                {currentImage.subtitle}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 md:bottom-8 md:space-x-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 md:h-2 md:w-2 ${
              index === currentIndex 
                ? 'bg-white w-6 md:w-8' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
