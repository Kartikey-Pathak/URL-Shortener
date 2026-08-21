import { eq } from 'drizzle-orm';
import db from '../db/index.js';
import { usersTable } from "../models/user.model.js";

export async function getUserByEmail(email) {
    const [exist] = await db.select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        password:usersTable.password,
        salt:usersTable.salt
    }).from(usersTable).where(eq(usersTable.email, email));

    return exist;
}

export async function createUser(name, email, hashpassword, salt) {
    const [user] = await db.insert(usersTable).values({
        name,
        email,
        password: hashpassword,
        salt

    }).returning({ id: usersTable.id });

    return user;
}