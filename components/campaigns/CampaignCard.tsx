'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Clock, Users, MapPin } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface CampaignCardProps {
  id: string;
  title: string;
  image: string;
  category: string;
  currentAmount: number;
  goalAmount: number;
  donors: number;
  daysLeft: number;
  location?: string;
}

export default function CampaignCard({
  id,
  title,
  image,
  category,
  currentAmount,
  goalAmount,
  donors,
  daysLeft,
  location,
}: CampaignCardProps) {
  const router = useRouter();
  
  const handleCardClick = () => {
    router.push(`/campaigns/${id}`);
  };
  
  const handleDonate = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    // Save campaign info to localStorage
    if (typeof window !== 'undefined') {
      const donationData = {
        campaignId: id,
        campaignTitle: title,
        // Amount will be set on payment page or can be default
        amount: '',
      };
      localStorage.setItem('pendingDonation', JSON.stringify(donationData));
      
      // Redirect directly to payment (no login required)
      router.push('/payment');
    }
  };
    
  const percentage = Math.min((currentAmount / goalAmount) * 100, 100);
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };
  
  return (
    <Card hover className="flex flex-col overflow-hidden bg-white rounded-lg shadow-sm">
      {/* Image Section */}
      <div 
        className="relative h-56 w-full overflow-hidden bg-gray-200 cursor-pointer"
        onClick={handleCardClick}
      >
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover pointer-events-none transition-transform duration-300 hover:scale-105"
            unoptimized
            onError={(e) => {
              // Fallback to a default medical image if the image fails to load
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{category}</span>
          </div>
        )}
        {/* Category Tag */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="bg-[#10b981] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
            {category}
          </span>
        </div>
      </div>
      
      {/* Content Section */}
      <div 
        className="p-5 flex-1 flex flex-col cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {title}
        </h3>
        
        {/* Location */}
        {location && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{location}</span>
          </div>
        )}
        
        {/* Progress Bar Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-base font-semibold text-gray-900">₹{formatNumber(currentAmount)}</span>
            <span className="text-sm text-gray-600">of ₹{formatNumber(goalAmount)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mb-1.5">
            <div
              className="h-full bg-[#10b981] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-sm text-gray-600 text-right">
            {percentage.toFixed(1)}% funded
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{donors} donors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{daysLeft} days left</span>
          </div>
        </div>
        
        {/* Donate Button */}
        <div onClick={(e) => e.stopPropagation()}>
          <Button 
            onClick={handleDonate}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Donate Now
          </Button>
        </div>
      </div>
    </Card>
  );
}

