'use client';

import { FileText, TrendingUp, Wallet, CheckCircle, BarChart3, Download } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';

export default function TransparencyPage() {
  const financialReports = [
    {
      year: '2024',
      totalRaised: '₹2,50,00,000',
      totalSpent: '₹2,30,00,000',
      beneficiaries: '15,000+',
      campaigns: '500+',
      efficiency: '92%',
    },
    {
      year: '2023',
      totalRaised: '₹1,80,00,000',
      totalSpent: '₹1,65,00,000',
      beneficiaries: '12,000+',
      campaigns: '380+',
      efficiency: '91.7%',
    },
    {
      year: '2022',
      totalRaised: '₹1,50,00,000',
      totalSpent: '₹1,38,00,000',
      beneficiaries: '10,000+',
      campaigns: '320+',
      efficiency: '92%',
    },
  ];

  const transparencyMetrics = [
    {
      icon: Wallet,
      title: 'Financial Transparency',
      description: 'All financial reports are publicly available and audited annually by certified auditors.',
      value: '100%',
    },
    {
      icon: CheckCircle,
      title: 'Impact Reporting',
      description: 'Regular updates on how donations are being used and the impact created.',
      value: 'Monthly',
    },
    {
      icon: BarChart3,
      title: 'Open Data',
      description: 'Complete transparency in operations, expenses, and beneficiary information.',
      value: 'Real-time',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <FileText className="h-16 w-16 text-[#10b981] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Transparency</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We believe in complete transparency. All our financial reports, impact data, and operational details are publicly available.
          </p>
        </div>

        {/* Transparency Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {transparencyMetrics.map((metric, index) => (
            <Card key={index} hover className="p-6 text-center">
              <div className="bg-[#10b981] p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <metric.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{metric.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{metric.description}</p>
              <div className="text-2xl font-bold text-[#10b981]">{metric.value}</div>
            </Card>
          ))}
        </div>

        {/* Financial Reports */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Financial Reports</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {financialReports.map((report, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{report.year}</h3>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download className="h-5 w-5 text-[#10b981]" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Raised</span>
                    <span className="font-semibold text-gray-900">{report.totalRaised}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-semibold text-gray-900">{report.totalSpent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Beneficiaries</span>
                    <span className="font-semibold text-gray-900">{report.beneficiaries}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Campaigns</span>
                    <span className="font-semibold text-gray-900">{report.campaigns}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Efficiency</span>
                      <span className="font-bold text-[#10b981] text-lg">{report.efficiency}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Impact Statistics */}
        <Card className="p-8 mb-12 bg-gradient-to-r from-[#10b981] to-[#059669] text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">Overall Impact</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">₹2.5Cr+</div>
              <div className="text-green-100">Total Raised</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15K+</div>
              <div className="text-green-100">Lives Impacted</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-green-100">Campaigns</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">92%</div>
              <div className="text-green-100">Efficiency Rate</div>
            </div>
          </div>
        </Card>

        {/* Certificates & Documents */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal Documents & Certificates</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">80G Tax Exemption Certificate</h3>
                <p className="text-sm text-gray-600">Valid until 2026</p>
              </div>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <Download className="h-5 w-5 text-[#10b981]" />
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">12A Registration Certificate</h3>
                <p className="text-sm text-gray-600">Valid until 2026</p>
              </div>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <Download className="h-5 w-5 text-[#10b981]" />
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">FCRA Registration</h3>
                <p className="text-sm text-gray-600">Valid until 2027</p>
              </div>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <Download className="h-5 w-5 text-[#10b981]" />
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Trust Registration</h3>
                <p className="text-sm text-gray-600">Permanent</p>
              </div>
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <Download className="h-5 w-5 text-[#10b981]" />
              </button>
            </div>
          </div>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}

