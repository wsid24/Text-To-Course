import { Outlet, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Layout = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <div className="min-h-screen flex flex-col bg-background text-gray-100 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-surface backdrop-blur-md border-b border-indigo-500/20 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary-light flex items-center gap-2">
          <span>Text-to-Learn</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className="hover:text-primary-light transition-colors">Home</Link>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Hi, {user?.name}</span>
              <button 
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="px-4 py-2 bg-surface border border-indigo-500/30 rounded-lg text-white font-semibold hover:bg-white/5 transition-colors"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => loginWithRedirect()}
              className="px-4 py-2 bg-primary rounded-lg text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              Sign In
            </button>
          )}
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Slot */}
        <aside className="w-64 flex-shrink-0 border-r border-indigo-500/20 bg-surface/50 p-4 overflow-y-auto hidden md:block">
          <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-4">Course Content</h3>
          <nav className="flex flex-col gap-2">
            {/* Sidebar content would go here, optionally passed via Context or nested routes */}
            <p className="text-sm text-gray-500">Select a course to see modules.</p>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
