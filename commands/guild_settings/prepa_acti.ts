import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import db from '../../db/config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('prepa_acti')
    .setDescription("Envoyer un rappel pour préparer l'activité")
    .addIntegerOption(o =>
      o
        .setName('jours')
        .setDescription(
          "Nombre de jours avant l'activité (Ne pas remplir pour désactiver)",
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const jours = interaction.options.getInteger('jours');
    await db.none(
      `UPDATE discord.guild_settings SET meeting_reminder = $1 WHERE guild_id = $2`,
      [jours || null, interaction.guildId],
    );
    interaction.reply({
      content: !!jours
        ? `Les rappels de préparation sont maintenant activés ${jours} jours avant !`
        : `Les rappels de préparation sont maintenant désactivés !`,
      ephemeral: true,
    });
  },
};
