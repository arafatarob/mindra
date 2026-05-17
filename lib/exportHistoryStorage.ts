import clientPromise from './mongodb';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';

const LOCAL_EXPORT_HISTORY_FILE = path.join(process.cwd(), 'storage', 'export-history.json');

async function getMongoClientSafe() {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  try {
    return await clientPromise;
  } catch (error) {
    console.warn('MongoDB unavailable for export history, falling back to local file.', error);
    return null;
  }
}

async function readExportHistoryFile(): Promise<ExportHistoryItem[]> {
  try {
    const data = await fs.readFile(LOCAL_EXPORT_HISTORY_FILE, 'utf8');
    const parsed = JSON.parse(data) as any[];
    return parsed.map((entry) => ({
      ...entry,
      createdAt: new Date(entry.createdAt),
    }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeExportHistoryFile(items: ExportHistoryItem[]) {
  await fs.mkdir(path.dirname(LOCAL_EXPORT_HISTORY_FILE), { recursive: true });
  await fs.writeFile(LOCAL_EXPORT_HISTORY_FILE, JSON.stringify(items, null, 2), 'utf8');
}

export interface ExportHistoryItem {
  _id?: ObjectId;
  id?: string;
  name: string;
  date: string;
  count: string;
  status: string;
  createdAt: Date;
}

function docToExportHistory(doc: any): ExportHistoryItem {
  return {
    id: String(doc._id ?? doc.id ?? ''),
    name: doc.name,
    date: doc.date,
    count: doc.count,
    status: doc.status,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
  };
}

export async function getExportHistory(): Promise<ExportHistoryItem[]> {
  try {
    const client = await getMongoClientSafe();
    if (!client) {
      const items = await readExportHistoryFile();
      return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const db = client.db();
    const items = await db
      .collection('export_history')
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return items.map(docToExportHistory);
  } catch (error) {
    console.warn('Failed to get export history:', error);
    return [];
  }
}

export async function saveExportHistoryItem(item: Omit<ExportHistoryItem, '_id' | 'id' | 'createdAt'>): Promise<ExportHistoryItem> {
  const now = new Date();
  const document = {
    ...item,
    createdAt: now,
  };

  const client = await getMongoClientSafe();
  if (!client) {
    const items = await readExportHistoryFile();
    const savedItem: ExportHistoryItem = {
      ...document,
      id: uuidv4(),
    } as ExportHistoryItem;
    items.unshift(savedItem);
    await writeExportHistoryFile(items);
    return savedItem;
  }

  const db = client.db();

  const result = await db.collection('export_history').insertOne(document);
  return docToExportHistory({ ...document, _id: result.insertedId });
}