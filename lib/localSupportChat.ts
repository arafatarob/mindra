import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';

export type ChatMessage = {
  id: string;
  sender: 'user' | 'ai' | 'admin';
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
};

export type SupportChatRecord = {
  _id?: ObjectId; // MongoDB's default ID
  userId: string;
  messages: ChatMessage[];
  status: 'ai' | 'admin_pending' | 'admin';
  updatedAt: string;
};

const SUPPORT_CHATS_COLLECTION = 'support_chats';
const LOCAL_SUPPORT_CHATS_FILE = path.join(process.cwd(), 'storage', 'support-chats.json');

async function getMongoClientSafe() {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  try {
    return await clientPromise;
  } catch (error) {
    console.warn('MongoDB unavailable for support chat, falling back to local file storage.', error);
    return null;
  }
}

async function readSupportChatsFile(): Promise<SupportChatRecord[]> {
  try {
    const data = await fs.readFile(LOCAL_SUPPORT_CHATS_FILE, 'utf8');
    return JSON.parse(data) as SupportChatRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeSupportChatsFile(chats: SupportChatRecord[]) {
  await fs.mkdir(path.dirname(LOCAL_SUPPORT_CHATS_FILE), { recursive: true });
  await fs.writeFile(LOCAL_SUPPORT_CHATS_FILE, JSON.stringify(chats, null, 2), 'utf8');
}

export async function getAllSupportChats(): Promise<SupportChatRecord[]> {
  try {
    const client = await getMongoClientSafe();
    if (!client) {
      return await readSupportChatsFile();
    }

    const db = client.db();
    const chats = await db.collection<SupportChatRecord>(SUPPORT_CHATS_COLLECTION).find({}).toArray();
    return chats;
  } catch (error) {
    console.error('Error getting all support chats from MongoDB:', error);
    return await readSupportChatsFile();
  }
}

export async function getSupportChatByUserId(userId: string): Promise<SupportChatRecord | null> {
  try {
    const client = await getMongoClientSafe();
    if (!client) {
      const chats = await readSupportChatsFile();
      return chats.find(chat => chat.userId === userId) || null;
    }

    const db = client.db();
    const chat = await db.collection<SupportChatRecord>(SUPPORT_CHATS_COLLECTION).findOne({ userId });
    return chat;
  } catch (error) {
    console.error('Error getting support chat by userId from MongoDB:', error);
    const chats = await readSupportChatsFile();
    return chats.find(chat => chat.userId === userId) || null;
  }
}

export async function upsertSupportChat(userId: string, messages: ChatMessage[], status: SupportChatRecord['status']): Promise<SupportChatRecord | null> {
  const updatedAt = new Date().toISOString();

  try {
    const client = await getMongoClientSafe();
    if (!client) {
      const chats = await readSupportChatsFile();
      const index = chats.findIndex(chat => chat.userId === userId);
      const updatedChat: SupportChatRecord = {
        userId,
        messages,
        status,
        updatedAt,
      };

      if (index >= 0) {
        chats[index] = { ...chats[index], ...updatedChat };
      } else {
        chats.push(updatedChat);
      }

      await writeSupportChatsFile(chats);
      return chats.find(chat => chat.userId === userId) || null;
    }

    const db = client.db();
    const result = await db.collection<SupportChatRecord>(SUPPORT_CHATS_COLLECTION).findOneAndUpdate(
      { userId: userId },
      { 
        $set: { messages, status, updatedAt }
      },
      { upsert: true, returnDocument: 'after' }
    );

    const document = (result as any)?.value !== undefined ? (result as any).value : result;
    return document ? (document as SupportChatRecord) : null;
  } catch (error) {
    console.error('Error upserting support chat to MongoDB:', error);
    throw error;
  }
}
