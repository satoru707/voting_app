import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Candidate, Election } from "../../types";

interface EditCandidateModalProps {
  election: Election;
  candidate: Candidate;
  onClose: () => void;
  onCandidateUpdated: () => void;
}

export const EditCandidateModal: React.FC<EditCandidateModalProps> = ({
  election,
  candidate,
  onClose,
  onCandidateUpdated,
}) => {
  const [matricNo, setMatricNo] = useState(candidate.student?.matricNo || "");
  const [position, setPosition] = useState(candidate.position);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  useEffect(() => {
    if (candidate.student?.matricNo) setMatricNo(candidate.student.matricNo);
    setPosition(candidate.position);
  }, [candidate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!matricNo || !position) {
      setError("Matriculation number and position are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/elections/${election.id}/candidates/${candidate.id}`,
        {
          method: "PUT", // Or PATCH, depending on your API
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            studentId: matricNo, // Assuming studentId is matricNo
            position,
          }),
        }
      );

      if (response.ok) {
        onCandidateUpdated();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update candidate.");
      }
    } catch (err) {
      console.error("Edit candidate error:", err);
      setError("Network error or unexpected issue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Edit Candidate in {election.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="matricNo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Student Matriculation Number
            </label>
            <input
              type="text"
              id="matricNo"
              value={matricNo}
              onChange={(e) => setMatricNo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., U18ME1001"
              required
            />
          </div>

          <div>
            <label
              htmlFor="position"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Position
            </label>
            <input
              type="text"
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., President"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              {isSubmitting ? "Updating..." : "Update Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
