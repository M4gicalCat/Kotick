import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import db from '../../db/config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('presence_acti')
    .setDescription("Demander qui est présent ou absent à l'activité")
    .addIntegerOption(o =>
      o
        .setName('jours')
        .setDescription(
          "Nombre de jours avant l'activité (Ne pas remplir pour désactiver)",
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    const jours = interaction.options.getInteger('jours');
    await db.none(
      `UPDATE discord.guild_settings SET activity_presence = $1 WHERE guild_id = $2`,
      [jours || null, interaction.guildId],
    );
    interaction.editReply({
      content: !!jours
        ? `Les demandes de présence sont maintenant activées ${jours} jours avant !`
        : `Les demandes de présence sont maintenant désactivées !`,
    });
  },
};
