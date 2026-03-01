import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

type ProfileForPremiumCheck = {
  plan?: string | null;
  is_vip?: boolean | null;
};

export function isPremiumUser(profile: ProfileForPremiumCheck): boolean {
  return profile.plan === "paid" || profile.is_vip === true;
}
