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
  const normalizedEmail = userEmail.toLowerCase().trim();
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

  const db = await getDatabase();
  if (!db) {
    const list = memoryDocs.get(normalizedEmail) || [];
    list.unshift(docRecord);
    memoryDocs.set(normalizedEmail, list);
    return docRecord;
  }

  const collection = db.collection<ExtractionDocument>('extractions');
  await collection.updateOne(
    { id: extraction.id },
    { $set: docRecord },
    { upsert: true }
  );

  return docRecord;
}

export async function getUserDocuments(
  userEmail: string,
  page = 1,
  pageSize = 20,
  documentType = 'all',
  search = ''
): Promise<DocumentListResponse> {
  const normalizedEmail = userEmail.toLowerCase().trim();
  const db = await getDatabase();

  if (!db) {
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

  const collection = db.collection<ExtractionDocument>('extractions');
  const query: Record<string, unknown> = { user_email: normalizedEmail };

  if (documentType && documentType !== 'all') {
    query.document_type = documentType;
  }

  if (search) {
    query.$or = [
      { filename: { $regex: search, $options: 'i' } },
      { id: { $regex: search, $options: 'i' } },
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

export async function getDocumentById(id: string, userEmail?: string): Promise<ExtractionDocument | null> {
  const db = await getDatabase();
  const normalizedEmail = userEmail ? userEmail.toLowerCase().trim() : undefined;

  if (!db) {
    if (normalizedEmail) {
      const list = memoryDocs.get(normalizedEmail) || [];
      return list.find(d => d.id === id) || null;
    }
    for (const list of memoryDocs.values()) {
      const found = list.find(d => d.id === id);
      if (found) return found;
    }
    return null;
  }

  const collection = db.collection<ExtractionDocument>('extractions');
  const query: Record<string, unknown> = { id };
  if (normalizedEmail) {
    query.user_email = normalizedEmail;
  }
  return collection.findOne(query);
}

export async function deleteDocumentById(id: string, userEmail: string): Promise<boolean> {
  const normalizedEmail = userEmail.toLowerCase().trim();
  const db = await getDatabase();
  if (!db) {
    const list = memoryDocs.get(normalizedEmail) || [];
    const filtered = list.filter(d => d.id !== id);
    memoryDocs.set(normalizedEmail, filtered);
    return true;
  }

  const collection = db.collection<ExtractionDocument>('extractions');
  const result = await collection.deleteOne({ id, user_email: normalizedEmail });
  return result.deletedCount > 0;
}
