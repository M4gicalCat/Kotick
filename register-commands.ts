import * as dotenv from 'dotenv';
import { REST, Routes } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: './env/.private.env' });
dotenv.config({ path: './env/.env' });

const commands: any[] = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(process.env.PWD!, 'out/commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  // Grab all the command files from the commands directory you created earlier
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith('.js'));
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = (await import(filePath)).default;
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.CLIENT_TOKEN!);

// and deploy your commands!
export const createCommands = async (guildId: string) => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = (await rest.put(
      Routes.applicationGuildCommands(
        process.env.COMMANDS_REGISTRATION_CLIENT_ID!,
        guildId,
      ),
      { body: commands },
    )) as any[];

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
};
