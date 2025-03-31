import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export interface DocumentAnalysisResult {
  mission?: string;
  vision?: string;
  objectives?: string;
  targetAudience?: string;
  brandTone?: string;
  keywords?: string;
  coreValues?: string;
  contentThemes?: {
    theme: string;
    keywords: string[];
  }[];
  competitorAnalysis?: {
    name: string;
    strengths: string;
    weaknesses: string;
    contentStrategy: string;
  }[];
  summary: string;
}

/**
 * Analyzes a document using GPT-4o to extract marketing insights
 */
export async function analyzeDocument(documentText: string): Promise<DocumentAnalysisResult> {
  try {
    const prompt = `
      As a marketing expert, analyze the following document and extract key marketing insights in JSON format.
      Focus on identifying:
      
      1. Brand mission and vision
      2. Marketing objectives
      3. Target audience description
      4. Brand tone/voice
      5. Key keywords and phrases
      6. Core brand values
      7. Content themes with associated keywords
      8. Competitor analysis if present
      
      Return the results in the following JSON format:
      {
        "mission": "string",
        "vision": "string",
        "objectives": "string",
        "targetAudience": "string",
        "brandTone": "string",
        "keywords": "string",
        "coreValues": "string",
        "contentThemes": [
          {
            "theme": "string",
            "keywords": ["string1", "string2"]
          }
        ],
        "competitorAnalysis": [
          {
            "name": "string",
            "strengths": "string",
            "weaknesses": "string",
            "contentStrategy": "string"
          }
        ],
        "summary": "string"
      }
      
      Keep all text fields concise but detailed. If information for a field is not present in the document, omit that field from the JSON.
      
      Document to analyze:
      ${documentText}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const analysisText = response.choices[0].message.content;
    if (!analysisText) {
      throw new Error("Empty response from OpenAI");
    }

    return JSON.parse(analysisText) as DocumentAnalysisResult;
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error(`Failed to analyze document: ${(error as Error).message}`);
  }
}

/**
 * Processes a chat message in the context of a marketing project
 */
export async function processChatMessage(
  message: string,
  projectContext?: any,
  chatHistory?: { role: string; content: string }[]
): Promise<string> {
  try {
    const systemPrompt = projectContext 
      ? `You are a marketing assistant for a project named "${projectContext.name}" for client "${projectContext.client}". 
         Use the following project context in your responses when relevant:
         ${JSON.stringify(projectContext, null, 2)}`
      : "You are a marketing assistant for Cohete Workflow, a marketing project management platform.";

    const messages = [
      { role: "system", content: systemPrompt },
      ...(chatHistory || []),
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as { role: "system" | "user" | "assistant"; content: string }[],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Error processing chat message:", error);
    throw new Error(`Failed to process chat message: ${(error as Error).message}`);
  }
}
