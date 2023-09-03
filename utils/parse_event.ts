/**
 * Get an event's id from its link or share link
 * @param event the link or share link
 * @returns event_id
 */
const parse_event = (event: string) => {
  // event link
  if (event.startsWith('https://discord.com/events/')) {
    return event.split('/').pop()!;
  }
  // share event
  if (event.startsWith('https://discord.gg/')) {
    return new URL(event).searchParams.get('event');
  }
  return null;
};

export default parse_event;
