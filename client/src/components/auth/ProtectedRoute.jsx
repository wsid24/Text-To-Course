import { withAuthenticationRequired } from "@auth0/auth0-react";

/**
 * ProtectedRoute component that redirects unauthenticated users to the Auth0 login page.
 */
const ProtectedRoute = ({ component, ...args }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"></div>
      </div>
    ),
  });

  return <Component {...args} />;
};

export default ProtectedRoute;
