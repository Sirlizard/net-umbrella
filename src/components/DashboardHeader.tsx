import React from 'react';
import { Umbrella, Users } from 'lucide-react';

interface DashboardHeaderProps {
  friendCount: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ friendCount }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-md border border-[#ffacd6]/20">
          <Umbrella className="w-8 h-8 text-[#28428c]" />
          <h1 className="text-2xl font-bold text-[#892f1a]">Net-umbrella</h1>
        </div>
      </div>
      
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#892f1a] mb-2">
          Your Amazing Friendship Network! ✨
        </h2>
        <div className="flex items-center justify-center space-x-2 text-[#624a4a]">
          <Users className="w-4 h-4" />
          <p className="text-sm">
            You're nurturing <span className="font-semibold text-[#28428c]">{friendCount}</span> wonderful connections that bring joy to your life! 🌟
          </p>
        </div>
      </div>
    </div>
  );
};