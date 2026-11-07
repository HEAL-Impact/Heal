'use client';

import { useState } from 'react';
import { Heart, Users, Shield, Target } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLang } from '@/lib/i18n';

export default function DonatePage() {
  const { tr } = useLang();
  console.log('Donate page is loading!');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const donationOptions = [
    {
      amount: 30,
      icon: Heart,
      title: '$30',
      description: { en: 'Provide emergency support for survivors', sw: 'Toa msaada wa dharura kwa walionusurika' },
      color: 'bg-pink-100 text-pink-600'
    },
    {
      amount: 10,
      icon: Heart,
      title: '$10',
      description: { en: 'Provide emergency support for survivors', sw: 'Toa msaada wa dharura kwa walionusurika' },
      color: 'bg-[#2C4A4E]/10 text-[#2C4A4E]'
    },
    {
      amount: 30,
      icon: Shield,
      title: '$30',
      description: { en: 'Provide emergency support for survivors', sw: 'Toa msaada wa dharura kwa walionusurika' },
      color: 'bg-[#2C4A4E]/10 text-[#2C4A4E]'
    },
    {
      amount: 60,
      icon: Users,
      title: '$60',
      description: { en: 'Establish new support group in one community', sw: 'Anzisha kikundi kipya cha msaada katika jamii moja' },
      color: 'bg-[#2C4A4E]/10 text-[#2C4A4E]'
    },
    {
      amount: 500,
      icon: Heart,
      title: '$500',
      description: { en: 'Provide emergency support for survivors', sw: 'Toa msaada wa dharura kwa walionusurika' },
      color: 'bg-purple-100 text-purple-600'
    },
    {
      amount: 1000,
      icon: Target,
      title: '$1000',
      description: { en: 'Provide emergency support for survivors', sw: 'Toa msaada wa dharura kwa walionusurika' },
      color: 'bg-[#2C4A4E]/10 text-[#2C4A4E]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#ECE5DA]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="font-acme text-4xl md:text-5xl font-bold text-[#2C4A4E] mb-6">
            {tr("Support Our Mission", "Saidia Dhamira Yetu")}
          </h1>
          <p className="font-inter text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {tr("Your donation helps us provide life-saving support, resources and advocacy for GBV survivors across Kenya", "Mchango wako unatusaidia kutoa msaada wa kuokoa maisha, rasilimali na utetezi kwa walionusurika ukatili wa kijinsia kote Kenya")}
          </p>
        </div>

        {/* Impact Preview */}
        <div className="text-center mb-8">
          <h2 className="font-acme text-2xl font-bold text-[#2C4A4E] mb-4">
            {tr("Your Impact", "Athari Yako")}
          </h2>
          <p className="font-inter text-gray-600 mb-6">{tr("See how your donation makes a difference", "Ona jinsi mchango wako unavyoleta tofauti")}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-transparent hover:border-[#2C4A4E] hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="w-10 h-10 bg-[#2C4A4E] rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-[#2C4A4E]/90 transition-colors">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-acme text-lg font-bold text-[#2C4A4E] group-hover:text-[#2C4A4E]">$30</h3>
              <p className="font-inter text-xs text-gray-600">{tr("Emergency support", "Msaada wa dharura")}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-transparent hover:border-[#2C4A4E] hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="w-10 h-10 bg-[#2C4A4E] rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-[#2C4A4E]/90 transition-colors">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-acme text-lg font-bold text-[#2C4A4E] group-hover:text-[#2C4A4E]">$100</h3>
              <p className="font-inter text-xs text-gray-600">{tr("Support group setup", "Kuanzisha kikundi cha msaada")}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md border-2 border-transparent hover:border-[#2C4A4E] hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="w-10 h-10 bg-[#2C4A4E] rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-[#2C4A4E]/90 transition-colors">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-acme text-lg font-bold text-[#2C4A4E] group-hover:text-[#2C4A4E]">$500</h3>
              <p className="font-inter text-xs text-gray-600">{tr("Comprehensive care", "Huduma kamili")}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-[#ECE5DA] rounded-2xl p-8 max-w-4xl mx-auto mb-8">
            <h2 className="font-acme text-2xl font-bold text-[#2C4A4E] mb-6">{tr("Payment Method", "Njia ya Malipo")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-6 text-center border-2 border-transparent hover:border-[#2C4A4E] hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="w-12 h-12 bg-[#2C4A4E] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#2C4A4E]/90 transition-colors">
                  <div className="w-8 h-6 bg-white rounded border-2 border-gray-300"></div>
                </div>
                <h3 className="font-acme font-semibold text-[#2C4A4E] mb-2 group-hover:text-[#2C4A4E]">{tr("Credit/Debit Card", "Kadi ya Benki")}</h3>
                <p className="font-inter text-sm text-gray-600">{tr("Secure payment via card", "Malipo salama kwa kadi")}</p>
              </div>
              <div className="bg-white rounded-lg p-6 text-center border-2 border-transparent hover:border-[#2C4A4E] hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="w-12 h-12 bg-[#2C4A4E] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#2C4A4E]/90 transition-colors">
                  <div className="w-6 h-10 bg-white rounded border-2 border-gray-300"></div>
                </div>
                <h3 className="font-acme font-semibold text-[#2C4A4E] mb-2 group-hover:text-[#2C4A4E]">{tr("Mobile Money", "Pesa kwa Simu")}</h3>
                <p className="font-inter text-sm text-gray-600">{tr("M-Pesa, Airtel Money", "M-Pesa, Airtel Money")}</p>
              </div>
              <div className="bg-white rounded-lg p-6 text-center border-2 border-transparent hover:border-[#2C4A4E] hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                <div className="w-12 h-12 bg-[#2C4A4E] rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#2C4A4E]/90 transition-colors">
                  <div className="w-8 h-6 bg-white rounded border-2 border-gray-300 relative">
                    <div className="absolute inset-1 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <h3 className="font-acme font-semibold text-[#2C4A4E] mb-2 group-hover:text-[#2C4A4E]">{tr("Bank Transfer", "Uhamisho wa Benki")}</h3>
                <p className="font-inter text-sm text-gray-600">{tr("Direct bank deposit", "Kuweka moja kwa moja benki")}</p>
              </div>
            </div>
          </div>

          {/* Donation Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto mb-8 border border-gray-200 heal-panel">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="h-6 w-6 text-[#2C4A4E]" />
              <h3 className="font-acme text-xl font-semibold text-[#2C4A4E]">{tr("Make a Donation", "Toa Mchango")}</h3>
            </div>

            {/* Donation amount */}
            <div className="mb-6">
              <label className="font-inter block text-sm font-medium text-[#2C4A4E] mb-3">{tr("Choose your donation amount", "Chagua kiasi cha mchango wako")}</label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button className="font-acme bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white py-2 px-4 rounded text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">
                  {tr("One-Time", "Mara Moja")}
                </button>
                <button className="font-acme bg-[#ECE5DA] hover:bg-[#2C4A4E]/90 hover:text-white text-[#2C4A4E] py-2 px-4 rounded text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">
                  {tr("Monthly", "Kila Mwezi")}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <button className="font-acme bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white py-3 px-4 rounded text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">$26</button>
                <button className="font-acme bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white py-3 px-4 rounded text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">$50</button>
                <button className="font-acme bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white py-3 px-4 rounded text-sm font-medium relative transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">
                  $100
                  <span className="absolute -top-2 -right-2 bg-[#2C4A4E] text-white text-xs px-1 rounded">{tr("Popular", "Maarufu")}</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button className="font-acme bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white py-3 px-4 rounded text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">$200</button>
                <button className="font-acme bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white py-3 px-4 rounded text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">$500</button>
                <button className="font-acme bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white py-3 px-4 rounded text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">$1000</button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-inter">$</span>
                <input
                  type="number"
                  className="font-inter w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#2C4A4E] focus:border-transparent"
                  placeholder={tr("Enter custom amount", "Weka kiasi chako")}
                />
              </div>
            </div>

            {/* Donor Information */}
            <div className="mb-6">
              <h4 className="font-acme text-lg font-medium text-[#2C4A4E] mb-4">{tr("Donor Information", "Taarifa za Mchangiaji")}</h4>
              <div className="mb-4">
                <label className="font-inter flex items-center gap-2 text-sm text-[#2C4A4E]">
                  <input type="checkbox" className="rounded" />
                  {tr("Make this donation anonymous", "Fanya mchango huu bila jina")}
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="font-inter block text-sm font-medium text-[#2C4A4E] mb-1">{tr("Full Name*", "Jina Kamili*")}</label>
                  <input type="text" className="font-inter w-full py-2 px-3 border border-gray-300 rounded bg-gray-50" />
                </div>
                <div>
                  <label className="font-inter block text-sm font-medium text-[#2C4A4E] mb-1">{tr("Email Address*", "Barua Pepe*")}</label>
                  <input type="email" className="font-inter w-full py-2 px-3 border border-gray-300 rounded bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="font-inter block text-sm font-medium text-[#2C4A4E] mb-1">{tr("Phone Number (optional)", "Namba ya Simu (si lazima)")}</label>
                <input type="tel" className="font-inter w-full py-2 px-3 border border-gray-300 rounded bg-gray-50" />
              </div>
            </div>

            {/* Donate Button */}
            <button className="font-acme w-full bg-[#2C4A4E] hover:bg-[#2C4A4E]/90 text-white py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-lg">
              <Heart className="h-5 w-5" />
              {tr("Complete Donation", "Kamilisha Mchango")}
            </button>
          </div>

          {/* Other Ways to Help */}
          <div className="mt-12 mb-8">
            <h2 className="font-acme text-xl font-semibold text-[#2C4A4E] text-center mb-4">{tr("Other Ways to Support", "Njia Nyingine za Kusaidia")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <button className="bg-white rounded-lg p-4 shadow-md text-center border-2 border-transparent hover:border-[#2C4A4E] hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <div className="w-8 h-8 bg-[#2C4A4E] rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-[#2C4A4E]/90 transition-colors">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-acme font-semibold text-[#2C4A4E] text-sm group-hover:text-[#2C4A4E]">{tr("Volunteer", "Jitolee")}</h3>
              </button>
              <button className="bg-white rounded-lg p-4 shadow-md text-center border-2 border-transparent hover:border-[#2C4A4E] hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <div className="w-8 h-8 bg-[#2C4A4E] rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-[#2C4A4E]/90 transition-colors">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-acme font-semibold text-[#2C4A4E] text-sm group-hover:text-[#2C4A4E]">{tr("Share Story", "Shiriki Hadithi")}</h3>
              </button>
              <button className="bg-white rounded-lg p-4 shadow-md text-center border-2 border-transparent hover:border-[#2C4A4E] hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <div className="w-8 h-8 bg-[#2C4A4E] rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-[#2C4A4E]/90 transition-colors">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-acme font-semibold text-[#2C4A4E] text-sm group-hover:text-[#2C4A4E]">{tr("Partner", "Shirikiana")}</h3>
              </button>
            </div>
          </div>



          {/* Trust Section */}
          <div className="bg-white rounded-lg p-4 shadow-md max-w-xl mx-auto text-center border-2 border-transparent hover:border-[#2C4A4E] hover:shadow-lg transition-all duration-300">
            <div className="flex justify-center items-center gap-6 mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#2C4A4E]" />
                <span className="font-inter text-xs text-gray-600">{tr("SSL Secured", "Imelindwa kwa SSL")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-[#2C4A4E]" />
                <span className="font-inter text-xs text-gray-600">{tr("100% Impact", "Athari 100%")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#2C4A4E]" />
                <span className="font-inter text-xs text-gray-600">{tr("10k+ Donors", "Wachangiaji 10k+")}</span>
              </div>
            </div>
            <p className="font-inter text-xs text-gray-500">
              {tr("Your donation is secure and goes directly to supporting GBV survivors", "Mchango wako ni salama na unaenda moja kwa moja kusaidia walionusurika ukatili wa kijinsia")}
            </p>
          </div>




        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}