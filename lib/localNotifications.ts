import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';

export type NotificationRecord = {
  _id?: ObjectId; // MongoDB's default ID
  id: string;
  username: string;
  message: string;
  from: string;
  createdAt: string;
  read?: boolean; // Added read status for persistence
};

const NOTIFICATIONS_COLLECTION = 'notifications';
const LOCAL_NOTIFICATIONS_FILE = path.join(process.cwd(), 'local-notifications.json');

function createNotificationId() {
  return new ObjectId().toString(); // Use ObjectId for new IDs
}

async function getMongoClientSafe() {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  try {
    return await clientPromise;
  } catch (error) {
    console.warn('MongoDB unavailable for notifications, falling back to local file storage.', error);
    return null;
  }
}

async function readNotificationsFile(): Promise<NotificationRecord[]> {
  try {
    const data = await fs.readFile(LOCAL_NOTIFICATIONS_FILE, 'utf8');
    return JSON.parse(data) as NotificationRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeNotificationsFile(notifications: NotificationRecord[]) {
  await fs.writeFile(LOCAL_NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf8');
}

export async function addNotification(notification: Omit<NotificationRecord, '_id' | 'id' | 'createdAt'>): Promise<NotificationRecord> {
  const now = new Date().toISOString();
  const newId = new ObjectId();
  const docToInsert: NotificationRecord = {
    _id: newId,
    id: newId.toString(),
    username: notification.username.toLowerCase(),
    message: notification.message,
    from: notification.from,
    createdAt: now,
    read: false,
  };

  try {
    const client = await getMongoClientSafe();
    if (!client) {
      const notifications = await readNotificationsFile();
      notifications.unshift(docToInsert);
      await writeNotificationsFile(notifications);
      return docToInsert;
    }

    const db = client.db();
    const result = await db.collection(NOTIFICATIONS_COLLECTION).insertOne(docToInsert);

    if (!result.acknowledged) {
      throw new Error('Database did not acknowledge the insert operation.');
    }

    return docToInsert;
  } catch (error) {
    console.error('Error adding notification to MongoDB:', error);
    throw error;
  }
}

export async function getNotificationsForUser(username: string): Promise<NotificationRecord[]> {
  try {
    const client = await getMongoClientSafe();
    if (!client) {
      const notifications = await readNotificationsFile();
      return notifications
        .filter(notification => notification.username === username.toLowerCase())
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    const db = client.db();
    const notifications = await db
      .collection<NotificationRecord>(NOTIFICATIONS_COLLECTION)
      .find({ username: username.toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();
    return notifications.map(notification => ({
      ...notification,
      id: notification._id?.toString() || notification.id,
    }));
  } catch (error) {
    console.warn('Failed to get notifications for user from MongoDB:', error);
    return [];
  }
}

export async function getAllNotifications(): Promise<NotificationRecord[]> {
  try {
    const client = await getMongoClientSafe();
    if (!client) {
      const notifications = await readNotificationsFile();
      return notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    const db = client.db();
    const notifications = await db
      .collection<NotificationRecord>(NOTIFICATIONS_COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return notifications.map(notification => ({
      ...notification,
      id: notification._id?.toString() || notification.id,
    }));
  } catch (error) {
    console.warn('Failed to get all notifications from MongoDB:', error);
    return [];
  }
}

export async function updateNotificationStatus(id: string, read: boolean): Promise<boolean> {
  try {
    const client = await getMongoClientSafe();
    if (!client) {
      const notifications = await readNotificationsFile();
      const index = notifications.findIndex(notification => notification.id === id);
      if (index < 0) {
        return false;
      }
      notifications[index].read = read;
      await writeNotificationsFile(notifications);
      return true;
    }
    const db = client.db();
    const result = await db.collection<NotificationRecord>(NOTIFICATIONS_COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      { $set: { read: read } }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error updating notification status in MongoDB:', error);
    return false;
  }
}