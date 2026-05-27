const GuildData = require("../models/GuildData");

module.exports = {

    name: "rangos",

    async execute(interaction) {

        const guildId = interaction.guild.id;

        let data = await GuildData.findOne({ guildId });

        if (!data) {

            data = new GuildData({
                guildId
            });

            await data.save();
        }

        if (data.messageId) {

            return interaction.reply({
                content: "❌ Ya existe una tabla configurada.",
                ephemeral: true
            });
        }

        const mensaje = await interaction.channel.send(
            "# 📋 Tabla de Rangos\n\nNo hay rangos agregados."
        );

        data.messageId = mensaje.id;

        data.channelId = interaction.channel.id;

        await data.save();

        interaction.reply({
            content: "✅ Tabla creada correctamente.",
            ephemeral: true
        });
    }
};