import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { Validate } from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNotPastDate', async: false })
export class IsNotPastDateConstraint implements ValidatorConstraintInterface {
  validate(dateValue: string) {
    if (!dateValue) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(dateValue);
    inputDate.setHours(0, 0, 0, 0);
    return inputDate.getTime() >= today.getTime();
  }

  defaultMessage() {
    return 'bookingDate cannot be in the past';
  }
}

export class CreateBookingDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  customerEmail!: string;

  @ApiProperty({ example: '+94771234567' })
  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @ApiProperty({ example: 'b3f1c2a0-1234-4a5b-9abc-987654321000' })
  @IsUUID()
  serviceId!: string;

  @ApiProperty({ example: '2026-08-01', description: 'YYYY-MM-DD' })
  @IsDateString()
  @Validate(IsNotPastDateConstraint)
  bookingDate!: string;

  @ApiProperty({ example: '14:30', description: 'HH:mm (24h)' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'bookingTime must be in HH:mm 24-hour format',
  })
  bookingTime!: string;

  @ApiProperty({ example: 'Please call before arriving', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
