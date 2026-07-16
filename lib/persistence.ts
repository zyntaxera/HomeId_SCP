import { get, set } from 'idb-keyval';

// Mock IndexedDB for autosave draft
const DRAFT_KEY = 'homeid_capel_draft';

export async function saveDraftCapel(draft: any): Promise<void> {
  try {
    await set(DRAFT_KEY, draft);
  } catch (e) {
    console.warn("Gagal menyimpan draft ke IndexedDB", e);
  }
}

export async function loadDraftCapel(): Promise<any | null> {
  try {
    return await get(DRAFT_KEY) || null;
  } catch (e) {
    console.warn("Gagal memuat draft dari IndexedDB", e);
    return null;
  }
}

export async function clearDraftCapel(): Promise<void> {
  try {
    await set(DRAFT_KEY, null);
  } catch (e) {
    console.warn("Gagal menghapus draft dari IndexedDB", e);
  }
}
