/**
 * Abstract LLM provider. Implementations must override `generateJSON`.
 * The pipeline only talks to this interface, so swapping Gemini for GPT
 * or a mock is a one-line config change.
 */
class LLMProvider {
  constructor({ name }) {
    this.name = name;
  }

  // eslint-disable-next-line no-unused-vars
  async generateJSON({ system, user, schema, tier }) {
    throw new Error(`${this.name}.generateJSON not implemented`);
  }

  isQuotaError(err) {
    const msg = (err && err.message) || "";
    const status = err && (err.status || err.statusCode);
    return (
      status === 429 ||
      /quota|rate.?limit|exhausted|RESOURCE_EXHAUSTED|429/i.test(msg)
    );
  }
}

module.exports = LLMProvider;
