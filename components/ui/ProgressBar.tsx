interface ProgressBarProps {
  current: number;
  goal: number;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({ current, goal, showLabel = true, className }: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  
  // Format numbers consistently using 'en-US' locale to avoid hydration mismatches
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US');
  };
  
  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">₹{formatNumber(current)}</span>
          <span className="text-sm text-gray-500">of ₹{formatNumber(goal)}</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-gray-500 text-right">{percentage.toFixed(1)}% funded</div>
      )}
    </div>
  );
}

