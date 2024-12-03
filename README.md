# Stream of Consciousness Plugin for ObsidianMD

Engage in a branching conversation with the OpenAI GPT API using the Obsidian Stream of Consciousness plugin for ObsidianMD.

## Features

- **Branching Conversations**: Revisit earlier chat points to refine or create new conversation branches. 
  - Refine a prompt without losing prior context.
  - Initiate a new prompt considering only the context up to a specific point.
- **Mindmap-like View**: Visualize how conversations have branched with a mindmap displaying summaries of each chat node.
- **Automatic Summarizations**: Automatically generate summaries for each prompt-response pair.
- **Thread Summarization**: Summarize an entire thread into a prompt usable as a system prompt.
- **Configurations**: 
  - Add your OpenAI API key.
  - Select the AI model for conversation.
  - Choose the AI model for summarizations.
- **Templatable Starters**: Set system prompts tailored for various conversation needs such as coding, code reviews, and documentation writing.
- **Slash-commands**:
  - `/addSystemPrompt(promptText)`
  - `/refine()`: Branch the previous chat point and refine the prompt.
  - Additional commands to enhance your interaction.

## Some Excuses

The code one writes when learning new frameworks will not be good for the first few iterations. I suspect that one won't be impressed
when you look over the Svelte stores and Obsidian integration in the current `main`. It is what it is for a personal project. I'm sort
of painted into a corner WRT new or imporved features until I'm able to refactor and improve some stuff. One thing that I'm planning
is to use RxJS Subjects and Observables. They are mostly compatible with Svelte 4 stores and I have a ton of professional expirience
usin RxJS in my Enterprise Angular day job.

## Installation

Use the BRAT plugin to install and manage the Obsidian Stream of Consciousness plugin directly from the GitLab repository.

## Usage Guidelines

The document used for this plugin is referred to as a `stream`. Interact with a chat-style interface to write prompts for the LLM, with each prompt and response forming nodes in a branching chat history.

### Example Use Cases

- Modify and resend prompts to improve response quality.
- Branch conversations from earlier nodes without using the current branch context to prevent hallucinations.
- Use distinct branches for different project aspects, such as research or documentation.

## Compatibility

The plugin is compatible with all recent Obsidian versions. It works seamlessly alongside plugins such as:
- **Templater**: For creating new chats with specific starting SYSTEM prompts.
- **Auto Note Organizer**: For organizing stream notes efficiently.

The user must provide their OpenAI API key. The capability to use local LLMs via ollama is experimental.

## Limitations and Known Issues

- Expect bugs as the UI is under development.
- Not compatibility with OpenAI's new o1 models, with a fix planned.
- Tested models: gpt-3.5-turbo, gpt-4, gpt-4o.

## Contributing

We welcome contributions through Pull Requests (PR) on GitHub.

## License

This project is licensed under the MIT License.

## Support

For support, please use GitHub issues and PRs for reporting bugs and requesting features.



![image](https://github.com/user-attachments/assets/2c266d96-77cb-4de2-a1af-6e63c21d3eb6)


## Roadmap items
- [x] RxJS-iffy
- [ ] refactor command bus to be more RxJS-y
- [ ] Interesting chat and thread management
  - [ ] deep link to a chat point
  - [ ] move a thread to a new note
  - [ ] reference other threads or notes in a RAG-like way
  - [ ] 'gaslight' mode
- [ ] Propper RAG
- [ ] UI and Ux enhancements
  - [ ] improved map view
  - [ ] drag and drop chat to re organize
- [ ] 

# To release
- Make sure the current origin HEAD is behaving
- `npm run release-[patch|minor|major]`

This will
- update the versions in package.json, (obsidian plugin's) manifest.json, versions.json
- build the source
- create a release and tag in the repo
  - Requires GitHub CLI: https://github.com/cli/cli


https://github.com/brosell/obsidian-stream-plugin

