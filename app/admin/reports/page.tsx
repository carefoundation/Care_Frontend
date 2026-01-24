'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Download, FileText, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const reportTypes = [
    {
      title: 'Financial Reports',
      description: 'View detailed financial reports and transactions',
      icon: DollarSign,
      color: 'text-[#10b981]',
      bg: 'bg-[#ecfdf5]',
    },
    {
      title: 'Donation Analytics',
      description: 'Analyze donation trends and patterns',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Campaign Reports',
      description: 'Generate reports for all campaigns',
      icon: BarChart3,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'User Reports',
      description: 'View user activity and engagement reports',
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">View and download various reports and analytics</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {reportTypes.map((report, index) => (
          <Card key={index} hover className="p-6">
            <div className="flex items-start gap-4">
              <div className={`${report.bg} p-3 rounded-lg`}>
                <report.icon className={`h-6 w-6 ${report.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{report.title}</h3>
                <p className="text-gray-600 mb-4">{report.description}</p>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Reports</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Today's Donations
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Monthly Summary
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Yearly Report
          </Button>
        </div>
      </Card>
    </div>
  );
}

