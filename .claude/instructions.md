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

## Build Instructions
- **Do NOT run builds** - User handles builds manually (`bun run build`)
- You can read build output if user shares it, but don't initiate builds
