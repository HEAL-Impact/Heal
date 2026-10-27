"use client";

import React from 'react';
import { MapPin, Navigation, Mail, Phone } from 'lucide-react';
import { HEAL_EMAIL, HEAL_PHONE, HEAL_PHONE_DISPLAY } from '@/lib/contact';

// HEAL-Impact office. The map is located by this search query, so updating the
// address here moves the pin. Add a building or street for a more precise pin.
const OFFICE = {
  name: 'HEAL-Impact',
  addressLines: ['Holo', 'Kisumu, Kenya'],
  mapQuery: 'Holo, Kisumu, Kenya',
};

// Google's address embed needs no API key or extra JS, so it works in the static export.
const query = encodeURIComponent(OFFICE.mapQuery);
const embedUrl = `https://maps.google.com/maps?q=${query}&z=14&output=embed`;
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
const largerMapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

const Map = () => {
  return (
    <section className="bg-[#FAF3E7] px-6 lg:px-12 pb-16">
      <div className="relative max-w-6xl mx-auto overflow-hidden rounded-2xl shadow-lg border border-black/5">
        <iframe
          title={`Map showing the ${OFFICE.name} office in ${OFFICE.mapQuery}`}
          src={embedUrl}
          className="block w-full h-[420px] md:h-[500px] border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />

        <div className="md:absolute md:top-6 md:left-6 md:max-w-xs bg-white/95 backdrop-blur p-6 md:rounded-xl md:shadow-xl">
          <h3 className="flex items-center gap-2 font-acme text-xl text-brand-primary mb-2">
            <MapPin className="w-5 h-5 shrink-0" aria-hidden="true" />
            Our Location
          </h3>
          <address className="not-italic text-gray-700 text-sm leading-6 mb-3">
            <span className="font-semibold">{OFFICE.name}</span>
            {OFFICE.addressLines.map((line) => (
              <React.Fragment key={line}>
                <br />
                {line}
              </React.Fragment>
            ))}
          </address>
          <a
            href={`mailto:${HEAL_EMAIL}`}
            className="flex items-center gap-2 text-sm text-brand-teal hover:underline mb-1"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            {HEAL_EMAIL}
          </a>
          <a
            href={`tel:${HEAL_PHONE}`}
            className="flex items-center gap-2 text-sm text-brand-teal hover:underline mb-4"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            {HEAL_PHONE_DISPLAY}
          </a>
          <div className="flex flex-wrap gap-2">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-accent text-white text-sm font-acme px-4 py-2 rounded-full transition-colors"
            >
              <Navigation className="w-4 h-4" aria-hidden="true" />
              Get directions
            </a>
            <a
              href={largerMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-acme px-4 py-2 rounded-full border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
            >
              View larger map
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Map;
