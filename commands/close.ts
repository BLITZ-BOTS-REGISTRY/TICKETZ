import {
  ChatInputCommandInteraction,
  Client,
  Role,
  SlashCommandBuilder,
  SlashCommandUserOption,
  TextChannel,
} from "npm:discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("close")
    .setDescription("Close a support ticket")
    .addUserOption((option: SlashCommandUserOption) =>
      option
        .setName("user")
        .setDescription("The user whose ticket you want to close")
        .setRequired(true)
    ),
  action: async (
    _client: Client,
    interaction: ChatInputCommandInteraction,
    config: {
      tickets_category: string;
      support_roles: string[];
      ticket_message?: string;
    },
  ) => {
    try {
      const guild = interaction.guild;
      if (!guild) {
        throw new Error("This command can only be used in a server.");
      }

      const member = interaction.member;
      if (!member || !("roles" in member)) {
        await interaction.reply({
          content:
            "Unable to verify your roles. Please contact an administrator.",
          ephemeral: true,
        });
        return;
      }

      const memberRoles = member.roles.cache.map((role: Role) => role.name);
      const hasPermission = config.support_roles.some((roleName) =>
        memberRoles.includes(roleName)
      );

      if (!hasPermission) {
        await interaction.reply({
          content: "You do not have permission to use this command.",
          ephemeral: true,
        });
        return;
      }

      const user = interaction.options.getUser("user");
      if (!user) {
        return await interaction.reply({
          content: `No user found.`,
          ephemeral: true,
        });
      }

      const category = guild.channels.cache.get(config.tickets_category);
      if (!category || category.type !== 4) {
        throw new Error("No valid tickets category found!");
      }

      const ticketChannel = guild.channels.cache.find(
        (channel: TextChannel) =>
          channel.name === `ticket-${user.id}` &&
          channel.parentId === category.id,
      ) as TextChannel;

      if (!ticketChannel) {
        await interaction.reply({
          content: `No ticket found for user <@${user.id}>.`,
          ephemeral: true,
        });
        return;
      }

      if (interaction) {
        await interaction.reply({
          content: `Ticket for <@${user.id}> has been closed.`,
          ephemeral: true,
        });
        ticketChannel.delete(`Ticket closed by ${interaction.user.username}`);
      }
    } catch (error) {
      console.error("Error closing ticket:", error);
      await interaction.reply({
        content:
          "There was an error closing the ticket. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
