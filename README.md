This is a Discord bot that will let users speak to OpenAI.

Features:

* `%ai [prompt]` - Send a prompt to the AI. Must be in the `AI_CHANNEL`, otherwise this won't work.
* React to any message with `:ParentalAdvisory:` to get whether this is an abusive, sexual, violent, etc. message.

Required environment variables:

* `OPENAI_API_KEY` - The API key to your OpenAI account.
* `DISCORD_TOKEN` The token to your Discord app.
* `AI_COMMAND_NAME` - The command that will trigger the AI. I use `%ai`.
* `AI_MODEL` - The language model to use. I use `text-davinci-001`.
* `AI_CHANNEL` - The channel to relegate the AI prompt bot to (content moderation works across all channels).
* `CONTENT_EMOJI` - The emoji that the bot will listen for, for content moderation purposes. I use `:ParentalAdvisory:`.

Setup:

1) Ensure that your node.js is version 18.x.xxx.
2) Clone the repo.
3) Run `npm install`
4) Run `npm run app` to start the app with `nodemon`. 
