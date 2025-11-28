import { EmailDraft, WorkerConfig } from "../types";

export const sendEmailViaWorker = async (draft: EmailDraft, config: WorkerConfig): Promise<void> => {
  // If no URL is configured, we simulate the send for demo purposes
  if (!config.endpointUrl) {
    console.warn("No Cloudflare Worker URL configured. Simulating send.");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return;
  }

  try {
    const response = await fetch(config.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.authToken}`, // Optional, depending on how user sets up their worker
      },
      body: JSON.stringify(draft),
    });

    if (!response.ok) {
      throw new Error(`Worker responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to send email via Cloudflare Worker", error);
    throw error;
  }
};