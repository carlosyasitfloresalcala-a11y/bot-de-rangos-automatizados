require("dotenv").config();

const {
    REST,
    Routes,
    SlashCommandBuilder
} = require("discord.js");

const commands = [

    // =========================
    // COMANDO /rangos
    // =========================

    new SlashCommandBuilder()
        .setName("rangos")
        .setDescription("Crear tabla de rangos"),

    // =========================
    // COMANDO /agregarrango
    // =========================

    new SlashCommandBuilder()
        .setName("agregarrango")
        .setDescription("Agregar un rango a la tabla")

        .addRoleOption(option =>
            option
                .setName("rol")
                .setDescription("Rol que deseas agregar")
                .setRequired(true)
        ),

    // =========================
    // COMANDO /eliminarrango
    // =========================

    new SlashCommandBuilder()
        .setName("eliminarrango")
        .setDescription("Eliminar un rango de la tabla")

        .addRoleOption(option =>
            option
                .setName("rol")
                .setDescription("Rol que deseas eliminar")
                .setRequired(true)
        ),

    // =========================
    // COMANDO /actualizar
    // =========================

    new SlashCommandBuilder()
        .setName("actualizar")
        .setDescription("Actualizar manualmente la tabla de rangos"),

    // =========================
    // COMANDO /owner
    // =========================

    new SlashCommandBuilder()
        .setName("owner")
        .setDescription("Muestra el dueño del servidor")

].map(command => command.toJSON());

// =========================
// CONFIGURAR REST
// =========================

const rest = new REST({
    version: "10"
}).setToken(process.env.TOKEN);

// =========================
// REGISTRAR COMANDOS
// =========================

(async () => {

    try {

        console.log("=================================");
        console.log("🔄 Registrando slash commands...");
        console.log("=================================");

        await rest.put(

            Routes.applicationCommands(
                process.env.CLIENT_ID
            ),

            {
                body: commands
            }
        );

        console.log("=================================");
        console.log("✅ Slash commands registrados");
        console.log("=================================");
    }

    catch (error) {

        console.error("❌ Error registrando comandos:");
        console.error(error);
    }

})();
