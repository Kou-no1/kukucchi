# くくっち

掛け算を遊びながら練習する、子ども向けのWebアプリです。初期版はバックエンドを使わず、進捗・コイン・経験値・称号・問題別成績を端末の `localStorage` に保存します。

## 主な機能

- 初回設定: よびな、アイコン、学習レベル、音設定
- ホーム: くくっち、レベル、経験値、コイン、今日のミッション、にがて問題
- おぼえるモード: 段選択、4択、数字入力、まとまり表示、数直線、たし算、九九読み
- スピードモード: 30秒チャレンジ、スコア、コンボ
- リザルト: 正解数、正答率、平均回答時間、コイン、経験値、自己ベスト、称号
- 設定: 効果音、読み上げ、アニメーション軽減、JSONバックアップ・ひきつぎ

## 使用技術

- React
- TypeScript
- Vite
- React Router HashRouter
- localStorage
- Vitest
- React Testing Library
- ESLint
- Prettier

## セットアップ

```bash
npm install
```

証明書検証で失敗する環境では、NodeのシステムCA利用を有効にします。

```bash
$env:NODE_OPTIONS='--use-system-ca'
npm install
```

## 開発サーバー

```bash
npm run dev
```

## テスト

```bash
npm run test
```

## ビルド

```bash
npm run build
```

## プレビュー

```bash
npm run preview
```

## GitHub Pages公開

`vite.config.ts` の `base` は `math-planet` に設定しています。リポジトリ名が変わる場合は `base` を合わせてからビルドしてください。

```bash
npm run build
```

生成物は `dist/` に出力されます。ルーティングは `HashRouter` のため、GitHub Pages上でのリロードや直リンクでも404になりにくい構成です。

## ディレクトリ構成

```text
src/
  app/                    ルーティング
  components/             共通UI、キャラクター、ゲームUI
  features/               画面単位の実装
  game-engine/            問題生成、採点、習熟度、報酬、ミッション
  hooks/                  セーブデータContext
  repositories/           localStorageリポジトリ
  services/               音、結果反映
  storage/                セーブデータ生成・マイグレーション
  data/                   九九読みデータ
  types/                  共通型
  tests/                  単体・UIテスト
```

## セーブデータ仕様

セーブデータは `version` を持つJSONです。主な内容は以下です。

- `player`: よびな、アイコン、学習レベル、レベル、経験値、コイン、称号
- `settings`: 効果音、読み上げ、アニメーション軽減
- `progress`: 問題別成績、履歴、自己ベスト、ミッション、所持アイテム

設定画面から「データをほぞんする」でJSONをダウンロードできます。ファイル保存が難しい端末では、表示されたJSONテキストをコピーできます。「データをひきつぐ」ではJSONファイルまたは貼り付けテキストから復元します。復元時はマイグレーション処理を通します。

## 今後の拡張案

- Phase 3: 習熟度判定の強化、復習スケジュール、にがてモンスター
- Phase 4: モンスターバトル、宝箱、ロケット、ショップ、ボス戦
- Phase 5: 平方数、3.14計算、発展計算カテゴリ
- PWA対応: `vite-plugin-pwa` によるホーム画面追加、オフライン動作
- FirebaseまたはSupabaseによるクラウド保存
