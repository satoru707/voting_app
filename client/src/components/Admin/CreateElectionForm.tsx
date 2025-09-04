import React, { useState } from "react";
import { ArrowLeft, Calendar, Users, Globe } from "lucide-react";
import { CreateElectionRequest } from "../../types";
import { toast } from "sonner";

interface CreateElectionFormProps {
  onSubmit: (data: CreateElectionRequest) => Promise<void>;
  onCancel: () => void;
  userRole: string;
  userFacultyId?: string;
  userDepartmentId?: string;
}

export const CreateElectionForm: React.FC<CreateElectionFormProps> = ({
  onSubmit,
  onCancel,
  userRole,
  userFacultyId,
  userDepartmentId,
}) => {
  const [formData, setFormData] = useState<CreateElectionRequest>({
    title: "",
    description: "",
    scope: userRole === "ADMIN" && userFacultyId ? "FACULTY" : "DEPARTMENT",
    facultyId: userFacultyId || "",
    departmentId: userDepartmentId || "",
    allowedYears: [100, 200, 300, 400, 500],
    startAt: "",
    endAt: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.startAt ||
      !formData.endAt
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    // setError(""); // No longer needed as toast handles error display

    try {
      await onSubmit(formData);
      toast.success("Election created successfully!");
    } catch (err) {
      toast.error("Failed to create election. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleYearToggle = (year: number) => {
    setFormData((prev) => ({
      ...prev,
      allowedYears: prev.allowedYears.includes(year)
        ? prev.allowedYears.filter((y) => y !== year)
        : [...prev.allowedYears, year],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onCancel}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Panel</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Election
          </h1>
          <p className="text-gray-600 mt-2">
            Set up a new voting process for students
          </p>
        </div>

        {/* {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )} */}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Election Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Student Council Elections 2025"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Annual student council elections for academic year 2025..."
                rows={4}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scope
              </label>
              <select
                value={formData.scope}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scope: e.target.value as any,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {userRole === "SUPER_ADMIN" && (
                  <option value="UNIVERSITY">University Wide</option>
                )}
                {(userRole === "SUPER_ADMIN" ||
                  (userRole === "ADMIN" && userFacultyId)) && (
                  <option value="FACULTY">Faculty Level</option>
                )}
                <option value="DEPARTMENT">Department Level</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allowed Years
              </label>
              <div className="flex flex-wrap gap-2">
                {[100, 200, 300, 400, 500].map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearToggle(year)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.allowedYears.includes(year)
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    Year {year}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startAt: e.target.value }))
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endAt: e.target.value }))
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Election"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
