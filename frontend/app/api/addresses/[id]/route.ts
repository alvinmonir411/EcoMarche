import { z } from "zod";
import { fail, ok, readJson } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const addressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2).optional(),
  phone: z.string().min(5).optional(),
  division: z.string().min(2).optional(),
  district: z.string().min(2).optional(),
  upazila: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  addressLine: z.string().min(5).optional(),
  isDefault: z.boolean().optional(),
});

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthUserFromRequest(request);
  if (!user) return fail("Unauthorized", 401);

  const { id } = await context.params;
  const address = await getPrisma().address.findFirst({
    where: { id, userId: user.id },
  });

  if (!address) return fail("Address not found.", 404);

  return ok(address);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const { id } = await context.params;
    const input = addressSchema.parse(await readJson(request));
    const prisma = getPrisma();
    const existing = await prisma.address.findFirst({ where: { id, userId: user.id } });

    if (!existing) return fail("Address not found.", 404);

    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        ...(input.label !== undefined ? { label: input.label } : {}),
        ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.division !== undefined ? { division: input.division } : {}),
        ...(input.district !== undefined ? { district: input.district } : {}),
        ...(input.upazila !== undefined ? { upazila: input.upazila } : {}),
        ...(input.postalCode !== undefined ? { postalCode: input.postalCode } : {}),
        ...(input.addressLine !== undefined ? { addressLine: input.addressLine } : {}),
        ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
      },
    });

    return ok(address);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail("Please provide valid address data.", 422, error.issues);
    }

    console.error("Address update error", error);
    return fail("Failed to update address.", 500);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const { id } = await context.params;
    await getPrisma().address.deleteMany({
      where: { id, userId: user.id },
    });

    return ok({ id });
  } catch (error) {
    console.error("Address delete error", error);
    return fail("Failed to delete address.", 500);
  }
}
