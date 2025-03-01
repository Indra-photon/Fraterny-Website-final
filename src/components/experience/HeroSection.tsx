
import React from 'react';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-16 bg-navy text-white relative">
      {/* 
      // Optimized background hero image with responsive sizes
      // Replace with your actual marketing images
      */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      >
        <picture>
          <source 
            media="(max-width: 640px)" 
            srcSet="/images/hero/villa-mobile.webp" 
          />
          <source 
            media="(max-width: 1024px)" 
            srcSet="/images/hero/villa-tablet.webp" 
          />
          <source 
            media="(min-width: 1025px)" 
            srcSet="/images/hero/villa-desktop.webp" 
          />
          <img 
            src="/images/hero/villa-desktop.webp"
            alt="Luxury villa exterior"
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        </picture>
      </div>
      
      {/* Gradient Overlay - you can modify the colors and opacity to match your image */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, 
            rgba(10, 26, 47, 0.95) 0%,
            rgba(10, 26, 47, 0.8) 50%,
            rgba(10, 26, 47, 0.6) 100%
          )`
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          {/* CUSTOMIZATION: Hero Section Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair mb-6">
            Condensing lifelong memories, lessons, and friendships in a week.
          </h1>
          
          {/* CUSTOMIZATION: Hero Section Subtitle */}
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            20 people. 7 days. 1 life-changing experience
          </p>
          
          {/* CUSTOMIZATION: Hero Section CTA Link 
          // Replace the Google Form URL below with your own form/application link
          */}
          <a 
            href="https://docs.google.com/forms/d/1TTHQN3gG2ZtC26xlh0lU8HeiMc3qDJhfoU2tOh9qLQM/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm italic underline text-terracotta hover:text-opacity-80 transition-colors"
          >
            See if you fit →
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
