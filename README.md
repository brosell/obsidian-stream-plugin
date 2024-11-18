# Obsidian Stream (of Consciousness) plugin for ObsidianMD
Have a branching conversation with Open AI gpt API.

### Features:
- Branching - go back to an earlier chat point and branch the conversation.
  - refine the prompt without losing prior context
  - a new prompt that only considers the context up to this point
- Mindmap-like view to see how the conversation has branched
- Automatic sumarizations for each prompt-response chat point
- Option to summarize an entire thread into a a prompt suitable for use as a system prompt
- Configurations include
  - _your_ OpenAI API key
  - which ai model to use for conversation
  - which ai model to use for sumarizations
- Templatable starters for different conversations needs - set system prompts specific to, for example, coding, code review, documentation writing, etc.
- Slash-commands
  - `/addSystemPrompt(promptText)`
  - `/refine()` - branch the previous chat point and preset the prompt field with the previous prompt to allow refinement
  - others



![image](https://github.com/user-attachments/assets/2c266d96-77cb-4de2-a1af-6e63c21d3eb6)


# To release
- Make sure the current origin HEAD is behaving
- `npm run release-[patch|minor|major]`

This will
- update the versions in package.json, (obsidian plugin's) manifest.json, versions.json
- build the source
- create a release and tag in the repo
  - Requires GitHub CLI: https://github.com/cli/cli


https://github.com/brosell/obsidian-stream-plugin

