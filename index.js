require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    Partials
} = require("discord.js");

// =========================
// SERVIDOR WEB PARA RAILWAY
// =========================

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("✅ Bot de rangos funcionando correctamente 24/7");
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor web iniciado en puerto ${PORT}`);
});

// =========================
// CONEXIÓN A MONGODB
// =========================

mongoose.connect(process.env.MONGO_URI)

    .then(() => {
        console.log("✅ Conectado exitosamente a MongoDB");
    })

    .catch((error) => {
        console.error("❌ Error conectando a MongoDB:");
        console.error(error);
    });

// =========================
// CLIENTE DISCORD
// =========================

const client = new Client({

    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ],

    partials: [
        Partials.Channel
    ]
});

// =========================
// CARGAR COMANDOS
// =========================

client.commands = new Map();

const commandsPath = path.join(__dirname, "commands");

const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

// =========================
// BOT LISTO
// =========================

client.once("ready", async () => {

    console.log("=================================");
    console.log(`🤖 Bot conectado como ${client.user.tag}`);
    console.log(`📡 Servidores conectados: ${client.guilds.cache.size}`);
    console.log("=================================");
});

// =========================
// MANEJO DE COMANDOS
// =========================

client.on("interactionCreate", async interaction => {

    try {

        // Verificar slash command
        if (!interaction.isChatInputCommand()) return;

        // Verificar permisos admin
        if (
            !interaction.member.permissions.has(
                PermissionsBitField.Flags.Administrator
            )
        ) {

            return interaction.reply({
                content: "❌ Necesitas permisos de administrador.",
                ephemeral: true
            });
        }

        // Buscar comando
        const command = client.commands.get(interaction.commandName);

        if (!command) {

            return interaction.reply({
                content: "❌ Comando no encontrado.",
                ephemeral: true
            });
        }

        // Ejecutar comando
        await command.execute(interaction);

    }

    catch (error) {

        console.error("❌ Error ejecutando comando:");
        console.error(error);

        // Evitar doble reply
        if (interaction.replied || interaction.deferred) {

            await interaction.followUp({
                content: "❌ Ocurrió un error ejecutando el comando.",
                ephemeral: true
            });

        } else {

            await interaction.reply({
                content: "❌ Ocurrió un error ejecutando el comando.",
                ephemeral: true
            });
        }
    }
});

// =========================
// MANEJO DE ERRORES GLOBALES
// =========================

process.on("unhandledRejection", error => {
    console.error("❌ Error no controlado:");
    console.error(error);
});

process.on("uncaughtException", error => {
    console.error("❌ Excepción no capturada:");
    console.error(error);
});

// =========================
// LOGIN DEL BOT
// =========================

client.login(process.env.TOKEN)
    .then(() => {
        console.log("🔑 Login realizado correctamente");
    })
    .catch((error) => {
        console.error("❌ Error iniciando sesión:");
        console.error(error);
    });