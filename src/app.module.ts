import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { User } from './auth/entities/user.entity';
import { Service } from './services/entities/service.entity';
import { Booking } from './bookings/entities/booking.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isSqlite = config.get<string>('DB_TYPE') === 'sqlite';

        if (isSqlite) {
          return {
            type: 'sqlite' as const,
            database: config.get<string>(
              'DB_SQLITE_PATH',
              'db/booking-platform.sqlite',
            ),
            entities: [User, Service, Booking],
            synchronize: false,
            migrationsRun: true,
            migrations: [__dirname + '/migrations/*{.ts,.js}'],
          };
        }

        return {
          type: 'postgres' as const,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USERNAME', 'postgres'),
          password: config.get<string>('DB_PASSWORD', 'postgres'),
          database: config.get<string>('DB_DATABASE', 'booking_platform'),
          entities: [User, Service, Booking],
          synchronize: false,
          migrationsRun: true,
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
        };
      },
    }),
    AuthModule,
    ServicesModule,
    BookingsModule,
  ],
})
export class AppModule {}
