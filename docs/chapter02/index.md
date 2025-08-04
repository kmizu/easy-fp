# 第2章: 純粋関数と副作用

## 📚 この章で学ぶこと

- 🌱 **純粋関数**（じゅんすいかんすう）って何？
- 💨 **副作用**（ふくさよう）って何？
- 🔄 同じ入力なら必ず同じ結果になること
- 💪 実践的な純粋関数の書き方

## 🌱 純粋関数とは？

**純粋関数**（Pure Function）は、「信頼できる関数」のことです。

### 🎯 純粋関数の2つのルール

1. **🔄 同じ入力 → 必ず同じ結果**  
   数学の関数と同じで、`2 + 3`はいつでも`5`
   
2. **🚫 関数の外に影響を与えない**  
   計算だけして、他のことはしない

### 🎀 純粋関数の例：税込価格の計算

```typescript
// ✅ 純粋関数：必要な情報をすべて引数で受け取る
function calculatePriceWithTax(price: number, taxRate: number): number {
    return price * (1 + taxRate);
}

// 同じ入力なら、何度呼んでも同じ結果！
console.log(calculatePriceWithTax(1000, 0.1)); // 1100
console.log(calculatePriceWithTax(1000, 0.1)); // 1100
console.log(calculatePriceWithTax(1000, 0.1)); // 1100 ← 安心！
```

### 😰 純粋でない関数の例

```typescript
// ✖️ 純粋でない：外部の変数に依存
let taxRate = 0.1;  // グローバル変数（危険！）

function calculatePrice(price: number): number {
    return price * (1 + taxRate); // 外部変数を使っている
}

// 同じ入力でも、結果が変わってしまう！
console.log(calculatePrice(1000)); // 1100
taxRate = 0.2;  // 誰かがtaxRateを変えた！
console.log(calculatePrice(1000)); // 1200 ← あれ？結果が違う！
```

!!! warning "なぜ問題なの？"
    外部変数に依存すると：
    - 🐛 どこで変数が変わったか追跡が難しい
    - 🧪 テストが書きにくい
    - 😵 予想外の動作でバグが発生

## 💨 副作用とは？

**副作用**（Side Effect）とは、「関数が計算以外のことをする」ことです。

### 🍳 料理で例えると...

- **純粋関数** = レシピを読んで材料の量を計算するだけ
- **副作用あり** = 実際に料理を作る、皿を洗う、写真を撮る

### 📋 よくある副作用の例

1. **💾 データの保存**
   - ファイルに書き込む
   - データベースに保存
   - localStorageに保存

2. **📢 情報の表示**
   - console.logで出力
   - 画面に表示（DOM操作）
   - アラートを出す

3. **🌐 外部との通信**
   - APIを呼ぶ
   - メールを送る

4. **🔄 状態の変更**
   - グローバル変数を変える
   - オブジェクトを直接書き換える

### 💻 副作用の具体例

```typescript
// ✖️ 副作用あり：グローバル変数を変更
let cartCount = 0;  // ショッピングカートの商品数

function addItemToCart(): number {
    cartCount++;  // 副作用：外部の変数を変更！
    return cartCount;
}

// ✖️ 副作用あり：コンソールに出力
function saveUser(user: { name: string; email: string }): void {
    console.log(`ユーザーを保存しました: ${user.name}`); // 副作用！
    // データベースに保存するコード...
}

// ✖️ 副作用あり：画面を更新
function showNotification(message: string): void {
    document.getElementById('notification')!.textContent = message; // DOMを変更！
}
```

!!! info "副作用は悪いもの？"
    副作用自体は悪くありません！プログラムは最終的に何かを表示したり、
    保存したりする必要があります。大事なのは「副作用を管理する」ことです。

## 🔄 参照透過性（置き換え可能性）

**参照透過性**とは、「関数の呼び出しをその結果で置き換えてもOK」という性質です。

### 🎯 簡単な例：計算式

```typescript
// ✅ 参照透過：純粋関数は置き換えOK
function double(x: number): number {
    return x * 2;
}

// この2つの計算はまったく同じ！
const 方法1 = double(5) + double(3);    // 関数を呼ぶ
const 方法2 = 10 + 6;                   // 結果で置き換え
//            ↑double(5)の結果  ↑double(3)の結果

console.log(方法1 === 方法2); // true ← 同じ結果！
```

### 😵 置き換えできない例

```typescript
// ✖️ 参照透過でない：呼ぶたびに結果が変わる
let orderId = 0;

function getNextOrderId(): number {
    return ++orderId; // 呼ぶたびに増える！
}

// 同じ計算のはずなのに...
const 計算1 = getNextOrderId() + getNextOrderId(); // 1 + 2 = 3
const 計算2 = getNextOrderId() + getNextOrderId(); // 3 + 4 = 7

console.log(計算1 === 計算2); // false ← 違う結果！
```

!!! tip "なぜ参照透過性が大事？"
    - 🧪 **テストが簡単**：同じ入力なら必ず同じ結果
    - 🔍 **デバッグが楽**：関数の結果が予測できる
    - 🚀 **最適化が可能**：コンパイラが賢く最適化できる

## 💪 純粋関数の実践的な書き方

### 1️⃣ 必要な情報はすべて引数で受け取る

```typescript
// 😰 悪い例：外部の設定に依存
const config = { 
    shippingFee: 500,  // 送料
    freeShippingThreshold: 3000  // 送料無料の闾値
};

function calculateShippingBad(orderTotal: number): number {
    // 外部のconfigに依存している！
    if (orderTotal >= config.freeShippingThreshold) {
        return 0;
    }
    return config.shippingFee;
}

// 😀 良い例：必要な情報を引数で受け取る
function calculateShippingGood(
    orderTotal: number, 
    shippingFee: number, 
    freeShippingThreshold: number
): number {
    if (orderTotal >= freeShippingThreshold) {
        return 0;
    }
    return shippingFee;
}

// 使い方
const shipping = calculateShippingGood(2500, 500, 3000); // 500円
```

### 2️⃣ 元のデータを変えず、新しいデータを返す

```typescript
// 😰 悪い例：引数の配列を直接変更
function sortPricesBad(prices: number[]): number[] {
    return prices.sort((a, b) => a - b); // 危険：元の配列が変わる！
}

// 使ってみると...
const originalPrices = [300, 100, 200];
const sortedPrices = sortPricesBad(originalPrices);
console.log(originalPrices); // [100, 200, 300] ← 元の配列が変わった！

// 😀 良い例：新しい配列を作って返す
function sortPricesGood(prices: number[]): number[] {
    return [...prices].sort((a, b) => a - b); // 安全：コピーしてからソート
}

// 使ってみると...
const originalPrices2 = [300, 100, 200];
const sortedPrices2 = sortPricesGood(originalPrices2);
console.log(originalPrices2); // [300, 100, 200] ← 元の配列はそのまま！
console.log(sortedPrices2);   // [100, 200, 300] ← 新しい配列がソート済み
```

### 3️⃣ 計算と副作用を分ける

```typescript
// 😰 悪い例：計算と表示が混ざっている
function calculateAndDisplayTotal(cart: CartItem[]): number {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    // 副作用：画面に表示
    console.log(`小計: ${subtotal}円`);
    console.log(`税: ${tax}円`);
    console.log(`合計: ${total}円`);
    
    return total;
}

// 😀 良い例：計算と表示を分ける

// 純粋関数：計算だけ
function calculateCartTotal(cart: CartItem[]): {
    subtotal: number;
    tax: number;
    total: number;
} {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    return { subtotal, tax, total };  // 計算結果を返すだけ
}

// 副作用を持つ関数：表示だけ
function displayCartTotal(totals: { subtotal: number; tax: number; total: number }): void {
    console.log(`小計: ${totals.subtotal}円`);
    console.log(`税: ${totals.tax}円`);
    console.log(`合計: ${totals.total}円`);
}

// 使い方
const cart: CartItem[] = [
    { id: 1, name: "Apple", price: 100, quantity: 3 },
    { id: 2, name: "Orange", price: 150, quantity: 2 }
];

const totals = calculateCartTotal(cart);  // 計算する
displayCartTotal(totals);                 // 表示する
```

!!! success "分離のメリット"
    - 🧪 計算部分だけをテストできる
    - 🔄 計算結果を他の目的にも使える
    - 🎯 表示方法を変えても計算ロジックは影響を受けない

## 🎯 純粋関数のメリット

### 1️⃣ テストが超簡単！

```typescript
// 純粋関数なら、テストはこんなにシンプル！
function applyDiscount(price: number, discountRate: number): number {
    return price * (1 - discountRate);
}

// テストコード
describe('割引計算', () => {
    it('10%割引が正しく計算される', () => {
        expect(applyDiscount(1000, 0.1)).toBe(900);
    });
    
    it('50%割引が正しく計算される', () => {
        expect(applyDiscount(2000, 0.5)).toBe(1000);
    });
    
    it('割引なしの場合', () => {
        expect(applyDiscount(1500, 0)).toBe(1500);
    });
});
// 外部の状態に依存しないので、テストが書きやすい！
```

### 2️⃣ 同時に実行しても安全！

```typescript
// 純粋関数なら、複数同時に実行してもOK
async function processOrders() {
    const orders = [
        { id: 1, items: [...], customerId: 101 },
        { id: 2, items: [...], customerId: 102 },
        { id: 3, items: [...], customerId: 103 }
    ];
    
    // 全部同時に計算しても大丈夫！
    const results = await Promise.all(
        orders.map(order => calculateOrderTotal(order))
    );
    
    // 純粋関数は互いに影響しないので、
    // データ競合や予期しない結果になる心配がない！
}
```

### 3️⃣ 結果をキャッシュできる！

```typescript
// 純粋関数は同じ入力なら同じ結果なので、
// 一度計算した結果を保存しておける！

// 例：重い商品推薦計算
function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
    const cache = new Map<T, R>();
    
    return (arg: T): R => {
        // キャッシュにあればそれを返す
        if (cache.has(arg)) {
            console.log('キャッシュから取得！');
            return cache.get(arg)!;
        }
        
        // なければ計算して保存
        console.log('新しく計算中...');
        const result = fn(arg);
        cache.set(arg, result);
        return result;
    };
}

// 重い計算をメモ化
const getRecommendations = memoize((userId: number) => {
    // 実際は複雑な推薦アルゴリズム
    console.log(`ユーザー${userId}のおすすめを計算中...`);
    return [`商品A`, `商品B`, `商品C`];
});

// 使ってみると...
getRecommendations(123); // "新しく計算中..."
getRecommendations(123); // "キャッシュから取得！" ← 2回目は高速！
```

## 💪 実践演習

### 📝 演習1: ユーザー登録機能を純粋関数に

以下のコードを純粋関数に書き換えてください：

```typescript
// 😰 外部の配列を直接変更している
type User = { id: number; name: string; email: string };
let users: User[] = [];
let nextId = 1;

function registerUser(name: string, email: string): void {
    users.push({ 
        id: nextId++,  // 外部変数を変更！
        name, 
        email 
    });
    console.log(`ユーザー登録完了: ${name}`); // 副作用！
}
```

??? tip "ヒント1"
    外部変数を使わず、必要な情報は引数で受け取りましょう。

??? tip "ヒント2"
    計算と副作用（console.log）を分けましょう。

??? success "解答"
    ```typescript
    // 😀 純粋関数：新しいユーザーリストを返す
    function registerUser(
        users: User[], 
        nextId: number, 
        name: string, 
        email: string
    ): { users: User[], nextId: number } {
        const newUser = { id: nextId, name, email };
        return {
            users: [...users, newUser],  // 新しい配列を作成
            nextId: nextId + 1           // 次のIDも返す
        };
    }
    
    // 副作用を別関数に
    function notifyUserRegistration(name: string): void {
        console.log(`ユーザー登録完了: ${name}`);
    }
    
    // 使い方
    let userState = { users: [], nextId: 1 };
    
    // ユーザー登録
    const result = registerUser(
        userState.users, 
        userState.nextId, 
        "Alice", 
        "alice@example.com"
    );
    userState = result;
    notifyUserRegistration("Alice");
    
    // さらに登録
    const result2 = registerUser(
        userState.users, 
        userState.nextId, 
        "Bob", 
        "bob@example.com"
    );
    userState = result2;
    notifyUserRegistration("Bob");
    ```

### 📝 演習2: 商品検索機能の分離

以下の商品検索コードを、計算と副作用に分離してください：

```typescript
// 😰 すべてが混ざったコード
type Product = { id: number; name: string; price: number; category: string };

async function searchAndDisplayProducts(keyword: string): Promise<void> {
    // APIからデータ取得（副作用）
    const response = await fetch(`/api/products?search=${keyword}`);
    const products: Product[] = await response.json();
    
    // 検索とソート（計算）
    const filtered = products
        .filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()))
        .sort((a, b) => a.price - b.price);
    
    // 結果を保存（副作用）
    localStorage.setItem('lastSearch', JSON.stringify(filtered));
    
    // 画面に表示（副作用）
    const container = document.getElementById('results')!;
    container.innerHTML = filtered
        .map(p => `<div>${p.name} - ¥${p.price}</div>`)
        .join('');
}
```

??? tip "ヒント1"
    まず「計算」と「副作用」を見分けましょう。
    - 計算：フィルタリング、ソート
    - 副作用：APIコール、localStorage、DOM操作

??? tip "ヒント2"
    計算部分を純粋関数にして、テストしやすくしましょう。

??? success "解答"
    ```typescript
    // 🌱 純粋関数：商品の検索とソート
    function searchProducts(products: Product[], keyword: string): Product[] {
        return products
            .filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()))
            .sort((a, b) => a.price - b.price);
    }
    
    // 🌱 純粋関数：HTMLの生成
    function renderProductsHtml(products: Product[]): string {
        return products
            .map(p => `<div class="product">${p.name} - ¥${p.price}</div>`)
            .join('');
    }
    
    // 💨 副作用：APIからデータ取得
    async function fetchProducts(keyword: string): Promise<Product[]> {
        const response = await fetch(`/api/products?search=${keyword}`);
        return response.json();
    }
    
    // 💨 副作用：ローカルストレージに保存
    function saveSearchResults(products: Product[]): void {
        localStorage.setItem('lastSearch', JSON.stringify(products));
    }
    
    // 💨 副作用：DOMを更新
    function displayProducts(html: string): void {
        const container = document.getElementById('results');
        if (container) {
            container.innerHTML = html;
        }
    }
    
    // 🎯 すべてを組み合わせる
    async function searchAndDisplayProducts(keyword: string): Promise<void> {
        // 1. データを取得（副作用）
        const allProducts = await fetchProducts(keyword);
        
        // 2. 検索とソート（純粋関数）
        const searchResults = searchProducts(allProducts, keyword);
        
        // 3. HTMLを生成（純粋関数）
        const html = renderProductsHtml(searchResults);
        
        // 4. 結果を保存と表示（副作用）
        saveSearchResults(searchResults);
        displayProducts(html);
    }
    
    // 🧪 テストの例（純粋関数はテストが簡単！）
    describe('商品検索', () => {
        it('キーワードでフィルタリングできる', () => {
            const products = [
                { id: 1, name: 'Apple iPhone', price: 100000, category: 'phone' },
                { id: 2, name: 'Apple Watch', price: 50000, category: 'watch' },
                { id: 3, name: 'Samsung Galaxy', price: 80000, category: 'phone' }
            ];
            
            const result = searchProducts(products, 'apple');
            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Apple Watch'); // 価格順
            expect(result[1].name).toBe('Apple iPhone');
        });
    });
    ```

## 📝 この章のまとめ

今日学んだことを振り返りましょう：

### ✅ わかったこと

1. **純粋関数** = 同じ入力なら必ず同じ結果 ＆ 外部に影響なし
2. **副作用** = 関数が計算以外のことをすること（表示、保存など）
3. **参照透過性** = 関数呼び出しを結果で置き換えてもOK

### 🔑 重要なポイント

| 概念 | 良い例 | 悪い例 |
|------|---------|---------|
| **純粋関数** | `add(2, 3) // 必ず5` | `Math.random() // 毎回違う` |
| **副作用なし** | `return x * 2` | `console.log(x)` |
| **参照透過** | `double(5) → 10` | `getId() → 1,2,3...` |

### 💡 実践のコツ

```typescript
// 🎯 純粋関数の書き方
// 1. 必要な情報は全部引数で
// 2. 新しいデータを返す
// 3. 計算と副作用を分ける

// Before: 混在している
function saveAndLog(data) {
    console.log(data);    // 副作用
    db.save(data);        // 副作用
    return data.id;       // 計算
}

// After: 分離する
function getId(data) { return data.id; }     // 純粋関数
function log(data) { console.log(data); }    // 副作用
function save(data) { db.save(data); }       // 副作用
```

### 🏆 純粋関数のメリット

- 🧪 **テストが簡単** - 入力と出力だけ確認すればOK
- 🚀 **並行処理OK** - データ競合の心配なし
- 💾 **キャッシュ可能** - 同じ入力なら結果を再利用

---

準備はできましたか？次は関数をもっと柔軟に使う「高階関数」を学びます！

[第3章: 高階関数 →](../chapter03/index.md){ .md-button .md-button--primary }

!!! question "質問・不明点があれば"
    - 💬 [よくある質問](../appendix/faq.md)をチェック
    - 📚 [用語集](../appendix/glossary.md)で復習
    - 🤝 [GitHubで質問](https://github.com/kmizu/easy-fp/issues)