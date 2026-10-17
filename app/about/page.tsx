'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { Clock, Users, ShieldCheck, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const galleryImages = [
  'image1.jpg', 'Image1.JPG', 'Image2.jpeg', 'image3.jpg', 'Image3.jpg', 'image3(1).jpg',
  'Image4.jpg', 'Image5.jpg', 'image6.jpg', 'Image6.jpg', 'Image7.jpg', 'image1.jpg',
  'image9.jpg', 'image11.jpg', 'Image5.jpg', 'Image13.png',
];

export default function AboutPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrev = useCallback(() =>
    setLightboxIndex(i => (i !== null ? (i - 1 + galleryImages.length) % galleryImages.length : null)), []);

  const showNext = useCallback(() =>
    setLightboxIndex(i => (i !== null ? (i + 1) % galleryImages.length : null)), []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  const cards = [
    {
      title: "Radical Accessibility",
      content: "24/7 confidential support via AI chat and USSD — even in low-connectivity areas. Survivors can access help immediately, when they need it most.",
      icon: <Clock className="w-5 h-5 text-white" />,
    },
    {
      title: "Survivor-Centered & Survivor-Built",
      content: "HEAL is designed with survivors — not for them. Every feature, from AI support to referrals, prioritizes dignity, empathy, and safety.",
      icon: <Users className="w-5 h-5 text-white" />,
    },
    {
      title: "Trust & Integrity Through Innovation",
      content: "Secure, transparent case coordination powered by technology. We strengthen accountability across medical, legal, and community systems.",
      icon: <ShieldCheck className="w-5 h-5 text-white" />,
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBE8DE]">

      <Navbar />
      {/*Hero section*/}
      <section className="relative lg:h-[66.66666667vh] text-white pt-28 lg:pt-20 lg:pb-0 overflow-hidden flex items-center -mt-20" style={{ background: 'linear-gradient(180deg, #DCE7E1 0%, #016A79 100%)' }}>

        {/* Decorative Sunbursts */}
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute"
          style={{ inset: '15% 5% auto 50%' }}
          width={50}
          height={50}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute hidden lg:block -rotate-6"
          style={{ inset: '20% auto auto 48%' }}
          width={70}
          height={70}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute"
          style={{ inset: '15% 5% auto auto' }}
          width={50}
          height={50}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute -rotate-6"
          style={{ inset: '20% auto auto 88%' }}
          width={70}
          height={70}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute rotate-12"
          style={{ inset: '20% auto auto 8%' }}
          width={70}
          height={70}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute rotate-45 z-30"
          style={{ inset: '75% 60% auto auto' }}
          width={70}
          height={70}
          priority
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10" >
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-2 md:gap-8">

            {/* Left: Text Content */}
            <div className="text-center lg:text-left space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-acme tracking-tight">
                About Us
              </h1>
              <p className="lg:max-w-md text-base sm:text-lg lg:text-xl font-inter font-medium leading-relaxed opacity-90 whitespace-pre-line">
                HEAL is an AI-powered mental health support platform
                providing confidential, culturally-sensitive care for survivors
                of SGBV — anytime, anywhere.
              </p>
            </div>

            {/* Right: Cutout Image Positioned at the bottom */}
            <div className="relative h-full flex justify-center lg:justify-end items-end">
              <div className="relative w-full max-w-[350px] rounded-[100px] mx-auto]">
                <Image
                  src="/images/about-hero-women.png"
                  alt="Supportive embrace"
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* The Wavy Bottom Edge using SVG */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0] z-20">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[200px]"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#DCE7E1" />
                <stop offset="100%" stopColor="#016A79" />
              </linearGradient>
            </defs>
            <path
              d="M0,120V60.29C400,20,800,100,1200,60.29V120H0Z"
              fill="url(#waveGradient)"
            />
          </svg>
        </div>
      </section>

      {/* Our Vision */}
      <section className="relative py-20 bg-[#FEF5E3] overflow-hidden">
        {/* Decorative Sunbursts */}
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute"
          style={{ inset: '15% 5% auto 50%' }}
          width={50}
          height={50}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute hidden lg:block -rotate-6"
          style={{ inset: '20% auto auto 48%' }}
          width={70}
          height={70}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute"
          style={{ inset: '15% 5% auto auto' }}
          width={50}
          height={50}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute -rotate-6"
          style={{ inset: '20% auto auto 88%' }}
          width={70}
          height={70}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute rotate-12"
          style={{ inset: '20% auto auto 8%' }}
          width={70}
          height={70}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute rotate-45 z-30"
          style={{ inset: '75% 60% auto auto' }}
          width={70}
          height={70}
          priority
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

            {/* Left Column: Vision + Stats */}
            <div className="space-y-12">
              {/* Vision Header */}
              <div className="relative inline-block">
                <div className="w-20 h-1 bg-[#056173] mt-2"></div>
                <span className="text-3xl font-bold text-[#044750] font-acme block">Our</span>
                <h2 className="text-4xl lg:text-5xl font-bold text-[#044750] font-acme">Vision</h2>
              </div>

              {/* Vision Text */}
              <p className="text-base lg:text-lg text-gray-800 text-[#363636] leading-relaxed font-medium font-acme max-w-md pl-20">
                A world where every SGBV survivor has immediate, confidential,
                culturally-sensitive access to healing and empowerment —
                anytime, anywhere, without barriers.
              </p>

              {/* Counter / Stats */}
              <div className="pt-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl lg:text-7xl font-bold text-[#0C444B] font-acme">500+</span>
                </div>
                <div className="flex gap-4 mt-2">
                  <span className="text-[#056173] font-bold font-acme uppercase tracking-wider text-sm">Cases</span>
                  <span className="text-[#056173] font-bold font-acme uppercase tracking-wider text-sm">Reported</span>
                  <span className="text-[#056173] font-bold font-acme uppercase tracking-wider text-sm">Yearly</span>
                </div>
              </div>
            </div>

            {/* Right Column: Mission (Pushed down for staggered look) */}
            <div className="lg:pt-48 space-y-8 flex flex-col items-end">
              {/* Mission Header */}
              <div className="text-right w-full">
                <span className="text-3xl font-bold text-[#0C444B] font-acme block">Our</span>
                <h2 className="text-4xl lg:text-5xl font-bold text-[#0C444B] font-acme">Mission</h2>
                <div className="w-20 h-1 bg-[#056173] mt-4 ml-auto"></div>
              </div>

              {/* Mission Text */}
              <p className="text-base lg:text-lg text-gray-800 leading-relaxed font-medium font-acme text-right max-w-lg pr-20">
                To make mental health support radically accessible to SGBV survivors
                through AI-powered technology — bridging gaps in mental-health care
                with reliable, survivor-centered support that enhances well-being,
                restores dignity, and fosters survivors' reintegration into the community.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Theory of Change Section */}
      <section className="py-12 sm:py-20 bg-[#2C4A4E] relative overflow-hidden">
        {/* Decorative sparkles */}
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute hidden lg:block -rotate-6"
          style={{ inset: '20% auto auto 48%' }}
          width={70}
          height={70}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute"
          style={{ inset: '15% 5% auto auto' }}
          width={50}
          height={50}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute -rotate-6"
          style={{ inset: '20% auto auto 88%' }}
          width={70}
          height={70}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute rotate-12"
          style={{ inset: '20% auto auto 8%' }}
          width={70}
          height={70}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute rotate-45 z-30"
          style={{ inset: '75% 60% auto auto' }}
          width={70}
          height={70}
          priority
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white font-acme">Our Theory of Change</h2>
          </div>

          {/* Theory boxes layout */}
          <div className="relative min-h-[600px]">
            {/* Top Left - Radical Access */}
            <div className="absolute top-0 left-0 w-72 bg-[#F5F5DC] p-6 rounded-lg shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#E8F5E8] hover:shadow-2xl cursor-pointer group">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-[#4A9B8E] rounded-full flex items-center justify-center mr-3 group-hover:bg-[#2C4A4E] transition-colors duration-300">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#2C4A4E] font-acme text-sm group-hover:text-[#4A9B8E] transition-colors duration-300">Radical Access to Mental Health</h3>
              </div>
              <p className="text-xs text-[#2C4A4E] leading-relaxed font-acme group-hover:text-gray-700 transition-colors duration-300">
                When survivors are provided with instant, confidential, and culturally-sensitive digital mental health support (AI-powered chat + USSD for low-connectivity areas), they will seek help earlier, begin healing immediately, and reclaim their voice without fear of stigma or judgment. This ultimately breaks them free from the triple threat of unwanted pregnancies, new HIV infections, continued cycles of GBV, and deaths linked to untreated trauma.
              </p>
            </div>

            {/* Connecting line from top left to center */}
            <div className="absolute top-48 left-72 w-40 h-0.5 bg-[#4A9B8E]"></div>
            <div className="absolute top-48 left-[440px] w-0.5 h-24 bg-[#4A9B8E]"></div>

            {/* Top Right - Strong Referral */}
            <div className="absolute top-0 right-0 w-72 bg-[#F5F5DC] p-6 rounded-lg shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#E8F5E8] hover:shadow-2xl cursor-pointer group">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-[#4A9B8E] rounded-full flex items-center justify-center mr-3 group-hover:bg-[#2C4A4E] transition-colors duration-300">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#2C4A4E] font-acme text-sm group-hover:text-[#4A9B8E] transition-colors duration-300">Strong Referral Pathways</h3>
              </div>
              <p className="text-xs text-[#2C4A4E] leading-relaxed font-acme group-hover:text-gray-700 transition-colors duration-300">
                If survivors are seamlessly connected through HEAL to trusted medical, legal, and community-based services, then they will access comprehensive care, pursue justice, and be protected from further harm — breaking cycles of silence and impunity.
              </p>
            </div>

            {/* Connecting line from top right to center */}
            <div className="absolute top-48 right-72 w-40 h-0.5 bg-[#4A9B8E]"></div>
            <div className="absolute top-48 right-[440px] w-0.5 h-24 bg-[#4A9B8E]"></div>

            {/* Bottom Right - Survivor-Centered */}
            <div className="absolute bottom-0 right-0 w-72 bg-[#F5F5DC] p-6 rounded-lg shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#E8F5E8] hover:shadow-2xl cursor-pointer group">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-[#4A9B8E] rounded-full flex items-center justify-center mr-3 group-hover:bg-[#2C4A4E] transition-colors duration-300">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 11.5C15.8 12.3 16 13.4 16 14.5V22H14V16H10V22H8V14.5C8 13.4 8.2 12.3 9 11.5L12 8.5L15 11.5Z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[#2C4A4E] font-acme text-sm group-hover:text-[#4A9B8E] transition-colors duration-300">Survivor-Centered Systems Change</h3>
              </div>
              <p className="text-xs text-[#2C4A4E] leading-relaxed font-acme group-hover:text-gray-700 transition-colors duration-300">
                If survivors are seamlessly connected through HEAL to trusted medical, legal, and community-based services with case management using community systems like CHVs for robust survivor tracking and tracing, then they will access comprehensive care, pursue justice, and be protected from further harm — breaking cycles of silence and impunity.
              </p>
            </div>

            {/* Connecting line from bottom right to center */}
            <div className="absolute bottom-48 right-72 w-40 h-0.5 bg-[#4A9B8E]"></div>
            <div className="absolute bottom-48 right-[440px] w-0.5 h-24 bg-[#4A9B8E]"></div>

            {/* Center - Main Theory */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-[#2C4A4E] border-2 border-[#4A9B8E] p-6 rounded-lg shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#1A3A3E] hover:border-[#6BB6AB] hover:shadow-2xl cursor-pointer group">
              <p className="text-white leading-relaxed text-center font-acme text-sm group-hover:text-[#E8F5E8] transition-colors duration-300">
                When GBV survivors are provided with immediate, confidential, and culturally-sensitive access to mental health support coupled with strong and effective referral pathways - anytime, anywhere, without barriers, they reclaim their dignity and agency by reporting, healing and speaking against GBV, creating community resilience and awareness. At scale this generates survivor-driven data that powers evidence-based advocacy and policy reform in Kenya and across the continent, positioning Africa as a leader in bold, inclusive mental health and gender justice.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-[#FEF5E3] overflow-hidden">
        {/* Decorative Sunbursts */}
        <Image
          src="/images/decoration.png"
          alt="Decorative sunburst"
          className="absolute rotate-45 z-30"
          style={{ inset: '75% 60% auto auto' }}
          width={70}
          height={70}
          priority
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Title Section */}
          <div className="mb-12">
            <div className="w-12 h-[2px] bg-[#016A79] mb-4"></div>
            <h2 className="text-xl font-bold text-[#016A79] font-acme uppercase tracking-tight leading-none">
              What makes us
            </h2>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#016A79] font-acme uppercase tracking-tight">
              Different
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, index) => (
              <div
                key={index}
                className="bg-[#51AB3B40] p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col min-h-[400px]"
              >
                {/* Icon & Title Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-[#016A79] p-2 rounded-lg flex-shrink-0 border-b-2 border-[#51AB3B80] shadow-sm">
                    {card.icon}
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-[#016A79] border-b-2 border-[#51AB3B80] font-acme leading-snug">
                    {card.title}
                  </h3>
                </div>

                {/* Body Text */}
                <p className="text-xl lg:2xl text-[#555555] leading-relaxed font-normal font-acme">
                  {card.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the HEAL's team Section */}
      <section className="py-12 sm:py-16 bg-[#016A79] border-1 border-[#973939]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-[40px] font-bold text-white font-acme mb-4">
            Join the HEAL's team!
          </h2>
          <p className="text-white/90 text-base lg:text-lg mb-8 font-acme">
            Do you want to be part of Heal's team? click "join team"
          </p>
          <button className="bg-white text-2xl lg:text-[32px] text-[#2C4A4E] font-bold py-3 px-8 rounded-lg hover:bg-gray-100 hover:scale-105 hover:shadow-lg transition-all duration-300 font-acme transform active:scale-95">
            Join Team
          </button>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 sm:py-20 bg-[#FEF5E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#044750] font-acme mb-4">
              Gallery
            </h2>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {galleryImages.map((imageName, index) => (
              <div
                key={index}
                className="relative h-40 sm:h-48 overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => setLightboxIndex(index)}
              >
                <Image
                  src={`/images/${imageName}`}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
              </div>
            ))}
          </div>

          {/* Lightbox */}
          {lightboxIndex !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
              onClick={closeLightbox}
            >
              {/* Close */}
              <button
                className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/70 transition-colors"
                onClick={closeLightbox}
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Prev */}
              <button
                className="absolute left-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/70 transition-colors"
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              {/* Image */}
              <div
                className="relative w-[90vw] max-w-4xl h-[80vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={`/images/${galleryImages[lightboxIndex]}`}
                  alt={`Gallery image ${lightboxIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              </div>

              {/* Next */}
              <button
                className="absolute right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/70 transition-colors"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
                aria-label="Next image"
              >
                <ChevronRight className="w-7 h-7" />
              </button>

              {/* Counter */}
              <span className="absolute bottom-4 text-white/80 text-sm">
                {lightboxIndex + 1} / {galleryImages.length}
              </span>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}