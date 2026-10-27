"use client";

import { useState } from 'react';
import { FaTwitter, FaLinkedin } from 'react-icons/fa';
import { HEAL_LINKEDIN_URL } from '@/lib/social';
import { HEAL_EMAIL, HEAL_PHONE, HEAL_PHONE_DISPLAY } from '@/lib/contact';

export function Contact() {
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
    alert('Form submitted!'); 
  };

  return (
    <section className="bg-[#FAF3E7] min-h-[400px] flex justify-center px-12 py-10">
      {/* Left Side: Contact Info */}
      <div className="w-1/3 pr-8 flex flex-col">
        <h2 className="text-[#0D474A] font-semibold text-xl mb-6 font-acme">Contact Us</h2>

        <div className="mb-4">
          <h3 className="text-xs font-bold text-black/80 mb-1 font-acme">GET IN TOUCH</h3>
          <a href={`mailto:${HEAL_EMAIL}`} className="block text-gray-600 hover:text-[#0D474A] text-sm mb-1">{HEAL_EMAIL}</a>
          <a href={`tel:${HEAL_PHONE}`} className="block text-gray-600 hover:text-[#0D474A] text-sm mb-4">{HEAL_PHONE_DISPLAY}</a>
          <div className="flex space-x-6 text-[#0D474A] text-2xl">
            <a href={HEAL_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="Twitter: opens HEAL-Impact on LinkedIn in a new tab" title="HEAL-Impact on LinkedIn">
              <FaTwitter />
            </a>
            <a href={HEAL_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn: opens HEAL-Impact on LinkedIn in a new tab" title="HEAL-Impact on LinkedIn">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>

      {/* Right Side: Contact Form */}
      <div className="w-2/3 max-w-2xl pl-8">
        <h2 className="text-[#0D474A] font-semibold mb-4 font-acme text-xl">Send Us A Message</h2>
        <p className="mb-6 text-gray-600 text-sm">
          Kindly fill the form below for all enquiries and our team will get in touch with you.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D474A]"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D474A]"
              required
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D474A]"
            required
          />
          <textarea
            name="message"
            placeholder="Enter Your Message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className="w-full px-3 py-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D474A]"
            required
          ></textarea>
          <button
            type="submit"
            className="bg-[#0D474A] text-white px-6 py-2 rounded hover:bg-[#0B3B3E] transition font-semibold font-acme"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
}
