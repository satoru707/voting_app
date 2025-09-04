import React, { useState } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Users, Clock } from "lucide-react";
import { Election } from "../../types";
import { AddCandidateModal } from "./AddCandidateModal";
import { CandidateManagement } from "./CandidateManagement";
import { toast } from "sonner";

interface ElectionManagementProps {
  elections: Election[];
  selectedElection: Election | null;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

export const ElectionManagement: React.FC<ElectionManagementProps> = ({
  elections,
  selectedElection: initialSelectedElection,
  onBack,
  onRefresh,
}) => {
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  // const [requestCloseMessage, setRequestCloseMessage] = useState<{
  //   electionId: string;
  //   message: string;
  // } | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    initialSelectedElection
  );

  const handleCloseElection = async (electionId: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/elections/${electionId}/close-request`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        await onRefresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to request election closure.");
      }
    } catch (error) {
      console.error("Failed to close election:", error);
      toast.error("Network error or unexpected issue.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Panel</span>
        </button>
      </div>

      {currentView === "list" ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Manage Elections
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and control your elections
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Election
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidates
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {elections.map((election) => (
                  <tr key={election.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        onClick={() => {
                          setSelectedElection(election);
                          setCurrentView("detail");
                        }}
                        className="cursor-pointer hover:underline"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {election.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {election.scope}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          election.status === "OPEN"
                            ? "bg-green-100 text-green-800"
                            : election.status === "CLOSED"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {election.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(election.startAt).toLocaleDateString()} -
                          {new Date(election.endAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{election.candidates?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {election.status === "OPEN" && (
                          <button
                            onClick={() => handleCloseElection(election.id)}
                            className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Request Close
                          </button>
                        )}
                        {/* <button
                          onClick={() => setShowAddCandidateModal(true)}
                          className="text-green-600 hover:text-green-900 px-3 py-1 rounded-md hover:bg-green-50 transition-colors flex items-center space-x-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Candidate</span>
                        </button> */}
                        <button className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                      {/* {requestCloseMessage?.electionId === election.id && (
                        <p className="text-xs text-gray-500 mt-1">
                          {requestCloseMessage.message}
                        </p>
                      )} */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {elections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No elections created yet.</p>
            </div>
          )}
        </div>
      ) : selectedElection && currentView === "detail" ? (
        <CandidateManagement
          election={selectedElection}
          onBack={() => setCurrentView("list")}
          onRefresh={onRefresh}
        />
      ) : null}

      {showAddCandidateModal && selectedElection && (
        <AddCandidateModal
          election={selectedElection}
          onClose={() => setShowAddCandidateModal(false)}
          onCandidateAdded={onRefresh}
        />
      )}
    </div>
  );
};
