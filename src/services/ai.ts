import OpenAI from "openai";
// import openaiTokenCounter, { type ModelType } from 'openai-gpt-token-counter'; //https://snyk.io/advisor/npm-package/openai-gpt-token-counter
import type { Completion } from "../models/chat-point";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import { BusEvent } from "./bus";
import { getContextualStores } from "../stores/contextual-stores";
import { settingsStore } from "../stores/settings";
import { get } from "svelte/store";



export class AiInterface {
  openai!: OpenAI;
  constructor(private safetyNet: number = 30, private model: string = 'gpt-3.5-turbo') {
    settingsStore.subscribe((settings) => {
    this.openai = new OpenAI({
      apiKey: settings.API_KEY,
      dangerouslyAllowBrowser: true
    });
  });
  }

  private _count: number = 0;
  get count() { return this._count; }

  async prompt(completions: Completion[], context: any): Promise<string> {
    const { sendMessage } = getContextualStores(context.guid);
    if (this.count > this.safetyNet) {
      throw "out of calls";
    }
    try {
      this._count++;
      process.stdout.write('.');
      const chatCompletion = await this.openai.chat.completions.create({
          messages: completions.map(c => ({ role: c.role.toLowerCase(), content: c.content } as ChatCompletionMessageParam)), 
          model: this.model
        }, 
        // { timeout: 5000 },
      );
      
      const content = chatCompletion?.choices[0]?.message.content ?? 'FALSE -m';
      sendMessage(BusEvent.AIResponseAvailable, context, { content });
      return content;
    } catch (error) {
      return `FALSE -${error}`;
    }
  }
}