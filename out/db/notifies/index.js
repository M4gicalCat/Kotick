import { onReminders } from './onReminders.js';
export const onNotify = (data, client) => {
    const payload = JSON.parse(data.payload);
    switch (payload.type) {
        case 'reminders':
            onReminders(payload.data, client);
    }
};
