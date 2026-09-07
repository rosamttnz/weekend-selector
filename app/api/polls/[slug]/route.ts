import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeekends } from "@/lib/weekends";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const poll = await prisma.poll.findUnique({ where: { slug } });

  if (!poll) return NextResponse.json({ error: "Encuesta no encontrada." }, { status: 404 });

  return NextResponse.json({
    title: poll.title,
    slug: poll.slug,
    startDate: poll.startDate,
    endDate: poll.endDate,
    weekends: getWeekends(poll.startDate, poll.endDate)
  });
}
