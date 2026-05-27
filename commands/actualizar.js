const GuildData = require("../models/GuildData");

const actualizarTabla = require("../utils/actualizarTabla");

module.exports = {

    name: "actualizar",

    async execute(interaction) {

        const guildId = interaction.guild.id;

        const data = await GuildData.findOne({ guildId });

        if (!data || !data.messageId) {

            return interaction.reply({
                content: "❌ Primero crea una tabla usando /rangos",
                ephemeral: true
            });
        }

        await actualizarTabla(interaction.guild);

        interaction.reply({
            content: "✅ Tabla actualizada correctamente.",
            ephemeral: true
        });
    }
};