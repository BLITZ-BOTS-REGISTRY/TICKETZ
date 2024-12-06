import {
  ChatInputCommandInteraction,
  Client,
  PermissionOverwrites,
  Role,
  SlashCommandBuilder,
  TextChannel,
} from "npm:discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Open a support ticket"),
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

      if (!config.ticket_message) {
        throw new Error(
          "The 'ticket_message' is not defined in the configuration.",
        );
      }

      const category = guild.channels.cache.get(config.tickets_category);
      if (!category || category.type !== 4) {
        throw new Error("No valid tickets category found!");
      }

      const existingTicket = guild.channels.cache.find(
        (channel: TextChannel) =>
          channel.name === `ticket-${interaction.user.id}` &&
          channel.parentId === category.id,
      );

      if (existingTicket) {
        await interaction.reply({
          content: "You already have an open ticket!",
          ephemeral: true,
        });
        return;
      }

      const perms = [
        {
          id: guild.roles.everyone.id,
          deny: ["ViewChannel", "SendMessages"],
        },
        {
          id: interaction.user.id,
          allow: ["ViewChannel", "SendMessages"],
        },
      ];

      config.support_roles.forEach((roleName: string) => {
        const role = guild.roles.cache.find((r: Role) => r.name === roleName);
        if (role) {
          perms.push({
            id: role.id,
            allow: ["ViewChannel", "SendMessages"],
          });
        }
      });

      const channel = await guild.channels.create({
        name: `ticket-${interaction.user.id}`,
        parent: category.id,
        permissionOverwrites: perms as [] as PermissionOverwrites[],
        type: 0,
      });

      if (!channel) {
        throw new Error("Failed to create the ticket channel.");
      }

      let welcomeMessage = config.ticket_message;
      welcomeMessage = welcomeMessage.replace(
        /@user/g,
        `<@${interaction.user.id}>`,
      );
      config.support_roles.forEach((roleName) => {
        const role = guild.roles.cache.find((r: Role) => r.name === roleName);
        if (role) {
          welcomeMessage = welcomeMessage.replace(
            new RegExp(`@${roleName}`, "g"),
            `<@&${role.id}>`,
          );
        }
      });

      await (channel as TextChannel).send({
        content: welcomeMessage,
      });

      await interaction.reply({
        content: `Your support ticket has been created: ${channel.toString()}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      await interaction.reply({
        content:
          "There was an error creating your ticket. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
