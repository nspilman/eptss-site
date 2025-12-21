# EPTSS Project Context

## Admin Panel
- Location: `/admin/projects`
- **Always check the admin UI before creating new configuration components**
- Project config is fully editable via the admin UI at `/admin/projects`
- Email templates (including signup confirmation) are editable in the "Communication" section

### Key Admin Components:
- `apps/web/app/admin/projects/ProjectConfigEditor.tsx` - Main admin interface
- `apps/web/app/admin/projects/components/editors/EmailConfigEditor.tsx` - Email customization UI
- `apps/web/app/admin/projects/components/editors/` - Other specialized editors

### Project Configuration
- Stored in: `projects.config` (jsonb column in database)
- Schema: `packages/project-config/src/schemas/projectConfig.ts`
- Service: `packages/project-config/src/services/projectConfigService.ts`
- API: `/api/admin/project-config`

#### Config Update Workflow (ALWAYS follow this order):
1. **Update Schema**: Add new field to appropriate schema in `packages/project-config/src/schemas/projectConfig.ts`
   - Use Zod schema with appropriate defaults
   - Add helpful comments explaining the field's purpose
2. **Update Database via API**: Use curl PATCH requests to update config, NOT migrations
   ```bash
   curl -X PATCH "http://localhost:3000/api/admin/project-config?slug=PROJECT_SLUG" \
     -H "Content-Type: application/json" \
     -d '{"sectionName": {"fieldName": value}}'
   ```
   - API performs deep merge, so only include fields you want to update
   - Available project slugs: `monthly-original`, `cover`
3. **Add Admin UI Control**: Ensure the new field is editable in the admin panel
   - Find appropriate editor in `apps/web/app/admin/projects/components/editors/`
   - Add form control following existing patterns (checkbox, input, select, etc.)
   - Include helpful tooltip explaining the field's purpose

#### Important Notes:
- **NEVER use migrations to update project config** - always use the API
- Migrations are for schema changes only, not data updates
- Config updates should always be done via curl to the `/api/admin/project-config` endpoint
- All new config fields must be editable through the admin UI at `/admin/projects`

## Build Instructions
- **Do NOT run builds** - User handles builds manually (`bun run build`)
- You can read build output if user shares it, but don't initiate builds

## UI Library Usage
- **Location**: `packages/ui/src/components/`
- **Exports**: All components are exported from `@eptss/ui`

### Component Guidelines (ALWAYS follow when writing JSX):
1. **Use UI Library Components**: When generating JSX, ALWAYS use components from `@eptss/ui` instead of raw HTML/Tailwind
   - Import from `@eptss/ui`: `import { Card, Text, Label, Button, etc. } from '@eptss/ui'`
   - Available components include:
     - Typography: `Display`, `Heading`, `Text`, `Label`, `Quote`
     - Layout: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
     - Primitives: `Button`, `Input`, `Badge`, `Skeleton`, `Separator`, etc.
     - Form fields: `FormBuilder`, `FormInputField`, `FormTextareaField`, `FormCheckboxField`, etc.
2. **When Components Don't Exist**: If you need a component that doesn't exist in the UI library:
   - First check if it can be composed from existing components
   - If truly necessary, create a new component in `packages/ui/src/components/ui/primitives/`
   - Follow existing patterns (use CVA for variants, TypeScript for props, etc.)
   - Export it from the appropriate index file
3. **Why This Matters**:
   - Ensures design system consistency
   - Components automatically inherit theme changes
   - Reduces duplication and maintenance burden

### Example:
```tsx
// ❌ Don't do this
<div className="p-4 bg-gray-800/50 rounded-lg">
  <h2 className="text-sm text-gray-400">Title</h2>
  <p className="text-lg text-gray-200">Content</p>
</div>

// ✅ Do this
<Card variant="glass">
  <CardContent>
    <Label size="sm" color="secondary">Title</Label>
    <Text size="lg" color="primary">Content</Text>
  </CardContent>
</Card>
```

## Database Migration Workflow
- **Schema Location**: `packages/data-access/src/db/schema.ts`
- **Migrations Location**: `packages/data-access/src/db/migrations/`
- **Config**: `packages/data-access/drizzle.config.ts`

### Migration Process (ALWAYS follow this order):
1. **Update Schema**: Modify `src/db/schema.ts` with table definitions
   - Use existing patterns (pgTable, bigint for IDs, timestamp for dates)
   - Export TypeScript types using `$inferSelect` and `$inferInsert`
2. **Generate Migration**: Run `bunx drizzle-kit generate` from `packages/data-access/`
   - This creates a new migration file in `src/db/migrations/`
   - Drizzle Kit will auto-detect schema changes
3. **Apply Migration**: Run `bunx drizzle-kit migrate`
   - This applies the migration to the database
   - Migration is tracked in the `__drizzle_migrations` table

### Important Notes:
- **NEVER manually create migration SQL files** - always use `bunx drizzle-kit generate`
- Run migration commands from the `packages/data-access/` directory
- IDs use `bigint` with `{ mode: "number" }` for consistency
- Foreign keys reference the projects table using fixed UUIDs when needed
