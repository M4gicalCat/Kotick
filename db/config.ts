import * as dotenv from 'dotenv';
dotenv.config({ path: './env/.private.env' });
dotenv.config({ path: './env/.env' });
import pgPromise from 'pg-promise';
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
const db = pgPromise({})(
  `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
);

export default db;
export const pgp = pgPromise({});
