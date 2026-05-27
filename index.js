const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('¡El bot está completamente vivo y funcionando!');
});

app.listen(port, () => {
  console.log(`Servidor web interno iniciado en el puerto ${port}`);
});

require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    Routes,
    REST,
    PermissionsBitField
} = require("discord.js");

const mongoose = require("mongoose");

// Conexión a MongoDB en Railway
mongoose.connect(process.env.MONGO_URI || process.env.MONGO_URL)
  .then(() => console.log("¡Conectado exitosamente a MongoDB en Railway!"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// Esquema de datos para guardar los rangos
const GuildDataSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    rangos: { type: [String], default: [] },
    messageId: { type: String, default: null },
    channelId: { type: String, default: null }
});
const GuildData = mongoose.model("GuildData", GuildDataSchema);

// Intents activos para poder leer los miembros del servidor
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildPresences
    ]
});

const commands = [
    new SlashCommandBuilder()
        .setName("rangos")
        .setDescription("Crear tabla de rangos"),

    new SlashCommandBuilder()
        .setName("agregarrango")
        .setDescription("Agregar un rango a la tabla")
        .addRoleOption(option =>
            option.setName("rol")
                .setDescription("Rol a agregar")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("eliminarrango")
        .setDescription("Eliminar un rango de la tabla")
        .addRoleOption(option =>
            option.setName("rol")
                .setDescription("Rol a eliminar")
                .setRequired(true)
        )
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Registrando comandos...");
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log("Comandos registrados.");
    } catch (error) {
        console.error(error);
    }
})();

client.once("ready", () => {
    console.log(`Bot conectado como ${client.user.tag}`);
});

// Función que descarga miembros en vivo y los etiqueta
async function actualizarTabla(guildId, channel) {
    const data = await GuildData.findOne({ guildId });
    if (!data) return;

    const rangos = data.rangos || [];
    let contenido = "# 📋 Tabla de Rangos\n\n";

    if (rangos.length === 0) {
        contenido += "No hay rangos agregados.";
    } else {
        try {
            const todosLosMiembros = await channel.guild.members.fetch();

            for (let index = 0; index < rangos.length; index++) {
                const rolId = rangos[index];
                const miembrosConRol = todosLosMiembros.filter(m => m.roles.cache.has(rolId));
                const listaMenciones = miembrosConRol.map(m => `<@${m.user.id}>`).join(", ");
                const textoMiembros = listaMenciones ? listaMenciones : "*Nadie en este rango*";

                contenido += `${index + 1}. <@&${rolId}>\n👤 **Miembros:** ${textoMiembros}\n\n`;
            }
        } catch (error) {
            console.error("Error al procesar miembros de los rangos:", error);
            contenido += "Error al cargar la lista de miembros en vivo.";
        }
    }

    try {
        const mensaje = await channel.messages.fetch(data.messageId);
        await mensaje.edit(contenido);
    } catch {
        const nuevoMensaje = await channel.send(contenido);
        data.messageId = nuevoMensaje.id;
        await data.save();
    }
}

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const guildId = interaction.guild.id;

    let data = await GuildData.findOne({ guildId });
    if (!data) {
        data = new GuildData({ guildId });
        await data.save();
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({
            content: "❌ Necesitas ser administrador.",
            ephemeral: true
        });
    }

    if (interaction.commandName === "rangos") {
        const mensaje = await interaction.channel.send(
            "# 📋 Tabla de Rangos\n\nNo hay rangos agregados."
        );

        data.messageId = mensaje.id;
        data.channelId = interaction.channel.id;
        await data.save();

        return interaction.reply({
            content: "✅ Tabla creada.",
            ephemeral: true
        });
    }

    if (interaction.commandName === "agregarrango") {
        const rol = interaction.options.getRole("rol");

        if (!data.rangos.includes(rol.id)) {
            data.rangos.push(rol.id);
            await data.save();
        }

        const channel = interaction.guild.channels.cache.get(data.channelId);
        await actualizarTabla(guildId, channel);

        return interaction.reply({
            content: `✅ Rango ${rol} agregado.`,
            ephemeral: true
        });
    }

    if (interaction.commandName === "eliminarrango") {
        const rol = interaction.options.getRole("rol");

        data.rangos = data.rangos.filter(r => r !== rol.id);
        await data.save();

        const channel = interaction.guild.channels.cache.get(data.channelId);
        await actualizarTabla(guildId, channel);

        return interaction.reply({
            content: `✅ Rango ${rol} eliminado.`,
            ephemeral: true
        });
    }
});

client.login(process.env.TOKEN);
