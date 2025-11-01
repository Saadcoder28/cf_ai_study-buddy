# AI Prompts Used in Development

This document contains all AI prompts used during the development of cf_ai_study-buddy, as required by the Cloudflare assignment. I used Cursor and chose claude in Cursor.
---
- I want to build a Cloudflare AI app inspired by my VR teaching in Pakistan and aimed at helping studnets learn and the art of gamified learning.  Give idea for a relevant project that runs fully on Cloudflare. Or give other really unique ideas but focus should be helping children learn like educational AI agent
- Explain me the main components of building Agentic AI agents on cloudfare specifically and whats the best way to go about it
-Create a project file structure for this project ai-studdy budy.
- Make the structure more detailed
- Give ideas on how I would include all these concepts for my AI app. LLM should be LLAMA 3.3
Workflow / coordination (recommend using Workflows, Workers or Durable Objects)
User input via chat or voice (recommend using Pages or Realtime)
Memory or state
- Should I do one Durable Object per session or per user? Explain tradeoffs and recommend the safer default.
- I wrote some Worker code. Can you help fix it 
- I having trouble crreating the durable object. Provide me with the template and suggestion on how to proceed and help me fix my file
- Give me a short adaptive system prompt for Llama 3.3 that switches between beginner / intermediate / advanced. Don't use markdown in AI replies—plain text only.
-Iterate and work on the prompt to make it more advanced
- I want to fix errors in my helper.ts. Can you identify them
- My DO state keeps resetting. Help me fix the DO state errors
- Worker returning 404 thriugh api..Help me fix this
- Am I using the correct version of wangler?
- Help me generate boiler code for fromt end of the sites and update all files
- Add progress tracking and voice input 
- My Chat.tsx won't auto-scroll. Add the scrol feature
- Make my progress bar look better. Show a simple UI for understanding score and the diffculty as well as no of messages
- Fix all the errors in Chat.tsx
- Web Speech API crashes on Safari. How do I feature-detect support, fail gracefully, and provide a fallback message?
- So the web speech ai glitches by default
- Add more error handling to my frontend app
- How do I deploy my app to cloudfare.
- Wrangler deploy error: "new_classes not supported." Fix this
- My understandingScore keeps starting at 50. Make it default to 0 and confirm it persists after refresh.
- My README headers render tiny on GitHub. Help me fix this.
- My vite.config.ts proxy to localhost:8787 isn't working. Fix the dev proxy and also give me production build tweaks.
- Write a clean system prompt for Llama 3.3 that focuses on clear teaching, step sizes, checks for understanding, and no markdown.
- Help me write the README for the projects that cover all of our contents, include idea generation, how project meets assignment guidelines, instructions to run the project
- Structure the setup steps 
- Add more detail in the README
- Include the project file structure in the readme
- Change the frontend gradient to purple/blue and keep it subtle on large screens.
- The progress panel is cluttered. Remove the topics list and just show difficulty, understanding %, and message count.
- My README formatting is still off. Github is messing the headings up
- Update Readme to include cloudfare documentation as additional references at end
- Fix the bold text showing as asterisks in my README—AI responses keep using markdown when they shouldn't.
- The understanding score should start at 0%, not 50%. Update the Durable Object initialization and explain why this is better UX.
- Run some prompts and stuff to test the app out
- My worker deployed but frontend can't reach it. Debug CORS and show me how to verify the API is accessible.
- Check all my files and see if there are improvemets to make code
- Add more structured code and fix all errors showing in frontend
- Fix the errors in progressbar.tsx
- SSL error on Pages deployment—"ERR_SSL_VERSION_OR_CIPHER_MISMATCH".
- So I need to just wait for this error to go away?
- Workers subdomain setup—I got an error saying I need a workers.dev subdomain. Help me write the code to fix this
- Push everything to GitHub—what's the safest way to commit without accidentally including .env files?
