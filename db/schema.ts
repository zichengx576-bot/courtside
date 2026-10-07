import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
// Store only a hash of a random browser identifier, never account details or IPs.
export const visitors=sqliteTable('visitors',{idHash:text('id_hash').primaryKey().notNull()});
export const wearingExperiences=sqliteTable('wearing_experiences',{
 id:text('id').primaryKey().notNull(),
 authorHash:text('author_hash').notNull(),
 nickname:text('nickname').notNull(),
 shoe:text('shoe').notNull(),
 court:text('court').notNull(),
 rating:integer('rating').notNull(),
 content:text('content').notNull(),
 createdAt:integer('created_at').notNull(),
},table=>[index('experiences_created_idx').on(table.createdAt),index('experiences_author_idx').on(table.authorHash,table.createdAt)]);
