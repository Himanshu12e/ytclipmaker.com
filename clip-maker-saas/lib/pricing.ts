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
      { text: "15 free clips", included: true },
      { text: "Basic AI clipping", included: true },
      { text: "TikTok & Instagram export", included: true },
      { text: "720p export quality", included: true },
      { text: "Community support", included: true },
      { text: "Faster processing", included: false },
      { text: "4K export quality", included: false },
      { text: "Custom captions & branding", included: false },
      { text: "Team access", included: false },
      { text: "API access", included: false },
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
    description: "For creators who want unlimited power",
    features: [
      { text: "Unlimited clips", included: true },
      { text: "Basic AI clipping", included: true },
      { text: "All platform exports", included: true },
      { text: "4K export quality", included: true },
      { text: "Custom captions & branding", included: true },
      { text: "Faster processing", included: true },
      { text: "Priority processing", included: true },
      { text: "Email support", included: true },
      { text: "Team access", included: false },
      { text: "API access", included: false },
    ],
    clipsLimit: null,
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
      { text: "Custom pricing", included: true },
      { text: "Team access", included: true },
      { text: "Unlimited clips", included: true },
      { text: "API access", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated support", included: true },
      { text: "Custom branding", included: true },
      { text: "SLA guarantee", included: true },
      { text: "4K export quality", included: true },
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
