/**
 * With Auth0 in place, the API no longer issues credentials or sessions
 * directly — login and registration happen on Auth0's hosted pages via
 * the React SDK's `loginWithRedirect()`. The only thing the API still
 * exposes is a `/me` echo, which the FE uses to confirm token validity
 * and pull display info.
 */
const getMe = (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    },
  });
};

module.exports = { getMe };
