<div align="center">
  
  ## Hall-of-Fame Discord.js Bot

  ### [Bot Invite Link](https://discord.com/api/oauth2/authorize?client_id=973042179033415690&permissions=423054793728&scope=bot%20applications.commands)
  <hr class="rounded">
  
  ### Description
  A hall of fame bot with 27 commands that allow you save text, images, and audio. To create quotes you must first create authors, which have an image and name. Every type of quote (audio, image, regular, and multi) has an author, text, and up to three tags. Use /help for more information.
  <hr class="rounded">
  
  ### Quotes Explanation
  Regular quotes have 1 author, required text, up to 3 tags. They are created with `/create_quote`. Regular quotes are color coded purple.
  
  ![Regular Quote Example](https://user-images.githubusercontent.com/102398620/208325071-f52e439d-d5d1-4675-aec1-2b1677e4e057.png)
  
  Image quotes have 1 author, optional text, an image link, and up to three tags. They are created with `/create_quote`. Image quotes are color coded orange. You can use the `last_image` parameter of the command to use the latest image sent in a channel. You can also upload an image to Discord or somewhere else, copy the link, and input that into the `image_link` parameter. Make sure not to copy the link to the message.
  
  ![Image Quote Example](https://user-images.githubusercontent.com/102398620/208360776-2ae6bcd5-e76e-4094-aa26-e1e8bdfec0ff.png)
  
  Audio quotes have up to 1 author, required text, and up to 3 tags. They are created with `create_audio_quote`. Audio quotes are color coded green. You can use the `last_audio` parameter of the command to use the latest audio or video file sent in a channel. You can also upload a video or audio file to Discord or somewhere else, copy the link, and input that into the `audio_file_link` parameter. Make sure not to copy the link to the message. Audio quotes can be played in a voice channel with `/play_quote`.

  ![Audio Quote Example](https://user-images.githubusercontent.com/102398620/208362032-7c6ca16e-8d13-43fd-a271-f7eb60cf9621.png)
  <hr class="rounded">
</div>
