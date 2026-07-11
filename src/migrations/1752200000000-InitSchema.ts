import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  type TableColumnOptions,
} from 'typeorm';

export class InitSchema1752200000000 implements MigrationInterface {
  name = 'InitSchema1752200000000';

  private createIdColumn(): TableColumnOptions {
    return {
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      isGenerated: true,
      generationStrategy: 'uuid',
      default: 'uuid_generate_v4()',
    };
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          this.createIdColumn(),
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Services table
    await queryRunner.createTable(
      new Table({
        name: 'services',
        columns: [
          this.createIdColumn(),
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'duration',
            type: 'integer',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Bookings table
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          this.createIdColumn(),
          {
            name: 'customerName',
            type: 'varchar',
          },
          {
            name: 'customerEmail',
            type: 'varchar',
          },
          {
            name: 'customerPhone',
            type: 'varchar',
          },
          {
            name: 'serviceId',
            type: 'uuid',
          },
          {
            name: 'bookingDate',
            type: 'date',
          },
          {
            name: 'bookingTime',
            type: 'time',
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'PENDING'",
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'bookings',
      new TableForeignKey({
        name: 'FK_BOOKING_SERVICE',
        columnNames: ['serviceId'],
        referencedTableName: 'services',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'UQ_BOOKING_SERVICE_DATE_TIME',
        columnNames: ['serviceId', 'bookingDate', 'bookingTime'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('bookings', true, true, true);
    await queryRunner.dropTable('services', true, true, true);
    await queryRunner.dropTable('users', true, true, true);
  }
}
