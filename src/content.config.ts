import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      client: z.string(),
      tagline: z.string(),
      /** Longer 2-3 sentence body shown on the case card. Falls back to tagline if missing. */
      description: z.string().optional(),
      type: z.string(),
      tags: z.array(
        z.object({
          label: z.string(),
          /** Semantic color role — maps to .case-tag.{role} in global.css */
          color: z.enum(['primary', 'rare', 'highlight', 'light']).default('light'),
        }),
      ),
      result: z.string(),
      /** Up to 2 stat boxes shown on the case card body. If omitted, only `result` is used. */
      metrics: z
        .array(
          z.object({
            value: z.string(),
            label: z.string(),
          }),
        )
        .max(2)
        .optional(),
      hero: image(),
      gallery: z.array(image()).optional(),
      logo: image().optional(),
      order: z.number().default(0),
      featured: z.boolean().default(false),
      published: z.boolean().default(true),
    }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    eyebrow: z.string(),
    description: z.string(),
    icon: z.string(),
    bullets: z.array(z.string()),
    /** Semantic shadow role — maps to .service-card.shadow-{role} in global.css */
    shadow: z.enum(['primary', 'rare', 'highlight', 'dark']).default('dark'),
    order: z.number().default(0),
    featured: z.boolean().default(true),
  }),
});

const testimonials = defineCollection({
  loader: file('./src/content/data/testimonials.json'),
  schema: z.object({
    id: z.string(),
    quote: z.string(),
    name: z.string(),
    role: z.string(),
    rating: z.number().min(1).max(5).default(5),
    avatar: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const faq = defineCollection({
  loader: file('./src/content/data/faq.json'),
  schema: z.object({
    id: z.string(),
    question: z.string(),
    answer: z.string(),
    order: z.number().default(0),
  }),
});

export const collections = { cases, services, testimonials, faq };
