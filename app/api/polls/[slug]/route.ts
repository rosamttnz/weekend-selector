import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeekends, dateKey } from "@/lib/weekends";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const poll = await prisma.poll.findUnique({
      where: { slug },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Encuesta no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      title: poll.title,
      slug: poll.slug,
      weekends: getWeekends(
        poll.startDate,
        poll.endDate
      ).map(dateKey),
    });
  } catch (error) {
    console.error("Error fetching poll:", error);

    return NextResponse.json(
      { error: "No se pudo obtener la encuesta." },
      { status: 500 }
    );
  }
}
