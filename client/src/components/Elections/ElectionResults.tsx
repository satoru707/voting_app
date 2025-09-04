import React from 'react';
import { TrendingUp, Users, Shield } from 'lucide-react';
import { Election, Candidate } from '../../types';

interface ElectionResultsProps {
  election: Election;
  results: Array<{
    candidate: Candidate;
    voteCount: number;
    percentage: number;
  }>;
  totalVotes: number;
  integrityVerified: boolean;
}

export const ElectionResults: React.FC<ElectionResultsProps> = ({
  election,
  results,
  totalVotes,
  integrityVerified,
}) => {
  // Group results by position
  const resultsByPosition = results.reduce((acc, result) => {
    const position = result.candidate.position;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  // Sort by vote count within each position
  Object.keys(resultsByPosition).forEach(position => {
    resultsByPosition[position].sort((a, b) => b.voteCount - a.voteCount);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{election.title}</h1>
          <div className="flex items-center space-x-2">
            <Shield className={`w-5 h-5 ${integrityVerified ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-sm font-medium ${integrityVerified ? 'text-green-600' : 'text-red-600'}`}>
              {integrityVerified ? 'Integrity Verified' : 'Integrity Error'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Total Votes</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{totalVotes}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Status</span>
            </div>
            <p className="text-lg font-semibold text-green-900 mt-1 capitalize">
              {election.status.toLowerCase()}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Scope</span>
            </div>
            <p className="text-lg font-semibold text-purple-900 mt-1 capitalize">
              {election.scope.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {Object.entries(resultsByPosition).map(([position, positionResults]) => (
        <div key={position} className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{position}</h2>
          
          <div className="space-y-4">
            {positionResults.map((result, index) => (
              <div
                key={result.candidate.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {result.candidate.student?.matricNo}
                    </p>
                    <p className="text-sm text-gray-600">
                      {result.candidate.student?.email}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {result.voteCount}
                  </p>
                  <p className="text-sm text-gray-600">
                    {result.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};