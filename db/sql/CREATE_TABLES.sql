CREATE SCHEMA IF NOT EXISTS discord;

CREATE TABLE IF NOT EXISTS discord.guild_calendar (
    guild_id VARCHAR(20) NOT NULL,
    calendar_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (guild_id, calendar_id)
);

DROP TABLE IF EXISTS discord.guild_settings;
CREATE TABLE IF NOT EXISTS discord.guild_settings (
    guild_id VARCHAR(20) NOT NULL,
    meeting_reminder INT DEFAULT 17,
    activity_presence INT DEFAULT 7,
    activity_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    role_responsable VARCHAR(255) NOT NULL,
    role_enfant VARCHAR(255) NOT NULL,
    drive_folder VARCHAR(255),
    meeting_reminders_channel VARCHAR(255),
    activity_reminders_channel VARCHAR(255),
    PRIMARY KEY (guild_id)
);

CREATE TABLE IF NOT EXISTS discord.event (
    event_id VARCHAR(255) NOT NULL,
    calendar_id VARCHAR(255) NOT NULL,
    guild_id VARCHAR(20) NOT NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    meeting_time TIMESTAMP,
    meeting_done BOOLEAN NOT NULL DEFAULT FALSE,
    activity_reminder_done BOOLEAN NOT NULL DEFAULT FALSE,
    sheet_id VARCHAR(255),
    PRIMARY KEY (event_id, guild_id)
);

CREATE TABLE IF NOT EXISTS discord.event_activity (
    event_id VARCHAR(255) NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    guild_id VARCHAR(20) NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (event_id, activity_name, guild_id),
    FOREIGN KEY (event_id, guild_id) REFERENCES discord.event (event_id, guild_id)
);

CREATE TABLE IF NOT EXISTS discord.user_name (
    id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    guild_id VARCHAR(20) NOT NULL,
    PRIMARY KEY (id, guild_id),
    CONSTRAINT unique_name UNIQUE (name, guild_id)
);

--DROP TABLE IF EXISTS discord.event_user;
CREATE TABLE IF NOT EXISTS discord.event_user (
    event_id VARCHAR(255) NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    guild_id VARCHAR(20) NOT NULL,
    PRIMARY KEY (event_id, user_id, guild_id, activity_name),
    FOREIGN KEY (event_id, guild_id) REFERENCES discord.event (event_id, guild_id),
    FOREIGN KEY (user_id, guild_id) REFERENCES discord.user_name (id, guild_id),
    FOREIGN KEY (event_id, activity_name, guild_id) REFERENCES discord.event_activity (event_id, activity_name, guild_id)
);

CREATE SCHEMA IF NOT EXISTS cron;