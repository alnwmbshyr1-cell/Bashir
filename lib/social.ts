import { supabase } from "./supabase";

export type SocialProfile = {
  id: string;
  name: string;
  phone: string;
  avatar: string | null;
  created_at: string;
};

export type SocialPost = {
  id: string;
  user_id: string;
  text: string;
  image_url: string | null;
  video_url: string | null;
  likes: number;
  created_at: string;
};

export type SocialComment = {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  created_at: string;
};

export type MarketplaceProduct = {
  id: string;
  user_id: string;
  title: string;
  price: number;
  image_url: string | null;
  whatsapp: string;
  created_at: string;
};

export type DirectMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  media_url: string | null;
  created_at: string;
};

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "file";

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("يرجى تسجيل الدخول أولاً");
  return data.user.id;
}

export async function signUpWithEmail(name: string, phone: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) {
    const { error: profileError } = await supabase.from("users").upsert({ id: data.user.id, name, phone }, { onConflict: "id" });
    if (profileError) throw profileError;
  }
  return data.user;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function loadMyProfile() {
  const userId = await currentUserId();
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
  if (error) throw error;
  return data as SocialProfile;
}

export async function uploadPublicMedia(bucket: "post-media" | "product-media", uri: string, mimeType: string) {
  const userId = await currentUserId();
  const file = await fetch(uri);
  const blob = await file.blob();
  const extension = mimeType.includes("video") ? "mp4" : mimeType.includes("png") ? "png" : "jpg";
  const path = `${userId}/${Date.now()}-${sanitizeFileName(`media.${extension}`)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: mimeType, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAdProof(uri: string, mimeType: string) {
  const userId = await currentUserId();
  const response = await fetch(uri);
  const blob = await response.blob();
  const extension = mimeType.includes("pdf") ? "pdf" : mimeType.includes("png") ? "png" : "jpg";
  const path = `${userId}/${Date.now()}-receipt.${extension}`;
  const { error } = await supabase.storage.from("ad-proofs").upload(path, blob, { contentType: mimeType, upsert: false });
  if (error) throw error;
  return path;
}

export async function fetchFeed() {
  const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return (data ?? []) as SocialPost[];
}

export async function createPost(input: { text: string; imageUrl?: string | null; videoUrl?: string | null }) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("posts")
    .insert({ user_id: userId, text: input.text.trim(), image_url: input.imageUrl ?? null, video_url: input.videoUrl ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as SocialPost;
}

export async function togglePostReaction(postId: string, hasReacted: boolean) {
  const userId = await currentUserId();
  if (hasReacted) {
    const { error } = await supabase.from("post_reactions").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from("post_reactions").insert({ post_id: postId, user_id: userId });
  if (error) throw error;
  return true;
}

export async function fetchComments(postId: string) {
  const { data, error } = await supabase.from("comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SocialComment[];
}

export async function addComment(postId: string, text: string) {
  const userId = await currentUserId();
  const { data, error } = await supabase.from("comments").insert({ post_id: postId, user_id: userId, text: text.trim() }).select().single();
  if (error) throw error;
  return data as SocialComment;
}

export async function fetchMarketplaceProducts() {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return (data ?? []) as MarketplaceProduct[];
}

export async function createMarketplaceProduct(input: { title: string; price: number; whatsapp: string; imageUrl?: string | null }) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("products")
    .insert({ user_id: userId, title: input.title.trim(), price: input.price, whatsapp: input.whatsapp.trim(), image_url: input.imageUrl ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as MarketplaceProduct;
}

export async function startDirectConversation(otherUserId: string) {
  const { data, error } = await supabase.rpc("start_direct_conversation", { other_user: otherUserId });
  if (error) throw error;
  return data as string;
}

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DirectMessage[];
}

export async function sendMessage(conversationId: string, body: string, mediaUrl?: string | null) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: userId, body: body.trim(), media_url: mediaUrl ?? null })
    .select()
    .single();
  if (error) throw error;
  return data as DirectMessage;
}

export async function submitPromotedPostRequest(postId: string, receiptPath: string) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("ads")
    .insert({ user_id: userId, post_id: postId, payment_proof: receiptPath, status: "pending_review" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToConversation(conversationId: string, onMessage: (message: DirectMessage) => void) {
  return supabase
    .channel(`conversation-${conversationId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => onMessage(payload.new as DirectMessage))
    .subscribe();
}
