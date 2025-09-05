import React, { useState, useEffect } from "react";
import { Shield, Users, Plus, Trash2 } from "lucide-react";
import { Admin, CreateAdminRequest } from "../../types";
import { toast } from "sonner";

export const SuperAdminPanel: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [matricNo, setMatricNo] = useState("");
  var level = "";
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/super/admins`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    }
  };

  const handleCreateAdmin = async (matricNo: string) => {
    setMatricNo("");
    try {
      const response = await fetch(`${BACKEND_URL}/api/super/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ matricNo, level }),
      });
      const data = await response.json();
      console.log("Create admin response:", data);

      if (response.ok) {
        await fetchAdmins();
        toast.success(data.message || "Admin created successfully");
      } else {
        toast.error(data.message || "Failed to create admin");
      }
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create admin:", error);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/super/admins/${adminId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        await fetchAdmins();
      }
    } catch (error) {
      console.error("Failed to delete admin:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Shield className="w-8 h-8 text-red-600" />
            <span>Super Admin Panel</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage system administrators</p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Admin</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="font-medium">Total Admins</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{admins.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 text-green-600 mb-2">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Faculty Admins</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {admins.filter((a) => a.level === "FACULTY").length}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 text-purple-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="font-medium">Dept Admins</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {admins.filter((a) => a.level === "DEPARTMENT").length}
          </p>
        </div>
      </div>

      {/* Admin List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            System Administrators
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Scope
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {admin.studentId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.level === "FACULTY"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {admin.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {admin.level === "FACULTY"
                      ? `Faculty: ${admin.facultyId}`
                      : `Department: ${admin.departmentId}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal would go here */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Add New Admin
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateAdmin(matricNo);
                setShowCreateForm(false);
              }}
              className="space-y-4"
            >
              <input
                type="text"
                value={matricNo}
                onChange={(e) => setMatricNo(e.target.value)}
                placeholder="Student Matric No"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                required
                onChange={(e) => (level = e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Level</option>
                <option value="FACULTY">Faculty Admin</option>
                <option value="DEPARTMENT">Department Admin</option>
              </select>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
