import { NextResponse } from "next/server";

import { getDashboardSession } from "@/lib/auth";
import {
  buildOperationsReportCsv,
  buildReportFileName,
  loadOperationsReportSnapshot,
  parseReportFilters,
} from "@/lib/services";

export async function GET(request: Request) {
  const session = await getDashboardSession();

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const filters = parseReportFilters({
    period: url.searchParams.get("period") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });

  const { report, range } = await loadOperationsReportSnapshot({
    session: {
      role: session.role,
      email: session.email,
    },
    filters,
  });

  const csv = buildOperationsReportCsv(report);
  const filename = buildReportFileName(range, "csv");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
