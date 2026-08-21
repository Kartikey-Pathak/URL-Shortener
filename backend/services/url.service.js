import { asc, eq } from 'drizzle-orm';
import db from '../db/index.js';
import { urlsTable } from "../models/index.js";

export async function createUrl(shortCode, targetURL, userId) {
    const [result] = await db.insert(urlsTable).values({
        shortCode,
        targetURL,
        userId
    }).returning({
        id: urlsTable.id,
        shortCode: urlsTable.shortCode,
        targetURL: urlsTable.targetURL
    });

    return result;
}