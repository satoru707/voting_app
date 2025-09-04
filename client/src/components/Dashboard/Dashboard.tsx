import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { ElectionCard } from "../Elections/ElectionCard";
import { VotingInterface } from "../Elections/VotingInterface";
import { ElectionResults } from "../Elections/ElectionResults";
import { Election, VoteRequest } from "../../types";
import { useAuth } from "../../context/AuthContext";

export const Dashboard: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const { user } = useAuth();
  const [selectedElection, setSelectedElection] = useState<Election | null>(
    null
  );
  const [view, setView] = useState<"list" | "vote" | "results">("list");
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  useEffect(() => {
    fetchElections();
  }, [filter]);

  const fetchElections = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/elections?status=${filter === "all" ? "" : filter}${
          user?.facultyId ? `&facultyId=${user.facultyId}` : ""
        }${user?.departmentId ? `&departmentId=${user.departmentId}` : ""}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setElections(data);
      }
    } catch (error) {
      console.error("Failed to fetch elections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleElectionClick = (election: Election) => {
    setSelectedElection(election);
    if (election.status === "OPEN") {
      setView("vote");
    } else if (election.status === "CLOSED") {
      setView("results");
    }
  };

  const handleVote = async (votes: VoteRequest[]) => {
    if (!selectedElection) return;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/elections/${selectedElection.id}/votes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ votes }),
        }
      );

      if (response.ok) {
        // Redirect to success or results page
        setView("results");
      }
    } catch (error) {
      throw error;
    }
  };

  const filteredElections = elections.filter((election) => {
    const matchesSearch =
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (view === "vote" && selectedElection) {
    return (
      <VotingInterface
        election={selectedElection}
        onBack={() => {
          setSelectedElection(null);
          setView("list");
        }}
        onVote={handleVote}
      />
    );
  }

  if (view === "results" && selectedElection) {
    return (
      <ElectionResults
        election={selectedElection}
        results={[]} // Would be fetched from API
        totalVotes={0}
        integrityVerified={true}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Elections</h1>
          <p className="text-gray-600 mt-1">
            Participate in university elections
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search elections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Elections</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Elections Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading elections...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredElections.map((election) => (
            <ElectionCard
              key={election.id}
              election={election}
              onClick={() => handleElectionClick(election)}
            />
          ))}
        </div>
      )}

      {!loading && filteredElections.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No elections found</p>
        </div>
      )}
    </div>
  );
};
