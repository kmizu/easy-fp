# 第3章: 高階関数

## この章で学ぶこと

- 高階関数の定義と概念
- map, filter, reduce の使い方
- カスタム高階関数の作成
- 実践的な高階関数の活用

## 高階関数とは？

**高階関数（Higher-Order Function）**は、以下のいずれかの条件を満たす関数です：

1. **関数を引数として受け取る**
2. **関数を戻り値として返す**

## JavaScriptの組み込み高階関数

### map - 変換する

`map`は配列の各要素を変換して新しい配列を作成します。

```typescript
const numbers = [1, 2, 3, 4, 5];

// 各要素を2倍にする
const doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// オブジェクトの配列を変換
type User = { id: number; name: string; age: number };
const users: User[] = [
    { id: 1, name: "Alice", age: 25 },
    { id: 2, name: "Bob", age: 30 }
];

const userNames = users.map(user => user.name);
console.log(userNames); // ["Alice", "Bob"]
```

### filter - 絞り込む

`filter`は条件を満たす要素だけを含む新しい配列を作成します。

```typescript
const numbers = [1, 2, 3, 4, 5];

// 偶数だけを抽出
const evens = numbers.filter(n => n % 2 === 0);
console.log(evens); // [2, 4]

// 年齢でフィルタリング
const adults = users.filter(user => user.age >= 18);
```

### reduce - 集約する

`reduce`は配列を単一の値に集約します。

```typescript
const numbers = [1, 2, 3, 4, 5];

// 合計を計算
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log(sum); // 15

// 最大値を見つける
const max = numbers.reduce((max, n) => n > max ? n : max, -Infinity);
console.log(max); // 5

// オブジェクトに変換
const userMap = users.reduce((map, user) => {
    map[user.id] = user;
    return map;
}, {} as Record<number, User>);
```

## カスタム高階関数の作成

### 関数を返す高階関数

```typescript
// 特定の値で乗算する関数を作成
function createMultiplier(factor: number): (n: number) => number {
    return (n: number) => n * factor;
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

### 関数を受け取る高階関数

```typescript
// 配列の要素に対して条件付きで関数を適用
function mapIf<T>(
    array: T[],
    predicate: (value: T) => boolean,
    transform: (value: T) => T
): T[] {
    return array.map(item => 
        predicate(item) ? transform(item) : item
    );
}

// 使用例：偶数だけを2倍にする
const numbers = [1, 2, 3, 4, 5];
const result = mapIf(
    numbers,
    n => n % 2 === 0,
    n => n * 2
);
console.log(result); // [1, 4, 3, 8, 5]
```

## 実践的な高階関数の活用

### パイプライン処理

```typescript
// データ処理のパイプライン
type Product = {
    id: number;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
};

const products: Product[] = [
    { id: 1, name: "Laptop", price: 1000, category: "Electronics", inStock: true },
    { id: 2, name: "Shirt", price: 30, category: "Clothing", inStock: true },
    { id: 3, name: "Phone", price: 800, category: "Electronics", inStock: false },
    { id: 4, name: "Jeans", price: 50, category: "Clothing", inStock: true }
];

// 在庫あり、かつ500円以上の電子機器を価格順で取得
const expensiveElectronics = products
    .filter(p => p.inStock)
    .filter(p => p.category === "Electronics")
    .filter(p => p.price >= 500)
    .sort((a, b) => b.price - a.price)
    .map(p => ({ name: p.name, price: p.price }));

console.log(expensiveElectronics);
// [{ name: "Laptop", price: 1000 }]
```

### 関数の合成

```typescript
// 複数の変換を組み合わせる
function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
    return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

// 文字列処理の例
const trim = (s: string) => s.trim();
const toLowerCase = (s: string) => s.toLowerCase();
const removeSpaces = (s: string) => s.replace(/\s+/g, '-');

const slugify = compose(trim, toLowerCase, removeSpaces);

console.log(slugify("  Hello World  ")); // "hello-world"
```

### デバウンスとスロットル

```typescript
// デバウンス：最後の呼び出しから一定時間後に実行
function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

// スロットル：一定時間に1回だけ実行
function throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;
    
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
```

## 高階関数のメリット

1. **抽象化** - 共通のパターンを関数として抽出
2. **再利用性** - 同じロジックを様々な場面で使用
3. **合成可能** - 小さな関数を組み合わせて複雑な処理を構築
4. **テストしやすい** - 小さな単位でテスト可能

## 実践演習

### 演習1: カスタムfilter関数

`filter`と同じ動作をする関数を実装してください：

```typescript
function myFilter<T>(
    array: T[],
    predicate: (value: T) => boolean
): T[] {
    // ここに実装
}
```

??? success "解答"
    ```typescript
    function myFilter<T>(
        array: T[],
        predicate: (value: T) => boolean
    ): T[] {
        const result: T[] = [];
        for (const item of array) {
            if (predicate(item)) {
                result.push(item);
            }
        }
        return result;
    }
    
    // または reduce を使った実装
    function myFilter<T>(
        array: T[],
        predicate: (value: T) => boolean
    ): T[] {
        return array.reduce((acc, item) => {
            if (predicate(item)) {
                acc.push(item);
            }
            return acc;
        }, [] as T[]);
    }
    ```

### 演習2: グループ化関数

配列の要素を指定されたキーでグループ化する関数を作成してください：

```typescript
function groupBy<T, K extends string | number>(
    array: T[],
    keySelector: (item: T) => K
): Record<K, T[]> {
    // ここに実装
}

// 使用例
const people = [
    { name: "Alice", age: 25, city: "Tokyo" },
    { name: "Bob", age: 30, city: "Tokyo" },
    { name: "Charlie", age: 25, city: "Osaka" }
];

const byAge = groupBy(people, p => p.age);
// { 25: [{Alice}, {Charlie}], 30: [{Bob}] }
```

??? success "解答"
    ```typescript
    function groupBy<T, K extends string | number>(
        array: T[],
        keySelector: (item: T) => K
    ): Record<K, T[]> {
        return array.reduce((groups, item) => {
            const key = keySelector(item);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {} as Record<K, T[]>);
    }
    ```

## まとめ

この章では、高階関数について学びました：

- ✅ 高階関数は関数を引数に取るか、関数を返す関数
- ✅ map, filter, reduce は最も重要な高階関数
- ✅ カスタム高階関数により、より抽象的で再利用可能なコードが書ける
- ✅ 高階関数を組み合わせることで、複雑な処理を簡潔に表現できる

次の章では、関数を組み合わせる「関数合成とパイプライン」について詳しく学びます。

[第4章: 関数合成とパイプライン →](../chapter04/index.md){ .md-button .md-button--primary }