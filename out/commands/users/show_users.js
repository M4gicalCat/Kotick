import { SlashCommandBuilder } from '@discordjs/builders';
import db from '../../db/config.js';
export default {
    data: new SlashCommandBuilder()
        .setName('show_users')
        .setDescription('Montre tous les responsables'),
    async execute(interaction) {
        await interaction.deferReply({
            ephemeral: true,
        });
        const res = await db.any(`
      SELECT name, id FROM discord.user_name WHERE guild_id = $1
    `, [interaction.guildId]);
        const users = res.map((u) => `${u.name} : <@${u.id}>`).join('\n');
        await interaction.editReply({
            content: `Voici la liste des responsables :\n${users}`,
        });
    },
};
