import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CouponType } from "./coupon-type.enum";
import { Coupon } from "./coupon.entity";
import { ApplyCouponDto } from "./dto/apply-coupon.dto";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto) {
    await this.checkDuplicateCode(createCouponDto.code);

    const coupon = this.couponsRepository.create({
      ...createCouponDto,
      code: createCouponDto.code.toUpperCase(),
      expiryDate: new Date(createCouponDto.expiryDate),
    });

    return this.couponsRepository.save(coupon);
  }

  findAll() {
    return this.couponsRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string) {
    const coupon = await this.couponsRepository.findOne({ where: { id } });

    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.findOne(id);

    if (updateCouponDto.code) {
      await this.checkDuplicateCode(updateCouponDto.code, id);
      coupon.code = updateCouponDto.code.toUpperCase();
    }

    if (updateCouponDto.type) {
      coupon.type = updateCouponDto.type;
    }

    if (updateCouponDto.value !== undefined) {
      coupon.value = updateCouponDto.value;
    }

    if (updateCouponDto.minOrderAmount !== undefined) {
      coupon.minOrderAmount = updateCouponDto.minOrderAmount;
    }

    if (updateCouponDto.expiryDate) {
      coupon.expiryDate = new Date(updateCouponDto.expiryDate);
    }

    if (updateCouponDto.isActive !== undefined) {
      coupon.isActive = updateCouponDto.isActive;
    }

    await this.couponsRepository.save(coupon);
    return this.findOne(id);
  }

  async remove(id: string) {
    const coupon = await this.findOne(id);
    return this.couponsRepository.remove(coupon);
  }

  async apply(applyCouponDto: ApplyCouponDto) {
    const coupon = await this.getValidCoupon(
      applyCouponDto.code,
      applyCouponDto.orderAmount,
    );
    const discount = this.calculateDiscount(coupon, applyCouponDto.orderAmount);

    return {
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      minOrderAmount: Number(coupon.minOrderAmount),
      discount,
      orderAmount: applyCouponDto.orderAmount,
      totalAfterDiscount: Math.max(applyCouponDto.orderAmount - discount, 0),
    };
  }

  async getValidCoupon(code: string, orderAmount: number) {
    const coupon = await this.couponsRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    if (!coupon.isActive) {
      throw new BadRequestException("Coupon is inactive");
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      throw new BadRequestException("Coupon has expired");
    }

    if (orderAmount < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount is ${coupon.minOrderAmount}`,
      );
    }

    return coupon;
  }

  calculateDiscount(coupon: Coupon, orderAmount: number) {
    let discount = Number(coupon.value);

    if (coupon.type === CouponType.PERCENTAGE) {
      discount = (orderAmount * Number(coupon.value)) / 100;
    }

    return Number(Math.min(discount, orderAmount).toFixed(2));
  }

  private async checkDuplicateCode(code: string, currentCouponId?: string) {
    const coupon = await this.couponsRepository.findOne({
      where: { code: code.toUpperCase() },
    });

    if (coupon && coupon.id !== currentCouponId) {
      throw new BadRequestException("Coupon code already exists");
    }
  }
}
