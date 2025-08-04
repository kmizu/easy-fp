# 第1章: 関数型プログラミングの基礎

## 📚 この章で学ぶこと

- 🤔 関数型プログラミングって何？
- 🔄 今までの書き方（命令型）との違い
- 💡 なぜTypeScriptで学ぶといいの？
- 🔒 データを変えない書き方（イミュータビリティ）

## 🎯 関数型プログラミングとは？

**関数型プログラミング**（Functional Programming、略してFP）は、プログラムを「関数の組み合わせ」で作る考え方です。

### 🍳 料理で例えると...

想像してください。あなたがケーキを作るとき：

- **従来の方法**：ボウルの中で材料を直接混ぜる（データを直接変更）
- **関数型の方法**：材料ごとに新しいボウルを使う（新しいデータを作成）

### 📋 主な特徴

1. **関数を自由に扱える**  
   関数を変数に入れたり、他の関数に渡したりできます
   ```typescript
   const 計算する = (x) => x * 2;  // 関数を変数に代入！
   ```

2. **データを変更しない（イミュータビリティ）**  
   元のデータはそのまま、新しいデータを作ります
   ```typescript
   const 元の配列 = [1, 2, 3];
   const 新しい配列 = [...元の配列, 4];  // 元の配列は変わらない！
   ```

3. **関数の外に影響を与えない（副作用なし）**  
   関数は計算だけして、画面表示やファイル保存はしません

4. **「何をするか」を書く（宣言的）**  
   「どうやってするか」ではなく「何をしたいか」を書きます

## 🔄 今までの書き方（命令型）vs 関数型

同じ問題を2つの方法で解いて、違いを見てみましょう！

### 📊 例: 商品の価格を合計する

=== "👴 今までの書き方（命令型）"

    ```typescript
    // 商品の価格の配列
    const prices = [100, 250, 300, 150, 500];
    
    function calculateTotal(prices: number[]): number {
        let total = 0;  // 合計を入れる箱を用意
        
        // 1つずつ取り出して...
        for (let i = 0; i < prices.length; i++) {
            total += prices[i];  // 箱の中身を更新！
        }
        
        return total;
    }

    const 合計金額 = calculateTotal(prices);
    console.log(`合計: ${合計金額}円`); // 合計: 1300円
    ```

=== "🌱 関数型の書き方"

    ```typescript
    // 商品の価格の配列
    const prices = [100, 250, 300, 150, 500];
    
    function calculateTotal(prices: number[]): number {
        // reduceを使って「みんなを足した結果」を取得
        return prices.reduce((total, price) => total + price, 0);
        //                    ↑今までの合計  ↑今の価格  ↑最初は0
    }

    const 合計金額 = calculateTotal(prices);
    console.log(`合計: ${合計金額}円`); // 合計: 1300円
    ```

!!! info "reduceの説明"
    `reduce`は配列の各要素を順番に処理して、1つの結果にまとめる関数です。
    ```typescript
    // reduceの動きを追ってみると...
    // 1回目: total=0,   price=100  → 0 + 100 = 100
    // 2回目: total=100, price=250  → 100 + 250 = 350
    // 3回目: total=350, price=300  → 350 + 300 = 650
    // ...と繰り返して、最終的に1300になる
    ```

### 🤔 違いを整理してみると...

| | 今までの書き方（命令型） | 関数型の書き方 |
|---|---|---|
| **何を書く？** | 「どうやって」計算するか | 「何を」したいか |
| **データの扱い** | 変数を更新していく | 新しい値を作る |
| **ループ** | for文で一つずつ処理 | reduceでまとめて処理 |
| **コードの長さ** | 長い | 短い |

!!! success "どちらが良いの？"
    関数型の書き方は：
    - 👍 コードが短くて読みやすい
    - 👍 バグが入りにくい（変数を変更しないから）
    - 👍 テストが書きやすい

## 💪 TypeScriptで学ぶメリット

### 1. 🔍 型があるからミスに気づきやすい

```typescript
// TypeScriptだと、間違いがすぐわかる！
const prices: number[] = [100, 200, 300];

// ✗ これはエラーになる（文字列を足そうとしてる！）
prices.reduce((total, price) => total + "円", 0);

// ✓ 正しい書き方
prices.reduce((total, price) => total + price, 0);
```

### 2. 🌏 実際の開発でも使える

TypeScriptは多くの企業で使われています。ここで学んだことは、そのまま仕事でも活用できます！

### 3. 🎯 少しずつ始められる

```typescript
// 最初はこんなコードでも...
let total = 0;
for (const price of prices) {
    total += price;
}

// 徐々に関数型に変えていける！
const total = prices.reduce((sum, price) => sum + price, 0);
```

## 🔒 データを変えない書き方（イミュータビリティ）

**イミュータビリティ**（不変性）とは、「一度作ったデータを変更しない」というルールです。

### 😟 データを直接変える書き方（避けたい）

```typescript
// 🛍️ ECサイトのユーザー情報
const users = [
    { id: 1, name: "Alice", age: 25, points: 100 },
    { id: 2, name: "Bob", age: 30, points: 200 }
];

// ✗ 危険：元のデータを直接変更！
users[0].points = 150;  // Aliceのポイントを直接変更

console.log(users[0].points); // 150 - 元のデータが変わってしまった！
// 💢 問題：いつ、どこで、誰が変えたかわからない...
```

### 🌱 新しいデータを作る書き方（推奨）

```typescript
// 🛍️ ECサイトのユーザー情報
const users = [
    { id: 1, name: "Alice", age: 25, points: 100 },
    { id: 2, name: "Bob", age: 30, points: 200 }
];

// ✓ 安全：新しい配列を作成！
const updatedUsers = users.map(user =>
    user.id === 1 
        ? { ...user, points: 150 }  // Aliceのポイントだけ変えた新しいオブジェクト
        : user  // 他のユーザーはそのまま
);

console.log(users[0].points);        // 100 - 元のデータは安全！
console.log(updatedUsers[0].points); // 150 - 新しいデータに変更が反映
```

!!! info "スプレッド構文（...）の説明"
    ```typescript
    const original = { name: "Alice", age: 25 };
    
    // ...を使うと、元のオブジェクトの中身をコピー
    const copy = { ...original };  // {name: "Alice", age: 25}
    
    // 一部だけ変えたいときは、後に書いたものが優先
    const updated = { ...original, age: 26 };  // {name: "Alice", age: 26}
    ```

### 🎉 データを変えないメリット

#### 1. 🔍 **バグを見つけやすい**
```typescript
// データの変更履歴が明確
const 初期データ = { total: 1000 };
const 割引後 = { ...initialData, total: 900 };
const 税込み = { ...割引後, total: 990 };
// 各段階で何が起きたか一目瞭然！
```

#### 2. 🤝 **チーム開発が安心**
```typescript
// AさんとBさんが同時に作業しても大丈夫！
const ユーザーAの変更 = updateUserPoints(users, 1, 150);
const ユーザーBの変更 = updateUserAge(users, 2, 31);
// 元のusersは誰も変えていないので衝突しない
```

#### 3. 🧪 **テストが簡単**
```typescript
// 同じ入力なら必ず同じ結果
test('ポイント計算', () => {
    const result = calculatePoints(100, 0.1);
    expect(result).toBe(110);  // 必ず110になる！
});
```

#### 4. 🔄 **「元に戻す」が簡単**
```typescript
// 各段階のデータが残っているので
// いつでも前の状態に戻せる！
const history = [初期状態, 変更1, 変更2];
```

## 💪 実践演習

### 📝 演習1: ショッピングカートに商品を追加

以下のコードを、データを変えない書き方に修正してください：

```typescript
// 😰 元のカートを直接変更してしまうコード
type CartItem = { id: number; name: string; price: number };

function addToCart(cart: CartItem[], newItem: CartItem): CartItem[] {
    cart.push(newItem);  // 危険：元の配列を変更！
    return cart;
}
```

??? tip "ヒント1"
    `push`は元の配列を変更します。代わりに新しい配列を作る方法を考えてみましょう。

??? tip "ヒント2"
    スプレッド構文`...`を使うと、配列の中身を展開できます。

??? success "解答"
    ```typescript
    // 😀 安全：新しい配列を作成
    function addToCart(cart: CartItem[], newItem: CartItem): CartItem[] {
        return [...cart, newItem];  // 元のcartは変更されない！
    }
    
    // 使い方
    const myCart = [{id: 1, name: "Apple", price: 100}];
    const newCart = addToCart(myCart, {id: 2, name: "Orange", price: 150});
    
    console.log(myCart.length);   // 1 - 元のカートは変わらない
    console.log(newCart.length);  // 2 - 新しいカートに商品が追加
    ```

### 📝 演習2: セール商品の価格計算

以下のfor文を使ったコードを、関数型の書き方に変えてください：

```typescript
// 割引対象商品（sale: true）の合計金額を計算
type Product = { name: string; price: number; sale: boolean };

function calculateSaleTotal(products: Product[]): number {
    let total = 0;
    for (const product of products) {
        if (product.sale) {
            total += product.price * 0.8;  // 20%OFF
        }
    }
    return total;
}
```

??? tip "ヒント1"
    まず`filter`でセール商品だけを選びましょう。

??? tip "ヒント2"
    次に`map`で各商品の割引後価格を計算しましょう。

??? tip "ヒント3"
    最後に`reduce`で合計を計算しましょう。

??? success "解答"
    ```typescript
    // 🌱 関数型の書き方
    function calculateSaleTotal(products: Product[]): number {
        return products
            .filter(product => product.sale)        // 1. セール商品だけ選ぶ
            .map(product => product.price * 0.8)    // 2. 各商品の割引後価格
            .reduce((total, price) => total + price, 0);  // 3. 合計を計算
    }
    
    // または、1つのreduceでまとめて書くこともできます
    function calculateSaleTotalV2(products: Product[]): number {
        return products.reduce((total, product) => {
            return product.sale ? total + (product.price * 0.8) : total;
        }, 0);
    }
    ```

## 📝 この章のまとめ

今日学んだことを振り返りましょう：

### ✅ わかったこと

1. **関数型プログラミング** = 関数を組み合わせてプログラムを作る方法
2. **イミュータビリティ** = データを変更せず、新しいデータを作る
3. **関数型の書き方**のメリット：
   - 🐛 バグが少ない
   - 🧪 テストしやすい
   - 👥 チームで開発しやすい

### 🔑 重要なキーワード

| 用語 | 意味 | 例 |
|------|------|-----|
| **イミュータブル** | 変更できない | `const newArray = [...oldArray, item]` |
| **ミュータブル** | 変更できる | `array.push(item)` |
| **スプレッド構文** | `...`で展開 | `{...obj, name: "新しい名前"}` |

### 💡 実践のコツ

```typescript
// ❌ 避けたい：データを直接変更
cart.push(newItem);

// ✅ 推奨：新しいデータを作成
const newCart = [...cart, newItem];
```

---

準備はできましたか？次は「純粋関数」という、もっと面白い概念を学びます！

[第2章: 純粋関数と副作用 →](../chapter02/index.md){ .md-button .md-button--primary }

!!! question "質問・不明点があれば"
    - 💬 [よくある質問](../appendix/faq.md)をチェック
    - 📚 [用語集](../appendix/glossary.md)で復習
    - 🤝 [GitHubで質問](https://github.com/kmizu/easy-fp/issues)