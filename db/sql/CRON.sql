CREATE OR REPLACE FUNCTION cron.reminders() RETURNS VOID AS
$$
DECLARE
    l_meeting_events          RECORD;
    DECLARE l_activity_events RECORD;
    DECLARE l_presence_events RECORD;
BEGIN
    -- Meeting reminders
    SELECT e.event_id
    FROM discord.event e
             JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
    WHERE e.meeting_done IS FALSE
      AND gs.meeting_reminder IS NOT NULL
      AND e.start_time < NOW() + gs.meeting_reminder * INTERVAL '1 day'
      AND e.start_time > NOW()
    INTO l_meeting_events;

    -- Activity presence
    SELECT e.event_id
    FROM discord.event e
             JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
    WHERE e.meeting_done IS FALSE
      AND e.activity_reminder_done IS FALSE
      AND gs.activity_presence IS NOT NULL
      AND e.start_time < NOW() + gs.activity_presence * INTERVAL '1 day'
      AND e.start_time > NOW()
    INTO l_presence_events;

    RAISE NOTICE 'Meeting events: %', l_meeting_events;
    RAISE NOTICE 'Activity events: %', l_activity_events;

    PERFORM pg_notify('meeting_reminders', json_agg(l_meeting_events)::text);
    PERFORM pg_notify('activity_reminders', json_agg(l_activity_events)::text);
END;
$$ LANGUAGE plpgsql;
