"use client";

import { useState } from 'react';
import { FaTwitter, FaLinkedin } from 'react-icons/fa';
import { HEAL_LINKEDIN_URL } from '@/lib/social';
import { HEAL_EMAIL, HEAL_PHONE, HEAL_PHONE_DISPLAY } from '@/lib/contact';
import { useLang } from '@/lib/i18n';

export function Contact() {
  const { tr } = useLang();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Add your form submission logic here
    // The form isn't connected to a mailbox yet, so say so rather than pretend it was sent.
    alert(tr(`Thank you. Online messages aren't connected yet, so please email us at ${HEAL_EMAIL}.`, `Asante. Ujumbe wa mtandaoni bado haujaunganishwa, kwa hivyo tafadhali tutumie barua pepe kupitia ${HEAL_EMAIL}.`));
  };

  return (
    <section className="bg-[#ECE5DA] min-h-[400px] flex justify-center px-12 py-10">
      {/* Left Side: Contact Info */}
      <div className="w-1/3 pr-8 flex flex-col">
        <h2 className="text-[#2C4A4E] font-semibold text-xl mb-6 font-acme">{tr("Contact Us", "Wasiliana Nasi")}</h2>

        <div className="mb-4">
          <h3 className="text-xs font-bold text-black/80 mb-1 font-acme">{tr("GET IN TOUCH", "WASILIANA NASI")}</h3>
          <a href={`mailto:${HEAL_EMAIL}`} className="block text-gray-600 hover:text-[#2C4A4E] text-sm mb-1">{HEAL_EMAIL}</a>
          <a href={`tel:${HEAL_PHONE}`} className="block text-gray-600 hover:text-[#2C4A4E] text-sm mb-4">{HEAL_PHONE_DISPLAY}</a>
          <div className="flex space-x-6 text-[#2C4A4E] text-2xl">
            <a href={HEAL_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label={tr("Twitter: opens HEAL-Impact on LinkedIn in a new tab", "Twitter: inafungua HEAL-Impact kwenye LinkedIn katika kichupo kipya")} title={tr("HEAL-Impact on LinkedIn", "HEAL-Impact kwenye LinkedIn")}>
              <FaTwitter />
            </a>
            <a href={HEAL_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label={tr("LinkedIn: opens HEAL-Impact on LinkedIn in a new tab", "LinkedIn: inafungua HEAL-Impact kwenye LinkedIn katika kichupo kipya")} title={tr("HEAL-Impact on LinkedIn", "HEAL-Impact kwenye LinkedIn")}>
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>

      {/* Right Side: Contact Form */}
      <div className="w-2/3 max-w-2xl pl-8">
        <h2 className="text-[#2C4A4E] font-semibold mb-4 font-acme text-xl">{tr("Send Us A Message", "Tutumie Ujumbe")}</h2>
        <p className="mb-6 text-gray-600 text-sm">
          {tr("Kindly fill the form below for all enquiries and our team will get in touch with you.", "Tafadhali jaza fomu hii kwa maswali yoyote na timu yetu itawasiliana nawe.")}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              name="firstName"
              placeholder={tr("First Name", "Jina la Kwanza")}
              value={formData.firstName}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C4A4E]"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder={tr("Last Name", "Jina la Mwisho")}
              value={formData.lastName}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C4A4E]"
              required
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder={tr("Email", "Barua pepe")}
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C4A4E]"
            required
          />
          <textarea
            name="message"
            placeholder={tr("Enter Your Message", "Andika Ujumbe Wako")}
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C4A4E]"
            required
          ></textarea>
          <button
            type="submit"
            className="bg-[#2C4A4E] text-white px-6 py-2 rounded hover:bg-[#0B3B3E] transition font-semibold font-acme"
          >
            {tr("Submit", "Tuma")}
          </button>
        </form>
      </div>
    </section>
  );
}
