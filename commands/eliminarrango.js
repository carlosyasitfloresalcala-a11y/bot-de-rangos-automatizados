const GuildData = require("../models/GuildData");

const actualizarTabla = require("../utils/actualizarTabla");

module.exports = {

    name: "eliminarrango",

    async execute(interaction) {

        const rol = interaction.options.getRole("rol");

        const guildId = interaction.guild.id;

        const data = await GuildData.findOne({ guildId });

        if (!data) {

            return interaction.reply({
                content: "❌ No existe configuración.",
                ephemeral: true
            });
        }

        data.rangos = data.rangos.filter(r => r !== rol.id);

        await data.save();

        await actualizarTabla(interaction.guild);

        interaction.reply({
            content: `✅ Rol ${rol} eliminado.`,
            ephemeral: true
        });
    }
};const GuildData = require("../models/GuildData");

const actualizarTabla = require("../utils/actualizarTabla");

module.exports = {

    name: "eliminarrango",

    async execute(interaction) {

        const rol = interaction.options.getRole("rol");

        const guildId = interaction.guild.id;

        const data = await GuildData.findOne({ guildId });

        if (!data) {

            return interaction.reply({
                content: "❌ No existe configuración.",
                ephemeral: true
            });
        }

        data.rangos = data.rangos.filter(r => r !== rol.id);

        await data.save();

        await actualizarTabla(interaction.guild);

        interaction.reply({
            content: `✅ Rol ${rol} eliminado.`,
            ephemeral: true
        });
    }
};