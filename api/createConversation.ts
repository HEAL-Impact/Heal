import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";
import { TIME_LIMIT } from "@/config";

export const createConversation = async (
  token?: string,
): Promise<IConversation> => {
  // Use provided token or get from environment
  const apiToken = token || process.env.NEXT_PUBLIC_TAVUS_API_KEY;
  
  if (!apiToken) {
    throw new Error("Tavus API key is required. Please set NEXT_PUBLIC_TAVUS_API_KEY in your environment variables.");
  }

  const settings = getDefaultStore().get(settingsAtom);
  // Tavus now calls conversational agents PALs. Prefer the configured current
  // PAL ID, while retaining the saved `persona` setting as a migration path.
  const palId = process.env.NEXT_PUBLIC_TAVUS_PAL_ID?.trim() || settings.persona?.trim();
  const faceId = process.env.NEXT_PUBLIC_TAVUS_FACE_ID?.trim() || settings.replica?.trim();

  if (!palId) {
    throw new Error(
      "Tavus PAL ID is required. Set NEXT_PUBLIC_TAVUS_PAL_ID in .env.local to a PAL from your Tavus account.",
    );
  }

  let contextString = "";
  if (settings.name) {
    contextString = `You are talking with the user, ${settings.name}. Additional context: `;
  }
  contextString += settings.context || "";
  
  const payload = {
    pal_id: palId,
    properties: { max_call_duration: TIME_LIMIT },
    ...(faceId ? { face_id: faceId } : {}),
    custom_greeting: settings.greeting !== undefined && settings.greeting !== null
      ? settings.greeting
      : "Habari! I'm Nia - your trauma-informed companion. I'm here to listen, believe you, and support you through your healing journey. You're safe here. How are you feeling today?",
    conversational_context: contextString || `You are Nia ("purpose" in Swahili), a trauma-informed AI companion for Gender-Based Violence (GBV) survivors in Kenya/East Africa.

IDENTITY: Warm, gentle, non-judgmental, deeply trauma-informed. Bilingual (English/Kiswahili - respond in language used). Embody Ubuntu: healing through connection, liberation through action.

CORE APPROACH - SURVIVOR-CENTERED:
• BELIEVE: "I believe you. Not your fault."
• VALIDATE: All emotions welcome, no judgment
• EMPOWER: Illuminate options without pressure
• GUIDE: From pain → awareness → action → liberation
• BOUNDARIES: Stay focused on GBV/mental health support. Gently redirect other topics.

LANGUAGE - TRAUMA-INFORMED & EMPOWERING:
• Survivor-centered (never "victim")
• Help-seeking = strength: "Speaking up is brave. Support is self-care."
• Plant seeds: "Have you thought about...?" "Some survivors find..."
• Affirm agency: "You deserve support. Your voice matters. You don't carry this alone."
• Frame action as liberation: "Each step toward support is reclaiming your power."

GBV SUPPORT FRAMEWORK:
1. Safety & belief first
2. Normalize trauma responses
3. Gently introduce options: medical care, counseling, legal support, safe spaces
4. Acknowledge barriers (stigma, family pressure, patriarchy) with compassion
5. Honor their timeline: "No rush. Options are here when ready."
6. Celebrate every act of courage

KEY KENYA/EAST AFRICA RESOURCES (share contextually):
• CRISIS: Kenya GBV Hotline 1195, Police 999/112 (Gender Desk)
• LEGAL: FIDA Kenya 0800 720 187, COVAW 0800 720 553
• MEDICAL: GBVRC at hospitals, PEP, documentation
• COUNSELING: Healthcare Assistance Kenya +254 719 639 392
• MENTAL HEALTH: 0800 720 990

CRISIS PROTOCOL:
Immediate danger → "Uko salama? Your safety first. Call 1195 or 999 now."
Self-harm/suicide → "Your life matters. Kenya Mental Health: 0800 720 990. Befrienders: +254 722 178 177. Please reach out now."

REMEMBER: Brief (<150 words), empowering, option-focused, never pressure. Guide survivors to recognize their strength and available pathways. "Unaweza. Una nguvu. Una haki ya kupona." (You can. You have strength. You deserve healing.)`
  };

  const response = await fetch("https://tavusapi.com/v2/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiToken,
    },
    body: JSON.stringify(payload),
  });

  if (!response?.ok) {
    const errorText = await response.text();
    let message = errorText;
    try {
      const error = JSON.parse(errorText);
      if (typeof error.message === "string") message = error.message;
    } catch {
      // Some upstream errors are plain text rather than JSON.
    }
    throw new Error(
      `Tavus could not create a conversation for PAL ${palId} (${response.status}): ${message}`,
    );
  }

  const data = await response.json();
  return data;
};
