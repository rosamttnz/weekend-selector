import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dateKey, getWeekends } from "@/lib/weekends";

type ResponseBody = {
  name: string;
  unavailable: string[];
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = (await request.json()) as Partial<ResponseBody>;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const unavailable = Array.isArray(body.unavailable)
      ? body.unavailable.filter((date): date is string => typeof date === "string")
      : [];

    if (!name || !Array.isArray(body.unavailable) || unavailable.length !== body.unavailable.length) {
      return NextResponse.json(
        { error: "Datos inválidos." },
        { status: 400 }
      );
    }

    const poll = await prisma.poll.findUnique({
      where: { slug },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Encuesta no encontrada." },
        { status: 404 }
      );
    }

    const valid = new Set(
      getWeekends(poll.startDate, poll.endDate).map(dateKey)
    );
    const uniqueUnavailable = [...new Set(unavailable)];

    if (uniqueUnavailable.some((d: string) => !valid.has(d))) {
      return NextResponse.json(
        { error: "Hay una fecha inválida." },
        { status: 400 }
      );
    }

    const response = await prisma.response.create({
      data: {
        pollId: poll.id,
        name,
        unavailable: {
          create: uniqueUnavailable.map((d) => ({
            weekend: new Date(`${d}T12:00:00Z`),
          })),
        },
      },
    });

    return NextResponse.json({
      id: response.id,
      editToken: response.editToken,
    });
  } catch (error) {
    console.error("Error creating response:", error);

    return NextResponse.json(
      { error: "No se pudo guardar la respuesta." },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const poll = await prisma.poll.findUnique({
      where: { slug },
      include: {
        responses: {
          include: { unavailable: true },
        },
      },
    });

    if (!poll) {
      return NextResponse.json(
        { error: "Encuesta no encontrada." },
        { status: 404 }
      );
    }

    const weekends = getWeekends(poll.startDate, poll.endDate);

    const results = weekends
      .map((date) => {
        const key = dateKey(date);

        const unavailableResponses = poll.responses.filter((response) =>
          response.unavailable.some((item) => dateKey(item.weekend) === key)
        );

        return {
          weekend: key,
          available: poll.responses.length - unavailableResponses.length,
          total: poll.responses.length,
          unavailable: unavailableResponses.map((response) => response.name),
        };
      })
      .sort((a, b) => b.available - a.available);

    return NextResponse.json({
      results,
      responses: poll.responses.map((response) => ({
        id: response.id,
        name: response.name,
        unavailable: response.unavailable.map((item) => dateKey(item.weekend)),
      })),
    });
  } catch (error) {
    console.error("Error fetching responses:", error);

    return NextResponse.json(
      { error: "No se pudieron obtener las respuestas." },
      { status: 500 }
    );
  }
}
