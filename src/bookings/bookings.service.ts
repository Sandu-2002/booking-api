import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { FindBookingsQueryDto } from './dto/find-bookings-query.dto';
import { BookingStatus } from './enums/booking-status.enum';
import { ServicesService } from '../services/services.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly servicesService: ServicesService,
  ) {}

  async create(dto: CreateBookingDto) {
    const service = await this.servicesService.findOne(dto.serviceId);

    const duplicate = await this.bookingRepository.findOne({
      where: {
        serviceId: dto.serviceId,
        bookingDate: dto.bookingDate,
        bookingTime: dto.bookingTime,
      },
    });
    if (duplicate && duplicate.status !== BookingStatus.CANCELLED) {
      throw new ConflictException(
        'This service is already booked for the selected date and time',
      );
    }

    const booking = this.bookingRepository.create({
      ...dto,
      serviceId: service.id,
      status: BookingStatus.PENDING,
    });
    return this.bookingRepository.save(booking);
  }

  async findAll(query: FindBookingsQueryDto) {
    const { status, search, page = 1, limit = 10 } = query;

    const where: any = {};
    if (status) where.status = status;
    if (search) where.customerName = Like(`%${search}%`);

    const [data, total] = await this.bookingRepository.findAndCount({
      where,
      relations: ['service'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['service'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id "${id}" not found`);
    }
    return booking;
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.findOne(id);

    if (
      booking.status === BookingStatus.CANCELLED &&
      dto.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'A cancelled booking cannot be marked as completed',
      );
    }

    booking.status = dto.status;
    return this.bookingRepository.save(booking);
  }

  async cancel(id: string) {
    const booking = await this.findOne(id);

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('A completed booking cannot be cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    return this.bookingRepository.save(booking);
  }
}