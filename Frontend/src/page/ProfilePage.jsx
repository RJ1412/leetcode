import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";

import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import {
  PieChart,
  Pie,
  Cell as PieCell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const CHART_PALETTE = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc949"];
const HEATMAP_COLORS = ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127"];
const HEATMAP_THRESHOLDS = [1, 3, 5, 8];

const heatmapStartDate = new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate());

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [editedProfile, setEditedProfile] = useState({ name: "" });
  const [editing, setEditing] = useState(false);
  const [solvedQuestions, setSolvedQuestions] = useState([]);
  const [difficultyData, setDifficultyData] = useState([]);
  const [topicData, setTopicData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, diffRes, topicRes] = await Promise.all([
          axiosInstance.get("/users/my-profile"),
          axiosInstance.get("/users/solved-problems-stats"),
          axiosInstance.get("/users/solved-problems-topics"),
        ]);
        setProfile(profileRes.data.user || {});
        setSolvedQuestions(profileRes.data.solvedProblems || []);
        setDifficultyData(diffRes.data.pieChartData || []);
        setTopicData(topicRes.data.topicChartData || []);
        const heatmapRes = await axiosInstance.get("/users/solved-heatmap");
        setHeatmapData(heatmapRes.data.heatmapData || []);
      } catch (error) {
        console.error("Error fetching profile or stats data:", error);
      }
    };
    fetchData();
  }, []);

  const handleEditToggle = () => {
    if (!editing && profile) setEditedProfile({ name: profile.name || "" });
    setEditing((prev) => !prev);
  };

  const handleInputChange = (e) => {
    setEditedProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileUpdate = async () => {
    try {
      const { data } = await axiosInstance.put("/users/update-profile", editedProfile);
      setProfile(data.user || {});
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const styleForValue = (value) => {
    if (!value || value.count === 0) return { fill: HEATMAP_COLORS[0] };
    const idx = HEATMAP_THRESHOLDS.reduce((acc, t, i) => (value.count >= t ? i + 1 : acc), 0);
    return { fill: HEATMAP_COLORS[idx] };
  };

  const totalSubs = heatmapData.reduce((sum, d) => sum + d.count, 0);
  const activeDays = heatmapData.filter((d) => d.count > 0).length;
  const activeSet = new Set(heatmapData.filter((d) => d.count > 0).map((d) => d.date));

  let maxStreak = 0, curStreak = 0;
  for (let d = new Date(heatmapStartDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().split("T")[0];
    if (activeSet.has(iso)) {
      curStreak++;
      maxStreak = Math.max(maxStreak, curStreak);
    } else curStreak = 0;
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Profile Header */}
      <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6" initial="hidden" animate="visible" variants={sectionVariants} transition={{ duration: 0.5 }}>
        <Link to={"/"} className="flex items-center gap-2 text-primary">
            <Home className="w-6 h-6" />
            <ChevronRight className="w-4 h-4" />
          </Link>
        <h1 className="text-3xl font-bold mb-4"> {profile?.name}</h1>
        {!editing ? (
          <>
            <p className="text-lg"><span className="font-semibold">Name:</span> {profile?.name}</p>
            <p className="text-lg"><span className="font-semibold">Email:</span> {profile?.email}</p>
            <button onClick={handleEditToggle} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition">Edit Profile</button>
          </>
        ) : (
          <>
            <label className="block mb-3">
              <span className="font-semibold">Name:</span>
              <input type="text" name="name" value={editedProfile.name} onChange={handleInputChange} className="block w-full mt-1 border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </label>
            <button onClick={handleProfileUpdate} className="mr-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition">Save</button>
            <button onClick={handleEditToggle} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition">Cancel</button>
          </>
        )}
      </motion.div>

      {/* Heatmap Section */}
      <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6" initial="hidden" animate="visible" variants={sectionVariants} transition={{ duration: 0.5, delay: 0.1 }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-semibold">{totalSubs} submissions in the past one year</span>
            <span className="text-gray-400 cursor-pointer" title="Total problems submitted over the last 365 days.">ⓘ</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
            <span>Total active days: {activeDays}</span>
            <span>Max streak: {maxStreak}</span>
            <select className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-white">
              <option>Current</option>
              <option>Last Year</option>
              <option>All-Time</option>
            </select>
          </div>
        </div>

        {/* 👇 FIX: Removed hardcoded height */}
        <div className="overflow-x-auto">
          <CalendarHeatmap
            startDate={heatmapStartDate}
            endDate={new Date()}
            values={heatmapData}
            styleForValue={styleForValue}
            boxSize={20}
            gutterSize={4}
            showMonthLabels={true}
            showWeekdayLabels={false}
          />
        </div>

        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
          <span>Less</span>
          {HEATMAP_COLORS.map((color, i) => (
            <span key={i} className="w-4 h-4 rounded mx-0.5 border" style={{ backgroundColor: color }} />
          ))}
          <span>More</span>
        </div>
      </motion.div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[{ title: "Solved by Difficulty", data: difficultyData }, { title: "Solved by Topic", data: topicData }].map(({ title, data }, i) => (
          <motion.div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6" initial="hidden" animate="visible" variants={sectionVariants} transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}>
            <h2 className="text-2xl font-semibold mb-4">{title}</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={100}
                  label
                >
                  {data.map((entry, index) => (
                    <PieCell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value, name) => [value, name]} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        ))}
      </div>

      {/* Solved Questions */}
      <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6" initial="hidden" animate="visible" variants={sectionVariants} transition={{ duration: 0.5, delay: 0.4 }}>
        <h2 className="text-2xl font-semibold mb-4">Solved Questions</h2>
        <ul className="list-disc list-inside space-y-1 max-h-64 overflow-y-auto">
          {solvedQuestions.map((q) => (
            <li key={q.id} className="text-base">
              <a href={`/problem/${q.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">{q.title}</a>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
