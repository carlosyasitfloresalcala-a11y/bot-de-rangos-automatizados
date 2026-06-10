require("dotenv").config();

const {
    REST,
    Routes,
    SlashCommandBuilder
} = require("discord.js");

const commands = [

    new SlashCommandBuilder()
        .setName("rangos")
        .setDescription("Crear tabla de rangos"),

    new SlashCommandBuilder()
        .setName("agregarrango")
        .setDescription("Agregar un rango a la tabla")
        .addRoleOption(option =>
            option
                .setName("rol")
                .setDescription("Rol que deseas agregar")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("eliminarrango")
        .setDescription("Eliminar un rango de la tabla")
        .addRoleOption(option =>
            option
                .setName("rol")
                .setDescription("Rol que deseas eliminar")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("actualizar")
        .setDescription("Actualizar manualmente la tabla de rangos"),

    new SlashCommandBuilder()
        .setName("owner")
        .setDescription("Muestra el dueño del servidor")

].map(command => command.toJSON());

const rest = new REST({
    version: "10"
}).setToken(process.env.TOKEN);

(async () => {

    try {

        console.log("🔄 Registrando slash commands...");

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            {
                body: commands
            }
        );

        console.log("✅ Slash commands registrados");

    } catch (error) {

        console.error("❌ Error registrando comandos:");
        console.error(error);
    }

})();
