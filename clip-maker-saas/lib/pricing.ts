export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  clipsLimit: number | null;
  cta: string;
  href: string;
  popular: boolean;
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out ClipMaker AI",
    features: [
      { text: "15 clips per month", included: true },
      { text: "Gemini AI clip detection", included: true },
      { text: "TikTok & Instagram export", included: true },
      { text: "720p export quality", included: true },
      { text: "Basic subtitles", included: true },
      { text: "Standard export", included: true },
      { text: "Community support", included: true },
      { text: "Fancy subtitles (MrBeast, themes)", included: false },
      { text: "Custom subtitle colors & fonts", included: false },
      { text: "Viral title generation", included: false },
      { text: "SEO title generation", included: false },
      { text: "Hashtag generation", included: false },
      { text: "Keyword generation", included: false },
      { text: "Faster processing", included: false },
      { text: "4K export quality", included: false },
      { text: "Priority processing", included: false },
    ],
    clipsLimit: 15,
    cta: "Get Started",
    href: "/signup",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For creators who need more power",
    features: [
      { text: "100 clips per month", included: true },
      { text: "Gemini AI clip detection", included: true },
      { text: "All platform exports", included: true },
      { text: "4K export quality", included: true },
      { text: "Basic subtitles", included: true },
      { text: "Fancy subtitles (MrBeast, themes)", included: true },
      { text: "Custom subtitle colors & fonts", included: true },
      { text: "Word-by-word animation", included: true },
      { text: "Keyword highlighting", included: true },
      { text: "Subtitle position control", included: true },
      { text: "Viral title generation", included: true },
      { text: "SEO title generation", included: true },
      { text: "Hashtag generation", included: true },
      { text: "Keyword generation", included: true },
      { text: "Faster processing", included: true },
      { text: "Priority processing", included: true },
      { text: "Email support", included: true },
    ],
    clipsLimit: 100,
    cta: "Upgrade to Pro",
    href: "/billing?upgrade=pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams and agencies",
    features: [
      { text: "Unlimited clips", included: true },
      { text: "Gemini AI clip detection", included: true },
      { text: "Team access", included: true },
      { text: "API access", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated support", included: true },
      { text: "Custom branding", included: true },
      { text: "SLA guarantee", included: true },
      { text: "4K export quality", included: true },
      { text: "All subtitle features", included: true },
      { text: "Priority processing", included: true },
    ],
    clipsLimit: null,
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
  },
];

export function getPlanById(planId: string): Plan | undefined {
  return plans.find((p) => p.id === planId);
}

export function getPlanFeatures(planId: string): PlanFeature[] {
  const plan = getPlanById(planId);
  return plan?.features ?? [];
}
