import clientPromise from './mongodb';
import { MongoClient, ObjectId } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';

export type LocalUser = {
  _id?: ObjectId; // MongoDB's default ID
  name: string;
  username: string;
  password: string;
  profileImage?: string;
  createdAt: string;
  role: 'admin' | 'user';
  plan: string; // e.g., 'Free', 'Starter', etc.
  planStartDate?: string;
  paymentMethod?: string;
  billingHistory?: Array<{
    invoice: string;
    date: string;
    amount: string;
    plan: string;
    period?: string;
  }>;
  leadsUsed?: number;
};

interface LocalResetToken {
  username: string;
  token: string;
  expiresAt: string;
}

const USERS_COLLECTION = 'local_users';
const TOKENS_COLLECTION = 'reset_tokens';
const LOCAL_USERS_FILE = path.join(process.cwd(), 'local-users.json');
const LOCAL_TOKENS_FILE = path.join(process.cwd(), 'local-reset-tokens.json');

async function readUsersFile(): Promise<LocalUser[]> {
  try {
    const data = await fs.readFile(LOCAL_USERS_FILE, 'utf8');
    return JSON.parse(data) as LocalUser[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsersFile(users: LocalUser[]) {
  await fs.writeFile(LOCAL_USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

async function readTokensFile(): Promise<LocalResetToken[]> {
  try {
    const data = await fs.readFile(LOCAL_TOKENS_FILE, 'utf8');
    return JSON.parse(data) as LocalResetToken[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeTokensFile(tokens: LocalResetToken[]) {
  await fs.writeFile(LOCAL_TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf8');
}

function regexUsernamePattern(username: string): RegExp {
  return new RegExp(`^${username.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, 'i');
}

async function getMongoClientSafe(): Promise<MongoClient | null> {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  try {
    return await clientPromise;
  } catch (error) {
    console.warn('MongoDB unavailable, falling back to local file auth.', error);
    return null;
  }
}

export async function findLocalUserByUsername(username: string) {
  const client = await getMongoClientSafe();
  if (!client) {
    const users = await readUsersFile();
    return users.find(user => regexUsernamePattern(username).test(user.username)) || null;
  }

  const db = client.db();
  return await db.collection<LocalUser>(USERS_COLLECTION).findOne({
    username: { 
      $regex: `^${username.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, 
      $options: 'i' 
    }
  });
}

export async function getAllLocalUsers() {
  const client = await getMongoClientSafe();
  if (!client) {
    return await readUsersFile();
  }

  const db = client.db();
  return await db.collection<LocalUser>(USERS_COLLECTION).find({}).toArray();
}

export async function saveLocalUser(user: LocalUser) {
  const client = await getMongoClientSafe();
  if (!client) {
    const users = await readUsersFile();
    users.push(user);
    await writeUsersFile(users);
    return;
  }

  const db = client.db();
  await db.collection<LocalUser>(USERS_COLLECTION).insertOne(user);
}

export async function updateLocalUserPassword(username: string, hashedPassword: string) {
  const client = await getMongoClientSafe();
  if (!client) {
    const users = await readUsersFile();
    const index = users.findIndex(user => regexUsernamePattern(username).test(user.username));
    if (index >= 0) {
      users[index].password = hashedPassword;
      await writeUsersFile(users);
    }
    return;
  }

  const db = client.db();
  const escapedUsername = username.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
  await db.collection<LocalUser>(USERS_COLLECTION).updateOne(
    { username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') } },
    { $set: { password: hashedPassword } }
  );
}

export async function updateLocalUserProfile(username: string, updates: Partial<Pick<LocalUser, 'name' | 'profileImage'>>) {
  const client = await getMongoClientSafe();
  if (!client) {
    const users = await readUsersFile();
    const index = users.findIndex(user => regexUsernamePattern(username).test(user.username));
    if (index < 0) {
      return null;
    }
    users[index] = { ...users[index], ...updates };
    await writeUsersFile(users);
    return users[index];
  }

  const db = client.db();
  const escapedUsername = username.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
  const result = await db.collection<LocalUser>(USERS_COLLECTION).findOneAndUpdate(
    { username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') } },
    { $set: updates },
    { returnDocument: 'after' }
  );
  const document = (result as any)?.value !== undefined ? (result as any).value : result;
  return document || null;
}

export async function updateLocalUser(username: string, updates: Partial<Omit<LocalUser, 'username' | 'password' | 'createdAt'>>) {
  const client = await getMongoClientSafe();
  if (!client) {
    const users = await readUsersFile();
    const index = users.findIndex(user => regexUsernamePattern(username).test(user.username));
    if (index < 0) {
      return null;
    }
    users[index] = { ...users[index], ...updates };
    await writeUsersFile(users);
    return users[index];
  }

  const db = client.db();
  const escapedUsername = username.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
  const result = await db.collection<LocalUser>(USERS_COLLECTION).findOneAndUpdate(
    { username: { $regex: new RegExp(`^${escapedUsername}$`, 'i') } },
    { $set: updates },
    { returnDocument: 'after' }
  );
  const document = (result as any)?.value !== undefined ? (result as any).value : result;
  return document || null;
}

export async function saveResetToken(tokenRecord: LocalResetToken) {
  const client = await getMongoClientSafe();
  if (!client) {
    const tokens = await readTokensFile();
    const index = tokens.findIndex(token => token.username === tokenRecord.username);
    if (index >= 0) {
      tokens[index] = tokenRecord;
    } else {
      tokens.push(tokenRecord);
    }
    await writeTokensFile(tokens);
    return;
  }

  const db = client.db();
  await db.collection(TOKENS_COLLECTION).updateOne(
    { username: tokenRecord.username },
    { $set: tokenRecord },
    { upsert: true }
  );
}

export async function findResetToken(token: string) {
  const client = await getMongoClientSafe();
  if (!client) {
    const tokens = await readTokensFile();
    return tokens.find(record => record.token === token) || null;
  }

  const db = client.db();
  return await db.collection<LocalResetToken>(TOKENS_COLLECTION).findOne({ token });
}

export async function deleteResetToken(token: string) {
  const client = await getMongoClientSafe();
  if (!client) {
    const tokens = await readTokensFile();
    const filtered = tokens.filter(record => record.token !== token);
    await writeTokensFile(filtered);
    return;
  }

  const db = client.db();
  await db.collection(TOKENS_COLLECTION).deleteOne({ token });
}