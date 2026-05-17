import clientPromise from './mongodb';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';

const OUTREACH_COLLECTION = 'outreach_items';
const LOCAL_OUTREACH_FILE = path.join(process.cwd(), 'storage', 'outreach-items.json');

async function getMongoClientSafe() {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  try {
    return await clientPromise;
  } catch (error) {
    console.warn('MongoDB unavailable for outreach storage, falling back to local file.', error);
    return null;
  }
}

async function readOutreachFile(): Promise<OutreachItem[]> {
  try {
    const data = await fs.readFile(LOCAL_OUTREACH_FILE, 'utf8');
    return JSON.parse(data) as OutreachItem[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeOutreachFile(items: OutreachItem[]) {
  await fs.mkdir(path.dirname(LOCAL_OUTREACH_FILE), { recursive: true });
  await fs.writeFile(LOCAL_OUTREACH_FILE, JSON.stringify(items, null, 2), 'utf8');
}

export interface OutreachItem {
  _id?: ObjectId; // MongoDB's default ID
  id: string; // Keep existing 'id' for compatibility if needed
  to: string;
  subject: string;
  body: string;
  date: string; // ISO string
  status: 'sent' | 'scheduled' | 'draft' | 'completed';
  businessName: string;
  isFollowUp: boolean;
  createdAt: string; // For sorting and tracking
}

export async function getOutreachItems(): Promise<OutreachItem[]> {
  try {
    const client = await getMongoClientSafe();
    if (!client) {
      const items = await readOutreachFile();
      return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    const db = client.db();

    const items = await db
      .collection<OutreachItem>(OUTREACH_COLLECTION)
      .find({})
      .sort({ createdAt: -1 }) // Most recent first
      .limit(500) // Limit to a reasonable number
      .toArray();

    return items.map((item) => ({
      ...item,
      id: item._id?.toString() || item.id,
    }));
  } catch (error) {
    console.warn('Failed to get outreach items:', error);
    return [];
  }
}

export async function saveOutreachItem(item: Omit<OutreachItem, '_id' | 'createdAt'>): Promise<OutreachItem> {
  try {
    const newItem: OutreachItem = {
      ...item,
      id: item.id || uuidv4(),
      createdAt: new Date().toISOString(),
    } as OutreachItem;

    const client = await getMongoClientSafe();
    if (!client) {
      const items = await readOutreachFile();
      const existingIndex = items.findIndex((stored) => stored.id === newItem.id);
      if (existingIndex >= 0) {
        items[existingIndex] = newItem;
      } else {
        items.unshift(newItem);
      }
      await writeOutreachFile(items);
      return newItem;
    }

    const db = client.db();
    const result = await db.collection<OutreachItem>(OUTREACH_COLLECTION).findOneAndUpdate(
      { id: newItem.id },
      { $set: newItem },
      { upsert: true, returnDocument: 'after' },
    );

    const document = (result as any)?.value !== undefined ? (result as any).value : result;
    if (!document) {
      throw new Error('Failed to save or retrieve the outreach item.');
    }

    return {
      ...document,
      id: document.id || document._id?.toString() || newItem.id,
    };
  } catch (error) {
    console.error('Error saving outreach item:', error);
    throw error;
  }
}

export async function deleteOutreachItem(id: string): Promise<void> {
  try {
    const client = await getMongoClientSafe();
    if (!client) {
      const items = await readOutreachFile();
      const filtered = items.filter((stored) => stored.id !== id);
      await writeOutreachFile(filtered);
      return;
    }
    const db = client.db();

    // Delete by the custom 'id' field
    await db.collection<OutreachItem>(OUTREACH_COLLECTION).deleteOne({ id });
  } catch (error) {
    console.warn('Failed to delete outreach item from MongoDB:', error);
    throw error;
  }
}