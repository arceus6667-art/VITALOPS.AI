// ═══════════════════════════════════════════════════
// VitalOps AI — Gemini Service (All AI calls route here)
// Model: gemini-2.0-flash via @google/genai SDK
// Every function has try/catch with typed fallback.
// ═══════════════════════════════════════════════════

import { GoogleGenAI } from '@google/genai';

// Initialize Gemini with safety check
let ai;
try {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Missing VITE_GEMINI_API_KEY in .env');
  }
  ai = new GoogleGenAI({ apiKey });
  console.log('[Gemini] SDK initialized');
} catch (error) {
  console.error('[Gemini] Initialization failed:', error.message);
  ai = { models: { generateContent: async () => ({ text: () => 'Analysis unavailable.' }) } };
}

// ─────────────────────────────────────────────
// Utility: debounce wrapper
// ─────────────────────────────────────────────
export function debounce(fn, ms) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(async () => {
        const result = await fn(...args);
        resolve(result);
      }, ms);
    });
  };
}

// ─────────────────────────────────────────────
// Helper: safely parse JSON from Gemini response
// ─────────────────────────────────────────────
function safeParseJSON(text) {
  // Strip markdown fences if present
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

// ─────────────────────────────────────────────
// 1. getGeminiInsights(incidents)
//    Returns array of 3 insight objects for dashboard
// ─────────────────────────────────────────────
async function _getGeminiInsights(incidents) {
  try {
    const incidentData = incidents.map((i) => ({
      id: i.id,
      type: i.type,
      severity: i.severity,
      zone: i.zone,
      status: i.status,
      description: i.description || '',
    }));

    const prompt = `You are an emergency response AI for a hospitality venue (hotel/resort).
Current active incidents: ${JSON.stringify(incidentData)}

Respond ONLY with a valid JSON array of exactly 3 objects, no markdown, no explanation:
[
  {
    "type": "critical|warning|info|success",
    "text": "concise situation assessment under 20 words",
    "action": "specific actionable directive under 15 words",
    "priority": 1
  }
]

Rules:
- If there are active incidents, prioritize life safety assessments.
- If there are no incidents, return 1 success object and 2 info objects about preventive measures.
- "type" must be one of: critical, warning, info, success
- "priority" must be 1, 2, or 3 (1 = highest)
- Be specific to the incident types reported.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text;
    const parsed = safeParseJSON(text);

    // Validate structure
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 3).map((item, i) => ({
        type: item.type || 'info',
        text: item.text || 'Analysis in progress.',
        action: item.action || 'Continue monitoring.',
        priority: item.priority || i + 1,
      }));
    }

    throw new Error('Invalid response structure');
  } catch (error) {
    console.warn('[Gemini] getGeminiInsights failed:', error.message);
    return [
      {
        type: 'info',
        text: 'AI analysis temporarily unavailable.',
        action: 'Continue standard monitoring protocols.',
        priority: 3,
      },
    ];
  }
}

// Export debounced version (3000ms)
export const getGeminiInsights = debounce(_getGeminiInsights, 3000);

// ─────────────────────────────────────────────
// 2. classifyIncident(report)
//    Classifies an incident report from a guest
//    report: { type, zone, description, voiceTranscript, guestRoom }
// ─────────────────────────────────────────────
export async function classifyIncident(report) {
  try {
    const prompt = `You are a hospitality crisis AI for a hotel/resort venue.
Classify this incident report: ${JSON.stringify(report)}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "severity": "critical|high|medium|low",
  "response": "specific action directive under 25 words",
  "estimatedMinutes": <number>,
  "escalateToEmergencyServices": <boolean>
}

Rules:
- Fire or active shooter → always critical, escalateToEmergencyServices: true
- Medical emergency with unconscious person → critical
- Security concern (theft, disturbance) → medium or high depending on description
- Flood/water leak → medium unless affecting electrical systems (then high)
- Be specific in your response directive.
- estimatedMinutes should be realistic (2-30 range).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text;
    const parsed = safeParseJSON(text);

    return {
      severity: parsed.severity || 'medium',
      response: parsed.response || 'Staff dispatched. Situation being assessed.',
      estimatedMinutes: parsed.estimatedMinutes || 10,
      escalateToEmergencyServices: parsed.escalateToEmergencyServices || false,
    };
  } catch (error) {
    console.warn('[Gemini] classifyIncident failed:', error.message);
    return {
      severity: 'medium',
      response: 'Staff dispatched. Situation being assessed.',
      estimatedMinutes: 10,
      escalateToEmergencyServices: false,
    };
  }
}

// ─────────────────────────────────────────────
// 3. summarizeIncident(incident)
//    Returns a 2-sentence summary for resolved incidents
// ─────────────────────────────────────────────
export async function summarizeIncident(incident) {
  try {
    const incidentData = {
      type: incident.type,
      severity: incident.severity,
      zone: incident.zone,
      description: incident.description || '',
      status: incident.status,
      assignedStaff: incident.assignedStaff || [],
    };

    const prompt = `Summarize this resolved hospitality emergency for the incident log:
${JSON.stringify(incidentData)}

Write 2 sentences max. Plain text only, no markdown, no bullet points.
Focus on what happened, how it was resolved, and any follow-up needed.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text.trim();
    return text || 'Incident resolved by on-site staff. Details recorded in system.';
  } catch (error) {
    console.warn('[Gemini] summarizeIncident failed:', error.message);
    return 'Incident resolved by on-site staff. Details recorded in system.';
  }
}

// ─────────────────────────────────────────────
// 4. getPatternSummary(historicalData)
//    Analyzes 30 days of incidents for trends
//    historicalData: array of resolved incident objects
// ─────────────────────────────────────────────
export async function getPatternSummary(historicalData) {
  try {
    const summaryData = historicalData.map((i) => ({
      type: i.type,
      severity: i.severity,
      zone: i.zone,
      createdAt: i.createdAt,
      resolvedAt: i.resolvedAt,
    }));

    const prompt = `Analyze these hospitality emergency incidents from the past 30 days:
${JSON.stringify(summaryData)}

Identify 3 key patterns or risks. Plain text, 3 sentences max.
Focus on: recurring incident types, vulnerable zones, response time trends.
If the data is sparse, note that and suggest what to monitor.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text.trim();
    return text || 'Insufficient data for pattern analysis. Continue collecting incident reports for actionable insights.';
  } catch (error) {
    console.warn('[Gemini] getPatternSummary failed:', error.message);
    return 'Insufficient data for pattern analysis. Continue collecting incident reports for actionable insights.';
  }
}
