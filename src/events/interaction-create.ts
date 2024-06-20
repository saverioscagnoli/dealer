import { Event } from "~/core/event";
import { client } from "~/index";

export default new Event("interactionCreate", async int => {
  if (!int.isCommand()) return;

  let command = client.commands.get(int.commandName);

  if (!command) {
    await int.reply({
      content:
        "There was either an internal error, or the command is not available right now. Please try again later.",
      ephemeral: true
    });

    return;
  }

  if (command.defer) {
    await int.deferReply();
  }

  try {
    await command.exe(int);
  } catch (err) {
    if (int.replied || int.deferred) {
      await int.editReply(
        "There was an error while executing the command. Please try again later."
      );

      console.error(
        `${int.user.username} used the ${int.commandName} command, but an error occurred: ${err}`
      );
    } else {
      await int.reply({
        content:
          "There was an error while executing the command. Please try again later.",
        ephemeral: true
      });
    }
  }
});
