'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Users,
  Phone,
  ArrowRight,
  Plus,
  CheckCircle,
  Bot,
  PhoneCall,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);


  // Pause audio when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Function to play audio
  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('Audio playback failed:', error);
        alert('Could not play audio. Check that /public/sounds/Heal_audio.mp3 exists and is a valid MP3 file.');
      });
    }
  };


  const values = [
    { title: 'Heal', content: '"You deserve healing — not shame. This is a safe space to begin."' },
    { title: 'Healing', content: '"Healing is not a moment. It\'s a journey — and you don\'t have to walk it alone."' },
    { title: 'Empowerment', content: '"We place survivors at the center — restoring voice, agency, and dignity."' },
    { title: 'Action', content: '"We turn support into action — connecting you to tools, people, and care that create real change."' },
    { title: 'Liberation', content: '"Liberation means freedom beyond the trauma — freedom to live fully, confidently, and joyfully."' }
  ];


  return (
    <div className="min-h-screen bg-[#FBE8DE]">
      <Navbar />

      {/* Hero Section */}
      <section
      className="relative min-h-screen flex flex-col justify-between bg-cover bg-center bg-no-repeat -mt-20"
      style={{ backgroundImage: 'url(/images/Hero-bg-image.png)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex items-center">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
          
          {/* Left: Illustration Image */}
          <div className={`w-full rounded-[100px] lg:w-1/2 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative w-full max-w-[400px] rounded-[100px] mx-auto">
              <Image
                src="/images/Heal-hero-section.png"
                alt="Heal Support Illustration"
                width={400}
                height={400}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>

          {/* Right: Text Content */}
          <div className={`w-full lg:w-1/2 text-center lg:text-left transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="flex flex-col gap-2">
              <span className="text-4xl md:text-5xl lg:text-6xl text-center font-acme font-normal text-[#333] uppercase tracking-tight">
                Welcome to Heal
              </span>
              <span className="text-3xl md:text-5xl font-acme font-normal text-[#6F8F7A] uppercase tracking-tight md:whitespace-nowrap md:-ml-8">
                Your Listening, Caring Partner
              </span>
            </h1>
            
            <p className="mt-6 text-base md:text-lg lg:text-xl font-medium text-[#4F5F5C] text-center font-acme max-w-2xl mx-auto lg:mx-0 leading-snug md:whitespace-nowrap">
              AI powered Mental health care and support anytime, anywhere. Immediate •<br className="hidden md:block" /> Confidential • Judgment-Free and Culturally-sensitive Care designed <br className="hidden md:block" />with you in mind.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {/* Primary Button */}
              <Link
                href="/auth/signup"
                className="bg-[#6F8F7A] hover:bg-[#6D7E73] text-white px-8 py-3 rounded-full flex items-center gap-2 transition-transform hover:scale-105 font-semibold text-xs lg:text-sm uppercase tracking-wider font-acme"
              >
                Begin at your pace
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Secondary Button */}
              <Link
                href="/crisis"
                className="bg-[#F9EBEB] border border-[#D97E7E] text-[#B34D4D] hover:bg-[#f3dede] px-8 py-3 rounded-full flex items-center gap-2 transition-transform hover:scale-105 font-semibold text-xs lg:text-sm uppercase tracking-wider font-acme"
              >
                <Plus className="h-4 w-4" />
                Immediate Help
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bar (White bar at the bottom) */}
      <div className="w-full bg-white/90 backdrop-blur-sm border-t border-gray-100 py-4 md:py-8 my-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm md:text-base text-center md:text-left font-medium font-acme">
            By clicking the arrow, you acknowledge and agree to our{" "}
            <Link href="/privacy-policy" className="text-[#056173] font-bold underline hover:text-[#0C444B]">
              Privacy Policy
            </Link>
            , and to activate your audio
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayAudio}
              className="bg-[#056173] hover:bg-[#0C444B] text-white rounded-full p-2.5 transition-all hover:scale-110 shadow-md"
              aria-label="Play audio"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <span className="text-gray-500 font-mono text-sm tracking-tighter">00:00 / 01:14:59</span>
          </div>
        </div>
        
        <audio ref={audioRef} src="/sounds/Heal_audio.mp3" preload="auto" />
      </div>
    </section>



      {/* Features Section */}
      <section id="features" className="relative py-20">
              <Image src="/images/decoration.png" alt="Decoration" 
                      className="absolute bottom-6 left-64 w-10 h-10 opacity-70 rotate-30"
                      width={20}
                      height={20}
                      priority />
              <Image src="/images/decoration.png" alt="Decoration" 
                      className="absolute -bottom-6 left-40 w-auto h-auto z-20"
                      width={100}
                      height={100}
                      priority />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-normal text-[#2F3A3A] font-acme">
              Comprehensive Mental Health Support
            </h2>
          </div>

          {/* Changed to 3 columns and added alignment classes */}
          <div className="grid grid-cols-1 gap-8 lg:gap-0 lg:grid-cols-3 items-center">
            
            {/* Card 1: Crisis Management */}
            <div className="bg-white rounded-3xl p-10 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group h-full">
              <div className="mb-8 transition-transform group-hover:scale-110 duration-300">
                <PhoneCall size={80} strokeWidth={1} className="text-[#333]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-4 uppercase tracking-tight font-acme">
                Crisis Management
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed font-medium font-acme">
                Immediate emergency response protocols with location-based services and direct connection to crisis professionals.
              </p>
            </div>

            {/* Card 2: AI - Powered Support (Featured Center Card) */}
            <div className="bg-[#007C85] rounded-3xl p-12 flex flex-col items-center text-center shadow-xl hover:shadow-2xl hover:-translate-y-4 transition-all duration-300 cursor-pointer lg:-mt-12 lg:mb-[-3rem] z-10 text-white min-h-[500px] justify-center">
              <div className="mb-8">
                <Bot size={100} strokeWidth={1} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight font-acme">
                AI - Powered Support
              </h3>
              <p className="text-teal-50/90 text-base leading-relaxed font-medium font-acme">
                Advanced AI companions provide 24/7 emotional support with personalized conversations and evidence-based therapeutic techniques.
              </p>
            </div>

            {/* Card 3: Privacy First */}
            <div className="bg-white rounded-3xl p-10 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group h-full">
              <div className="mb-8 transition-transform group-hover:scale-110 duration-300">
                <Shield size={80} strokeWidth={1} className="text-[#333]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-4 uppercase tracking-tight font-acme">
                Privacy First
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed font-medium font-acme">
                End-to-end encryption ensures your conversations remain completely private and secure with zero-knowledge architecture.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-16 sm:py-24 bg-[#E5EFEC] mb-20 overflow-hidden">
      {/* Decorative Sunbursts (Absolute positioned) */}
                <Image src="/images/decoration.png" alt="Decoration" 
                      className="absolute bottom-1/4 left-40 w-auto h-auto opacity-70 rotate-30"
                      width={40}
                      height={40}
                      priority />
                <Image src="/images/about-decorative-rectangle.png" alt="Decoration" 
                      className="absolute bottom-40 left-40 w-40 h-20 opacity-70 rotate-30 hidden lg:block"
                      width={40}
                      height={40}
                      priority />
              <Image src="/images/decoration.png" alt="Decoration" 
                      className="absolute -bottom-6 right-40 w-auto h-auto"
                      width={100}
                      height={100}
                      priority />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* Left Side: Image with rounded corners */}
          <div className="relative group">
            {/* The yellowish decorative box behind the image in figma */}
            <div className="absolute -bottom-6 -left-6 w-32 h-20 rounded-lg -z-10 hidden lg:block" />
            
            <div className="rounded-[3rem] overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
              <Image
                src="/images/about-image.png"
                alt="Happy people embracing"
                width={600}
                height={800}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="flex flex-col space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-normal text-[#2F3A3A] mb-6 font-acme leading-tight">
                Built by Mental Health Professionals
              </h2>
              <p className="text-base sm:text-lg text-[#4F5F5C] mb-8 leading-relaxed font-acme">
                Heal was created by a team of licensed therapists, AI researchers, and
                security experts to provide accessible, effective mental health support
                that prioritizes your privacy and safety.
              </p>
            </div>

            {/* Values List */}
            <div className="space-y-8">
              {values.map((item, index) => (
                <div key={index} className="flex flex-col space-y-1 border-l-4 border-[#000000]/80 pl-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-[#6F8F7A] font-acme uppercase tracking-wide">
                      {item.title}
                    </h3>
                    <CheckCircle2 className="h-5 w-5 text-[#4F5F5C] stroke-[1.5]" />
                  </div>
                  <p className="text-[#4A635D] text-base md:text-lg italic leading-relaxed font-acme">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  

      {/* Healing Without Barriers Section */}
      <section 
        className="py-16 sm:py-24 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: 'url(/images/home-no3.png)' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 font-acme">
              Healing Without Barriers
            </h2>
            <p className="text-lg sm:text-xl text-white mb-8 font-acme">
              Hope • Empowerment • Action • Love
            </p>
            <Link 
              href="/auth/signup" 
              className="text-black font-bold py-3 px-8 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 font-acme hover:bg-opacity-90" style={{backgroundColor: '#FEF0D3'}}
            >
              Lets Start Here
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="flex items-center justify-center w-full py-20 px-4">
        <div className="w-full max-w-7xl rounded-[20px] shadow-sm bg-gradient-to-r from-white to-[#e8f3ff] flex flex-col lg:flex-row items-center justify-between gap-10 px-8 lg:px-16 py-12">
          {/* LEFT CONTENT */}
          <div className="flex flex-col w-full align-center justify-end lg:w-1/2">
            <h2 className="font-acme text-[#2a4045] text-2xl lg:text-[34px] leading-[42px] mb-3">
              Sign up for our newsletter!
            </h2>
            <p className="font-acme text-[#6b7c93] text-base lg:text-lg leading-7 max-w-[480px]">
              Get notified about updates, join us in building a world where mental health care is accessible without barriers.
            </p>
          </div>

          {/* RIGHT FORM */}
          <form className="w-full lg:w-1/2 flex flex-col items-center gap-3 lg:gap-4">
            <input
              type="text"
              placeholder="Enter Your First Name"
              className="flex-1 w-full px-5 py-[14px] bg-white rounded-[25px] border border-[#ecf2f7] shadow-sm font-acme text-[#7a7a7a] focus:outline-none focus:ring-2 focus:ring-[#016a79]"
            />
            <input
              type="text"
              placeholder="Enter Your Last Name"
              className="flex-1 w-full px-5 py-[14px] bg-white rounded-[25px] border border-[#ecf2f7] shadow-sm font-acme text-[#7a7a7a] focus:outline-none focus:ring-2 focus:ring-[#016a79]"
            />
            <input
              type="email"
              placeholder="Enter Your Email"
              className="flex-1 w-full px-5 py-[14px] bg-white rounded-[25px] border border-[#ecf2f7] shadow-sm font-acme text-[#6b7c93] focus:outline-none focus:ring-2 focus:ring-[#016a79]"
            />
            <div className="flex w-full">
              <button
                type="submit"
                className="mt-2 ml-auto h-auto px-8 py-[13px] bg-[#1a1a1a] rounded-[25px] font-acme text-white text-sm uppercase tracking-[0.5px] hover:bg-[#333] transition-all"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
  
}