
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const tables = await db.raw("SHOW TABLES");
        const tableNames = tables[0].map(t => Object.values(t)[0]);

        const schemas = {};
        for (const table of tableNames) {
            const columns = await db.raw(`SHOW COLUMNS FROM ${table}`);
            schemas[table] = columns[0].map(c => c.Field);
        }

        return NextResponse.json({ tables: tableNames, schemas });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
