import { GoogleGenAI } from "@google/genai";
import { Tone } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEmailDraft = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `あなたはプロのメールライターです。以下のプロンプトに基づいて、適切なメールの本文を**日本語で**作成してください。
      
      制約事項:
      - 件名は含めず、本文のみを出力してください。
      - マークダウンのコードブロックは使用しないでください。
      - プレースホルダー（例: [名前]）が必要な場合はそのまま残してください。

      プロンプト: ${prompt}`,
      config: {
        systemInstruction: "あなたは優秀なビジネスメール作成アシスタントです。日本語で自然かつ丁寧なメールを作成してください。",
        temperature: 0.7,
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Draft Error:", error);
    throw error;
  }
};

const tonePrompts: Record<Tone, string> = {
  professional: 'よりビジネスライクで丁寧な',
  friendly: '親しみやすく、柔らかい',
  urgent: '至急の対応を促す',
  concise: '要点を絞って簡潔な'
};

export const refineEmailDraft = async (currentBody: string, tone: Tone): Promise<string> => {
  try {
    const toneInstruction = tonePrompts[tone] || tone;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `以下のメール本文を、「${toneInstruction}」トーンになるように**日本語で**書き直してください。
      元のメッセージの意図や主要な内容は維持してください。

      現在の本文:
      ${currentBody}`,
      config: {
        systemInstruction: "あなたは優秀な編集者です。指定されたトーンに合わせて日本語の文章を推敲してください。マークダウンや挨拶等の余計な説明は省き、書き直した本文のみを返してください。",
        temperature: 0.6,
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Refine Error:", error);
    throw error;
  }
};