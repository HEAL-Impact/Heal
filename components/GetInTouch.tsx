import Image from "next/image";
import { Facebook, Twitter, Linkedin, Youtube, Instagram, MessageCircle } from 'lucide-react';
import { HEAL_LINKEDIN_URL } from '@/lib/social';
import { HEAL_EMAIL, HEAL_PHONE, HEAL_PHONE_DISPLAY } from '@/lib/contact';

export function GetInTouch() {
  return (
    <section className="relative min-h-[500px] flex items-center justify-center bg-[#222] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/Contactbg.png"
          alt="Contact background"
          className="object-cover w-full h-full opacity-80"
          fill
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        <h1 className="text-white font-extrabold font-acme text-[4rem] md:text-[5rem] text-center drop-shadow-lg">
          Get In Touch
        </h1>
        <p className="text-white text-lg text-center mt-2 font-semibold max-w-xl">
          We love hearing from you, and we take your feedback very seriously.
          <br />
          Email us at{" "}
          <a href={`mailto:${HEAL_EMAIL}`} className="font-bold hover:underline">{HEAL_EMAIL}</a>
          {" "}or call{" "}
          <a href={`tel:${HEAL_PHONE}`} className="font-bold hover:underline whitespace-nowrap">{HEAL_PHONE_DISPLAY}</a>
        </p>
        <div className="mt-8 text-white text-xl font-semibold text-center font-acme">
          Subscribe To Our Socials:
        </div>
        <div className="flex flex-wrap justify-center gap-5 mt-6">
          {/* Social Buttons */}
          {[
            { icon: <Facebook className="w-5 h-5" />, label: "Facebook", url: HEAL_LINKEDIN_URL },
            { icon: <Twitter className="w-5 h-5" />, label: "Twitter", url: HEAL_LINKEDIN_URL },
            { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn", url: HEAL_LINKEDIN_URL },
            { icon: <Youtube className="w-5 h-5" />, label: "YouTube", url: HEAL_LINKEDIN_URL },
            { icon: <Instagram className="w-5 h-5" />, label: "Instagram", url: HEAL_LINKEDIN_URL },
            { icon: <MessageCircle className="w-5 h-5" />, label: "WhatsApp", url: HEAL_LINKEDIN_URL },
          ].map(({ icon, label, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#444b50] text-white rounded-full p-3 shadow-md hover:bg-[#666] transition-all hover:scale-110"
              aria-label={`${label}: opens HEAL-Impact on LinkedIn in a new tab`}
              title="HEAL-Impact on LinkedIn"
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}