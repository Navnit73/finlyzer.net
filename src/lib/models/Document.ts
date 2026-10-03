import { getDatabase } from '../mongodb';
import { ExtractionResponse, StoredDocument, DocumentListResponse } from '@/types/ocr';
import { measureDbQuery } from '../db-logger';

export interface ExtractionDocument {
  _id?: string;
  id: string;
  user_email: string;
  document_type: string;
  filename: string;
  pages: number;
  status: 'success' | 'processing' | 'error' | 'queued';
  extraction: Record<string, unknown>;
  raw_text?: string;
  cleaned_text?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  is_paid?: boolean;
  is_guest?: boolean;
  guest_session_id?: string;
  payment_order_id?: string;
}

// In-memory fallback if MongoDB is not reachable
const memoryDocs = new Map<string, ExtractionDocument[]>();

export function getMemoryDocumentCount(userEmail: string): number {
  const normalizedEmail = (userEmail || 'guest').toLowerCase().trim();
  const list = memoryDocs.get(normalizedEmail) || [];
  return list.length;
}

export async function saveDocumentExtraction(
  userEmail: string,
  extraction: ExtractionResponse,
  filename: string,
  options?: {
    isGuest?: boolean;
    guestSessionId?: string;
    isPaid?: boolean;
  }
): Promise<ExtractionDocument> {
  const isGuest = options?.isGuest ?? (!userEmail || userEmail === 'guest');
  const normalizedEmail = isGuest ? 'guest' : userEmail.toLowerCase().trim();
  const pages = extraction.metadata?.pages || 1;
  const isPaid = options?.isPaid ?? (isGuest ? pages <= 10 : true);

  const docRecord: ExtractionDocument = {
    id: extraction.id,
    user_email: normalizedEmail,
    document_type: extraction.document_type || 'bank_statement',
    filename: filename || 'statement.pdf',
    pages,
    status: extraction.status || 'success',
    extraction: extraction.extraction || {},
    raw_text: extraction.raw_text,
    cleaned_text: extraction.cleaned_text,
    metadata: (extraction.metadata || {}) as unknown as Record<string, unknown>,
    created_at: new Date().toISOString(),
    is_paid: isPaid,
    is_guest: isGuest,
    guest_session_id: options?.guestSessionId,
  };

  return await measureDbQuery('saveDocumentExtraction', async () => {
    try {
      const db = await getDatabase();
      if (db) {
        const collection = db.collection<ExtractionDocument>('extractions');
        await collection.updateOne(
          { id: extraction.id },
          { $set: docRecord },
          { upsert: true }
        );
        return docRecord;
      }
    } catch (err) {
      console.warn('⚠️ MongoDB save fallback to memory:', (err as Error).message);
    }

    const list = memoryDocs.get(normalizedEmail) || [];
    list.unshift(docRecord);
    memoryDocs.set(normalizedEmail, list);
    return docRecord;
  }, { id: extraction.id, user_email: normalizedEmail, is_paid: isPaid, is_guest: isGuest });
}

export async function unlockGuestDocument(documentId: string, orderId: string): Promise<ExtractionDocument | null> {
  return await measureDbQuery('unlockGuestDocument', async () => {
    try {
      const db = await getDatabase();
      if (db) {
        const collection = db.collection<ExtractionDocument>('extractions');
        const result = await collection.findOneAndUpdate(
          { id: documentId },
          {
            $set: {
              is_paid: true,
              payment_order_id: orderId,
              updated_at: new Date().toISOString(),
            },
          },
          { returnDocument: 'after' }
        );
        if (result) return result as unknown as ExtractionDocument;
      }
    } catch (err) {
      console.warn('⚠️ MongoDB unlockGuestDocument fallback to memory:', (err as Error).message);
    }

    const guestList = memoryDocs.get('guest') || [];
    const doc = guestList.find(d => d.id === documentId);
    if (doc) {
      doc.is_paid = true;
      doc.payment_order_id = orderId;
      return doc;
    }
    return null;
  }, { id: documentId, order_id: orderId });
}

export async function getUserDocuments(
  userEmail: string,
  page = 1,
  pageSize = 20,
  documentType = 'all',
  search = ''
): Promise<DocumentListResponse> {
  const normalizedEmail = (userEmail || 'guest').toLowerCase().trim();
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(100, Math.max(1, pageSize));

  return await measureDbQuery('getUserDocuments', async () => {
    try {
      const db = await getDatabase();
      if (db) {
        const collection = db.collection<ExtractionDocument>('extractions');
        const query: Record<string, unknown> = { user_email: normalizedEmail };

        if (documentType && documentType !== 'all') {
          query.document_type = documentType;
        }

        if (search && search.trim()) {
          const sanitizedSearch = search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          query.$or = [
            { filename: { $regex: sanitizedSearch, $options: 'i' } },
            { id: { $regex: sanitizedSearch, $options: 'i' } },
          ];
        }

        // Run count and projected find concurrently
        const [total, docs] = await Promise.all([
          collection.countDocuments(query),
          collection
            .find(query, {
              projection: {
                raw_text: 0,
                cleaned_text: 0,
              },
            })
            .sort({ created_at: -1 })
            .skip((safePage - 1) * safePageSize)
            .limit(safePageSize)
            .toArray(),
        ]);

        const totalPages = Math.ceil(total / safePageSize) || 1;

        const items: StoredDocument[] = docs.map((d: Record<string, unknown>) => ({
          id: (d.id as string) || (d._id as { toString: () => string })?.toString() || '',
          document_type: (d.document_type as StoredDocument['document_type']) || 'bank_statement',
          status: (d.status as StoredDocument['status']) || 'success',
          created_at: (d.created_at as string) || (d.updated_at ? new Date(d.updated_at as string).toISOString() : new Date().toISOString()),
          filename: (d.filename as string) || (d.file_name as string) || 'statement.pdf',
          pages: (d.pages as number) || (d.total_pages as number) || 1,
          extraction: ((d.extraction || d.result || {}) as StoredDocument['extraction']),
          metadata: ((d.metadata || { pages: (d.pages as number) || 1 }) as unknown as StoredDocument['metadata']),
          is_paid: d.is_paid as boolean | undefined,
          is_guest: d.is_guest as boolean | undefined,
        }));

        return {
          total,
          page: safePage,
          page_size: safePageSize,
          total_pages: totalPages,
          items,
        };
      }
    } catch (err) {
      console.warn('⚠️ MongoDB list documents fallback to memory:', (err as Error).message);
    }

    // Memory fallback
    let list = memoryDocs.get(normalizedEmail) || [];
    if (documentType && documentType !== 'all') {
      list = list.filter(d => d.document_type === documentType);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(d => 
        d.filename.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        JSON.stringify(d.extraction).toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const totalPages = Math.ceil(total / safePageSize) || 1;
    const startIndex = (safePage - 1) * safePageSize;
    const items = list.slice(startIndex, startIndex + safePageSize).map(d => ({
      id: d.id,
      document_type: d.document_type as StoredDocument['document_type'],
      status: d.status,
      created_at: d.created_at,
      filename: d.filename,
      pages: d.pages,
      extraction: d.extraction as StoredDocument['extraction'],
      metadata: (d.metadata || { pages: d.pages }) as unknown as StoredDocument['metadata'],
      is_paid: d.is_paid,
      is_guest: d.is_guest,
    }));

    return {
      total,
      page: safePage,
      page_size: safePageSize,
      total_pages: totalPages,
      items,
    };
  }, { user_email: normalizedEmail, page: safePage, pageSize: safePageSize, documentType });
}

export async function getDocumentsByIds(ids: string[], userEmail?: string): Promise<StoredDocument[]> {
  if (!ids || ids.length === 0) return [];
  const normalizedEmail = userEmail && userEmail !== 'guest' ? userEmail.toLowerCase().trim() : undefined;
  const safeIds = ids.slice(0, 100); // Limit batch lookup to 100 IDs

  return await measureDbQuery('getDocumentsByIds', async () => {
    try {
      const db = await getDatabase();
      if (db) {
        const collection = db.collection<ExtractionDocument>('extractions');
        const query: Record<string, unknown> = {
          id: { $in: safeIds },
          // If authenticated user, allow their docs or guest docs; if guest, ONLY allow guest docs
          user_email: normalizedEmail ? { $in: [normalizedEmail, 'guest'] } : 'guest',
        };
        const docs = await collection
          .find(query, {
            projection: {
              raw_text: 0,
              cleaned_text: 0,
            },
          })
          .sort({ created_at: -1 })
          .toArray();

        return docs.map((d: Record<string, unknown>) => ({
          id: (d.id as string) || (d._id as { toString: () => string })?.toString() || '',
          document_type: (d.document_type as StoredDocument['document_type']) || 'bank_statement',
          status: (d.status as StoredDocument['status']) || 'success',
          created_at: (d.created_at as string) || (d.updated_at ? new Date(d.updated_at as string).toISOString() : new Date().toISOString()),
          filename: (d.filename as string) || (d.file_name as string) || 'statement.pdf',
          pages: (d.pages as number) || (d.total_pages as number) || 1,
          extraction: ((d.extraction || d.result || {}) as StoredDocument['extraction']),
          metadata: ((d.metadata || { pages: (d.pages as number) || 1 }) as unknown as StoredDocument['metadata']),
          is_paid: d.is_paid as boolean | undefined,
          is_guest: d.is_guest as boolean | undefined,
        }));
      }
    } catch (err) {
      console.warn('⚠️ MongoDB getDocumentsByIds fallback to memory:', (err as Error).message);
    }

    // Memory fallback
    const results: StoredDocument[] = [];
    const allowedKeys = normalizedEmail ? [normalizedEmail, 'guest'] : ['guest'];
    for (const key of allowedKeys) {
      const list = memoryDocs.get(key) || [];
      for (const d of list) {
        if (safeIds.includes(d.id) && !results.some(r => r.id === d.id)) {
          results.push({
            id: d.id,
            document_type: d.document_type as StoredDocument['document_type'],
            status: d.status,
            created_at: d.created_at,
            filename: d.filename,
            pages: d.pages,
            extraction: d.extraction as StoredDocument['extraction'],
            metadata: (d.metadata || { pages: d.pages }) as unknown as StoredDocument['metadata'],
            is_paid: d.is_paid,
            is_guest: d.is_guest,
          });
        }
      }
    }
    return results;
  }, { ids_count: safeIds.length, user_email: normalizedEmail });
}

export async function getDocumentById(id: string, userEmail?: string): Promise<ExtractionDocument | null> {
  const normalizedEmail = userEmail && userEmail !== 'guest' ? userEmail.toLowerCase().trim() : undefined;

  return await measureDbQuery('getDocumentById', async () => {
    try {
      const db = await getDatabase();
      if (db) {
        const collection = db.collection<ExtractionDocument>('extractions');
        // If user is authenticated, search their email or guest docs; if guest, ONLY search guest docs
        const query: Record<string, unknown> = {
          id,
          user_email: normalizedEmail ? { $in: [normalizedEmail, 'guest'] } : 'guest',
        };
        return await collection.findOne(query);
      }
    } catch (err) {
      console.warn('⚠️ MongoDB getDocumentById fallback to memory:', (err as Error).message);
    }

    if (normalizedEmail) {
      const userList = memoryDocs.get(normalizedEmail) || [];
      const foundUserDoc = userList.find(d => d.id === id);
      if (foundUserDoc) return foundUserDoc;
    }
    const guestList = memoryDocs.get('guest') || [];
    return guestList.find(d => d.id === id) || null;
  }, { id, user_email: normalizedEmail });
}

export async function deleteDocumentById(id: string, userEmail?: string): Promise<boolean> {
  const normalizedEmail = userEmail && userEmail !== 'guest' ? userEmail.toLowerCase().trim() : undefined;

  return await measureDbQuery('deleteDocumentById', async () => {
    try {
      const db = await getDatabase();
      if (db) {
        const collection = db.collection<ExtractionDocument>('extractions');
        const query: Record<string, unknown> = {
          id,
          user_email: normalizedEmail ? normalizedEmail : 'guest',
        };
        const result = await collection.deleteOne(query);
        return result.deletedCount > 0;
      }
    } catch (err) {
      console.warn('⚠️ MongoDB delete fallback to memory:', (err as Error).message);
    }

    const targetKey = normalizedEmail || 'guest';
    const list = memoryDocs.get(targetKey) || [];
    const filtered = list.filter(d => d.id !== id);
    memoryDocs.set(targetKey, filtered);
    return true;
  }, { id, user_email: normalizedEmail });
}

export async function deleteAllUserDocuments(userEmail: string): Promise<number> {
  const normalizedEmail = userEmail.toLowerCase().trim();

  return await measureDbQuery('deleteAllUserDocuments', async () => {
    try {
      const db = await getDatabase();
      if (db) {
        const collection = db.collection<ExtractionDocument>('extractions');
        const result = await collection.deleteMany({ user_email: normalizedEmail });
        return result.deletedCount;
      }
    } catch (err) {
      console.warn('⚠️ MongoDB deleteAllUserDocuments fallback to memory:', (err as Error).message);
    }

    const list = memoryDocs.get(normalizedEmail) || [];
    const count = list.length;
    memoryDocs.delete(normalizedEmail);
    return count;
  }, { user_email: normalizedEmail });
}
