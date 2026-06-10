module.exports = {

    name: "owner",

    async execute(interaction) {

        try {

            const owner = await interaction.guild.fetchOwner();

            await interaction.reply({
                content: `👑 El dueño del servidor es ${owner.user.tag}`
            });

        }

        catch (error) {

            console.error(error);

            await interaction.reply({
                content: "❌ No pude obtener el dueño del servidor.",
                ephemeral: true
            });
        }
    }
};
