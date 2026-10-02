import { getDatabase } from '../mongodb';
import { ExtractionResponse, StoredDocument, DocumentListResponse } from '@/types/ocr';

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
}

// In-memory fallback if MongoDB is not reachable
const memoryDocs = new Map<string, ExtractionDocument[]>();

export async function saveDocumentExtraction(
  userEmail: string,
  extraction: ExtractionResponse,
  filename: string
): Promise<ExtractionDocument> {
  const normalizedEmail = (userEmail || 'guest').toLowerCase().trim();
  const docRecord: ExtractionDocument = {
    id: extraction.id,
    user_email: normalizedEmail,
    document_type: extraction.document_type || 'bank_statement',
    filename: filename || 'statement.pdf',
    pages: extraction.metadata?.pages || 1,
    status: extraction.status || 'success',
    extraction: extraction.extraction || {},
    raw_text: extraction.raw_text,
    cleaned_text: extraction.cleaned_text,
    metadata: (extraction.metadata || {}) as unknown as Record<string, unknown>,
    created_at: new Date().toISOString(),
  };

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
}

export async function getUserDocuments(
  userEmail: string,
  page = 1,
  pageSize = 20,
  documentType = 'all',
  search = ''
): Promise<DocumentListResponse> {
  const normalizedEmail = (userEmail || 'guest').toLowerCase().trim();

  try {
    const db = await getDatabase();
    if (db) {
      const collection = db.collection<ExtractionDocument>('extractions');
      const query: Record<string, unknown> = { user_email: normalizedEmail };

      if (documentType && documentType !== 'all') {
        query.document_type = documentType;
      }

      if (search) {
        const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
          { filename: { $regex: sanitizedSearch, $options: 'i' } },
          { id: { $regex: sanitizedSearch, $options: 'i' } },
        ];
      }

      const total = await collection.countDocuments(query);
      const totalPages = Math.ceil(total / pageSize) || 1;
      const docs = await collection
        .find(query)
        .sort({ created_at: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();

      const items: StoredDocument[] = docs.map(d => ({
        id: d.id,
        document_type: d.document_type as StoredDocument['document_type'],
        status: d.status,
        created_at: d.created_at,
        filename: d.filename,
        pages: d.pages,
        extraction: d.extraction as StoredDocument['extraction'],
        metadata: (d.metadata || { pages: d.pages }) as unknown as StoredDocument['metadata'],
      }));

      return {
        total,
        page,
        page_size: pageSize,
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
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(d => 
      d.filename.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      JSON.stringify(d.extraction).toLowerCase().includes(q)
    );
  }

  const total = list.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const items = list.slice(startIndex, startIndex + pageSize).map(d => ({
    id: d.id,
    document_type: d.document_type as StoredDocument['document_type'],
    status: d.status,
    created_at: d.created_at,
    filename: d.filename,
    pages: d.pages,
    extraction: d.extraction as StoredDocument['extraction'],
    metadata: (d.metadata || { pages: d.pages }) as unknown as StoredDocument['metadata'],
  }));

  return {
    total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
    items,
  };
}

export async function getDocumentsByIds(ids: string[], userEmail?: string): Promise<StoredDocument[]> {
  if (!ids || ids.length === 0) return [];
  const normalizedEmail = userEmail && userEmail !== 'guest' ? userEmail.toLowerCase().trim() : undefined;

  try {
    const db = await getDatabase();
    if (db) {
      const collection = db.collection<ExtractionDocument>('extractions');
      const query: Record<string, unknown> = {
        id: { $in: ids },
        // If authenticated user, allow their docs or guest docs; if guest, ONLY allow guest docs
        user_email: normalizedEmail ? { $in: [normalizedEmail, 'guest'] } : 'guest',
      };
      const docs = await collection
        .find(query)
        .sort({ created_at: -1 })
        .toArray();

      return docs.map(d => ({
        id: d.id,
        document_type: d.document_type as StoredDocument['document_type'],
        status: d.status,
        created_at: d.created_at,
        filename: d.filename,
        pages: d.pages,
        extraction: d.extraction as StoredDocument['extraction'],
        metadata: (d.metadata || { pages: d.pages }) as unknown as StoredDocument['metadata'],
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
      if (ids.includes(d.id) && !results.some(r => r.id === d.id)) {
        results.push({
          id: d.id,
          document_type: d.document_type as StoredDocument['document_type'],
          status: d.status,
          created_at: d.created_at,
          filename: d.filename,
          pages: d.pages,
          extraction: d.extraction as StoredDocument['extraction'],
          metadata: (d.metadata || { pages: d.pages }) as unknown as StoredDocument['metadata'],
        });
      }
    }
  }
  return results;
}

export async function getDocumentById(id: string, userEmail?: string): Promise<ExtractionDocument | null> {
  const normalizedEmail = userEmail && userEmail !== 'guest' ? userEmail.toLowerCase().trim() : undefined;

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
}

export async function deleteDocumentById(id: string, userEmail?: string): Promise<boolean> {
  const normalizedEmail = userEmail && userEmail !== 'guest' ? userEmail.toLowerCase().trim() : undefined;

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
}

export async function deleteAllUserDocuments(userEmail: string): Promise<number> {
  const normalizedEmail = userEmail.toLowerCase().trim();
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
}
