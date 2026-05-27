const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

const RUTA_BD = path.join(__dirname, "servidores.json");

// Función para leer los roles guardados de un servidor
function obtenerRolesServidor(guildId) {
  if (!fs.existsSync(RUTA_BD)) return [];
  const datos = JSON.parse(fs.readFileSync(RUTA_BD, "utf-8"));
  return datos[guildId] || [];
}

// Función para guardar los roles de un servidor
function guardarRolesServidor(guildId, roles) {
  let datos = {};
  if (fs.existsSync(RUTA_BD)) {
    datos = JSON.parse(fs.readFileSync(RUTA_BD, "utf-8"));
  }
  datos[guildId] = roles;
  fs.writeFileSync(RUTA_BD, JSON.stringify(datos, null, 2), "utf-8");
}

// Servidor Web para UptimeRobot 24/7
app.get("/", (req, res) => res.send("Bot activo"));
app.listen(3000, () => console.log("Servidor web online"));

// Registro Global de Comandos
client.once("ready", async () => {
  console.log(✅ Bot conectado como ${client.user.tag});
  try {
    await client.application.commands.set([
      {
        name: "rangos",
        description: "Muestra la tabla de rangos actualizada de este servidor"
      },
      {
        name: "config-agregar",
        description: "Añade un rol a la lista de monitoreo de rangos",
        options: [
          {
            name: "rol",
            description: "Menciona el rol que deseas añadir",
            type: 8, // Tipo ROLE
            required: true
          }
        ]
      },
      {
        name: "config-eliminar",
        description: "Elimina un rol de la lista de monitoreo de rangos",
        options: [
          {
            name: "rol",
            description: "Menciona el rol que deseas quitar",
            type: 8, // Tipo ROLE
            required: true
          }
        ]
      }
    ]);
    console.log("⭐ Comandos del sistema registrados globalmente");
  } catch (error) {
    console.error("Error al registrar comandos:", error);
  }
});

// Receptor de Interacciones
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName, guild, member, channel } = interaction;

  // Verificar permisos de Administrador para configurar o usar el bot
  if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: "❌ No tienes permisos de Administrador para usar este bot.", ephemeral: true });
  }

  const rolesActuales = obtenerRolesServidor(guild.id);

  if (commandName === "config-agregar") {
    const rolObject = interaction.options.getRole("rol");
    
    if (rolesActuales.includes(rolObject.name)) {
      return interaction.reply({ content: ⚠️ El rol **${rolObject.name}** ya está en la lista., ephemeral: true });
    }

    rolesActuales.push(rolObject.name);
    guardarRolesServidor(guild.id, rolesActuales);
    return interaction.reply({ content: ✅ Se ha añadido el rol **${rolObject.name}** a la tabla de monitoreo. });
  }

  if (commandName === "config-eliminar") {
    const rolObject = interaction.options.getRole("rol");
    
    if (!rolesActuales.includes(rolObject.name)) {
      return interaction.reply({ content: ⚠️ El rol **${rolObject.name}** no estaba en la lista., ephemeral: true });
    }

    const nuevaLista = rolesActuales.filter(nombre => nombre !== rolObject.name);
    guardarRolesServidor(guild.id, nuevaLista);
    return interaction.reply({ content: ❌ Se ha eliminado el rol **${rolObject.name}** de la tabla de monitoreo. });
  }

  if (commandName === "rangos") {
    await interaction.deferReply();
    
    if (rolesActuales.length === 0) {
      return interaction.editReply("⚠️ Este servidor aún no tiene rangos configurados. Usa /config-agregar para empezar.");
    }

    try {
      await guild.members.fetch();
      let contenido = "📊 *TABLA DE RANGOS DEL SERVIDOR*\n\n";

      for (const nombreRol of rolesActuales) {
        const rol = guild.roles.cache.find(r => r.name.toLowerCase() === nombreRol.toLowerCase());
        if (!rol) continue;

        contenido += 🔰 <@&${rol.id}>\n;
        if (rol.members.size === 0) {
          contenido += "Nadie\n\n";
          continue;
        }

        rol.members.forEach(m => {
          contenido += • <@${m.id}>\n;
        });
        contenido += "\n";
      }

      await channel.send(contenido);
      await interaction.editReply("✅ Tabla desplegada correctamente.");
    } catch (error) {
      console.error(error);
      await interaction.editReply("❌ Hubo un error al generar la tabla.");
    }
  }
});

// El Token se lee de forma segura desde Railway
client.login(process.env.TOKEN);