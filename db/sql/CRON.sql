CREATE OR REPLACE FUNCTION kotick_cron.reminders() RETURNS VOID AS
$$
DECLARE
    l_meeting_events  JSONB[];
    l_meeting_events_today  JSONB[];
    l_events JSONB[];
    l_presence_events JSONB[];
    l_activity_events JSONB[];
    l_activity_meetings JSONB[];
BEGIN
    -- Meeting reminders : meeting is not set
    SELECT ARRAY_AGG(jsonb_build_object('event', e.event_id, 'guild', e.guild_id))
    FROM discord.event e
       JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
    WHERE e.meeting_done IS FALSE
      AND gs.meeting_reminder IS NOT NULL
      AND e.meeting_time IS NULL
      AND e.start_time::date <= (NOW() + gs.meeting_reminder * INTERVAL '1 day')::date
    INTO l_meeting_events;

    -- event meeting reminders today
    SELECT ARRAY_AGG(
         jsonb_build_object('event', e.event_id, 'guild', e.guild_id)
      )
    FROM discord.event e
             JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
             JOIN discord.event_activity a ON a.event_id = e.event_id
    WHERE e.meeting_done IS TRUE
      AND gs.activity_reminder IS TRUE
      AND e.meeting_time IS NOT NULL
      AND e.meeting_time::date = CURRENT_DATE
    INTO l_meeting_events_today;

    -- Activity presence
    SELECT ARRAY_AGG(jsonb_build_object('event', e.event_id, 'guild', e.guild_id))
    FROM discord.event e
             JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
    WHERE e.meeting_done IS TRUE
      AND e.activity_reminder_done IS FALSE
      AND gs.activity_presence IS NOT NULL
      AND e.start_time::date <= (NOW() + gs.activity_presence * INTERVAL '1 day')::date
      AND e.start_time::date > CURRENT_DATE
    INTO l_presence_events;

    -- event reminders (is today)
    SELECT ARRAY_AGG(jsonb_build_object('event', e.event_id, 'guild', e.guild_id))
    FROM discord.event e
             JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
    WHERE e.meeting_done IS TRUE
      AND gs.activity_reminder IS TRUE
      AND e.start_time::date = CURRENT_DATE
    INTO l_events;

    -- activity reminders : activity meeting not set
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
      AND a.meeting_time IS NULL
    INTO l_activity_events;

    -- activity meetings is today
    SELECT ARRAY_AGG(
        jsonb_build_object('event_id', e.event_id, 'activity_name', a.activity_name, 'guild_id', e.guild_id)
    )
    FROM discord.event e
            JOIN discord.guild_settings gs ON gs.guild_id = e.guild_id
            JOIN discord.event_activity a ON a.event_id = e.event_id
    WHERE e.meeting_done IS TRUE
      AND gs.activity_reminder IS TRUE
      AND a.meeting_time IS NOT NULL
      AND a.meeting_time::date = CURRENT_DATE
    INTO l_activity_meetings;

    PERFORM pg_notify(
        'reminders',
        jsonb_build_object(
            'type', 'reminders',
            'data', jsonb_build_object(
                'meeting', l_meeting_events,
                'meeting_today', l_meeting_events_today,
                'event', l_events,
                'presence', l_presence_events,
                'activity', l_activity_events,
                'activity_meeting', l_activity_meetings
            )
        )::text
    );
END;
$$ LANGUAGE plpgsql;