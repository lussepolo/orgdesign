// V10-X1 (2026-07-27): ZIP packaging for the payroll export matrix batch
// download (spec sections 16-17). Fourteen entries: twelve detailed
// workbooks + Rio_Matriz_Folha_Resumo.xlsx + scenario-manifest.json.
import JSZip from "jszip";

export interface PayrollExportZipEntry {
  readonly filename: string;
  readonly bytes: Uint8Array;
}

export async function buildPayrollExportZip(
  entries: readonly PayrollExportZipEntry[],
): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const entry of entries) {
    zip.file(entry.filename, entry.bytes);
  }
  return zip.generateAsync({ type: "uint8array" });
}
