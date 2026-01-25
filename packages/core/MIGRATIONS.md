# Database Migrations with Drizzle Kit

This document explains how to create and manage database migrations for the EPTSS project using Drizzle Kit.

## Overview

We use **Drizzle ORM** with **Drizzle Kit** to manage database schema changes. All schema definitions are in `src/db/schema.ts`, and migrations are automatically generated based on changes to this file.

## Migration Workflow

### 1. Update Schema
Make your changes to `src/db/schema.ts`. This is the single source of truth for the database schema.

**Example:** Adding a new table
```typescript
export const notification_emails_sent = pgTable("notification_emails_sent", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  userId: uuid("user_id").references(() => users.userid).notNull(),
  emailType: notificationEmailTypeEnum("email_type").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  notificationIds: text("notification_ids").array(),
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
});
```

### 2. Generate Migration
Run the Drizzle Kit generate command:

```bash
cd packages/data-access
npm run drizzle:generate
```

This command:
- Compares `schema.ts` with the existing database schema
- Creates a new migration file in `src/db/migrations/`
- Names it with a timestamp and descriptive slug
- Generates both `.sql` and snapshot files

### 3. Review Migration
**Important:** Always review the generated migration file before applying it!

Check the generated SQL in `src/db/migrations/XXXX_*.sql`:
- Verify the SQL is correct
- Ensure no data will be lost
- Check for proper indexes and constraints

### 4. Apply Migration
Apply the migration to your database:

```bash
npm run drizzle:migrate
```

Or use the Drizzle Kit migrate command:
```bash
npx drizzle-kit migrate
```

**For production:** Follow your deployment process (usually applied automatically via CI/CD)

### 5. Commit Migration Files
Commit both the schema changes and generated migration files:
```bash
git add src/db/schema.ts
git add src/db/migrations/
git commit -m "feat: add notification emails tracking table"
```

## Common Scenarios

### Adding a New Table
1. Define table in `schema.ts`
2. Run `npm run drizzle:generate`
3. Review generated SQL
4. Run `npm run drizzle:migrate`

### Adding a Column
1. Add field to existing table definition in `schema.ts`
2. Run `npm run drizzle:generate`
3. Review generated `ALTER TABLE` statement
4. Run `npm run drizzle:migrate`

### Adding an Enum
1. Define enum using `pgEnum()` in `schema.ts`
2. Use enum in table column definition
3. Run `npm run drizzle:generate`
4. Run `npm run drizzle:migrate`

**Example:**
```typescript
export const notificationEmailTypeEnum = pgEnum("notification_email_type", [
  "new_notifications",
  "outstanding_reminder"
]);

export const myTable = pgTable("my_table", {
  type: notificationEmailTypeEnum("type").notNull(),
});
```

### Modifying an Existing Column
1. Update the column definition in `schema.ts`
2. Run `npm run drizzle:generate`
3. **Carefully review** the generated migration
4. Consider data migration needs
5. Run `npm run drizzle:migrate`

## Important Notes

### DO NOT:
- ❌ Manually create migration files
- ❌ Edit existing migration files after they've been applied
- ❌ Delete migration files
- ❌ Skip reviewing generated migrations

### DO:
- ✅ Always review generated SQL before applying
- ✅ Test migrations on a development database first
- ✅ Commit migration files with schema changes
- ✅ Use descriptive commit messages
- ✅ Back up production data before major migrations

## Rollback Strategy

If a migration causes issues:

1. **Development:** Revert schema changes and regenerate
2. **Production:** Write a new migration to reverse changes (do not delete existing migrations)

Example rollback migration:
```sql
-- Reverting: Added notification_emails_sent table
DROP TABLE IF EXISTS notification_emails_sent;
```

## Drizzle Kit Commands Reference

```bash
# Generate migration from schema changes
npm run drizzle:generate
# or
npx drizzle-kit generate

# Apply migration to database
npm run drizzle:migrate
# or
npx drizzle-kit migrate

# Open Drizzle Studio (database GUI)
npx drizzle-kit studio

# Introspect existing database
npx drizzle-kit introspect

# Push schema directly (skip migrations - use with caution)
npx drizzle-kit push
```

## Configuration

Drizzle Kit configuration is in `drizzle.config.ts` at the project root.

## Example: Notification Email System Migration

For the notification email system, the workflow was:

1. **Updated schema.ts:**
   - Added `notificationEmailTypeEnum`
   - Added `notification_emails_sent` table
   - Added `notification_emails_enabled` to `user_privacy_settings`

2. **Generated migration:**
   ```bash
   cd packages/data-access
   npm run drizzle:generate
   ```

3. **Reviewed generated SQL** - verified enum creation, table structure, and foreign keys

4. **Applied to development database:**
   ```bash
   npm run drizzle:migrate
   ```

5. **Committed changes:**
   ```bash
   git add src/db/schema.ts src/db/migrations/
   git commit -m "feat: add notification email tracking and user preferences"
   ```

## Troubleshooting

### "No schema changes detected"
- Ensure you saved `schema.ts`
- Check that your changes are valid TypeScript
- Verify Drizzle Kit can find your schema file

### Migration fails to apply
- Check database connection
- Verify you have proper permissions
- Look for conflicts with existing data
- Review the error message in detail

### Need to modify an applied migration
- **Never edit applied migrations**
- Create a new migration to make additional changes
- Use `npm run drizzle:generate` after updating schema

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
