import {
  CURRENT_STORAGE_VERSION,
  ExportDataPayload,
  ExportDataSchema,
  StoredAppData,
} from "./schema";
import { getStoredData, saveStoredData } from "./local-storage";

export interface ImportResult {
  success: boolean;
  message: string;
  importedData?: StoredAppData;
  error?: string;
}

/**
 * Creates export payload object
 */
export function createExportPayload(): ExportDataPayload {
  const currentData = getStoredData();
  return {
    app: "wird-quran",
    exportedAt: new Date().toISOString(),
    schemaVersion: CURRENT_STORAGE_VERSION,
    data: currentData,
  };
}

/**
 * Initiates browser download of JSON export file
 */
export function downloadBackupFile(): void {
  if (typeof window === "undefined") return;
  const payload = createExportPayload();
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `wird-backup-${dateStr}.json`;

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validates and restores imported JSON string
 */
export function importBackupFromJson(jsonString: string): ImportResult {
  try {
    const raw = JSON.parse(jsonString);

    // Support both wrapper format and direct data format
    if (raw && raw.app === "wird-quran" && raw.data) {
      const parsedExport = ExportDataSchema.safeParse(raw);
      if (!parsedExport.success) {
        return {
          success: false,
          message: "ملف النسخ الاحتياطي غير صالح أو يحتوي على بيانات غير متوافقة",
          error: parsedExport.error.message,
        };
      }
      saveStoredData(parsedExport.data.data);
      return {
        success: true,
        message: "تم استرجاع بياناتك بنجاح",
        importedData: parsedExport.data.data,
      };
    } else {
      // Direct raw data check
      const parsedData = ExportDataSchema.shape.data.safeParse(raw);
      if (!parsedData.success) {
        return {
          success: false,
          message: "هيكل البيانات داخل الملف غير مطابق لنموذج وِرد المعتمد",
          error: parsedData.error.message,
        };
      }
      saveStoredData(parsedData.data);
      return {
        success: true,
        message: "تم استرجاع بياناتك بنجاح",
        importedData: parsedData.data,
      };
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: "تعذر قراءة الملف، تأكد من اختيار ملف JSON سليم",
      error: errMsg,
    };
  }
}
