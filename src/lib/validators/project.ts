import { z } from "zod";

export const projectTypeSchema = z.enum([
  "WEBSITE", "WEB_APP", "MOBILE_APP", "DASHBOARD", "API", "INTERNAL_TOOL", "OTHER"
]);

export const projectStageSchema = z.enum(["IDEA", "IN_DESIGN", "SPECIFICATIONS_READY", "EXISTING_CODE"]);

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  type: projectTypeSchema,
  stage: projectStageSchema.default("IDEA")
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
