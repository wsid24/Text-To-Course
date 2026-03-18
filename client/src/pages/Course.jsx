import { useParams, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

const Course = () => {
  const { id } = useParams();
  const { getAccessTokenSilently } = useAuth0();
  const [saveStatus, setSaveStatus] = useState("");

  const handleSaveCourse = async () => {
    try {
      setSaveStatus("Saving...");
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE || "your-api-audience",
        },
      });

      const response = await fetch("http://localhost:5000/api/courses/save-course", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: id, title: `Sample Course ${id}` }),
      });

      if (response.ok) {
        setSaveStatus("Saved successfully!");
      } else {
        setSaveStatus("Failed to save.");
      }
    } catch (e) {
      console.error(e.message);
      setSaveStatus("Error authenticating API call.");
    }
  };

  return (
    <div className="py-8">
      <Link to="/" className="text-primary-light text-sm font-semibold hover:underline mb-6 inline-block">&larr; Back to Home</Link>
      
      <div className="bg-surface border border-indigo-500/20 rounded-2xl p-8 mb-8 shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-white">Sample Course {id}</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSaveCourse}
              className="bg-primary/20 hover:bg-primary/40 text-primary-light border border-primary-light/50 px-3 py-1 rounded cursor-pointer text-xs font-bold transition-colors"
            >
              {saveStatus || "Save Course"}
            </button>
            <span className="bg-primary/20 text-primary-light px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Intermediate</span>
          </div>
        </div>
        <p className="text-gray-400 mb-6">
          This is an AI-generated course overview. Dive deep into the modules below to master the topic.
        </p>
        
        <div className="h-2 bg-background/50 rounded-full overflow-hidden">
          <div className="h-full bg-primary-light w-1/3 rounded-full"></div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-right">33% completed</p>
      </div>

      <h2 className="text-xl font-bold mb-4 border-b border-indigo-500/20 pb-2 text-white">Modules</h2>
      
      <div className="space-y-4">
        {[1,2,3].map(mod => (
          <div key={mod} className="bg-surface border border-indigo-500/10 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-2 text-gray-200">Module {mod}: Getting Started</h3>
            <div className="pl-4 border-l-2 border-indigo-500/30 mt-4 space-y-3">
              {[1,2].map(les => (
                <Link key={les} to={`/lesson/${mod}0${les}`} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group text-gray-400 hover:text-white">
                  <div className="w-5 h-5 rounded-full border border-gray-600 group-hover:border-primary-light flex items-center justify-center"></div>
                  <span>Lesson {les}: Core Concepts</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Course;
