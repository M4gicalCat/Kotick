import { SlashCommandBuilder } from '@discordjs/builders';
import db from '../../db/config.js';
import { PERM } from '../../utils/permissions.js';
export default {
    data: new SlashCommandBuilder()
        .setDefaultMemberPermissions(0)
        .setName('init_server')
        .setDescription('Configure le serveur')
        .addRoleOption(o => o
        .setName('responsable')
        .setDescription('Rôle représentant un responsable')
        .setRequired(true))
        .addRoleOption(o => o
        .setName('enfant')
        .setDescription('Rôle représentant un enfant')
        .setRequired(true)),
    perms: PERM.RESPONSABLE,
    async execute(interaction) {
        await interaction.deferReply({
            ephemeral: true,
        });
        const guildId = interaction.guildId;
        const responsable = interaction.options.getRole('responsable');
        const enfant = interaction.options.getRole('enfant');
        await db.none(`
      INSERT INTO discord.guild_settings (guild_id, role_responsable, role_enfant)
      VALUES ($1, $2, $3)
      ON CONFLICT ON CONSTRAINT guild_settings_pkey DO UPDATE SET role_responsable = $2, role_enfant = $3
    `, [guildId, responsable.id, enfant.id]);
        interaction.editReply({
            content: 'Le serveur est configuré !\nUtilisez `/help` pour voir les commandes disponibles.',
        });
    },
};
