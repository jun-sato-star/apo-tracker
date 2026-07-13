# アポ獲得トラッカー

新卒研修中の営業アポ取り(架電数・アポ獲得数)をチームで共有・可視化するための管理ツールです。
React + Vite + Supabase で構築しています。

- フロントエンド: React + Vite
- データベース: Supabase (PostgreSQL)
- ホスティング: Vercel
- 認証: なし(リンクを知っている人が使う想定の社内ツール)

詳しい仕様は [`アポ獲得トラッカー_開発仕様書.md`](./アポ獲得トラッカー_開発仕様書.md) を参照してください。

---

## 1. Supabaseプロジェクトを作成する

1. [https://supabase.com](https://supabase.com) にアクセスし、GitHubアカウントなどでサインアップ/ログインする。
2. ダッシュボードで **New project** をクリック。
   - Organization: 個人用のものでOK
   - Project name: `apo-tracker` など好きな名前
   - Database Password: 任意の強いパスワードを設定して控えておく
   - Region: `Northeast Asia (Tokyo)` など日本に近いリージョンを推奨
3. **Create new project** をクリックし、プロジェクトの起動(1〜2分)を待つ。

## 2. テーブルを作成する

1. Supabaseダッシュボードの左メニューから **SQL Editor** を開く。
2. **New query** をクリックし、このリポジトリの [`supabase/schema.sql`](./supabase/schema.sql) の中身を全てコピー&ペーストする。
3. **Run** をクリックして実行する。
   - `reps`(担当者)、`daily_logs`(日次記録)、`call_plans`(週次架電予定数)の3テーブルが作成されます。
   - 初期メンバー(田尻・奥野・岡崎・山﨑・樋口・福島)が `reps` テーブルに登録されます。不要な場合はSQL末尾の `insert into reps ...` 部分を削除してから実行するか、後でアプリの画面上から名前を書き換えてください。
   - 認証を使わない社内ツールのため、RLS(Row Level Security)は「誰でも読み書き可能」というポリシーにしてあります。
4. (任意・推奨) 複数人が同時に見ているときに自動で最新状態を反映したい場合は、リアルタイム更新を有効にします。
   - `schema.sql` の最後にある `alter publication supabase_realtime add table ...` がすでに実行されていれば設定完了です。
   - ダッシュボードの **Database > Replication** で `reps` / `daily_logs` / `call_plans` が有効になっていることを確認できます。

## 3. APIキーを取得する

1. Supabaseダッシュボードの **Project Settings > API** を開く。
2. 以下の2つの値をメモする。
   - **Project URL**(例: `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** キー(公開しても問題ない読み書き用キー)

## 4. ローカルで動かす

```bash
npm install
cp .env.example .env
```

`.env` を開き、手順3で取得した値を設定する。

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

開発サーバーを起動する。

```bash
npm run dev
```

`http://localhost:5173` を開いて動作を確認してください。

## 5. Vercelにデプロイする

1. このリポジトリをGitHubにpushする(すでにpush済みならこの手順は不要)。
2. [https://vercel.com](https://vercel.com) にアクセスし、GitHubアカウントでログインする。
3. **Add New... > Project** から、このGitHubリポジトリをインポートする。
4. Framework Preset は自動的に **Vite** が検出されます(検出されない場合は手動で選択)。
5. **Environment Variables** に以下の2つを追加する(値は手順3で取得したものと同じ)。
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. **Deploy** をクリックする。数十秒〜数分でデプロイが完了し、`https://<プロジェクト名>.vercel.app` のようなURLが発行されます。
7. 発行されたURLを5人のメンバーに共有すれば、スマホ・PCどちらのブラウザからでもアクセスできます。

以降、`main` ブランチ(またはVercelで設定したブランチ)にpushするたびに自動で再デプロイされます。

## 主な機能

- ヘッダーの月切り替え(‹ ›)で表示月を移動、月間サマリー・週次振り返りが連動
- チーム月間サマリー(合計アポ獲得数/目標、進捗バー、架電数合計、アポ獲得率)
- 担当者カード(名前編集、順位、架電数・アポ獲得数、アポ獲得率、月目標編集)
- メンバー追加
- 週次振り返り(月〜金で区切り、月をまたがない。架電予定数・アポ獲得週目標を編集可能)
- 実績記録フォーム(担当者・日付・架電数・アポ獲得数を入力、記録一覧から削除も可能)
- 複数人が同時に開いていても、Supabaseのリアルタイム更新で自動的に最新状態が反映される

## データモデル

| テーブル | 説明 |
|---|---|
| `reps` | 担当者(名前、月目標、週目標) |
| `daily_logs` | 日次の架電数・アポ獲得数の記録 |
| `call_plans` | 担当者×週ごとの架電予定数 |

詳細は [`supabase/schema.sql`](./supabase/schema.sql) を参照してください。

## ディレクトリ構成

```
src/
  components/   画面を構成するReactコンポーネント
  lib/
    supabaseClient.js  Supabaseクライアントの初期化
    api.js              Supabaseへの読み書き関数
    date.js              週・月の日付計算ユーティリティ
  App.jsx        画面全体の状態管理・データ取得
supabase/
  schema.sql     テーブル定義・RLSポリシー・初期データ
```
