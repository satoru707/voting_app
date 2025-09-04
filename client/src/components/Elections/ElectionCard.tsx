import React from 'react';
import { Calendar, Users, Clock, ArrowRight } from 'lucide-react';
import { Election } from '../../types';

interface ElectionCardProps {
  election: Election;
  onClick: () => void;
  hasVoted?: boolean;
}

export const ElectionCard: React.FC<ElectionCardProps> = ({ 
  election, 
  onClick, 
  hasVoted = false 
}) => {
  const getStatusColor = () => {
    switch (election.status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isActive = election.status === 'OPEN';
  const timeRemaining = isActive ? new Date(election.endAt).getTime() - Date.now() : 0;
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {election.title}
          </h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {election.description}
          </p>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {election.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {new Date(election.startAt).toLocaleDateString()} - {new Date(election.endAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-500">
          <Users className="w-4 h-4 mr-2" />
          <span>{election.candidates?.length || 0} candidates</span>
        </div>

        {isActive && (
          <div className="flex items-center text-sm text-orange-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{hoursRemaining}h remaining</span>
          </div>
        )}

        {hasVoted && (
          <div className="text-sm text-green-600 font-medium">
            ✓ You have voted in this election
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {election.scope} • Years {election.allowedYears.join(', ')}
          </span>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};