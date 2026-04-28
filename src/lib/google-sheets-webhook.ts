type WebhookTable = "consents" | "questionnaires" | "sessions";

type WebhookPayload = {
  table: WebhookTable;
  data: Record<string, unknown>;
};

type WebhookResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

function getWebhookConfig() {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL;
  const secret = process.env.GOOGLE_APPS_SCRIPT_SECRET;

  return {
    url,
    secret,
    isConfigured: Boolean(url && secret),
  };
}

export async function postToGoogleSheets(payload: WebhookPayload) {
  const config = getWebhookConfig();

  if (!config.isConfigured || !config.url || !config.secret) {
    console.warn("[Google Sheets Webhook] Missing GOOGLE_APPS_SCRIPT_URL or GOOGLE_APPS_SCRIPT_SECRET.");
    return false;
  }

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: config.secret,
        ...payload,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[Google Sheets Webhook] Request failed:", response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Google Sheets Webhook] Request error:", error);
    return false;
  }
}

export async function readFromGoogleSheets<T = Record<string, string>[]>(
  table: WebhookTable,
  filters?: Record<string, string>
): Promise<WebhookResponse<T>> {
  const config = getWebhookConfig();

  if (!config.isConfigured || !config.url || !config.secret) {
    return {
      success: false,
      message: "Missing GOOGLE_APPS_SCRIPT_URL or GOOGLE_APPS_SCRIPT_SECRET.",
    };
  }

  try {
    const url = new URL(config.url);
    url.searchParams.set("secret", config.secret);
    url.searchParams.set("table", table);

    Object.entries(filters || {}).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Google Sheets webhook read failed: ${response.status} ${response.statusText}`,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

export function generateParticipantId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `user-${timestamp}-${random}`;
}
