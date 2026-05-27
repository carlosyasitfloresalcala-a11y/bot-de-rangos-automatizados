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

  // 🔥 CARGAR TODOS LOS MIEMBROS DEL SERVIDOR
  for (const guild of client.guilds.cache.values()) {
    await guild.members.fetch();
    console.log(`👥 Miembros cargados en ${guild.name}`);
  }
});

// COMANDO MANUAL !tabla
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content !== "!tabla") return;

  if (
    !message.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    )
  ) {
    return message.reply("❌ No tienes permisos.");
  }

  await actualizarTabla(message.guild);
  message.reply("✅ Tabla actualizada.");
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