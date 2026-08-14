export type SocialServiceGate = {
  id: string;
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
  owner: string;
  status: "ready" | "pending";
};

export const SOCIAL_SERVICE_GATES: SocialServiceGate[] = [
  {
    id: "identity",
    titleAr: "الحسابات والجلسات",
    titleEn: "Accounts and sessions",
    detailAr: "يحتاج المجتمع الحي إلى تسجيل آمن، استرداد حساب، حذف بيانات، ومنع إساءة الاستخدام.",
    detailEn: "A live community needs secure sign-in, recovery, deletion, and abuse prevention.",
    owner: "Identity / Security",
    status: "pending",
  },
  {
    id: "content",
    titleAr: "المنشورات والتفاعلات",
    titleEn: "Posts and interactions",
    detailAr: "تحتاج المنشورات والإعجابات والتعليقات والمشاركات إلى قاعدة بيانات وصلاحيات وصول واضحة.",
    detailEn: "Posts, likes, comments, and shares need a database and clear access rules.",
    owner: "Community Platform",
    status: "pending",
  },
  {
    id: "media",
    titleAr: "الصور والفيديو",
    titleEn: "Photos and video",
    detailAr: "تحتاج الوسائط إلى تخزين محمي وحدود حجم وفحص محتوى وإجراءات إبلاغ وحذف.",
    detailEn: "Media needs protected storage, size limits, content checks, reporting, and deletion flows.",
    owner: "Storage / Trust & Safety",
    status: "pending",
  },
  {
    id: "messaging",
    titleAr: "المراسلة بين المستخدمين",
    titleEn: "User messaging",
    detailAr: "تحتاج الرسائل إلى صلاحيات محادثات، حظر، إبلاغ، وحدود تمنع الإزعاج أو الإساءة.",
    detailEn: "Messaging needs conversation permissions, blocking, reporting, and abuse limits.",
    owner: "Realtime / Trust & Safety",
    status: "pending",
  },
  {
    id: "moderation",
    titleAr: "البلاغات والإشراف",
    titleEn: "Reports and moderation",
    detailAr: "يتطلب المجتمع الحي مراجعة بلاغات وسجل تدقيق وإجراءات واضحة لحماية المستخدمين.",
    detailEn: "A live community requires report review, audit logs, and clear user-safety procedures.",
    owner: "Trust & Safety",
    status: "pending",
  },
];

export const LIVE_SOCIAL_ENABLED = false;

export const COMMUNITY_POLICY = {
  launchRegion: "YE",
  messaging: "pending",
  mediaUploads: "pending",
  reason: "YemenBook is a non-financial community. Live social services are enabled only after secure backend, moderation, and privacy setup.",
} as const;
