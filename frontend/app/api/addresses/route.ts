import { z } from "zod";
import { created, fail, ok, readJson } from "@/lib/api-utils";
import { getAuthUserFromRequest } from "@/lib/auth-server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

const addressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2),
  phone: z.string().min(5),
  division: z.string().min(2),
  district: z.string().min(2),
  upazila: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  addressLine: z.string().min(5),
  isDefault: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const addresses = await getPrisma().address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return ok(addresses);
  } catch (error) {
    console.error("Addresses load error", error);
    return fail("Failed to load addresses.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return fail("Unauthorized", 401);

    const input = addressSchema.parse(await readJson(request));
    const prisma = getPrisma();

    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: input.label || "Home",
        fullName: input.fullName,
        phone: input.phone,
        division: input.division,
        district: input.district,
        upazila: input.upazila ?? undefined,
        postalCode: input.postalCode ?? undefined,
        addressLine: input.addressLine,
        isDefault: input.isDefault ?? false,
      },
    });

    return created(address);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail("Please provide valid address data.", 422, error.issues);
    }

    console.error("Address create error", error);
    return fail("Failed to create address.", 500);
  }
}
