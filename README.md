<div align="center">
  
  # Hall-of-Fame Discord.js Bot

  ## [Bot Invite Link](https://discord.com/api/oauth2/authorize?client_id=973042179033415690&permissions=423054793728&scope=bot%20applications.commands)
  
  ## [Web Dashboard Link](https://hall-of-fame-discordjs-bot.weisman.repl.co/)
  
  ## Description
  A hall of fame bot with 28 commands that allow you save text, images, and audio. The bot is geared towards smaller, close-knit servers. It's purpose is to allow users to organize memorable moments so they can be easily accessed with authors, tags, types, dates, and more. To create quotes you must first create an author for the quote. An author has a name and optionally an image. You can also add tags to quotes, which need to be created before hand. Every type of quote (audio, image, regular, and multi) has an author, text, and up to three tags.
  <hr class="rounded">
  
  ## Web Dashboard
  The web dashboard is an alternate way to use the bot's infrastructure. It can do nearly everything the bot can do, but it uses a GUI to make usage simpler. Mobile is currently not supported, and without more popularity that won't change.
  <hr class="rounded">

  ## Authors
  Authors have a name and an optional image. The default image is the Hall of Fame Bot's icon. Authors are created with `/create_author` and edited with `/edit_author`. Use the `last_image` parameter of the command to use the latest image sent in a channel. You can also upload an image to Discord or somewhere else, copy the link, and input that into the `image_link` parameter. Deleting an author with `/delete_author` will make any of those author's quotes display "Deleted Author". See a server's authors with `/get_authors`.
  
  ![Author Example](/images/Author%20Example.png)
   <hr class="rounded">
  
  ## Quotes
  You can find quotes with `/count_quotes`, `/find_quotes`, and `/random_quote`. When using these commands, you can filter by the author, tags, type of quote (regular, image, audio, and multi), and look for specific text. You can also use `/quotes_channel` to choose a channel for all quotes to automatically be forwarded to so you can have them all in a centralized place.
  
  #### Regular Quote
  Regular quotes require an author and text, and you can choose up to 3 tags. They are created with `/create_quote`, edited with `/edit_quote`, and deleted with `/delete_quote`.
  
  ![Regular Quote Example](/images/Regular%20Quote%20Example.png)
  
  #### Image Quote
  Image quotes require and author and an image link, and optionally, a title and up to three tags. They are created with `/create_quote`, edited with `/edit_quote`, and deleted with `/delete_quote`. Use the `last_image` parameter of the command to use the latest image sent in a channel. You can also upload an image to Discord or somewhere else, copy the link, and input that into the `image_link` parameter. Make sure not to copy the link to the message.
  
  ![Image Quote Example](/images/Image%20Quote%20Example.png)

  #### Audio Quote
  Audio quotes require an author and title, and optionally up to 3 tags. They are created with `/create_audio_quote`, edited with `/edit_audio_quote`, deleted with `/delete_quote`, and played in a voice channel with `/play_quote` or `/play_random_quote`. Use the `last_audio` parameter of the command to use the latest audio or video file sent in a channel. You can also upload an audio or video file to Discord or somewhere else, copy the link, and input that into the `audio_file_link` parameter. Make sure not to copy the link to the message.
  
  ![Audio Quote Example](/images/Audio%20Quote%20Example.png)
  
  #### Multi Quote
  Multi quotes require between two and five fragments and a title, and optionally up to 3 tags and an image. A fragment is an author/text pair. Multi quotes are created with `/create_multi_quote`, edited with `/edit_multi_quote`, and deleted with `/delete_quote`. You can optionally add an image with the `last_image` parameter of the command to use the latest image sent in a channel. You can also upload an image to Discord or somewhere else, copy the link, and input that into the `image_link` parameter. Make sure not to copy the link to the message.
  
  ![Multi Quote Example](/images/Multi%20Quote%20Example.png)
  <hr class="rounded">
  
  ## Tags
  Tags are just text. They are created with `/create_tag`, edited with `/edit_tag`, and deleted with `/delete_tag`. Editing/deleting a tag changes the tag in quotes. See a server's tags with `/get_tags`.
  
  ![Tag Example](/images/Tag%20Example.png)

  <hr class="rounded">
</div>
