import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, isAppError } from "./errors";

export const jsonOk = <T>(data: T, status = 200) => {
  return NextResponse.json(data, { status });
};

export const toAppError = (error: unknown): AppError => {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof ZodError) {
    return new AppError("Validation failed", 400, error.flatten());
  }

  return new AppError("Internal server error", 500);
};

export const jsonError = (error: unknown) => {
  const appError = toAppError(error);

  return NextResponse.json(
    {
      error: appError.message,
      details: appError.details ?? null,
    },
    { status: appError.statusCode }
  );
};
