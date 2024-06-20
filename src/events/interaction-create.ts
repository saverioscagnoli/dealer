import { Event } from "~/core/event";
import { Profile } from "~/core/profile";
import { client } from "~/index";
import { DEFAULT_CHIPS_COUNT } from "~/lib/consts";
import userSchema from "~/schemas/user";

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

  /**
   * Check if the user has an entry in the database.
   */
  let userData = await userSchema.findOne({ id: int.user.id });

  /**
   * If not, create one.
   */
  if (!userData) {
    userData = await userSchema.create({
      id: int.user.id,
      chips: DEFAULT_CHIPS_COUNT,
      wins: 0,
      losses: 0
    });

    console.log(`Created a new user document for ${int.user.username}`);
  }

  if (command.defer) {
    await int.deferReply();
  }

  try {
    await command.exe({
      int,
      profile: new Profile(userData.toObject())
    });
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
