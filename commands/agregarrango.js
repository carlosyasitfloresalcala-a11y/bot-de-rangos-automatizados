const GuildData = require("../models/GuildData");

const actualizarTabla = require("../utils/actualizarTabla");

module.exports = {

    name: "agregarrango",

    async execute(interaction) {

        const rol = interaction.options.getRole("rol");

        const guildId = interaction.guild.id;

        let data = await GuildData.findOne({ guildId });

        if (!data) {

            data = new GuildData({
                guildId
            });

            await data.save();
        }

        if (!data.rangos.includes(rol.id)) {

            data.rangos.push(rol.id);

            await data.save();
        }

        await actualizarTabla(interaction.guild);

        interaction.reply({
            content: `✅ Rol ${rol} agregado.`,
            ephemeral: true
        });
    }
};