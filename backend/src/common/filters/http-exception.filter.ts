import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { errorResponse } from "../helpers/response.helper";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const message = this.getMessage(exceptionResponse);
    const error = this.getError(exceptionResponse, statusCode);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response
      .status(statusCode)
      .json(errorResponse(message, error, statusCode, request.originalUrl));
  }

  private getMessage(exceptionResponse: unknown): string | string[] {
    if (typeof exceptionResponse === "string") {
      return exceptionResponse;
    }

    if (
      exceptionResponse &&
      typeof exceptionResponse === "object" &&
      "message" in exceptionResponse
    ) {
      return (exceptionResponse as { message: string | string[] }).message;
    }

    return "Internal server error";
  }

  private getError(exceptionResponse: unknown, statusCode: number): string {
    if (
      exceptionResponse &&
      typeof exceptionResponse === "object" &&
      "error" in exceptionResponse
    ) {
      return String((exceptionResponse as { error: string }).error);
    }

    return HttpStatus[statusCode] || "Error";
  }
}
