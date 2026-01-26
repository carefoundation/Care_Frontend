'use client';

import { useState, useEffect, useRef } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Camera, Pen, Ticket, CheckCircle2, XCircle, Clock, TrendingUp, Wallet, Loader2, QrCode } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { Html5Qrcode } from 'html5-qrcode';

interface RedemptionRequest {
  _id: string;
  couponId: {
    _id: string;
    couponCode: string;
    amount: number;
  };
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestedAt: string;
  reviewedAt?: string;
  paidAt?: string;
}

export default function RedeemCouponPage() {
  const [couponCode, setCouponCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redemptionRequests, setRedemptionRequests] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const scanContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMyClaims();
    
    // Cleanup scanner on unmount
    return () => {
      if (qrCodeScannerRef.current) {
        const scanner = qrCodeScannerRef.current;
        scanner.stop().catch(() => {}).then(() => {
          try {
            scanner.clear();
          } catch (e) {
            // Ignore clear errors
          }
        });
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchMyClaims = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>('/coupon-claims/my-claims');
      const data = Array.isArray(response) ? response : (response?.data || []);
      if (Array.isArray(data)) {
        setRedemptionRequests(data);
        
        // Calculate stats
        const total = data.length;
        const pending = data.filter((r: RedemptionRequest) => r.status === 'pending').length;
        const approved = data.filter((r: RedemptionRequest) => r.status === 'approved').length;
        const paid = data.filter((r: RedemptionRequest) => r.status === 'paid').length;
        const totalAmount = data.reduce((sum: number, r: RedemptionRequest) => sum + (r.amount || 0), 0);
        const pendingAmount = data
          .filter((r: RedemptionRequest) => r.status === 'pending')
          .reduce((sum: number, r: RedemptionRequest) => sum + (r.amount || 0), 0);
        
        setStats({ total, pending, approved, paid, totalAmount, pendingAmount });
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.href = '/login';
      } else {
        console.error('Failed to fetch redemption requests:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScanQRCode = async () => {
    try {
      setShowScanModal(true);
      setIsScanning(true);
      
      // Wait for the DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const containerId = 'qr-reader';
      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error('Scanner container not found');
      }

      // Initialize QR code scanner
      const qrCodeScanner = new Html5Qrcode(containerId);
      qrCodeScannerRef.current = qrCodeScanner;

      await qrCodeScanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR code scanned successfully
          setCouponCode(decodedText.toUpperCase());
          stopScanning(false).then(() => {
            setShowScanModal(false);
            handleSubmitCoupon();
          });
        },
        (errorMessage) => {
          // Ignore scanning errors (just keep scanning)
        }
      );
    } catch (error: any) {
      console.error('QR Scanner error:', error);
      if (error?.message?.includes('Permission denied') || error?.name === 'NotAllowedError') {
        showToast('Camera access denied. Please enter coupon code manually.', 'error');
      } else {
        showToast('Failed to start camera. Please enter coupon code manually.', 'error');
      }
      setIsScanning(false);
      // Fallback to manual entry
      setTimeout(() => {
        setIsScanning(false);
      }, 100);
    }
  };

  const stopScanning = async (closeModal: boolean = true) => {
    if (qrCodeScannerRef.current) {
      try {
        await qrCodeScannerRef.current.stop();
        await qrCodeScannerRef.current.clear();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      qrCodeScannerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    if (closeModal) {
      setShowScanModal(false);
      setCouponCode(''); // Clear coupon code when closing
    }
  };

  const handleEnterCode = () => {
    setShowScanModal(true);
  };

  const handleSubmitCoupon = async () => {
    if (!couponCode.trim()) {
      showToast('Please enter a coupon code', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/coupon-claims/claim', { couponCode: couponCode.trim().toUpperCase() });
      showToast('Coupon redeemed successfully! Request submitted for admin approval.', 'success');
      setCouponCode('');
      setShowScanModal(false);
      stopScanning();
      await fetchMyClaims();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          showToast(error.message || 'This coupon has already been used or is invalid', 'error');
        } else if (error.status === 403) {
          showToast(error.message || 'You are not authorized to redeem this coupon', 'error');
        } else {
          showToast(error.message || 'Failed to redeem coupon', 'error');
        }
      } else {
        showToast('Failed to redeem coupon. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Redeem Coupon</h1>
        <p className="text-gray-600">Scan QR code or enter coupon code to redeem</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#ecfdf5] rounded-lg">
              <Ticket className="h-6 w-6 text-[#10b981]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Redemptions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#fef3c7] rounded-lg">
              <Clock className="h-6 w-6 text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#ecfdf5] rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-[#10b981]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#d1fae5] rounded-lg">
              <Wallet className="h-6 w-6 text-[#059669]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#ecfdf5] rounded-lg">
              <Wallet className="h-6 w-6 text-[#10b981]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#fef3c7] rounded-lg">
              <TrendingUp className="h-6 w-6 text-[#f59e0b]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.pendingAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Button
          size="md"
          className="h-20 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white text-base font-semibold shadow-md hover:shadow-lg transition-all"
          onClick={handleScanQRCode}
        >
          <Camera className="h-5 w-5 mr-2" />
          Scan QR Code
        </Button>

        <Button
          size="md"
          className="h-20 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white text-base font-semibold shadow-md hover:shadow-lg transition-all"
          onClick={handleEnterCode}
        >
          <Pen className="h-5 w-5 mr-2" />
          Enter Coupon Code
        </Button>
      </div>

      {/* Redemption Requests Table */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Redemption Requests</h2>
        {redemptionRequests.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No redemption requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#10b981] to-[#059669] text-white">
                  <th className="px-4 py-3 text-left font-semibold">COUPON CODE</th>
                  <th className="px-4 py-3 text-left font-semibold">AMOUNT</th>
                  <th className="px-4 py-3 text-left font-semibold">STATUS</th>
                  <th className="px-4 py-3 text-left font-semibold">REQUESTED DATE</th>
                  <th className="px-4 py-3 text-left font-semibold">PROCESSED DATE</th>
                </tr>
              </thead>
              <tbody>
                {redemptionRequests.map((request) => (
                  <tr key={request._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-[#10b981]">
                        {request.couponId?.couponCode || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ₹{request.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : request.status === 'paid'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {request.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(request.requestedAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {request.paidAt ? formatDate(request.paidAt) : (request.reviewedAt ? formatDate(request.reviewedAt) : '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Scan/Enter Code Modal */}
      {showScanModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={() => stopScanning(true)} />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <Card className="max-w-md w-full ">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isScanning ? 'Scan QR Code' : 'Enter Coupon Code'}
                  </h2>
                  <button
                    onClick={() => stopScanning(true)}
                    className="text-gray-400 hover:text-gray-600"
                    type="button"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                {isScanning ? (
                  <div className="space-y-4">
                    <div 
                      id="qr-reader" 
                      ref={scanContainerRef}
                      className="w-full rounded-lg overflow-hidden bg-black"
                      style={{ minHeight: '300px' }}
                    />
                    <p className="text-sm text-gray-600 text-center">
                      Position the QR code within the frame
                    </p>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => stopScanning(true)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-[#10b981] hover:bg-[#059669]"
                        onClick={async () => {
                          await stopScanning();
                          setIsScanning(false);
                        }}
                      >
                        Enter Code Manually
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmitCoupon();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coupon Code
                      </label>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code (e.g., COUPON-XXXX-XXXX-XXXX)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10b981] focus:border-transparent font-mono text-lg"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmitCoupon();
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          stopScanning(true);
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!couponCode.trim() || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Redeem Coupon'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

