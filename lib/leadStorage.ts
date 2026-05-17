import clientPromise from './mongodb';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';

const LEADS_COLLECTION = 'leads';
const LOCAL_LEADS_FILE = path.join(process.cwd(), 'storage', 'user-leads.json');

async function getMongoClientSafe() {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  try {
    return await clientPromise;
  } catch (error) {
    console.warn('MongoDB unavailable for leads, falling back to local file.', error);
    return null;
  }
}

async function readLeadsFile(): Promise<LeadItem[]> {
  try {
    const data = await fs.readFile(LOCAL_LEADS_FILE, 'utf8');
    return JSON.parse(data) as LeadItem[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeLeadsFile(leads: LeadItem[]) {
  await fs.mkdir(path.dirname(LOCAL_LEADS_FILE), { recursive: true });
  await fs.writeFile(LOCAL_LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
}

function matchesQuery(lead: LeadItem, query: string) {
  if (!query) return true;
  const lowerCaseQuery = query.toLowerCase();
  return [lead.title, lead.location, lead.details?.[0] || '']
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(lowerCaseQuery));
}

export interface LeadItem {
  _id?: ObjectId; // MongoDB's default ID
  id: string; // Keep existing 'id' for compatibility if needed, or remove if _id is sufficient
  username: string;
  title: string;
  location: string;
  site: string;
  email?: string;
  phone?: string;
  details: string[];
  platform: 'linkedin' | 'google' | 'instagram' | 'facebook' | 'web' | 'all';
  source: string;
  score: 'high' | 'medium' | 'low';
  verified: boolean;
  createdAt: string;
}

export async function findStoredLeads({ query, volume, username }: { query: string; volume: number; username?: string }): Promise<LeadItem[]> {
  try {
    const client = await getMongoClientSafe();
    if (!client) {
      const leads = await readLeadsFile();
      return leads
        .filter((lead) => !username || lead.username === username.toLowerCase())
        .filter((lead) => matchesQuery(lead, query))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, volume);
    }

    const db = client.db();
    const filter: any = {};
    if (username) {
      filter.username = username.toLowerCase();
    }
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      filter.$or = [
        { title: { $regex: lowerCaseQuery, $options: 'i' } },
        { location: { $regex: lowerCaseQuery, $options: 'i' } },
        { 'details.0': { $regex: lowerCaseQuery, $options: 'i' } },
      ];
    }

    const leads = await db
      .collection<LeadItem>(LEADS_COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(volume)
      .toArray();

    return leads.map((lead) => ({
      ...lead,
      id: lead._id?.toString() || lead.id,
    }));
  } catch (error) {
    console.error('Error finding stored leads:', error);
    return [];
  }
}

export async function saveStoredLead(leadData: Omit<LeadItem, 'id' | 'createdAt'>): Promise<LeadItem> {
  const normalizedUsername = leadData.username.toLowerCase();
  try {
    const client = await getMongoClientSafe();
    if (!client) {
      const leads = await readLeadsFile();
      const existingIndex = leads.findIndex(
        (lead) => lead.username === normalizedUsername && lead.title === leadData.title && lead.site === leadData.site,
      );

      const now = new Date().toISOString();
      const savedLead: LeadItem = {
        ...leadData,
        id: existingIndex >= 0 ? leads[existingIndex].id : uuidv4(),
        username: normalizedUsername,
        createdAt: existingIndex >= 0 ? leads[existingIndex].createdAt : now,
      };

      if (existingIndex >= 0) {
        leads[existingIndex] = savedLead;
      } else {
        leads.unshift(savedLead);
      }

      await writeLeadsFile(leads);
      return savedLead;
    }

    const db = client.db();
    const result = await db.collection<LeadItem>(LEADS_COLLECTION).findOneAndUpdate(
      { username: normalizedUsername, title: leadData.title, site: leadData.site },
      {
        $set: {
          ...leadData,
          username: normalizedUsername,
          score: leadData.score,
          verified: leadData.verified,
          source: leadData.source,
          details: leadData.details,
          email: leadData.email,
          phone: leadData.phone,
          location: leadData.location,
          platform: leadData.platform,
        },
        $setOnInsert: {
          createdAt: new Date().toISOString(),
          id: uuidv4(),
        },
      },
      { upsert: true, returnDocument: 'after' },
    );

    const document = (result as any)?.value !== undefined ? (result as any).value : result;
    if (!document) {
      throw new Error('Failed to save lead');
    }

    return {
      ...document,
      id: document.id || document._id?.toString() || uuidv4(),
      username: normalizedUsername,
    };
  } catch (error) {
    console.error('Error saving stored lead:', error);
    throw error;
  }
}

export async function deleteStoredLead(params: { id?: string; title?: string; username: string }): Promise<void> {
  try {
    const client = await getMongoClientSafe();
    const normalizedUsername = params.username.toLowerCase();
    if (!client) {
      const leads = await readLeadsFile();
      const filtered = leads.filter((lead) => {
        if (lead.username !== normalizedUsername) return true;
        if (params.id) return lead.id !== params.id;
        return lead.title !== params.title;
      });
      await writeLeadsFile(filtered);
      return;
    }

    const db = client.db();

    // Delete only leads owned by the current user.
    const filter: any = { username: normalizedUsername };

    if (params.id) {
      filter.id = params.id;
    } else if (params.title) {
      filter.title = params.title;
    } else {
      throw new Error('Either id or title is required to delete a lead.');
    }

    await db.collection<LeadItem>(LEADS_COLLECTION).deleteOne(filter);
  } catch (error) {
    console.error('Error deleting stored lead from MongoDB:', error);
    throw error;
  }
}