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
    const flat = error.flatten();
    const firstFieldMsg = Object.values(flat.fieldErrors)
      .flat()
      .find((m): m is string => typeof m === "string");
    const firstFormMsg = flat.formErrors[0];
    const message =
      firstFieldMsg ?? firstFormMsg ?? error.issues[0]?.message ?? "Geçersiz giriş";
    return new AppError(message, 400, flat);
  }

  if (error instanceof Error && error.message.trim()) {
    console.error("[jsonError]", error);
    return new AppError(error.message, 500);
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
