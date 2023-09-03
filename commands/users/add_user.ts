import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import db from '../../db/config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('add_user')
    .setDescription(
      'Ajouter (ou mettre à jour) un utilisateur à la liste des responsables',
    )
    .addStringOption(o =>
      o.setName('nom').setDescription('Nom du responsable').setRequired(true),
    )
    .addUserOption(o =>
      o
        .setName('utilisateur')
        .setDescription("Compte discord de l'utilisateur")
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({
      ephemeral: true,
    });
    const nom = interaction.options.getString('nom');
    const utilisateur = interaction.options.getUser('utilisateur');

    if (!nom || !utilisateur) {
      return interaction.followUp({
        content: `Il faut préciser un nom et un utilisateur`,
        ephemeral: true,
      });
    }
    await db.one(
      `
      INSERT INTO discord.user_name (id, name, guild_id) VALUES ($1, $2, $3)
      ON CONFLICT ON CONSTRAINT unique_name DO UPDATE SET id = $1
      RETURNING id;
    `,
      [utilisateur.id, nom, interaction.guildId],
    );
    interaction.followUp({
      content: `L'utilisateur ${utilisateur} est maintenant connu sous le nom de \`${nom}\``,
    });
  },
};
