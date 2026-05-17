import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';

export type ActivityRecord = {
  _id?: ObjectId;
  id: string;
  user: string;
  action: string;
  details?: any;
  createdAt: string;
};

const LOCAL_ACTIVITIES_FILE = path.join(process.cwd(), 'local-activities.json');
const ACTIVITIES_COLLECTION = 'activities';

async function readActivitiesFile(): Promise<ActivityRecord[]> {
  try {
    const data = await fs.readFile(LOCAL_ACTIVITIES_FILE, 'utf8');
    return JSON.parse(data) as ActivityRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function writeActivitiesFile(items: ActivityRecord[]) {
  await fs.writeFile(LOCAL_ACTIVITIES_FILE, JSON.stringify(items, null, 2), 'utf8');
}

async function getMongoClientSafe() {
  if (!process.env.MONGODB_URI) return null;
  try {
    return await clientPromise;
  } catch (error) {
    console.warn('MongoDB unavailable for activities, falling back to file storage.', error);
    return null;
  }
}

export async function addActivity(activity: Omit<ActivityRecord, '_id' | 'id' | 'createdAt'>): Promise<ActivityRecord> {
  const now = new Date().toISOString();
  const newId = new ObjectId();
  const doc: ActivityRecord = {
    _id: newId,
    id: newId.toString(),
    user: activity.user || 'anonymous',
    action: activity.action,
    details: activity.details || {},
    createdAt: now,
  };

  try {
    const client = await getMongoClientSafe();
    if (!client) {
      const items = await readActivitiesFile();
      items.unshift(doc);
      await writeActivitiesFile(items);
      return doc;
    }
    const db = client.db();
    const result = await db.collection(ACTIVITIES_COLLECTION).insertOne(doc as any);
    if (!result.acknowledged) throw new Error('Insert not acknowledged');
    return doc;
  } catch (error) {
    console.error('Failed to add activity:', error);
    throw error;
  }
}

export async function getRecentActivities(limit = 50): Promise<ActivityRecord[]> {
  try {
    const client = await getMongoClientSafe();
    if (!client) {
      const items = await readActivitiesFile();
      return items.slice(0, limit);
    }
    const db = client.db();
    const rows = await db.collection<ActivityRecord>(ACTIVITIES_COLLECTION).find({}).sort({ createdAt: -1 }).limit(limit).toArray();
    return rows.map(r => ({ ...r, id: r._id?.toString() || r.id }));
  } catch (error) {
    console.warn('Failed to read activities:', error);
    return [];
  }
}
