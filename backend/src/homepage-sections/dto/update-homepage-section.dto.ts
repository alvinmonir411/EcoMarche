import { PartialType } from "@nestjs/mapped-types";
import { CreateHomepageSectionDto } from "./create-homepage-section.dto";

export class UpdateHomepageSectionDto extends PartialType(CreateHomepageSectionDto) {}
