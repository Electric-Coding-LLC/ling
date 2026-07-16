import { getChatGPTUser } from "@/app/chatgpt-auth";

export type CurrentIdentity = {
  provider: "chatgpt" | "development";
  providerKey: string;
  email: string;
  displayName: string;
};

export async function getCurrentIdentity(): Promise<CurrentIdentity | null> {
  const chatGPTUser = await getChatGPTUser();
  if (chatGPTUser) {
    const email = normalizeEmail(chatGPTUser.email);
    return {
      provider: "chatgpt",
      providerKey: email,
      email,
      displayName: chatGPTUser.displayName,
    };
  }

  if (process.env.NODE_ENV !== "development") return null;

  const configuredEmail = process.env.DEV_USER_EMAIL;
  if (!configuredEmail) {
    throw new Error(
      "DEV_USER_EMAIL is required for local development without ChatGPT identity headers.",
    );
  }

  const email = normalizeEmail(configuredEmail);
  return {
    provider: "development",
    providerKey: email,
    email,
    displayName: "Owner",
  };
}

function normalizeEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("The current identity has an invalid email address.");
  }
  return email;
}
