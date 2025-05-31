import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useProfileStore } from "../store/useProfileStore";

const COLORS = {
  EASY: "#00C49F",
  MEDIUM: "#FFBB28",
  HARD: "#FF4C4C",
};

const MyProfilePage = () => {
  const { profile, fetchProfile, updateProfile, isLoading } = useProfileStore();
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.user?.name) {
      setName(profile.user.name);
    }
  }, [profile]);

  const solvedProblems = profile?.solvedProblems || [];

  const difficultyCounts = solvedProblems.reduce((acc, p) => {
    const level = p.problem.difficuilty || "Unknown";
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(difficultyCounts).map(([difficulty, count]) => ({
    name: difficulty,
    value: count,
  }));

  const handleSave = () => {
    updateProfile({ name });
    setIsEditing(false);
  };

  if (isLoading || !profile) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {/* Edit Profile */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={name}
            disabled={!isEditing}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="bg-primary text-white px-4 py-2 rounded">
              Edit
            </button>
          ) : (
            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">
              Save
            </button>
          )}
        </div>
      </div>

      {/* Solved Problems */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Solved Questions</h2>
        {solvedProblems.length > 0 ? (
          <ul className="list-disc list-inside space-y-2">
            {solvedProblems.map((q) => (
              <li key={q.id}>
                <span className="font-medium">{q.problem.title}</span> —{" "}
                <span>{q.problem.difficuilty}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No problems solved yet.</p>
        )}
      </div>

      {/* Difficulty Pie Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Difficulty Breakdown</h2>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={100} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name.toUpperCase()] || "#8884d8"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>No data available for chart.</p>
        )}
      </div>
    </div>
  );
};

export default MyProfilePage;
