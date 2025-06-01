import React, { useEffect } from "react";
import { useProblemStore } from "../store/useProblemStore";
import { Loader, PlusCircle } from "lucide-react";
import ProblemTable from "../components/ProblemTable";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";


const HomePage = () => {
  const { getAllProblems, problems, isProblemsLoading } = useProblemStore();
  const { authUser } = useAuthStore();
  useEffect(() => {
    getAllProblems();
  }, [getAllProblems]);

  if (isProblemsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center mt-14 px-4 relative">
      <div className="absolute top-16 left-0 w-1/3 h-1/3 bg-primary opacity-30 blur-3xl rounded-md bottom-9"></div>
      <h1 className="text-4xl font-extrabold z-10 text-center">
        Welcome to <span className="text-primary">LeetLab</span>
      </h1>

      <p className="mt-4 text-center text-lg font-semibold text-gray-500 dark:text-gray-400 z-10">
        A Platform Inspired by Leetcode which helps you to prepare for coding
        interviews and improve your coding skills by solving problems
      </p>

      {/* Add Problem Button */}
      {authUser?.role === "ADMIN" && (
        <Link
          to="/add-problem"
          className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow-md hover:bg-primary/90 transition z-10"
        >
          <PlusCircle className="w-5 h-5" />
          Add Problem
        </Link>
      )}
      {problems.length > 0 ? (
        <ProblemTable problems={problems} />
      ) : (
        <p className="mt-10 text-center text-lg font-semibold text-gray-500 dark:text-gray-400 z-10 border border-primary px-4 py-2 rounded-md border-dashed">
          No problems found
        </p>
      )}
    </div>
  );
};

export default HomePage;
