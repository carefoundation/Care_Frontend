'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Building2, Heart, Users, Award, Map, Loader2, Ticket, X, QrCode, Copy, CheckCircle } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';

export default function HospitalPartnersPage() {
  const router = useRouter();
  const [hospitalPartners, setHospitalPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ patientsServed: 0, yearsCombined: 0 });
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState<any>(null);
  const [generatingCoupon, setGeneratingCoupon] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchHospitalPartners();
  }, []);

  const fetchHospitalPartners = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/partners/type/hospital');
      if (Array.isArray(data)) {
        const formatted = data.map((partner: any) => {
          let photo = partner.photo || partner.logo;
          if (!photo && partner.formData) {
            if (partner.formData.banner) {
              photo = partner.formData.banner;
            } else if (partner.formData.hospitalImages && Array.isArray(partner.formData.hospitalImages) && partner.formData.hospitalImages.length > 0) {
              photo = partner.formData.hospitalImages[0];
            }
          }
          return {
            id: partner._id || partner.id,
            name: partner.name || partner.businessName || 'Unknown',
            logo: partner.logo || photo || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=400&fit=crop',
            photo: photo || partner.photo || partner.logo || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop',
            description: partner.description || 'Hospital partner',
            location: partner.city || partner.location || partner.address || 'India',
            website: partner.website || '#',
            contact: partner.phone || partner.mobileNumber || 'N/A',
            phone: partner.phone || partner.mobileNumber || 'N/A',
            email: partner.email || 'N/A',
            address: partner.address || partner.city || 'N/A',
            operatingHours: partner.operatingHours || '24/7',
            about: partner.description || '',
            programs: partner.programs || [],
            impact: partner.impact || 'Making a difference',
            since: partner.since || new Date(partner.createdAt).getFullYear().toString() || '2020',
          };
        });
        setHospitalPartners(formatted);
        
        let totalPatients = 0;
        let totalYears = 0;
        const currentYear = new Date().getFullYear();
        
        formatted.forEach((partner: any) => {
          if (partner.impact) {
            const impactStr = partner.impact.toLowerCase();
            const patientsMatch = impactStr.match(/([\d.]+)([mk]?)\+?/);
            if (patientsMatch) {
              let patients = parseFloat(patientsMatch[1]);
              const unit = patientsMatch[2];
              if (unit === 'm') patients *= 1000000;
              else if (unit === 'k') patients *= 1000;
              totalPatients += patients;
            }
          }
          
          if (partner.since) {
            const sinceYear = parseInt(partner.since);
            if (!isNaN(sinceYear) && sinceYear > 1900) {
              totalYears += (currentYear - sinceYear);
            }
          }
        });
        
        setStats({
          patientsServed: totalPatients,
          yearsCombined: totalYears,
        });
      } else {
        setHospitalPartners([]);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch hospital partners:', error.message);
      } else {
        console.error('Failed to fetch hospital partners');
      }
      setHospitalPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCoupon = async (partner: any) => {
    try {
      setGeneratingCoupon(true);
      setSelectedPartner(partner);
      
      const token = localStorage.getItem('userToken');
      if (!token || token.trim() === '') {
        showToast('Please login to get a coupon', 'info');
        localStorage.setItem('redirectAfterLogin', '/partners/hospital');
        router.push('/login');
        return;
      }

      const response = await api.post<any>('/coupons', {
        amount: 0,
        paymentId: `hospital-partner-${partner.id}-${Date.now()}`,
        paymentStatus: 'completed',
        beneficiaryName: partner.name || 'Hospital Partner',
        partnerId: partner.id,
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
          localStorage.setItem('redirectAfterLogin', '/partners/hospital');
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

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Building2 className="h-16 w-16 text-[#10b981] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Hospital Partners</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Working together with leading hospitals to provide quality healthcare services across India.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center bg-gradient-to-br from-[#10b981] to-[#059669] text-white">
            <Users className="h-10 w-10 mx-auto mb-4" />
            <div className="text-3xl font-bold mb-2">{hospitalPartners.length}</div>
            <div className="text-green-100">Hospital Partners</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-[#10b981] to-[#059669] text-white">
            <Heart className="h-10 w-10 mx-auto mb-4" />
            <div className="text-3xl font-bold mb-2">
              {stats.patientsServed >= 1000000 
                ? `${(stats.patientsServed / 1000000).toFixed(0)}M+`
                : stats.patientsServed >= 1000
                ? `${(stats.patientsServed / 1000).toFixed(0)}K+`
                : stats.patientsServed > 0
                ? `${stats.patientsServed.toLocaleString()}+`
                : '0'}
            </div>
            <div className="text-green-100">Patients Served</div>
          </Card>
          <Card className="p-6 text-center bg-gradient-to-br from-[#10b981] to-[#059669] text-white">
            <Award className="h-10 w-10 mx-auto mb-4" />
            <div className="text-3xl font-bold mb-2">{stats.yearsCombined > 0 ? `${stats.yearsCombined}+` : '0'}</div>
            <div className="text-green-100">Years Combined</div>
          </Card>
        </div>

        {hospitalPartners.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {hospitalPartners.map((partner) => (
            <Card 
              key={partner.id} 
              hover 
              className="overflow-hidden cursor-pointer"
              onClick={() => router.push(`/partners/hospital/${partner.id}`)}
            >
              <div className="relative h-64 bg-gradient-to-br from-[#ecfdf5] to-white">
                <Image
                  src={partner.photo || partner.logo}
                  alt={partner.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
                    <Image
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      width={120}
                      height={40}
                      className="object-contain h-8 w-auto"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.name}</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-4">{partner.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Services:</h4>
                  <div className="flex flex-wrap gap-2">
                    {partner.programs.slice(0, 4).map((program: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#ecfdf5] text-[#10b981] text-xs font-medium rounded"
                      >
                        {program}
                      </span>
                    ))}
                    {partner.programs.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        +{partner.programs.length - 4} more...
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-gray-600">Impact:</span>
                      <span className="font-semibold text-gray-900 ml-1">{partner.impact}</span>
                    </div>
                    <div className="text-gray-500">Since {partner.since}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetCoupon(partner);
                    }}
                    disabled={generatingCoupon}
                  >
                    <Ticket className="h-4 w-4 mr-1" />
                    {generatingCoupon ? 'Generating...' : 'Get Coupon'}
                  </Button>
                  <button
                    className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold text-sm py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      let phoneNumber = (partner.phone || partner.contact || '').replace(/[\s\-+()]/g, '');
                      if (phoneNumber && !phoneNumber.startsWith('91') && phoneNumber.length === 10) {
                        phoneNumber = '91' + phoneNumber;
                      }
                      if (phoneNumber) {
                        window.open(`https://wa.me/${phoneNumber}`, '_blank');
                      }
                    }}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.239-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Contact on WhatsApp
                  </button>
                </div>
              </div>
            </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">No hospital partners available yet</p>
            <p className="text-gray-400">Check back soon for our partner listings</p>
          </div>
        )}

        <Card className="p-8 bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Hospital Partner</h2>
          <p className="text-green-100 mb-6 text-lg">
            Join us in providing quality healthcare. Partner with Care Foundation Trust® to make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/become-partner">
              <Button size="lg" variant="outline" className="bg-white text-[#10b981] border-white hover:bg-gray-100">
                Become a Partner
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </Card>
      </div>
      
      {showCouponModal && generatedCoupon && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowCouponModal(false);
                setGeneratedCoupon(null);
                setSelectedPartner(null);
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

                {selectedPartner && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Partner</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedPartner.name}</p>
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
                  setSelectedPartner(null);
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

