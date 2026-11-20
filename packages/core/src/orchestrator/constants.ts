export const DEFAULT_AUTH_SERVICE_URL = "https://cmd-d-llm.vercel.app";
export const DEFAULT_AI_GATEWAY_URL = "https://cmd-d-llm.vercel.app";
export const DEFAULT_SAST_SERVICE_URL = "https://sast.jayeshpandey754.workers.dev";
export const DEFAULT_DAST_ORIGIN_URL = "https://dast-js9w.onrender.com";
export const DEFAULT_DAST_SERVICE_URL = "https://dast.pandeyjayesh020.workers.dev";
export const DEFAULT_ORCHESTRATOR_URL = DEFAULT_SAST_SERVICE_URL;

// SECURITY: These values must NEVER be hardcoded. Configure them via
// VS Code settings (codefy.orchestrator.apiKey / codefy.orchestrator.adminApiKey),
// the extension's SecretStorage, or environment variables (API_KEY, ADMIN_API_KEY,
// CODEFY_JWT). The old hardcoded credentials have been rotated on the backend.
export const DEFAULT_OPERATOR_API_KEY: string | undefined = undefined;
export const DEFAULT_ADMIN_API_KEY: string | undefined = undefined;
export const DEFAULT_CODEFY_JWT: string | undefined = undefined;


