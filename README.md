# 🎫 Ticketz
#### Create simple tickets in your discord server.

## Commands
``/ticket`` - user whom ran command creates a ticket.

``/close`` - close a ticket using a specific user mention.

## Config
Edit all config values in ``blitz.config.yaml``.

#### Values
| Name             	| Type       	| Use                                                  	|
|------------------	|------------	|------------------------------------------------------	|
| tickets_category 	| channel id 	| Used to place ticket channels in a specific category 	|
| ticket_message   	| string     	| Message to send into a newly created channel         	|
| support_roles    	| list       	| List of role names which can view and close tickets  	|


#### Config Example
```yaml
config:
  tickets_category: "1314381040713990205"
  ticket_message: "Hey @user, this is your ticket! Please describe your issue here."
  support_roles:
    - Moderator
    - Helper
```

#### Ticket Message Variables
You can input mentions into your ticket message using specific symbols.

``@user`` - mention the user which created the ticket

``@{role}`` - mention any role within the support roles, *e.g, @Moderator*