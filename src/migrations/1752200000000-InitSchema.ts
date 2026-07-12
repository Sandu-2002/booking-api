import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitSchema1752200000000 implements MigrationInterface {
  name = 'InitSchema1752200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const isPostgres = queryRunner.connection.options.type === 'postgres';

    if (isPostgres) {
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    }

    const idColumn = isPostgres
      ? {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          default: 'uuid_generate_v4()',
        }
      : {
          name: 'id',
          type: 'varchar',
          isPrimary: true,
          generationStrategy: 'uuid' as const,
          isGenerated: true,
        };

    // users
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          idColumn,
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password', type: 'varchar' },
          { name: 'name', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // services
    await queryRunner.createTable(
      new Table({
        name: 'services',
        columns: [
          idColumn,
          { name: 'title', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'duration', type: 'int' },
          { name: 'price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // bookings
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          idColumn,
          { name: 'customerName', type: 'varchar' },
          { name: 'customerEmail', type: 'varchar' },
          { name: 'customerPhone', type: 'varchar' },
          { name: 'serviceId', type: isPostgres ? 'uuid' : 'varchar' },
          { name: 'bookingDate', type: 'date' },
          { name: 'bookingTime', type: 'time' },
          { name: 'status', type: 'varchar', default: `'PENDING'` },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({
        columnNames: ['serviceId'],
        referencedTableName: 'services',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_BOOKING_SERVICE_DATE_TIME',
        columnNames: ['serviceId', 'bookingDate', 'bookingTime'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('bookings', true, true, true);
    await queryRunner.dropTable('services', true, true, true);
    await queryRunner.dropTable('users', true, true, true);
  }
}
