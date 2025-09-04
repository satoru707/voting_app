import React from "react";
import { ArrowLeft, Plus, Edit, Trash2, Users } from "lucide-react";
import { Candidate, Election } from "../../types";
import { AddCandidateModal } from "./AddCandidateModal";
import { EditCandidateModal } from "./EditCandidateModal";
import { toast } from "sonner";

interface CandidateManagementProps {
  election: Election;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

export const CandidateManagement: React.FC<CandidateManagementProps> = ({
  election,
  onBack,
  onRefresh,
}) => {
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  const [showAddCandidateModal, setShowAddCandidateModal] =
    React.useState(false);
  const [showEditCandidateModal, setShowEditCandidateModal] =
    React.useState(false);
  const [candidateToEdit, setCandidateToEdit] =
    React.useState<Candidate | null>(null);

  const handleAddCandidateClick = () => {
    setShowAddCandidateModal(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setCandidateToEdit(candidate);
    setShowEditCandidateModal(true);
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/admin/elections/${election.id}/candidates/${candidateId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (response.ok) {
          toast.success("Candidate deleted successfully.");
          onRefresh();
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to delete candidate.");
        }
      } catch (error) {
        console.error("Delete candidate error:", error);
        toast.error("Network error or unexpected issue.");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Elections</span>
        </button>
        <button
          onClick={handleAddCandidateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Candidate</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {election.title}
        </h2>
        <p className="text-gray-600 mb-6">{election.description}</p>

        <h3 className="text-xl font-bold text-gray-900 mb-4">Candidates</h3>
        {election.candidates && election.candidates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {election.candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {candidate.student?.matricNo} ({candidate.student?.email})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {candidate.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditCandidate(candidate)}
                          className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No candidates added yet.</p>
        )}
      </div>

      {showAddCandidateModal && (
        <AddCandidateModal
          election={election}
          onClose={() => setShowAddCandidateModal(false)}
          onCandidateAdded={onRefresh}
        />
      )}

      {showEditCandidateModal && candidateToEdit && (
        <EditCandidateModal
          election={election}
          candidate={candidateToEdit}
          onClose={() => setShowEditCandidateModal(false)}
          onCandidateUpdated={() => {
            onRefresh();
            setCandidateToEdit(null);
          }}
        />
      )}
    </div>
  );
};
