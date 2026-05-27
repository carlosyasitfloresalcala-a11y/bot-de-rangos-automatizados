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
        .setDescription("Agregar rango")
        .addRoleOption(option =>
            option
                .setName("rol")
                .setDescription("Rol")
                .setRequired(true)
        ),

   new SlashCommandBuilder()
    .setName("eliminarrango")
    .setDescription("Eliminar rango")
    .addRoleOption(option =>
        option
            .setName("rol")
            .setDescription("Rol")
            .setRequired(true)
    ),

new SlashCommandBuilder()
    .setName("actualizar")
    .setDescription("Actualizar manualmente la tabla")

].map(command => command.toJSON());

const rest = new REST({
    version: "10"
}).setToken(process.env.TOKEN);

(async () => {

    try {

        console.log("Registrando comandos...");

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log("✅ Comandos registrados.");

    }

    catch (error) {

        console.error(error);
    }

})();