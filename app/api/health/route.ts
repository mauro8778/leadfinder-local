import { NextResponse } from "next/server";
import { getDb, getStorageMode } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    await db.execute("SELECT 1 as ping");

    return NextResponse.json({
      ok: true,
      service: "leadfinder-local",
      timestamp: new Date().toISOString(),
      db: "ok",
      storage: getStorageMode(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        service: "leadfinder-local",
        timestamp: new Date().toISOString(),
        db: "error",
        error: errorMessage,
      },
      { status: 503 }
    );
  }
}
