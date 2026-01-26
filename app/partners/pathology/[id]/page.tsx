'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Map, FlaskConical, Heart, Loader2, Ticket, X, QrCode, Copy, CheckCircle } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

export default function PathologyPartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params?.id as string;
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState<any>(null);
  const [generatingCoupon, setGeneratingCoupon] = useState(false);
  const [copied, setCopied] = useState(false);

  const presetAmounts = ['100', '500', '1000', '2500', '5000', '10000'];

  useEffect(() => {
    fetchPartner();
  }, [partnerId]);

  const fetchPartner = async () => {
    try {
      setLoading(true);
      const data = await api.get<any>(`/partners/${partnerId}`);
      if (data) {
        let photo = data.photo || data.logo;
        if (!photo && data.formData) {
          if (data.formData.banner) {
            photo = data.formData.banner;
          } else if (data.formData.labImages && Array.isArray(data.formData.labImages) && data.formData.labImages.length > 0) {
            photo = data.formData.labImages[0];
          }
        }
        setPartner({
          ...data,
          photo: photo || data.photo,
          logo: data.logo || photo,
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch partner:', error.message);
      } else {
        console.error('Failed to fetch partner');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGetCoupon = async () => {
    try {
      setGeneratingCoupon(true);
      
      const token = localStorage.getItem('userToken');
      if (!token || token.trim() === '') {
        showToast('Please login to get a coupon', 'info');
        localStorage.setItem('redirectAfterLogin', `/partners/pathology/${partnerId}`);
        router.push('/login');
        return;
      }

      const response = await api.post<any>('/coupons', {
        amount: 0,
        paymentId: `pathology-partner-${partnerId}-${Date.now()}`,
        paymentStatus: 'completed',
        beneficiaryName: partner?.name || partner?.businessName || 'Pathology Partner',
        partnerId: partnerId,
      });

      if (response.data) {
        setGeneratedCoupon(response.data);
        setShowCouponModal(true);
        showToast('Coupon generated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error generating coupon:', error);
      if (error instanceof ApiError) {
        if (error.status === 401) {
          showToast('Please login to get a coupon', 'error');
          localStorage.setItem('redirectAfterLogin', `/partners/pathology/${partnerId}`);
          router.push('/login');
        } else {
          showToast(`Failed to generate coupon: ${error.message}`, 'error');
        }
      } else {
        showToast('Failed to generate coupon. Please try again.', 'error');
      }
    } finally {
      setGeneratingCoupon(false);
    }
  };

  const handleCopyCouponCode = () => {
    if (generatedCoupon?.couponCode || generatedCoupon?.code) {
      const code = generatedCoupon.couponCode || generatedCoupon.code;
      navigator.clipboard.writeText(code);
      setCopied(true);
      showToast('Coupon code copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Partner Not Found</h1>
          <Button onClick={() => router.push('/partners/pathology')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pathology Partners
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <button
            onClick={() => router.push('/partners/pathology')}
            className="inline-flex items-center text-gray-600 hover:text-[#10b981] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pathology Partners
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[5px]">
          <div className="lg:col-span-7">
            <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden bg-gray-200">
              <Image
                src={partner.photo || partner.logo || 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&h=600&fit=crop'}
                alt={partner.name || partner.businessName || 'Partner'}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                <div className="bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-md">
                  <Image
                    src={partner.logo || 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&h=400&fit=crop'}
                    alt={`${partner.name || partner.businessName || 'Partner'} logo`}
                    width={120}
                    height={40}
                    className="object-contain h-8 sm:h-10 w-auto"
                    unoptimized
                  />
                </div>
              </div>
            </div>

            <Card className="rounded-none border-0 shadow-none p-6 sm:p-8 lg:p-10 bg-white">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{partner.name || partner.businessName}</h1>
              <p className="text-gray-600 text-lg sm:text-xl mb-8 leading-relaxed">{partner.description || partner.about}</p>

              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Tests Available</h2>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {(partner.programs || []).map((program: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-[#ecfdf5] to-[#d1fae5] text-[#10b981] text-sm sm:text-base font-bold rounded-xl border-2 border-[#10b981]/30 shadow-sm hover:shadow-md transition-all"
                    >
                      {program}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 sm:pt-8 border-t-2 border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
                  {partner.impact && (
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <span className="text-gray-600 text-base sm:text-lg font-semibold">Impact:</span>
                      <span className="font-bold text-[#10b981] ml-2 text-lg sm:text-xl">{partner.impact}</span>
                    </div>
                  )}
                  {partner.since && (
                    <div className="bg-gray-50 px-4 py-3 rounded-lg">
                      <span className="text-gray-500 text-base sm:text-lg font-semibold">Since </span>
                      <span className="font-bold text-gray-900 text-lg sm:text-xl">{partner.since}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card className="rounded-none shadow-none p-5 sm:p-6 lg:p-8 lg:sticky lg:top-20 h-full lg:min-h-screen bg-gray-50">
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-5 sm:mb-6 pb-4 sm:pb-5 border-b-2 border-gray-300">
                  <div className="bg-[#10b981] p-2 rounded-lg">
                    <FlaskConical className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Contact Information</h2>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="pb-2 sm:pb-3 border-b border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wide">Phone</div>
                        <div className="flex items-center gap-2 sm:gap-2.5 text-sm text-gray-700">
                          <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#10b981] flex-shrink-0" />
                          <a href={`tel:${partner.phone || partner.mobileNumber || partner.contact}`} className="hover:text-[#10b981] transition-colors font-medium">
                            {partner.phone || partner.mobileNumber || partner.contact || 'N/A'}
                          </a>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wide">Email</div>
                        <div className="flex items-center gap-2 sm:gap-2.5 text-sm text-gray-700">
                          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#10b981] flex-shrink-0" />
                          <a href={`mailto:${partner.email}`} className="hover:text-[#10b981] break-all transition-colors font-medium">
                            {partner.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pb-2 sm:pb-3 border-b border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wide">Address</div>
                    <div className="flex items-start gap-2 sm:gap-2.5 text-sm text-gray-700">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                      <span className="font-medium">{partner.address || `${partner.city || ''} ${partner.state || ''}`.trim() || 'N/A'}</span>
                    </div>
                  </div>

                  {(partner.operatingHours || partner.hours) && (
                    <div className="pb-2 sm:pb-3 border-b border-gray-100">
                      <div className="text-xs font-semibold text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wide">Operating Hours</div>
                      <div className="flex items-center gap-2 sm:gap-2.5 text-sm text-gray-700">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#10b981] flex-shrink-0" />
                        <span className="font-medium">{partner.operatingHours || partner.hours}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 sm:pt-8 border-t-2 border-gray-300">
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="bg-[#10b981] p-2 rounded-lg">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Donate Now</h3>
                </div>

                <div className="mb-4 sm:mb-5">
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Choose Amount</div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                        className={`px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg border-2 transition-all duration-200 ${
                          selectedAmount === amount
                            ? 'border-[#10b981] bg-[#ecfdf5] text-[#10b981] shadow-sm'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#10b981] hover:bg-gray-50'
                        }`}
                      >
                        ₹{amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4 sm:mb-5">
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-2.5">Or Enter Custom Amount</div>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount('');
                      }}
                      className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all text-sm font-medium"
                      min="1"
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm sm:text-base py-3 sm:py-3.5 shadow-lg hover:shadow-xl transition-all duration-200 mb-3 sm:mb-4"
                  onClick={() => {
                    const amount = customAmount || selectedAmount;
                    if (!amount || parseFloat(amount) <= 0) {
                      showToast('Please select or enter a donation amount', 'error');
                      return;
                    }
                    
                    const donationData = {
                      amount: amount,
                      campaignId: null,
                      campaignTitle: `Donation to ${partner.name || partner.businessName}`,
                      partnerId: partnerId,
                    };
                    
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('pendingDonation', JSON.stringify(donationData));
                    }
                    
                    router.push('/payment');
                  }}
                  disabled={!selectedAmount && !customAmount}
                >
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Donate ₹{customAmount || selectedAmount || '0'}
                </Button>

                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-gray-200 hover:border-[#10b981] hover:text-[#10b981] transition-all text-xs sm:text-sm font-medium"
                    onClick={handleGetCoupon}
                    disabled={generatingCoupon}
                  >
                    <Ticket className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                    {generatingCoupon ? 'Generating...' : 'Get Coupon'}
                  </Button>
                  <button
                    className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                    onClick={() => {
                      let phoneNumber = (partner.phone || partner.mobileNumber || partner.contact || '').replace(/[\s\-+()]/g, '');
                      if (phoneNumber && !phoneNumber.startsWith('91') && phoneNumber.length === 10) {
                        phoneNumber = '91' + phoneNumber;
                      }
                      if (phoneNumber) {
                        window.open(`https://wa.me/${phoneNumber}`, '_blank');
                      }
                    }}
                  >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.239-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span className="hidden sm:inline">Contact on </span>WhatsApp
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {showCouponModal && generatedCoupon && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowCouponModal(false);
                setGeneratedCoupon(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-[#10b981] rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Coupon Generated!</h2>
              <p className="text-gray-600">Your coupon is ready to use</p>
            </div>

            <Card className="p-6 mb-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Coupon Code</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold font-mono text-[#10b981] flex-1">
                      {generatedCoupon.couponCode || generatedCoupon.code}
                    </p>
                    <button
                      onClick={handleCopyCouponCode}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy code"
                    >
                      {copied ? (
                        <CheckCircle className="h-5 w-5 text-[#10b981]" />
                      ) : (
                        <Copy className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {partner && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Partner</p>
                    <p className="text-lg font-semibold text-gray-900">{partner.name || partner.businessName}</p>
                  </div>
                )}

                {generatedCoupon.expiryDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Valid Until</p>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(generatedCoupon.expiryDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-center">
                    {generatedCoupon.qrCode?.url || generatedCoupon.qrCode ? (
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                        <Image
                          src={generatedCoupon.qrCode?.url || generatedCoupon.qrCode}
                          alt="QR Code"
                          width={200}
                          height={200}
                          className="rounded"
                          unoptimized
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">Scan to redeem</p>
                      </div>
                    ) : (
                      <div className="bg-gray-100 p-8 rounded-lg">
                        <QrCode className="h-16 w-16 text-gray-400 mx-auto" />
                        <p className="text-xs text-gray-500 mt-2 text-center">QR Code not available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowCouponModal(false);
                  setGeneratedCoupon(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  router.push('/dashboard');
                }}
                className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white"
              >
                View in Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

