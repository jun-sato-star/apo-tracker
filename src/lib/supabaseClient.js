import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error(
    'Supabaseの環境変数が設定されていません。.env.exampleを参考に.envファイルを作成するか、Vercelの環境変数を設定してください。'
  )
}

// 環境変数が未設定の場合、createClientが例外を投げて画面が真っ白になるのを防ぐ
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
