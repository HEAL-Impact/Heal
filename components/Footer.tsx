'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
  PodcastIcon,
} from 'lucide-react';
import { HEAL_LINKEDIN_URL } from '@/lib/social';
import { HEAL_EMAIL, HEAL_PHONE, HEAL_PHONE_DISPLAY } from '@/lib/contact';

const quickLinks = [
  { label: 'About Heal', href: '/about' },
  { label: 'We Listen – Safe Space', href: '/anonymous' },
  // { label: 'Chat Anonymously – Chat Space', href: '/anonymous' },
  { label: 'Report - Seek Help', href: '/report' },
  { label: 'Get In Touch', href: '/contact' },
];

const socialIcons = [
  { Icon: FacebookIcon, label: 'Facebook', href: HEAL_LINKEDIN_URL },
  { Icon: TwitterIcon, label: 'Twitter', href: HEAL_LINKEDIN_URL },
  { Icon: InstagramIcon, label: 'Instagram', href: HEAL_LINKEDIN_URL },
  { Icon: LinkedinIcon, label: 'LinkedIn', href: HEAL_LINKEDIN_URL },
  { Icon: YoutubeIcon, label: 'YouTube', href: HEAL_LINKEDIN_URL },
  { Icon: PodcastIcon, label: 'Podcast', href: HEAL_LINKEDIN_URL },
];

export default function Footer() {
  return (
    <footer className="flex flex-col items-center w-full bg-brand-primary">
      {/* Main Footer Content */}
      <div className="w-full w-auto lg:max-w-[1280px] px-6 lg:px-8 pt-[65px] pb-[15px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Tagline - Column 1 */}
          <div className="col-span-1 lg:col-span-1 flex flex-col items-center">
            <div className="flex flex-col items-center -mt-6 w-full">
              <Link href="/" className="group transition-all duration-300 hover:scale-105">
                <Image
                  src="/images/heal-impact-logo-light.png"
                  alt="HEAL-Impact"
                  width={240}
                  height={61}
                  className="w-60 h-auto my-8 group-hover:opacity-90 transition-opacity duration-300"
                  priority
                />
              </Link>
            </div>
            <div className="flex flex-col text-[#b0b8b8] text-sm text-center leading-7">
              <p className="">
                Navigating Mental Health Care with your <br />Listening, Caring Partner
                <br /> Anytime, Anywhere
              </p>
            </div>
          </div>

          {/* Quick Links - Column 2 */}
          <nav className="col-span-1 lg:col-span-1 flex flex-col items-start">
            <div className="w-full">
              <h3 className="font-acme text-white text-[17px] tracking-[0] leading-7 whitespace-nowrap">
                QUICK LINKS
              </h3>
            </div>

            <ul className="flex flex-col items-start pt-1 pb-3.5 w-full space-y-1">
              {quickLinks.map((link, index) => (
                <li key={index} className="flex flex-col items-start w-full">
                  <a
                    href={link.href}
                    className="text-[#9ca3a3] text-sm tracking-[0] leading-7 whitespace-nowrap hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Get In Touch */}
          <div className="w-full lg:w-[285px] flex flex-col items-start">
            <div className="flex flex-col items-start pb-5 w-full">
              <h3 className="font-acme text-white text-lg tracking-[0] leading-7 whitespace-nowrap">
                GET IN TOUCH
              </h3>
            </div>

            <address className="flex flex-col items-start w-full not-italic">
              <div className="flex flex-col items-start w-full">
                <div className="flex flex-col text-[#b0b8b8] text-sm tracking-[0] leading-7">
                  <a href={`mailto:${HEAL_EMAIL}`} className="hover:text-white transition-colors">
                    {HEAL_EMAIL}
                  </a>
                  <a href={`tel:${HEAL_PHONE}`} className="hover:text-white transition-colors">
                    {HEAL_PHONE_DISPLAY}
                  </a>
                </div>
              </div>
            </address>
          </div>

          {/* Subscribe & Follow */}
          <div className="w-full lg:w-[285px] flex flex-col items-start">
            <div className="flex flex-col items-start pb-5 w-full">
              <h3 className="font-acme text-white text-[17px] tracking-[0] leading-7 whitespace-nowrap">
                SUBSCRIBE &amp; FOLLOW US
              </h3>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-3 gap-2 w-full">
                {socialIcons.map(({ Icon, label, href }, index) => (
                  <a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label}: opens HEAL-Impact on LinkedIn in a new tab`}
                    title="HEAL-Impact on LinkedIn"
                    className="flex items-start text-white hover:text-[#b0b8b8] transition-colors p-2"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full max-w-[1280px] px-6 lg:px-8">
        <div className="border-t border-[#c9d0d8] my-2.5" />
      </div>

      {/* Copyright */}
      <div className="w-full max-w-[1280px] px-6 lg:px-8 pb-[30px]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center py-2.5">
            <p className="text-[#6b7280] text-base tracking-[0] leading-7 whitespace-nowrap">
              Copyright © 2025 Heal.org – All Rights Reserved.
            </p>
          </div>

          <div className="flex items-center gap-4 py-2.5">
            <Link 
              href="/privacy" 
              className="text-[#6b7280] hover:text-white text-base tracking-[0] leading-7 whitespace-nowrap transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-[#6b7280]">|</span>
            <p className="text-[#6b7280] text-base tracking-[0] leading-7 whitespace-nowrap">
              Powered by Heal.Org
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

