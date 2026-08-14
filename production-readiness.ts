export type ProductionGate = {
  id: string;
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
  owner: string;
  status: "locked" | "pending";
};

export const PRODUCTION_GATES: ProductionGate[] = [
  {
    id: "identity",
    titleAr: "الهوية والحسابات الحية",
    titleEn: "Identity and live accounts",
    detailAr: "يتطلب خادم مصادقة متعدد المستخدمين، تدفقات حذف الحساب، وحماية من إساءة الاستخدام.",
    detailEn: "Requires multi-user server authentication, account deletion flows, and abuse protection.",
    owner: "Identity / Security",
    status: "pending",
  },
  {
    id: "payments",
    titleAr: "المدفوعات والاشتراكات",
    titleEn: "Payments and subscriptions",
    detailAr: "مغلق حتى يتم ربط حساب أعمال ومفاتيح خادم وwebhooks موقعة ومسارات استرداد الأموال.",
    detailEn: "Locked until a business account, server secrets, signed webhooks, and refund paths are configured.",
    owner: "Payments / Finance",
    status: "locked",
  },
  {
    id: "payouts",
    titleAr: "أرباح المنشئين والسحب",
    titleEn: "Creator earnings and payouts",
    detailAr: "مغلق حتى يتوفر دفتر أستاذ، KYC/AML، موافقات سحب، وإجراءات مكافحة الاحتيال.",
    detailEn: "Locked until a ledger, KYC/AML, payout approvals, and anti-fraud controls exist.",
    owner: "Finance / Risk",
    status: "locked",
  },
  {
    id: "ugc",
    titleAr: "المحتوى والرسائل والوسائط",
    titleEn: "Content, messaging, and media",
    detailAr: "يتطلب تخزيناً محمياً، إبلاغاً وحظراً فعليين، اعتدالاً مستمراً، وسجل تدقيق.",
    detailEn: "Requires protected storage, real report and block flows, continuous moderation, and audit logs.",
    owner: "Trust & Safety",
    status: "pending",
  },
  {
    id: "operations",
    titleAr: "المراقبة ومفاتيح الإيقاف",
    titleEn: "Monitoring and kill switches",
    detailAr: "يتطلب تنبيهات تشغيلية، تتبع أخطاء، مفاتيح إيقاف للمدفوعات والسحب، وخطة استجابة للحوادث.",
    detailEn: "Requires operational alerts, error tracking, payment/payout kill switches, and an incident response plan.",
    owner: "Operations",
    status: "pending",
  },
];

export const LIVE_OPERATIONS_ENABLED = false;

export type RegionalLaunchMode = "disabled" | "sandbox" | "review_required" | "live";

export type RegionalFeaturePolicy = {
  countryCode: string;
  payments: RegionalLaunchMode;
  payouts: RegionalLaunchMode;
  creatorEarnings: RegionalLaunchMode;
  messaging: RegionalLaunchMode;
  mediaUploads: RegionalLaunchMode;
  reason: string;
};

/**
 * Secure default: every region stays disabled until a server-controlled
 * compliance and provider approval record exists. Client code never promotes
 * a region to live mode.
 */
export const DEFAULT_GLOBAL_POLICY: RegionalFeaturePolicy = {
  countryCode: "DEFAULT",
  payments: "disabled",
  payouts: "disabled",
  creatorEarnings: "disabled",
  messaging: "disabled",
  mediaUploads: "disabled",
  reason: "No legal jurisdiction, payment provider, compliance approval, or server feature flag has been approved.",
};

/** Yemen is the nominated legal home jurisdiction, but no regulated feature is approved yet. */
export const YEMEN_INITIAL_POLICY: RegionalFeaturePolicy = {
  countryCode: "YE",
  payments: "disabled",
  payouts: "disabled",
  creatorEarnings: "disabled",
  messaging: "disabled",
  mediaUploads: "disabled",
  reason: "Yemen is the nominated launch jurisdiction. Provider availability, legal approval, compliance operations, and server feature flags remain unconfirmed.",
};

export function getRegionalPolicy(countryCode?: string): RegionalFeaturePolicy {
  return countryCode?.toUpperCase() === "YE" ? YEMEN_INITIAL_POLICY : DEFAULT_GLOBAL_POLICY;
}

export type YemenPaymentProviderId = "kuraimi" | "jawali" | "jaib";

export type YemenPaymentProvider = {
  id: YemenPaymentProviderId;
  nameAr: string;
  nameEn: string;
  publicIntegrationStatus: "official_path_identified" | "documentation_required";
  liveStatus: "locked";
  requiredBeforeActivation: string[];
};

/**
 * This registry describes candidate providers only. It intentionally contains
 * no credentials, URLs for transaction endpoints, merchant IDs, or payment
 * execution methods. Server-side approval is required before a provider can
 * ever move out of the locked state.
 */
export const YEMEN_PAYMENT_PROVIDERS: YemenPaymentProvider[] = [
  {
    id: "kuraimi",
    nameAr: "بنك الكريمي — حاسب / الربط API",
    nameEn: "Al-Kuraimi — Haseb / API Link",
    publicIntegrationStatus: "official_path_identified",
    liveStatus: "locked",
    requiredBeforeActivation: ["Merchant business agreement", "Official API specification", "Sandbox access", "Signed webhook contract", "Server-side secrets"],
  },
  {
    id: "jawali",
    nameAr: "محفظة جوالي",
    nameEn: "Jawali Wallet",
    publicIntegrationStatus: "documentation_required",
    liveStatus: "locked",
    requiredBeforeActivation: ["Merchant onboarding", "Official API specification", "Sandbox or controlled test", "Webhook contract", "Server-side secrets"],
  },
  {
    id: "jaib",
    nameAr: "محفظة جيب",
    nameEn: "Jeeb Wallet",
    publicIntegrationStatus: "documentation_required",
    liveStatus: "locked",
    requiredBeforeActivation: ["Merchant onboarding", "Official API specification", "Sandbox or controlled test", "Webhook contract", "Server-side secrets"],
  },
];

export function canProcessLivePayment(_provider: YemenPaymentProviderId): false {
  return false;
}
