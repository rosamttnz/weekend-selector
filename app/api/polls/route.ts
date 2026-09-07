import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const startDate = new Date(`${body.startDate}T12:00:00Z`);
    const endDate = new Date(`${body.endDate}T12:00:00Z`);

    if (!title || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }

    const slug = `${slugify(title).slice(0, 40) || "encuesta"}-${crypto.randomUUID().slice(0, 6)}`;

    const poll = await prisma.poll.create({
      data: { title, slug, startDate, endDate }
    });

    return NextResponse.json({ slug: poll.slug });
  } catch {
    return NextResponse.json({ error: "No se pudo crear la encuesta." }, { status: 500 });
  }
}
