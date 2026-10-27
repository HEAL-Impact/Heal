'use client';

import { useState, useEffect } from 'react';
import {
  Heart,
  Shield,
  Menu,
  X,
  AlertTriangle,
  Phone,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import NextImage from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


export default function ReportPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [formData, setFormData] = useState({
    incidentType: '',
    urgencyLevel: '',
    description: '',
    submitAnonymously: false,
    phoneNumber: '',
    contactPreference: '',
  });
  // Store submitted data for modal display before clearing form
  const [submittedData, setSubmittedData] = useState({
    submitAnonymously: false,
    phoneNumber: '',
    contactPreference: '',
  });

  // Get user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      console.log('Requesting location permission...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Location granted:', position.coords);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.log('Geolocation not supported by browser');
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showCountdownModal && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showCountdownModal, countdown]);

  // Format countdown time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mask phone number to show only last 3 digits
  const maskPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, ''); // Remove non-digit characters
    const lastThree = digits.slice(-3);
    return `(•••) •••-${lastThree}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    console.log('Form submitted:', {
      ...formData,
      location: userLocation
    });

    // Save submitted data for modal display
    setSubmittedData({
      submitAnonymously: formData.submitAnonymously,
      phoneNumber: formData.phoneNumber,
      contactPreference: formData.contactPreference,
    });

    // Reset countdown and show modal
    setCountdown(300);
    setShowCountdownModal(true);

    // Reset form data immediately after submission to improve anonymity
    setFormData({
      incidentType: '',
      urgencyLevel: '',
      description: '',
      submitAnonymously: false,
      phoneNumber: '',
      contactPreference: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleModalClose = (open: boolean) => {
    setShowCountdownModal(open);
    // If modal is being closed, ensure all data is cleared for anonymity
    if (!open) {
      setFormData({
        incidentType: '',
        urgencyLevel: '',
        description: '',
        submitAnonymously: false,
        phoneNumber: '',
        contactPreference: '',
      });
      setSubmittedData({
        submitAnonymously: false,
        phoneNumber: '',
        contactPreference: '',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF5E3] flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative min-h-[calc(100vh-10rem)]">
          {/* Decoration elements - positioned relative to the main content area */}
          <div className="absolute z-10 w-full h-full pointer-events-none">
            {/* Top left */}
            <div className="absolute top-[5%] left-[5%] transform -rotate-12">
              <NextImage
                src="/images/decoration.png"
                alt=""
                width={64}
                height={64}
                className="w-12 sm:w-20 sm:h-20"
                priority
              />
            </div>

            {/* Top right */}
            <div className="absolute top-[15%] right-[5%] transform rotate-25">
              <NextImage
                src="/images/decoration.png"
                alt=""
                width={80}
                height={80}
                className="w-18 h-18 sm:w-20 sm:h-20"
                priority
              />
            </div>

            {/* Middle left */}
            <div className="absolute top-[40%] left-[3%] transform -rotate-15">
              <NextImage
                src="/images/decoration.png"
                alt=""
                width={72}
                height={72}
                className="w-18 h-18 sm:w-20 sm:h-20"
                priority
              />
            </div>

            {/* Middle right */}
            <div className="absolute bottom-[30%] right-[5%] transform rotate-15">
              <NextImage
                src="/images/decoration.png"
                alt=""
                width={64}
                height={64}
                className="w-18 h-18 sm:w-20 sm:h-20"
                priority
              />
            </div>

            {/* Bottom center */}
            <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 transform rotate-12">
              <NextImage
                src="/images/decoration.png"
                alt=""
                width={56}
                height={56}
                className="w-18 h-18 sm:w-20 sm:h-20"
                priority
              />
            </div>
          </div>

          {/* Header */}
          <div className="relative z-20 text-center mb-8">
            <h1 className="font-acme text-[72px] sm:text-5xl font-bold text-brand-primary mb-4">
              Report A Case
            </h1>
            <p className="font-acme text-[48px] mb-2 text-black">
              Your safety and privacy are our priority.
            </p>
            <p className="font-acme text-[48px] text-black whitespace-nowrap">
              Submit a detailed report about any GBV incident.
            </p>
          </div>



          {/* Emergency Situation Alert */}
          <div className="relative z-20 bg-transparent p-6 pt-0 mb-8 ml-14">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-acme text-[24px] text-red-900">Emergency Situation?</h3>
                  <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                </div>
                <p className="text-[20px] font-acme text-red-800 mb-4">
                  If you are in immediate danger, please contact emergency services immediately.
                </p>
                <div className="flex justify-center justify-space-between items-center flex-wrap gap-20">
                  <a
                    href="tel:911"
                    className="w-[30%] justify-center bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-acme text-[20px] transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2"
                  >
                    <Phone className="h-18 w-18" />
                    Call 911
                  </a>
                  <a
                    href="tel:1195"
                    className="w-[40%] justify-center bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-acme text-[20px] transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2"
                  >
                    <Phone className="h-18 w-18" />
                    Call GBV Hotline: 1195
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Report Form */}
          <div className="relative z-20 bg-transparent p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-6">
              <Shield className="h-18 w-18 text-brand-teal flex-shrink-0 mt-1" strokeWidth={3} />
              <div>
                <h2 className="font-acme text-xl text-brand-primary mb-1">Incident Report Form</h2>
                <p className="text-xl font-acme text-brand-secondary">
                  Please provide as much detail as possible. All information is confidential.
                </p>
              </div>
            </div>

            {/* Location Status Indicator */}
            <div className="mb-4">
              {userLocation ? (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                  <MapPin className="h-4 w-4" />
                  <span className="">Location detected - Your report will include location data to help authorities</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <MapPin className="h-4 w-4" />
                  <span className="">Location not available - Please enable location services for better assistance</span>
                </div>
              )}
            </div>

            {/* Anonymous Submission Toggle */}
            <div className="bg-brand-teal rounded-lg p-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="submitAnonymously"
                  checked={formData.submitAnonymously}
                  onChange={handleChange}
                  className="w-5 h-5 text-brand-teal border-brand-teal/30 rounded focus:ring-brand-teal"
                />
                <span className="text-black text-lg">Submit this report anonymously</span>
              </label>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Incident Information Section */}
              <div>
                <h3 className="font-acme text-lg text-brand-teal mb-4">Incident Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Type of Incident */}
                  <div>
                    <label className="block text-lg font-medium text-brand-primary mb-2">
                      Type of Incident <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="incidentType"
                      value={formData.incidentType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-[#ECF5F7]  border border-brand-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent text-brand-primary"
                    >
                      <option value="">Select incident type</option>
                      <option value="physical">Physical Violence</option>
                      <option value="sexual">Sexual Violence</option>
                      <option value="emotional">Emotional Abuse</option>
                      <option value="financial">Financial Abuse</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Urgency Level */}
                  <div>
                    <label className="block text-lg font-medium text-brand-primary mb-2">
                      Urgency Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="urgencyLevel"
                      value={formData.urgencyLevel}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-[#ECF5F7] border border-brand-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent text-brand-primary"
                    >
                      <option value="">Select urgency level</option>
                      <option value="low">Low - Past incident</option>
                      <option value="medium">Medium - Ongoing concern</option>
                      <option value="high">High - Recent incident</option>
                      <option value="critical">Critical - Immediate danger</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-lg font-medium text-brand-primary mb-2">
                    Description of Incident <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Please tell us more about the incident"
                    className="w-full px-4 py-3 bg-[#ECF5F7] border border-brand-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent resize-none text-brand-primary placeholder:text-brand-gray"
                  />
                </div>
              </div>

              {/* Contact Section */}
              {!formData.submitAnonymously && (
                <div>
                  <h3 className="font-acme text-lg text-brand-teal mb-4">Contact Information</h3>
                  <p className="text-lg text-brand-secondary mb-4">
                    Provide your contact details so we can reach you for immediate support.
                  </p>

                  <div className="space-y-4">
                    {/* Phone Number */}
                    <div>
                      <label className="block text-lg font-medium text-brand-primary mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required={!formData.submitAnonymously}
                        placeholder="e.g., +254 712 345 678"
                        className="w-full px-4 py-2 bg-[#ECF5F7] border border-brand-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent text-brand-primary placeholder:text-brand-gray"
                      />
                    </div>

                    {/* Contact Preference */}
                    <div>
                      <label className="block text-lg font-medium text-brand-primary mb-2">
                        Preferred Contact Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="contactPreference"
                        value={formData.contactPreference}
                        onChange={handleChange}
                        required={!formData.submitAnonymously}
                        className="w-full px-4 py-2 bg-[#ECF5F7] border border-brand-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent text-brand-primary"
                      >
                        <option value="">Select contact preference</option>
                        <option value="call">Call me - I&apos;m comfortable with a phone call</option>
                        <option value="text">Text me - I prefer text messages</option>
                        <option value="both">Either call or text - I&apos;m comfortable with both</option>
                      </select>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Phone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800">
                          Our support team will contact you within 5 minutes using your preferred method to provide immediate assistance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-4 border-t border-brand-light">
                <div className="flex items-center gap-2 text-sm text-brand-secondary">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>All reports are encrypted and secure</span>
                </div>
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-accent text-white px-8 py-3 rounded-full font-acme text-base transition-all shadow-md hover:shadow-lg hover:scale-105"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer - Same as landing page */}
      <Footer />

      {/* Countdown Modal */}
      <Dialog open={showCountdownModal} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="font-acme text-2xl text-brand-primary flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Report Submitted Successfully
            </DialogTitle>
            <DialogDescription className="text-base text-brand-secondary pt-2">
              Your safety is our priority. Our support team has been notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Countdown Display - Only for non-anonymous submissions */}
            {!submittedData.submitAnonymously && (
              <>
                <div className="bg-gradient-to-br from-brand-teal/20 to-brand-primary/10 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Clock className="h-6 w-6 text-brand-primary animate-pulse" />
                    <p className="text-lg text-brand-primary">
                      Expected Contact Time
                    </p>
                  </div>
                  <div className="text-5xl font-bold text-brand-primary font-mono">
                    {formatTime(countdown)}
                  </div>
                  <p className="text-sm text-brand-secondary mt-2">
                    minutes remaining
                  </p>
                </div>

                {/* Confirmation Details */}
                {submittedData.phoneNumber && (
                  <div className="w-full bg-gray-50 rounded-lg p-4 mt-4 text-center">
                    <p className="text-slate-600 text-sm">
                      We will contact you at{' '}
                      <span className="font-semibold text-slate-800">{maskPhoneNumber(submittedData.phoneNumber)}</span> via{' '}
                      <span className="font-semibold text-slate-800">
                        {submittedData.contactPreference === 'call' && 'Phone Call'}
                        {submittedData.contactPreference === 'text' && 'Text Message'}
                        {submittedData.contactPreference === 'both' && 'Phone Call or Text Message'}
                      </span>.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Anonymous Submission Confirmation */}
            {submittedData.submitAnonymously && (
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Shield className="h-8 w-8 text-brand-teal" />
                </div>
                <h3 className="font-acme text-xl text-brand-primary font-semibold mb-2">
                  Anonymous Report Received
                </h3>
                <p className="text-sm text-brand-secondary">
                  Your report has been securely submitted. Your identity and location are protected.
                </p>
              </div>
            )}

            {/* What Happens Next */}
            <div className="space-y-3">
              <h4 className="font-acme text-lg text-brand-primary font-semibold">
                What happens next:
              </h4>
              {submittedData.submitAnonymously ? (
                <ul className="space-y-2 text-sm text-brand-secondary">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="">Your report has been securely submitted and encrypted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="">Your location has been recorded to help local authorities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="">A trained support specialist is reviewing your case</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="">Resources and support are available through our platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="">Your identity remains completely anonymous</span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-2 text-sm text-brand-secondary">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="">Your report has been securely submitted and encrypted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="">Your location has been recorded to help local authorities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="">A trained support specialist is reviewing your case</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="">You will be contacted within 5 minutes for immediate assistance</span>
                  </li>
                </ul>
              )}
            </div>

            {/* Emergency Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    In Immediate Danger?
                  </p>
                  <p className="text-sm text-red-800 mb-2">
                    If you are in immediate danger, please call emergency services:
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="tel:911"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full font-acme text-sm transition-all inline-flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      911
                    </a>
                    <a
                      href="tel:1195"
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-full font-acme text-sm transition-all inline-flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      GBV Hotline: 1195
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="text-center pt-2">
              <button
                onClick={() => setShowCountdownModal(false)}
                className="text-sm text-brand-secondary hover:text-brand-primary font-acme underline"
              >
                Close this window (you can safely close this)
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

