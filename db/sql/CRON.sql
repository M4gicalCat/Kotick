CREATE OR REPLACE FUNCTION cron.reminders() RETURNS VOID AS
$$
DECLARE
    l_meeting_events  VARCHAR(255)[];
    l_event_events VARCHAR(255)[];
    l_presence_events VARCHAR(255)[];
    l_activity_events JSONB[];
BEGIN
    -- Meeting reminders
    SELECT ARRAY_AGG(e.event_id)
    FROM discord.event e
             JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
    WHERE e.meeting_done IS FALSE
      AND gs.meeting_reminder IS NOT NULL
      AND e.start_time::date <= (NOW() + gs.meeting_reminder * INTERVAL '1 day')::date
      AND e.start_time::date > CURRENT_DATE
      AND e.meeting_time IS NULL
    INTO l_meeting_events;

    -- Activity presence
    SELECT ARRAY_AGG(e.event_id)
    FROM discord.event e
             JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
    WHERE e.meeting_done IS TRUE
      AND e.activity_reminder_done IS FALSE
      AND gs.activity_presence IS NOT NULL
      AND e.start_time::date <= (NOW() + gs.activity_presence * INTERVAL '1 day')::date
      AND e.start_time::date > CURRENT_DATE
    INTO l_presence_events;

    -- event reminders (is today)
    SELECT ARRAY_AGG(e.event_id)
    FROM discord.event e
             JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
    WHERE e.meeting_done IS TRUE
      AND gs.activity_reminder IS TRUE
      AND e.start_time::date = NOW()::date
    INTO l_event_events;

    -- activity reminders (AM1)
    SELECT ARRAY_AGG(
        jsonb_build_object('event_id', e.event_id, 'activity_name', a.activity_name, 'guild_id', e.guild_id)
    )
    FROM discord.event e
            JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
            JOIN discord.event_activity a ON a.event_id = e.event_id
    WHERE e.meeting_done IS TRUE
      AND gs.activity_reminder IS TRUE
      AND e.start_time::date <= (NOW() + gs.meeting_reminder * INTERVAL '1 day')::date
      AND e.start_time::date > CURRENT_DATE
    INTO l_activity_events;

    PERFORM pg_notify(
        'reminders',
        jsonb_build_object(
            'type', 'reminders',
            'data', jsonb_build_object(
                'meeting', l_meeting_events,
                'event', l_event_events,
                'presence', l_presence_events,
                'activity', l_activity_events
            )
        )::text
    );
END;
$$ LANGUAGE plpgsql;

SELECT cron.reminders();