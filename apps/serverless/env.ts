import { z } from 'zod';

export const envSch = z.object({
  AWS_REGION: z.string().min(1).default('ap-southeast-1'),
  AWS_PROFILE: z.string().min(1).optional(),
});

export const env = envSch.parse(process.env);
export default env;
