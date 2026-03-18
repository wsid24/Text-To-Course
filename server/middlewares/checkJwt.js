const { auth } = require("express-oauth2-jwt-bearer");
const { AUTH0_ISSUER, AUTH0_AUDIENCE } = require("../config/env");

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
  audience: AUTH0_AUDIENCE,
  issuerBaseURL: AUTH0_ISSUER,
  tokenSigningAlg: "RS256",
});

module.exports = checkJwt;
