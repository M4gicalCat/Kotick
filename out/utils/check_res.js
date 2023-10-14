import db from '../db/config.js';
export const check_res = async (interaction) => {
    const guild = interaction.guild.id;
    const { role_responsable } = await db.oneOrNone(`SELECT role_responsable FROM discord.guild_settings WHERE guild_id = $1`, [guild], x => x !== null && x !== void 0 ? x : {});
    const has_rights = interaction.member.roles.cache.some(r => r.id === role_responsable);
    if (!has_rights) {
        await interaction.reply({
            content: 'Vous ne pouvez pas utiliser cette commande.',
            ephemeral: true,
        });
        throw new Error('403');
    }
};
