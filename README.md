<div align="center">
  
  ## Hall-of-Fame Discord.js Bot

  ### [Bot Invite Link](https://discord.com/api/oauth2/authorize?client_id=973042179033415690&permissions=423054793728&scope=bot%20applications.commands)
  <hr class="rounded">
  
  ### Description
  A hall of fame bot with 28 commands that allow you save text, images, and audio. To create quotes you must first create authors, which have an image and name. Every type of quote (audio, image, regular, and multi) has an author, text, and up to three tags. Use /help for more information.
  <hr class="rounded">
  
  ### Quotes Explanation
  Regular quotes have 1 author, required text, up to 3 tags. They are created with `/create_quote`. Regular quotes are color coded purple. They are edited with `/edit_quote` and deleted with `/delete_quote`.
  
  ![Regular Quote Example](https://user-images.githubusercontent.com/102398620/208363430-727dcf64-d4b9-4886-a430-d488e2bd1fbc.png)
  
  Image quotes have 1 author, optional text, an image link, and up to three tags. They are created with `/create_quote`. Image quotes are color coded orange. You can use the `last_image` parameter of the command to use the latest image sent in a channel. You can also upload an image to Discord or somewhere else, copy the link, and input that into the `image_link` parameter. Make sure not to copy the link to the message. They are edited with `/edit_quote` and deleted with `/delete_quote`.
  
  ![Image Quote Example](https://user-images.githubusercontent.com/102398620/208363753-374c95c3-8397-4202-ba4f-8b31bea5644c.png)

  Audio quotes have 1 author, a required title, and up to 3 tags. They are created with `/create_audio_quote`. Audio quotes are color coded green. You can use the `last_audio` parameter of the command to use the latest audio or video file sent in a channel. You can also upload a video or audio file to Discord or somewhere else, copy the link, and input that into the `audio_file_link` parameter. Make sure not to copy the link to the message. Audio quotes can be played in a voice channel with `/play_quote`. They are edited with `/edit_audio_quote` and deleted with `/delete_quote`.
  
  ![Audio Quote Example](https://user-images.githubusercontent.com/102398620/208363444-0423f9de-40cd-4fc2-a8c7-ab3c076c57a3.png)
  
  Multi-quotes have between 2 and 5 authors, a required title, and up to 3 tags. They are created with `/create_multi_quote`. Multi-quotes are color coded pink. They are edited with `/edit_multi_quote` and deleted with `/delete_quote`.
  
  ![Multi-Quote Example](https://user-images.githubusercontent.com/102398620/208612092-3e96166d-ae1f-414a-aedc-2b61efc39360.png)

  <hr class="rounded">
</div>
