'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, FileText, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

interface PartnerKycModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function PartnerKycModal({ isOpen, onClose, onComplete }: PartnerKycModalProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  if (!isOpen) return null;

  const handleGoToForm = () => {
    setIsNavigating(true);
    onClose();
    router.push('/become-partner');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#10b981] p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Complete Your Partnership</h2>
                <p className="text-sm text-gray-600">KYC Verification Required</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700">
                    Your account has been approved! To complete your partnership and start claiming coupons, 
                    please fill out the partnership KYC form.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-[#ecfdf5] rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#10b981] font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Fill Partnership Form</p>
                  <p className="text-sm text-gray-600">Complete all required business details and documents</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-[#ecfdf5] rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#10b981] font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Admin Review</p>
                  <p className="text-sm text-gray-600">Our team will review your application</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-[#ecfdf5] rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#10b981] font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Start Claiming Coupons</p>
                  <p className="text-sm text-gray-600">Once approved, you can claim and manage coupons</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGoToForm}
              className="flex-1"
              isLoading={isNavigating}
            >
              Fill Form Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
