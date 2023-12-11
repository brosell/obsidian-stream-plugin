import { tStringConstructor } from "../services/template-strings";

export default {
  SummaryOfChatPoint: tStringConstructor<{ text: string }>(`
Create a summary using less than 10 words of the following interaction, capturing
the main insights and factual information from both the user's prompt and the
assistant's response. Focus on presenting the essence of the exchange, ensuring
the summary is balanced, concise, and informative. priority is given to the assistant's response.
It is critical that the summary not exceed 10 words. IT MUST NOT EXCEED 10 WORDS!!!!
If your summary is more than 10 words, then revise it.
===  
{{text}}
  `),
  SummaryOfThread: tStringConstructor<{}>(`
Can you provide a comprehensive summary of the preceding? The summary should cover all the key points and main ideas presented, while also condensing the information into a concise and easy-to-understand format. Please ensure that the summary includes relevant details and examples that support the main ideas, while avoiding any unnecessary information or repetition. The length of the summary should be appropriate for the length and complexity of the original text, providing a clear and accurate overview without omitting any important information. The summary must be usable as background information for future discussions without losing fidelity.
The summary should be in prose form as a brief. Avoid bullet points. The text should be dry and not wordy. Do not acknowledge that it is a conversation.
  `),
  AnalyzeMyWriting: tStringConstructor<{ text: string }>(`
Please analyze the text following these instructions.

Focus on identifying the following characteristics:

Writing style - Is it formal, informal, conversational, technical, or narrative?
Tone - Does the text convey enthusiasm, seriousness, humor, urgency, or another distinct emotion?
Mannerisms - Are there unique phrases, words, or catchphrases repeatedly used?
Sentence structure - Are the sentences complex, simple, varied, or predominantly of one type?
Vocabulary - Is it rich and varied, technical and industry-specific, or straightforward and accessible?
Rhythm or pacing - How does the flow of the text feel? Is it fast-paced with short sentences, or more drawn out and deliberate?
Any other noteworthy characteristics that the system should emulate.
Don't focus on the topic of the text. That is not important. Focus on the writing.

It's OK to describe negative characteristics as well. Without these the analysis will be wrong.

Based on the analysis, create a prompt that describes the style to emulate.
I only want the prompt with no explanations. Respond with the prompt that is 
ready to use as a SYSTEM role prompt


\`\`\`
{{text}}
\`\`\`
  `),

}