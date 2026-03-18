import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="text-center py-20 px-4">
      <h1 className="text-4xl font-bold mb-6">
        Generate <span className="text-primary-light">Full Courses</span> with AI
      </h1>
      <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
        Input any topic, and let Gemini build a structured curriculum with comprehensive modules and lessons for you.
      </p>
      
      <div className="bg-surface border border-indigo-500/20 p-8 rounded-2xl max-w-lg mx-auto shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-white">What do you want to learn?</h2>
        <div className="flex gap-4">
          <input 
            className="flex-1 bg-background/50 border border-indigo-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-light" 
            placeholder="e.g. Advanced TypeScript"
          />
          <button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Generate
          </button>
        </div>
      </div>

      <div className="mt-16 text-left">
        <h3 className="text-2xl font-bold mb-6 border-b border-indigo-500/20 pb-2">Recent Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <Link key={i} to={`/course/${i}`} className="block bg-surface border border-indigo-500/20 p-6 rounded-xl hover:border-primary-light transition-colors">
              <h4 className="font-bold text-lg mb-2 text-white">Sample Course {i}</h4>
              <p className="text-sm text-gray-400 mb-4">A complete guide to mastering placeholder topics with AI.</p>
              <span className="text-primary-light text-sm font-semibold">View Course &rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
