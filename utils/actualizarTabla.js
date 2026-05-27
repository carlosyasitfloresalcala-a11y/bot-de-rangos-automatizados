const GuildData = require("../models/GuildData");

async function actualizarTabla(guild) {

    const data = await GuildData.findOne({
        guildId: guild.id
    });

    if (!data) return;

    const channel = guild.channels.cache.get(data.channelId);

    if (!channel) return;

    let contenido = "# 📋 Tabla de Rangos\n\n";

    if (data.rangos.length === 0) {

        contenido += "No hay rangos agregados.";

    } else {

        try {

            const miembros = await guild.members.fetch();

            for (let i = 0; i < data.rangos.length; i++) {

                const rolId = data.rangos[i];

                const rol = guild.roles.cache.get(rolId);

                if (!rol) continue;

                const miembrosConRol = miembros.filter(member =>
                    member.roles.cache.has(rolId)
                );

                const lista = miembrosConRol
                    .map(member => `<@${member.user.id}>`)
                    .join(", ");

                contenido += `## ${i + 1}. <@&${rolId}>\n`;

                if (lista.length > 0) {
                    contenido += `👤 ${lista}\n\n`;
                } else {
                    contenido += `👤 *Nadie en este rango*\n\n`;
                }
            }
        }

        catch (error) {

            console.error(error);

            contenido += "❌ Error cargando miembros.";
        }
    }

    try {

        const mensaje = await channel.messages.fetch(data.messageId);

        await mensaje.edit(contenido);

    }

    catch {

        const nuevoMensaje = await channel.send(contenido);

        data.messageId = nuevoMensaje.id;

        await data.save();
    }
}

module.exports = actualizarTabla;