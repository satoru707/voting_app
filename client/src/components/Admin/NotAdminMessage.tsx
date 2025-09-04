import React from "react";

export const NotAdminMessage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg shadow-md p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
      <p className="text-gray-600">
        This student isn't an admin, so you can't access admin tools.
      </p>
    </div>
  );
};
