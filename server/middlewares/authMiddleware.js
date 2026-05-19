const { auth } = require("express-oauth2-jwt-bearer");
const ApiError = require("../utils/ApiError");

/**
 * Auth0 JWT validator.
 *
 * Verifies the Bearer access token against the configured Auth0 tenant
 * (issuer + audience), then sets `req.user = { id, email }`. The Auth0
 * `sub` claim is the canonical user identifier and is stored verbatim
 * as `creator` on Course documents — that's why Course.creator is a
 * String, not an ObjectId.
 *
 * Required env:
 *   AUTH0_ISSUER_BASE_URL   e.g. https://your-tenant.us.auth0.com/
 *   AUTH0_AUDIENCE          e.g. https://text-to-course-api
 */
const requireAuth0 = auth({
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || process.env.AUTH0_ISSUER,
  audience: process.env.AUTH0_AUDIENCE,
  tokenSigningAlg: "RS256",
});

const authMiddleware = (req, res, next) => {
  requireAuth0(req, res, (err) => {
    if (err) {
      const message = err.code === "invalid_token"
        ? "Invalid or expired access token"
        : err.message || "Authentication required";
      return next(new ApiError(401, message));
    }
    const payload = req.auth && req.auth.payload;
    if (!payload || !payload.sub) {
      return next(new ApiError(401, "Token has no subject claim"));
    }
    req.user = {
      id: payload.sub,
      email: payload.email || payload["https://text-to-course/email"] || null,
      name: payload.name || payload["https://text-to-course/name"] || null,
    };
    next();
  });
};

module.exports = authMiddleware;
