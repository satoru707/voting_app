import React, { useState, useEffect } from "react";
import { Plus, Calendar, Users, Settings, BarChart3 } from "lucide-react";
import { CreateElectionForm } from "./CreateElectionForm";
import { ElectionManagement } from "./ElectionManagement";
import { ElectionCard } from "../Elections/ElectionCard";
import { useAuth } from "../../context/AuthContext";
import { Election } from "../../types";

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<"overview" | "create" | "manage">(
    "overview"
  );
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  useEffect(() => {
    fetchAdminElections();
  }, []);

  const fetchAdminElections = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/elections`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setElections(data);
      }
    } catch (error) {
      console.error("Failed to fetch admin elections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleElectionClick = (election: Election) => {
    setSelectedElection(election);
    setView("manage");
  };

  const handleCreateElection = async (electionData: any) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/elections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(electionData),
      });

      if (response.ok) {
        await fetchAdminElections();
        setView("overview");
      }
    } catch (error) {
      console.error("Failed to create election:", error);
      throw error;
    }
  };

  if (view === "create") {
    return (
      <CreateElectionForm
        onSubmit={handleCreateElection}
        onCancel={() => setView("overview")}
        userRole={user?.role || "ADMIN"}
        userFacultyId={user?.facultyId}
        userDepartmentId={user?.departmentId}
      />
    );
  }

  if (view === "manage") {
    return (
      <ElectionManagement
        elections={elections}
        selectedElection={selectedElection}
        onBack={() => setView("overview")}
        onRefresh={fetchAdminElections}
      />
    );
  }

  const openElections = elections.filter((e) => e.status === "OPEN").length;
  const closedElections = elections.filter((e) => e.status === "CLOSED").length;
  const draftElections = elections.filter((e) => e.status === "DRAFT").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-1">
            Manage elections for {user?.adminLevel?.toLowerCase()} level
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Total Elections</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{elections.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 text-green-600 mb-2">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Open</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{openElections}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 text-yellow-600 mb-2">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Draft</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{draftElections}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="font-medium">Closed</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{closedElections}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => setView("create")}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Create New Election
              </h3>
              <p className="text-gray-600 text-sm">
                Set up a new voting process
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setView("manage")}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Elections</h3>
              <p className="text-gray-600 text-sm">
                Edit and monitor ongoing elections
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Elections */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Elections
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading elections...</p>
          </div>
        ) : elections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No elections created yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {elections.slice(0, 4).map((election) => (
              <ElectionCard
                key={election.id}
                election={election}
                onClick={() => handleElectionClick(election)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
