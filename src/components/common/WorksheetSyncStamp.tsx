import { Clock, Database } from "lucide-react";
import { DRE_WORKSHEET_SYNC_METADATA } from "../../config/worksheetSyncMetadata";
import { useLocale } from "../../i18n/useLocale";

export default function WorksheetSyncStamp() {
  const { locale } = useLocale();
  const isPt = locale === "pt-BR";
  const date = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${DRE_WORKSHEET_SYNC_METADATA.lastSyncedDate}T00:00:00Z`));

  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-amber-800 shadow-sm">
      <Database className="h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] font-black uppercase tracking-widest">
          <span>{isPt ? "Snapshot da planilha" : "Worksheet snapshot"}</span>
          <span className="inline-flex items-center gap-1 text-amber-700">
            <Clock className="h-3 w-3" />
            {isPt ? "Atualizado" : "Synced"} {date}
          </span>
        </div>
        <div className="mt-0.5 max-w-[34rem] whitespace-normal break-words text-[10px] font-semibold leading-snug text-amber-700">
          {DRE_WORKSHEET_SYNC_METADATA.sourceWorkbook} · {DRE_WORKSHEET_SYNC_METADATA.sourceSheet} ·{" "}
          {isPt ? "sem conexao live" : "no live connection"}
        </div>
      </div>
    </div>
  );
}
