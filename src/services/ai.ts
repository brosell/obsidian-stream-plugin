import OpenAI from "openai";
// import openaiTokenCounter, { type ModelType } from 'openai-gpt-token-counter'; //https://snyk.io/advisor/npm-package/openai-gpt-token-counter
import { OPENAI_API_KEY } from "../oai-api-key";
import type { Completion } from "../models/chat-point";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import { BusEvent, bus } from "./bus";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class AiInterface {
  constructor(private safetyNet: number = 30, private model: string = 'gpt-3.5-turbo') { }

  private _count: number = 0;
  get count() { return this._count; }

  async prompt(completions: Completion[]): Promise<string> {
    if (this.count > this.safetyNet) {
      throw "out of calls";
    }
    try {
      this._count++;
      process.stdout.write('.');
      const chatCompletion = await openai.chat.completions.create({
          messages: completions.map(c => ({ role: c.role.toLowerCase(), content: c.content } as ChatCompletionMessageParam)), 
          model: this.model
        }, 
        // { timeout: 5000 },
      );
      
      const content = chatCompletion?.choices[0]?.message.content ?? 'FALSE -m';
      bus.set({event: BusEvent.AIResponseAvailable, details: { content }});
      return content;
    } catch (error) {
      return `FALSE -${error}`;
    }
  }

  // tokenizeText(text: string, tokensPer: number, tokenCounter: (t: string) => number = (s) => openaiTokenCounter.text(s, this.model)): string[] {
  //   const result: string[] = [];
  //   let startIdx = 0;

  //   while (startIdx < text.length) {
  //       let left = startIdx;
  //       let right = text.length;
  //       let lastValidMid = startIdx;

  //       while (left < right) {
  //           const mid = Math.floor((left + right) / 2);
  //           const substring = text.slice(startIdx, mid);
  //           const tokensCount = tokenCounter(substring);

  //           if (tokensCount > tokensPer) {
  //               right = mid;
  //           } else {
  //               lastValidMid = mid;
  //               left = mid + 1;
  //           }

  //           if (left >= right) {
  //               break;
  //           }
  //       }

  //       const finalSubstring = text.slice(startIdx, lastValidMid);
  //       if (finalSubstring) {
  //           result.push(finalSubstring);
  //           process.stdout.write(`${Math.floor(startIdx/text.length*100)}%|`);
  //       }

  //       startIdx = lastValidMid != startIdx ? lastValidMid : text.length;
  //   }
  //   return result.filter(s => s.trim().length);
  // }

}