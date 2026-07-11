import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../auth/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { Booking } from '../bookings/entities/booking.entity';

dotenv.config();

const isSqlite = process.env.DB_TYPE === 'sqlite';

export const dataSourceOptions: DataSourceOptions = isSqlite
  ? {
      type: 'sqlite',
      database: process.env.DB_SQLITE_PATH || 'db/booking-platform.sqlite',
      entities: [User, Service, Booking],
      migrations: ['src/migrations/*.ts'],
      synchronize: false,
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'booking_platform',
      entities: [User, Service, Booking],
      migrations: ['src/migrations/*.ts'],
      synchronize: false,
    };

// Used by the TypeORM CLI (npm run migration:*)
export const AppDataSource = new DataSource(dataSourceOptions);
