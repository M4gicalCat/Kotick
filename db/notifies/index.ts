import { onReminders } from './onReminders.js';
import { Client } from 'discord.js';

export const onNotify = (data: any, client: Client) => {
  const payload = JSON.parse(data.payload);
  switch (payload.type) {
    case 'reminders':
      onReminders(payload.data, client);
  }
};
