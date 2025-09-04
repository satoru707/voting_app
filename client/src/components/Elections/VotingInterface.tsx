import React, { useState } from 'react';
import { Check, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Election, Candidate, VoteRequest } from '../../types';

interface VotingInterfaceProps {
  election: Election;
  onBack: () => void;
  onVote: (votes: VoteRequest[]) => Promise<void>;
}

export const VotingInterface: React.FC<VotingInterfaceProps> = ({
  election,
  onBack,
  onVote,
}) => {
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Group candidates by position
  const candidatesByPosition = election.candidates?.reduce((acc, candidate) => {
    if (!acc[candidate.position]) {
      acc[candidate.position] = [];
    }
    acc[candidate.position].push(candidate);
    return acc;
  }, {} as Record<string, Candidate[]>) || {};

  const positions = Object.keys(candidatesByPosition);

  const handleCandidateSelect = (position: string, candidateId: string) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [position]: candidateId,
    }));
  };

  const handleSubmit = () => {
    if (positions.length === Object.keys(selectedCandidates).length) {
      setShowConfirmation(true);
    }
  };

  const confirmVote = async () => {
    setIsSubmitting(true);
    try {
      const votes: VoteRequest[] = Object.entries(selectedCandidates).map(
        ([position, candidateId]) => ({
          candidateId,
          position,
        })
      );
      
      await onVote(votes);
    } catch (error) {
      console.error('Vote submission failed:', error);
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center mb-6">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Confirm Your Vote</h2>
            <p className="text-gray-600 mt-2">
              Please review your selections. Once submitted, you cannot change your vote.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {positions.map((position) => {
              const candidateId = selectedCandidates[position];
              const candidate = candidatesByPosition[position].find(c => c.id === candidateId);
              return (
                <div key={position} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-1">{position}</h3>
                  <p className="text-gray-600">
                    {candidate?.student?.matricNo} - {candidate?.student?.email}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setShowConfirmation(false)}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Review Choices
            </button>
            <button
              onClick={confirmVote}
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit Vote</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Elections</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{election.title}</h1>
          <p className="text-gray-600 mt-2">{election.description}</p>
        </div>

        <div className="space-y-8">
          {positions.map((position) => (
            <div key={position} className="border-b border-gray-100 pb-6 last:border-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{position}</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                {candidatesByPosition[position].map((candidate) => {
                  const isSelected = selectedCandidates[position] === candidate.id;
                  
                  return (
                    <div
                      key={candidate.id}
                      onClick={() => handleCandidateSelect(position, candidate.id)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {candidate.student?.matricNo}
                          </p>
                          <p className="text-sm text-gray-600">
                            {candidate.student?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {Object.keys(selectedCandidates).length} of {positions.length} positions selected
            </p>
            
            <button
              onClick={handleSubmit}
              disabled={positions.length !== Object.keys(selectedCandidates).length}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              Review & Submit Vote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};