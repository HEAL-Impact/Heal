'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';

export default function AboutPage() {
  const cards = [
    {
      title: "Radical Accessibility",
      content: "24/7 confidential support via AI chat and USSD — even in low-connectivity areas. Survivors can access help immediately, when they need it most.",
      icon: Clock,
    },
    {
      title: "Survivor-Centered & Survivor-Built",
      content: "HEAL is designed with survivors — not for them. Every feature, from AI support to referrals, prioritizes dignity, empathy, and safety.",
      icon: Users,
    },
    {
      title: "Trust & Integrity Through Innovation",
      content: "Secure, transparent case coordination powered by technology. We strengthen accountability across medical, legal, and community systems.",
      icon: ShieldCheck,
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBE8DE]">

      <Navbar />
      {/* Hero section */}
      <section
        className="relative lg:h-[66.66666667vh] pt-28 pb-12 lg:pt-20 lg:pb-0 overflow-hidden flex items-center -mt-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/Hero-bg-image.png)' }}
      >

        {/* Decorative Sunbursts */}
        <Image
          src="/images/decoration.png"
          alt=""
          aria-hidden="true"
          className="absolute"
          style={{ inset: '15% 5% auto 50%' }}
          width={50}
          height={50}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt=""
          aria-hidden="true"
          className="absolute hidden lg:block -rotate-6"
          style={{ inset: '20% auto auto 48%' }}
          width={70}
          height={70}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt=""
          aria-hidden="true"
          className="absolute"
          style={{ inset: '15% 5% auto auto' }}
          width={50}
          height={50}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt=""
          aria-hidden="true"
          className="absolute -rotate-6"
          style={{ inset: '20% auto auto 88%' }}
          width={70}
          height={70}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt=""
          aria-hidden="true"
          className="absolute rotate-12"
          style={{ inset: '20% auto auto 8%' }}
          width={70}
          height={70}
          priority
        />
        <Image
          src="/images/decoration.png"
          alt=""
          aria-hidden="true"
          className="absolute rotate-45 z-30"
          style={{ inset: '75% 60% auto auto' }}
          width={70}
          height={70}
          priority
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10" >
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-2 md:gap-8">

            {/* Left: Text Content */}
            <div className="text-center lg:text-left space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6F8F7A]">
                Who we are
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-acme font-normal text-[#333] uppercase tracking-tight">
                About Us
              </h1>
              <p className="lg:max-w-md mx-auto lg:mx-0 text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-[#4F5F5C] whitespace-pre-line">
                HEAL is an AI-powered mental health support platform
                providing confidential, culturally-sensitive care for survivors
                of SGBV — anytime, anywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/anonymous"
                  className="bg-[#6F8F7A] hover:bg-[#6D7E73] text-white px-8 py-3 rounded-full transition-transform hover:scale-105 font-semibold text-xs lg:text-sm uppercase tracking-wider font-acme text-center"
                >
                  Talk to Nia anonymously
                </Link>
                <Link
                  href="/services"
                  className="bg-white/70 border border-[#6F8F7A] text-[#4F5F5C] hover:bg-white px-8 py-3 rounded-full transition-transform hover:scale-105 font-semibold text-xs lg:text-sm uppercase tracking-wider font-acme text-center"
                >
                  Our services
                </Link>
              </div>
            </div>

            {/* Right: Cutout Image Positioned at the bottom */}
            <div className="relative h-full flex justify-center lg:justify-end items-end">
              <div className="relative w-full max-w-[350px] rounded-[100px] mx-auto">
                <Image
                  src="/images/about-hero-women.png"
                  alt="Two women sharing a supportive embrace"
                  width={400}
                  height={400}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Our Vision */}
      <section className="relative py-20 overflow-hidden">
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
              <p className="text-base lg:text-lg text-gray-800 text-[#363636] leading-relaxed font-medium max-w-md pl-20">
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
              <p className="text-base lg:text-lg text-gray-800 leading-relaxed font-medium text-right max-w-lg pr-20">
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
              <p className="text-xs text-[#2C4A4E] leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
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
              <p className="text-xs text-[#2C4A4E] leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
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
              <p className="text-xs text-[#2C4A4E] leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                If survivors are seamlessly connected through HEAL to trusted medical, legal, and community-based services with case management using community systems like CHVs for robust survivor tracking and tracing, then they will access comprehensive care, pursue justice, and be protected from further harm — breaking cycles of silence and impunity.
              </p>
            </div>

            {/* Connecting line from bottom right to center */}
            <div className="absolute bottom-48 right-72 w-40 h-0.5 bg-[#4A9B8E]"></div>
            <div className="absolute bottom-48 right-[440px] w-0.5 h-24 bg-[#4A9B8E]"></div>

            {/* Center - Main Theory */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-[#2C4A4E] border-2 border-[#4A9B8E] p-6 rounded-lg shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#1A3A3E] hover:border-[#6BB6AB] hover:shadow-2xl cursor-pointer group">
              <p className="text-white leading-relaxed text-center text-sm group-hover:text-[#E8F5E8] transition-colors duration-300">
                When GBV survivors are provided with immediate, confidential, and culturally-sensitive access to mental health support coupled with strong and effective referral pathways - anytime, anywhere, without barriers, they reclaim their dignity and agency by reporting, healing and speaking against GBV, creating community resilience and awareness. At scale this generates survivor-driven data that powers evidence-based advocacy and policy reform in Kenya and across the continent, positioning Africa as a leader in bold, inclusive mental health and gender justice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="relative py-16 sm:py-24 bg-[#E5EFEC] overflow-hidden">
        <Image
          src="/images/decoration.png"
          alt=""
          aria-hidden="true"
          className="absolute rotate-45"
          style={{ inset: '75% 60% auto auto' }}
          width={70}
          height={70}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-normal text-[#2F3A3A] font-acme">
              What Makes Us Different
            </h2>
          </div>

          {/* Same card style as the home page features; the middle card is featured. */}
          <div className="grid grid-cols-1 gap-8 lg:gap-0 lg:grid-cols-3 items-center">
            {cards.map(({ title, content, icon: Icon }, index) =>
              index === 1 ? (
                <div
                  key={title}
                  className="bg-[#007C85] rounded-3xl p-12 flex flex-col items-center text-center shadow-xl hover:shadow-2xl hover:-translate-y-4 transition-all duration-300 lg:-mt-12 lg:mb-[-3rem] z-10 text-white min-h-[500px] justify-center"
                >
                  <div className="mb-8">
                    <Icon size={100} strokeWidth={1} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight font-acme">{title}</h3>
                  <p className="text-teal-50/90 text-base leading-relaxed font-medium">{content}</p>
                </div>
              ) : (
                <div
                  key={title}
                  className="bg-white rounded-3xl p-10 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group h-full"
                >
                  <div className="mb-8 transition-transform group-hover:scale-110 duration-300">
                    <Icon size={80} strokeWidth={1} className="text-[#333]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-4 uppercase tracking-tight font-acme">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-medium">{content}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Join the HEAL's team Section */}
      <section className="py-12 sm:py-16 bg-[#016A79] border-1 border-[#973939]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-[40px] font-bold text-white font-acme mb-4">
            Join the HEAL's team!
          </h2>
          <p className="text-white/90 text-base lg:text-lg mb-8">
            Do you want to be part of Heal's team? click "join team"
          </p>
          <button className="bg-white text-2xl lg:text-[32px] text-[#2C4A4E] font-bold py-3 px-8 rounded-lg hover:bg-gray-100 hover:scale-105 hover:shadow-lg transition-all duration-300 font-acme transform active:scale-95">
            Join Team
          </button>
        </div>
      </section>

      <Gallery />

      <Footer />
    </div>
  );
}