const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('¡El bot está completamente vivo y funcionando!');
});

app.listen(port, () => {
  console.log(Servidor web interno iniciado en el puerto ${port});
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

const fs = require("fs");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const DATA_FILE = "./data.json";

function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({}));
    }

    return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
}

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

async function actualizarTabla(guildId, channel) {
    const data = loadData();

    if (!data[guildId]) return;

    const rangos = data[guildId].rangos || [];

    let contenido = "# 📋 Tabla de Rangos\n\n";

    if (rangos.length === 0) {
        contenido += "No hay rangos agregados.";
    } else {
        rangos.forEach((rol, index) => {
            contenido += `${index + 1}. <@&${rol}>\n`;
        });
    }

    try {
        const mensaje = await channel.messages.fetch(data[guildId].messageId);

        await mensaje.edit(contenido);
    } catch {
        const nuevoMensaje = await channel.send(contenido);

        data[guildId].messageId = nuevoMensaje.id;
        saveData(data);
    }
}

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const data = loadData();
    const guildId = interaction.guild.id;

    if (!data[guildId]) {
        data[guildId] = {
            rangos: [],
            messageId: null,
            channelId: null
        };
    }

    if (
        !interaction.member.permissions.has(
            PermissionsBitField.Flags.Administrator
        )
    ) {
        return interaction.reply({
            content: "❌ Necesitas ser administrador.",
            ephemeral: true
        });
    }

    if (interaction.commandName === "rangos") {

        const mensaje = await interaction.channel.send(
            "# 📋 Tabla de Rangos\n\nNo hay rangos agregados."
        );

        data[guildId].messageId = mensaje.id;
        data[guildId].channelId = interaction.channel.id;

        saveData(data);

        return interaction.reply({
            content: "✅ Tabla creada.",
            ephemeral: true
        });
    }

    if (interaction.commandName === "agregarrango") {

        const rol = interaction.options.getRole("rol");

        if (!data[guildId].rangos.includes(rol.id)) {
            data[guildId].rangos.push(rol.id);
        }

        saveData(data);

        const channel = interaction.guild.channels.cache.get(
            data[guildId].channelId
        );

        await actualizarTabla(guildId, channel);

        return interaction.reply({
            content: `✅ Rango ${rol} agregado.`,
            ephemeral: true
        });
    }

    if (interaction.commandName === "eliminarrango") {

        const rol = interaction.options.getRole("rol");

        data[guildId].rangos = data[guildId].rangos.filter(
            r => r !== rol.id
        );

        saveData(data);

        const channel = interaction.guild.channels.cache.get(
            data[guildId].channelId
        );

        await actualizarTabla(guildId, channel);

        return interaction.reply({
            content: `✅ Rango ${rol} eliminado.`,
            ephemeral: true
        });
    }
});

client.login(process.env.TOKEN);