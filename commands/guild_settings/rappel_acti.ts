import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import db from '../../db/config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rappel_acti')
    .setDescription("Envoyer un rappel le jour même de l'activité")
    .addBooleanOption(o =>
      o.setName('activer').setDescription('Activer ou désactiver les rappels'),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    const rappel_acti = interaction.options.getBoolean('activer');
    await db.none(
      `UPDATE discord.guild_settings SET activity_reminder = $1 WHERE guild_id = $2`,
      [rappel_acti, interaction.guildId],
    );
    interaction.editReply({
      content: `Les rappels d'activité sont maintenant ${
        rappel_acti ? '' : 'dés'
      }activés !`,
    });
  },
};
