type JsonShape = Record<string, unknown> | unknown[];

type ProviderRequest = {
  system: string;
  prompt: string;
  schemaHint: string;
};

function extractJson(content: string): JsonShape | null {
  const trimmed = content.trim();
  const firstBrace = trimmed.indexOf("{");
  const firstBracket = trimmed.indexOf("[");
  const startCandidates = [firstBrace, firstBracket].filter((index) => index >= 0);
  const start = startCandidates.length ? Math.min(...startCandidates) : -1;

  if (start < 0) {
    return null;
  }

  const sliced = trimmed.slice(start);
  const lastBrace = sliced.lastIndexOf("}");
  const lastBracket = sliced.lastIndexOf("]");
  const end = Math.max(lastBrace, lastBracket);

  if (end < 0) {
    return null;
  }

  try {
    return JSON.parse(sliced.slice(0, end + 1));
  } catch {
    return null;
  }
}

async function callOpenAi({ system, prompt, schemaHint }: ProviderRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `${system}\nReturn only valid JSON matching this shape: ${schemaHint}`
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };
  const content =
    json.output_text ||
    json.output?.flatMap((item) => item.content || []).map((item) => item.text).join("\n") ||
    "";

  return extractJson(content);
}

async function callAnthropic({ system, prompt, schemaHint }: ProviderRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_TEXT_MODEL || "claude-3-5-haiku-latest",
      max_tokens: 3000,
      system: `${system}\nReturn only valid JSON matching this shape: ${schemaHint}`,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
  const content = json.content?.map((item) => item.text || "").join("\n") || "";

  return extractJson(content);
}

export async function generateStructuredJson(request: ProviderRequest) {
  if (process.env.AI_PROVIDER === "anthropic") {
    return callAnthropic(request);
  }

  const openAiResult = await callOpenAi(request);
  if (openAiResult) {
    return openAiResult;
  }

  return callAnthropic(request);
}
