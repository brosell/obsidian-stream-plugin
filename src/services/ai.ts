import OpenAI from "openai";
// import openaiTokenCounter, { type ModelType } from 'openai-gpt-token-counter'; //https://snyk.io/advisor/npm-package/openai-gpt-token-counter
import type { Completion } from "../models/chat-point";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import { BusEvent } from "./bus";
import { getContextualStores } from "../stores/contextual-stores";
import { settingsStore } from "../stores/settings";
import { get } from "svelte/store";
import { Subject } from "rxjs";



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
    const stores = getContextualStores(context.guid)
    const { streamedCount } = stores;
    streamedCount.set(0);
    if (this.count > this.safetyNet) {
      throw "out of calls";
    }
    try {
      this._count++;
      const stream = await this.openai.chat.completions.create({
          messages: completions.map(c => ({ role: c.role.toLowerCase(), content: c.content } as ChatCompletionMessageParam)), 
          model: this.model,
          stream: true,
        }, 
        // { timeout: 5000 },
      );

      const deltas = new Subject<string>();
      stores.sendMessage(BusEvent.AIStreamDelta, context, { stream: deltas });

      let content = '';
      for await (const part of stream) {
        streamedCount.update(n => n + 1);
        content += part.choices[0]?.delta?.content || '';
        deltas.next(part?.choices[0]?.delta?.content || '');
      }

      deltas.complete();

      stores.sendMessage(BusEvent.AIResponseAvailable, context, { content });
      return content;
    } catch (error) {
      return `FALSE -${error}`;
    }
  }
}