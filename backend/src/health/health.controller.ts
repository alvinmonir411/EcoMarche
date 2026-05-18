import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Check API health" })
  @ApiResponse({
    status: 200,
    description: "API is running successfully",
  })
  check() {
    return {
      status: "ok",
      message: "EcoMarche API is running",
    };
  }
}
