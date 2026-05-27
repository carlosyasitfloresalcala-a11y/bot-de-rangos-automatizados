const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot activo");
});

app.listen(3000, () => {
  console.log("Web online");
});
require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// CONFIGURACIÓN
const CANAL_TABLA_ID = "1503582640853352599";
const ROLES_A_MONITOREAR = ["LIDER", "Mandos", "Colonenl", "Mayor", "Sargento de Primera Clase", "Sargento de Personal", "Sargento", "Cabo", "Soldado Primera Clase", "Soldado Raso"]; // nombres exactos
let MENSAJE_TABLA_ID = null;

// BOT LISTO
client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  // Esto registra el comando /rangos de forma global en cualquier servidor
  try {
    await client.application.commands.set([
      {
        name: "rangos",
        description: "Actualiza la tabla de rangos del servidor manualmente",
      }
    ]);
    console.log("⭐ Comando /rangos registrado globalmente");
  } catch (error) {
    console.error("Error al registrar comando:", error);
  }

  // CARGAR TODOS LOS MIEMBROS DEL SERVIDOR
  for (const guild of client.guilds.cache.values()) {
    await guild.members.fetch();
    console.log(`👥 Miembros cargados en ${guild.name}`);
  }
});

// COMANDO MANUAL !tabla
// ESCUCHAR COMANDO DIAGONAL /rangos
client.on("interactionCreate", async (interaction) => {
  // Si no es un comando de barra diagonal, no hacer nada
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "rangos") {
    // Verificar si el usuario es administrador
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "❌ No tienes permisos para usar este comando.", ephemeral: true });
    }

    // Avisarle a Discord que el bot está procesando (evita que el comando expire si tarda en cargar)
    await interaction.deferReply();

    try {
      // Ejecuta tu función usando el servidor donde se usó el comando (interaction.guild)
      await actualizarTabla(interaction.guild);
      await interaction.editReply("✅ Tabla actualizada correctamente.");
    } catch (error) {
      console.error(error);
      await interaction.editReply("❌ Hubo un error al actualizar la tabla.");
    }
  }
});

// DETECTAR CAMBIOS DE ROLES
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  if (oldMember.roles.cache.size === newMember.roles.cache.size) return;
  await actualizarTabla(newMember.guild);
});

// FUNCIÓN PRINCIPAL
async function actualizarTabla(guild) {
  const canal = guild.channels.cache.get(CANAL_TABLA_ID);
  if (!canal) return;

  let contenido = "📊 **TABLA DE RANGOS**\n\n";

  for (const nombreRol of ROLES_A_MONITOREAR) {
    const rol = guild.roles.cache.find(
      (r) => r.name.toLowerCase() === nombreRol.toLowerCase()
    );
    if (!rol) continue;

    contenido += `🔰 <@&${rol.id}>\n`;

    if (rol.members.size === 0) {
      contenido += "_Nadie_\n\n";
      continue;
    }

    rol.members.forEach((miembro) => {
      contenido += `• <@${miembro.id}>\n`;
    });

    contenido += "\n";
  }

  // CREAR O EDITAR MENSAJE
  if (!MENSAJE_TABLA_ID) {
    const mensajes = await canal.messages.fetch({ limit: 10 });
    const existente = mensajes.find(
      (m) =>
        m.author.id === client.user.id &&
        m.content.startsWith("📊 **TABLA DE RANGOS**")
    );

    if (existente) {
      MENSAJE_TABLA_ID = existente.id;
      await existente.edit(contenido);
    } else {
      const nuevo = await canal.send(contenido);
      MENSAJE_TABLA_ID = nuevo.id;
    }
  } else {
    try {
      const mensaje = await canal.messages.fetch(MENSAJE_TABLA_ID);
      await mensaje.edit(contenido);
    } catch {
      MENSAJE_TABLA_ID = null;
      await actualizarTabla(guild);
    }
  }
}

client.login(process.env.TOKEN);