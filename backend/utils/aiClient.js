import "dotenv/config";
import OpenAI from "openai";

const API_KEY = process.env.GEMINI_API;
if (!API_KEY) {
  console.error("Missing API key. Set GEMINI_API in your environment.");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

function buildSystemPrompt() {
  return `You are ProductLaunchGPT — an expert AI product consultant specialized in taking a user's problem statement and producing a full product launch plan.

Your responsibilities:
- Perform market research: target customers, competitors, TAM/SAM/SOM estimates, pricing landscape.
- Produce a waterfall roadmap (series of steps) the user should follow to build the product, with milestones and rough timelines.
- Provide production details: costing breakdown, manufacturing options, quality checks, packaging.
- Provide sales & distribution recommendations: website/ecommerce platform choices, logistics, retail strategies, bulk orders.
- Provide marketing strategy: organic, inorganic (ads), performance marketing, influencer, retail/channel marketing.
- Produce a simple profit & loss estimate and recommend an initial selling price and margin strategy so the product can be competitive.

Output requirements:
1) Return a top-level JSON object with these keys: "market_research", "roadmap", "production", "sales", "marketing", "financials", "pricing_recommendation", "summary".
2) Each section should contain structured subfields (for example, market_research should include target_customers, competitors, market_size_estimates, pricing_analysis).
3) After the JSON, also provide a short human-readable summary (2-6 paragraphs) highlighting top priorities and quick next steps.
4) Be explicit about assumptions and data confidence levels for any quantitative estimate.

Be concise, actionable, and pragmatic. If information is missing, state assumptions you made. Use clear bullet-style lists where appropriate within text fields.
`;
}

export async function runProductLaunchAgent(problemDescription) {
  const systemPrompt = buildSystemPrompt();

  const userMessage = `Problem statement: ${problemDescription}\n\nRespond strictly following the JSON structure requested in the system prompt.\nProvide numeric estimates when possible and label assumptions.`;

  try {
    const resp = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      // temperature: 0.2,
    });

    const msg = resp.choices?.[0]?.message?.content;
    if (!msg) throw new Error("No content returned from model.");

    // Try to extract JSON portion safely
    const jsonMatch = msg.match(/```(?:json)?\n([\s\S]*?)\n```/);
    let jsonPart = null;

    if (jsonMatch) {
      jsonPart = JSON.parse(jsonMatch[1]);
    } else {
      // fallback: try first {...} block
      const rawJson = msg.match(/\{[\s\S]*\}/);
      if (rawJson) {
        jsonPart = JSON.parse(rawJson[0]);
      }
    }

    if (!jsonPart) {
      // fallback: return plain text if JSON can't be parsed
      return {
        success: false,
        message: "Could not parse structured JSON response.",
        raw_output: msg,
      };
    }

    return {
      success: true,
      data: jsonPart,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}
