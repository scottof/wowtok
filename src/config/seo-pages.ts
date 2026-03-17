export interface SeoPageConfig {
  slug: string;
  type: "main" | "niche";
  themeId?: string;
  translationNamespace: string;
  priority: number;
  faqCount: number;
}

export const allSeoPages: SeoPageConfig[] = [
  // Main product pages
  {
    slug: "ai-tiktok-video-generator",
    type: "main",
    translationNamespace: "SeoAiVideoGenerator",
    priority: 0.9,
    faqCount: 8,
  },
  {
    slug: "ai-tiktok-content-generator",
    type: "main",
    translationNamespace: "SeoAiContentGenerator",
    priority: 0.9,
    faqCount: 8,
  },
  {
    slug: "ai-tiktok-video-tools",
    type: "main",
    translationNamespace: "SeoAiVideoTools",
    priority: 0.9,
    faqCount: 7,
  },
  {
    slug: "how-to-create-tiktok-videos-with-ai",
    type: "main",
    translationNamespace: "SeoHowToCreate",
    priority: 0.9,
    faqCount: 8,
  },
  // Theme niche pages
  {
    slug: "horror-tiktok-video-maker",
    type: "niche",
    themeId: "horror",
    translationNamespace: "SeoHorror",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "fantasy-tiktok-video-generator",
    type: "niche",
    themeId: "fantasy",
    translationNamespace: "SeoFantasy",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "comedy-tiktok-generator",
    type: "niche",
    themeId: "comedy",
    translationNamespace: "SeoComedy",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "scifi-tiktok-video-maker",
    type: "niche",
    themeId: "scifi",
    translationNamespace: "SeoSciFi",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "drama-tiktok-video-generator",
    type: "niche",
    themeId: "drama",
    translationNamespace: "SeoDrama",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "mystery-tiktok-video-maker",
    type: "niche",
    themeId: "mystery",
    translationNamespace: "SeoMystery",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "romance-tiktok-video-generator",
    type: "niche",
    themeId: "romance",
    translationNamespace: "SeoRomance",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "thriller-tiktok-video-maker",
    type: "niche",
    themeId: "thriller",
    translationNamespace: "SeoThriller",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "educational-tiktok-video-generator",
    type: "niche",
    themeId: "educational",
    translationNamespace: "SeoEducational",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "motivational-tiktok-video-maker",
    type: "niche",
    themeId: "motivational",
    translationNamespace: "SeoMotivational",
    priority: 0.7,
    faqCount: 6,
  },
  // Additional theme niche pages
  {
    slug: "cooking-tiktok-video-maker",
    type: "niche",
    themeId: "cooking",
    translationNamespace: "SeoCooking",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "fitness-tiktok-video-maker",
    type: "niche",
    themeId: "fitness",
    translationNamespace: "SeoFitness",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "travel-tiktok-video-maker",
    type: "niche",
    themeId: "travel",
    translationNamespace: "SeoTravel",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "science-tiktok-video-maker",
    type: "niche",
    themeId: "science",
    translationNamespace: "SeoScience",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "pet-tiktok-video-maker",
    type: "niche",
    themeId: "pet",
    translationNamespace: "SeoPet",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "true-crime-tiktok-video-maker",
    type: "niche",
    themeId: "true-crime",
    translationNamespace: "SeoTrueCrime",
    priority: 0.7,
    faqCount: 6,
  },
  // Extra non-theme niche pages
  {
    slug: "ai-voiceover-tiktok",
    type: "niche",
    translationNamespace: "SeoVoiceover",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "tiktok-video-maker-no-face",
    type: "niche",
    translationNamespace: "SeoNoFace",
    priority: 0.7,
    faqCount: 6,
  },
  {
    slug: "ai-tiktok-caption-generator",
    type: "niche",
    translationNamespace: "SeoCaptions",
    priority: 0.7,
    faqCount: 6,
  },
];

export function getSeoPageBySlug(slug: string): SeoPageConfig | undefined {
  return allSeoPages.find((p) => p.slug === slug);
}
