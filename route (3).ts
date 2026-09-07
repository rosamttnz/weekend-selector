import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeekends, dateKey } from "@/lib/weekends";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const response = await prisma.response.findUnique({
    where: { editToken: token },
    include: { poll: true, unavailable: true }
  });

  if (!response) return NextResponse.json({ error: "Respuesta no encontrada." }, { status: 404 });

  return NextResponse.json({
    title: response.poll.title,
    slug: response.poll.slug,
    name: response.name,
    weekends: getWeekends(response.poll.startDate, response.poll.endDate),
    unavailable: response.unavailable.map((u) => dateKey(u.weekend))
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const unavailable = Array.isArray(body.unavailable) ? body.unavailable.map(String) : [];

  const response = await prisma.response.findUnique({
    where: { editToken: token },
    include: { poll: true }
  });

  if (!response) return NextResponse.json({ error: "Respuesta no encontrada." }, { status: 404 });
  if (!name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });

  const valid = new Set(getWeekends(response.poll.startDate, response.poll.endDate).map(dateKey));
  if (unavailable.some((d) => !valid.has(d))) {
    return NextResponse.json({ error: "Hay una fecha inválida." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.unavailable.deleteMany({ where: { responseId: response.id } }),
    prisma.response.update({
      where: { id: response.id },
      data: {
        name,
        unavailable: {
          create: [...new Set(unavailable)].map((d) => ({ weekend: new Date(`${d}T12:00:00Z`) }))
        }
      }
    })
  ]);

  return NextResponse.json({ ok: true, slug: response.poll.slug });
}
