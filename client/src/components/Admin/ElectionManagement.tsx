import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Users,
  Clock,
  Eye,
  Settings,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Election } from "../../types";
import { EditElectionForm } from "./EditElectionForm";
import { CandidateManagement } from "./CandidateManagement";

interface ElectionManagementProps {
  elections: Election[];
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

export const ElectionManagement: React.FC<ElectionManagementProps> = ({
  elections,
  onBack,
  onRefresh,
}) => {
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );
  const [view, setView] = useState<"list" | "edit" | "candidates" | "details">(
    "list"
  );
  const [loading, setLoading] = useState(false);

  const handleCloseElection = async (electionId: string) => {
    if (
      !confirm(
        "Are you sure you want to close this election? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/elections/${electionId}/close-request`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        await onRefresh();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to close election");
      }
    } catch (error) {
      console.error("Failed to close election:", error);
      alert("Failed to close election. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditElection = (election: Election) => {
    setSelectedElection(election);
    setView("edit");
  };

  const handleManageCandidates = (election: Election) => {
    setSelectedElection(election);
    setView("candidates");
  };

  const handleViewDetails = (election: Election) => {
    setSelectedElection(election);
    setView("details");
  };

  const handleUpdateElection = async (electionData: any) => {
    if (!selectedElection) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/elections/${selectedElection.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(electionData),
        }
      );

      if (response.ok) {
        await onRefresh();
        setView("list");
        setSelectedElection(null);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update election");
      }
    } catch (error) {
      console.error("Failed to update election:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElection = async (electionId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this election? This action cannot be undone and will remove all associated data."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/elections/${electionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await onRefresh();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete election");
      }
    } catch (error) {
      console.error("Failed to delete election:", error);
      alert("Failed to delete election. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (view === "edit" && selectedElection) {
    return (
      <EditElectionForm
        election={selectedElection}
        onSubmit={handleUpdateElection}
        onCancel={() => {
          setView("list");
          setSelectedElection(null);
        }}
        loading={loading}
      />
    );
  }

  if (view === "candidates" && selectedElection) {
    return (
      <CandidateManagement
        election={selectedElection}
        onBack={() => {
          setView("list");
          setSelectedElection(null);
        }}
        onRefresh={onRefresh}
      />
    );
  }

  if (view === "details" && selectedElection) {
    return (
      <ElectionDetails
        election={selectedElection}
        onBack={() => {
          setView("list");
          setSelectedElection(null);
        }}
        onEdit={() => setView("edit")}
        onManageCandidates={() => setView("candidates")}
      />
    );
  }
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Total Elections</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{elections.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 text-green-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Open</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {elections.filter((e) => e.status === "OPEN").length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 text-yellow-600 mb-2">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Draft</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {elections.filter((e) => e.status === "DRAFT").length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Closed</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {elections.filter((e) => e.status === "CLOSED").length}
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Manage Elections</h1>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votes
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
                    <div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <span>0</span> {/* This would come from ballot count */}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(election)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {election.status === "DRAFT" && (
                        <button
                          onClick={() => handleEditElection(election)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-colors"
                          title="Edit Election"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleManageCandidates(election)}
                        className="text-green-600 hover:text-green-900 p-2 rounded-md hover:bg-green-50 transition-colors"
                        title="Manage Candidates"
                      >
                        <Users className="w-4 h-4" />
                      </button>

                      {election.status === "OPEN" && (
                        <button
                          onClick={() => handleCloseElection(election.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Close Election"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      {election.status === "DRAFT" && (
                        <button
                          onClick={() => handleDeleteElection(election.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete Election"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {elections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No elections found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Election Details Component
const ElectionDetails: React.FC<{
  election: Election;
  onBack: () => void;
  onEdit: () => void;
  onManageCandidates: () => void;
}> = ({ election, onBack, onEdit, onManageCandidates }) => {
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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {election.title}
            </h1>
            <p className="text-gray-600 mt-2">{election.description}</p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              election.status === "OPEN"
                ? "bg-green-100 text-green-800"
                : election.status === "CLOSED"
                ? "bg-gray-100 text-gray-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {election.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Scope
              </label>
              <p className="text-gray-900 capitalize">
                {election.scope.toLowerCase()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Allowed Years
              </label>
              <p className="text-gray-900">
                {election.allowedYears.join(", ")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Candidates
              </label>
              <p className="text-gray-900">
                {election.candidates?.length || 0} registered
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <p className="text-gray-900">
                {new Date(election.startAt).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <p className="text-gray-900">
                {new Date(election.endAt).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Created
              </label>
              <p className="text-gray-900">
                {new Date(election.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4 pt-6 border-t border-gray-200">
          {election.status === "DRAFT" && (
            <button
              onClick={onEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Election</span>
            </button>
          )}

          <button
            onClick={onManageCandidates}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Manage Candidates</span>
          </button>
        </div>
      </div>
    </div>
  );
};
