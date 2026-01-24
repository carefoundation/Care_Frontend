'use client';

import { Heart, CheckCircle, TrendingUp, Users, ArrowRight } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '1',
      title: 'Choose a Cause',
      description: 'Browse through our verified campaigns and find a cause that resonates with you. Each campaign is carefully vetted to ensure authenticity.',
      icon: Heart,
    },
    {
      step: '2',
      title: 'Donate Securely',
      description: 'Make a secure donation using our trusted payment gateway. We support multiple payment methods including UPI, cards, and net banking.',
      icon: CheckCircle,
    },
    {
      step: '3',
      title: 'Track Impact',
      description: 'Receive regular updates on how your contribution is making a real difference. See photos, videos, and progress reports.',
      icon: TrendingUp,
    },
    {
      step: '4',
      title: 'Share & Spread',
      description: 'Share campaigns with friends and family to amplify impact. Every share helps reach more people who can make a difference.',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Making a difference is simple. Follow these easy steps to start helping today and create a positive impact in someone's life.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step) => (
            <Card key={step.step} hover className="p-6 text-center">
              <div className="bg-[#10b981] text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {step.step}
              </div>
              <step.icon className="h-10 w-10 mx-auto mb-4 text-[#10b981]" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my donation secure?</h3>
              <p className="text-gray-600">
                Yes, we use industry-standard encryption and secure payment gateways to protect your financial information. All transactions are processed securely.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I donate anonymously?</h3>
              <p className="text-gray-600">
                Yes, you have the option to make anonymous donations. Your name will not be displayed publicly if you choose this option.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Will I get a receipt?</h3>
              <p className="text-gray-600">
                Yes, you will receive an email receipt immediately after your donation. This receipt can be used for tax deduction purposes under Section 80G.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I track my donation?</h3>
              <p className="text-gray-600">
                You will receive regular updates via email about the campaign's progress. You can also visit the campaign page anytime to see updates.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Make a Difference?</h2>
          <p className="text-gray-600 mb-6">Start your journey of giving today</p>
          <Link href="/campaigns">
            <Button size="lg">
              Browse Campaigns
              <ArrowRight className="ml-2 h-5 w-5 inline" />
            </Button>
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

