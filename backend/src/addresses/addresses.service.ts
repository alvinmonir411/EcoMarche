import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import { Address } from "./address.entity";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressesRepository: Repository<Address>,
  ) {}

  async create(userId: string, createAddressDto: CreateAddressDto) {
    if (createAddressDto.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    const address = this.addressesRepository.create({
      ...createAddressDto,
      user: { id: userId } as User,
    });

    return this.addressesRepository.save(address);
  }

  findMyAddresses(userId: string) {
    return this.addressesRepository.find({
      where: { user: { id: userId } },
      order: { isDefault: "DESC", createdAt: "DESC" },
    });
  }

  async findOneForUser(userId: string, id: string) {
    const address = await this.addressesRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException("Address not found");
    }

    return address;
  }

  async update(userId: string, id: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.findOneForUser(userId, id);

    if (updateAddressDto.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    Object.assign(address, updateAddressDto);
    return this.addressesRepository.save(address);
  }

  async remove(userId: string, id: string) {
    const address = await this.findOneForUser(userId, id);
    await this.addressesRepository.remove(address);

    return {
      deleted: true,
      id,
    };
  }

  async setDefault(userId: string, id: string) {
    const address = await this.findOneForUser(userId, id);

    await this.clearDefaultAddress(userId);

    address.isDefault = true;
    return this.addressesRepository.save(address);
  }

  private clearDefaultAddress(userId: string) {
    return this.addressesRepository.update(
      { user: { id: userId }, isDefault: true },
      { isDefault: false },
    );
  }
}
