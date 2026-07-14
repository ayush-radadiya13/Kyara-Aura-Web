import https from "node:https";

const TLS_VERIFY_ERROR_CODES = new Set([
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "CERT_HAS_EXPIRED",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "ERR_TLS_CERT_ALTNAME_INVALID",
  "SELF_SIGNED_CERT_IN_CHAIN",
]);

const insecureHttpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

function getErrorCode(error) {
  return error?.cause?.code || error?.code || "";
}

function isTlsVerifyError(error) {
  return TLS_VERIFY_ERROR_CODES.has(getErrorCode(error));
}

function insecureHttpsFetch(url, init = {}) {
  const method = String(init.method || "GET").toUpperCase();
  const headers = init.headers || {};

  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        method,
        headers,
        agent: insecureHttpsAgent,
      },
      (response) => {
        const chunks = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          resolve(
            new Response(Buffer.concat(chunks), {
              status: response.statusCode || 500,
              statusText: response.statusMessage || "",
              headers: response.headers,
            }),
          );
        });
      },
    );

    request.on("error", reject);

    if (init.body) {
      request.write(init.body);
    }

    request.end();
  });
}

/**
 * Server-side fetch for the product API.
 * Retries once without TLS verification in development when antivirus HTTPS
 * scanning (e.g. Avast) replaces the real certificate chain and Node rejects it.
 */
export async function serverFetch(url, init = {}) {
  try {
    return await fetch(url, init);
  } catch (error) {
    if (process.env.NODE_ENV === "production" || !isTlsVerifyError(error)) {
      throw error;
    }

    const host = (() => {
      try {
        return new URL(url).host;
      } catch {
        return "unknown";
      }
    })();

    console.warn(
      `[server-fetch] TLS verification failed for ${host} (${getErrorCode(error)}). ` +
        "Retrying without certificate verification for local HTTPS inspection. " +
        "Disable antivirus HTTPS scanning for Node, or trust the interceptor CA, for a proper fix.",
    );

    return insecureHttpsFetch(url, init);
  }
}
