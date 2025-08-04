# TypeScriptで学ぶ関数型プログラミング

TypeScriptを使って関数型プログラミングの基礎から実践までを学ぶ教材です。

## 🎯 この教材の目的

- 関数型プログラミングの基本概念を理解する
- TypeScriptで実践的な関数型プログラミングを書けるようになる
- 日常の開発で関数型プログラミングのパターンを活用できるようになる

## 📚 対象読者

- TypeScriptの基本的な構文を理解している方
- オブジェクト指向プログラミングの経験がある方
- より良いコードを書きたいと考えている方

## 🚀 はじめ方

### 1. リポジトリのクローン

```bash
git clone https://github.com/kmizu/easy-fp.git
cd easy-fp
```

### 2. 依存関係のインストール

```bash
# Python環境のセットアップ（ドキュメント用）
pip install -r requirements.txt

# TypeScript環境のセットアップ（サンプルコード用）
cd examples
npm install
```

### 3. ローカルでドキュメントを見る

```bash
# プロジェクトルートで実行
mkdocs serve
```

ブラウザで http://localhost:8000 にアクセスしてください。

## 📖 内容

1. **入門編**
   - 第1章: 関数型プログラミングの基礎
   - 第2章: 純粋関数と副作用
   - 第3章: 高階関数

2. **基礎編**
   - 第4章: 関数合成とパイプライン
   - 第5章: カリー化と部分適用
   - 第6章: 関数型データ構造

3. **応用編**
   - 第7章: エラーハンドリング
   - 第8章: 非同期処理と関数型
   - 第9章: 実践プロジェクト

## 🛠️ 開発

### ドキュメントの編集

`docs/` ディレクトリ内のMarkdownファイルを編集してください。
MkDocsが自動的に変更を検出してリロードします。

### サンプルコードの実行

```bash
cd examples
npm run dev
```

### テストの実行

```bash
cd examples
npm test
```

## 🤝 コントリビューション

Issue や Pull Request を歓迎します！

## 📝 ライセンス

MIT License

## 🔗 関連リンク

- [オンラインドキュメント](https://kmizu.github.io/easy-fp/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/)
- [関数型プログラミングリソース](docs/appendix/references.md)
