import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";

const config = Constants.expoConfig?.extra ?? {};
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? String(config.supabaseUrl ?? "https://cjwzfrygvoophdezicrz.supabase.co");
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? String(config.supabasePublishableKey ?? "");

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey || "public-anon-key-required", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
