# 第4章: 関数合成とパイプライン

## この章で学ぶこと

- 関数合成の基礎
- compose と pipe の実装と使い方
- ポイントフリースタイル
- 実践的なデータ変換パイプライン

## 関数合成とは？

**関数合成（Function Composition）**は、複数の関数を組み合わせて新しい関数を作る技法です。

数学の関数合成 `(f ∘ g)(x) = f(g(x))` をプログラミングで実現します。

### 基本的な例

```typescript
// 2つの関数
const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;

// 手動で合成
const addOneThenDouble = (x: number) => double(addOne(x));

console.log(addOneThenDouble(3)); // (3 + 1) * 2 = 8
```

## compose関数の実装

`compose`は右から左へ関数を適用します（数学的な関数合成と同じ）。

```typescript
// 2つの関数を合成
function compose<A, B, C>(
    f: (b: B) => C,
    g: (a: A) => B
): (a: A) => C {
    return (a: A) => f(g(a));
}

// 使用例
const addOneThenDouble = compose(double, addOne);
console.log(addOneThenDouble(3)); // 8
```

### 可変長引数のcompose

```typescript
// 任意の数の関数を合成
function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
    return (arg: T) => 
        fns.reduceRight((acc, fn) => fn(acc), arg);
}

// 複数の関数を合成
const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;
const square = (x: number) => x * x;

const composed = compose(square, double, addOne);
// (x + 1) * 2 の結果を2乗
console.log(composed(3)); // ((3 + 1) * 2)² = 64
```

## pipe関数の実装

`pipe`は左から右へ関数を適用します（より直感的）。

```typescript
// pipe関数の実装
function pipe<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
    return (arg: T) => 
        fns.reduce((acc, fn) => fn(acc), arg);
}

// 使用例
const piped = pipe(addOne, double, square);
// 左から右へ：(3 + 1) * 2 の結果を2乗
console.log(piped(3)); // 64
```

### 型安全なpipe

```typescript
// 型安全な2引数pipe
function pipe<A, B, C>(
    f: (a: A) => B,
    g: (b: B) => C
): (a: A) => C {
    return (a: A) => g(f(a));
}

// 型安全な3引数pipe
function pipe<A, B, C, D>(
    f: (a: A) => B,
    g: (b: B) => C,
    h: (c: C) => D
): (a: A) => D {
    return (a: A) => h(g(f(a)));
}
```

## ポイントフリースタイル

**ポイントフリースタイル（Point-free Style）**は、引数を明示的に書かずに関数を定義するスタイルです。

```typescript
// ポイントフルスタイル（通常のスタイル）
const getUpperCaseNames = (users: User[]) => 
    users.map(user => user.name.toUpperCase());

// ポイントフリースタイル
const getName = (user: User) => user.name;
const toUpperCase = (str: string) => str.toUpperCase();
const map = <T, U>(fn: (t: T) => U) => (array: T[]) => array.map(fn);

const getUpperCaseNames = pipe(
    map(getName),
    map(toUpperCase)
);
```

## 実践的なデータ変換パイプライン

### 文字列処理パイプライン

```typescript
// 文字列処理の関数群
const trim = (str: string) => str.trim();
const toLowerCase = (str: string) => str.toLowerCase();
const removeSpecialChars = (str: string) => 
    str.replace(/[^a-z0-9\s-]/g, '');
const replaceSpaces = (str: string) => 
    str.replace(/\s+/g, '-');
const removeConsecutiveDashes = (str: string) => 
    str.replace(/-+/g, '-');

// URLスラッグ生成パイプライン
const createSlug = pipe(
    trim,
    toLowerCase,
    removeSpecialChars,
    replaceSpaces,
    removeConsecutiveDashes
);

console.log(createSlug("  Hello, World! 123  "));
// "hello-world-123"
```

### データ処理パイプライン

```typescript
type Sale = {
    productId: string;
    quantity: number;
    price: number;
    date: Date;
    customerId: string;
};

// 売上データの集計パイプライン
const salesData: Sale[] = [
    { productId: "A", quantity: 2, price: 100, date: new Date("2024-01-01"), customerId: "C1" },
    { productId: "B", quantity: 1, price: 200, date: new Date("2024-01-02"), customerId: "C2" },
    { productId: "A", quantity: 3, price: 100, date: new Date("2024-01-03"), customerId: "C1" },
];

// ヘルパー関数
const calculateTotal = (sale: Sale) => ({
    ...sale,
    total: sale.quantity * sale.price
});

const filterByProduct = (productId: string) => 
    (sales: Sale[]) => sales.filter(s => s.productId === productId);

const sumBy = <T>(fn: (item: T) => number) => 
    (items: T[]) => items.reduce((sum, item) => sum + fn(item), 0);

// 特定商品の売上合計を計算
const getProductRevenue = (productId: string) => pipe(
    filterByProduct(productId),
    map(calculateTotal),
    sumBy((sale: Sale & { total: number }) => sale.total)
);

const productARevenue = getProductRevenue("A")(salesData);
console.log(productARevenue); // 500
```

### 非同期パイプライン

```typescript
// 非同期関数の合成
function pipeAsync<T>(...fns: Array<(arg: T) => Promise<T>>): (arg: T) => Promise<T> {
    return (arg: T) => 
        fns.reduce(
            (promise, fn) => promise.then(fn),
            Promise.resolve(arg)
        );
}

// API呼び出しのパイプライン
const fetchUser = async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
};

const enrichUserData = async (user: any) => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
    age: new Date().getFullYear() - new Date(user.birthDate).getFullYear()
});

const filterSensitiveData = async (user: any) => {
    const { password, ssn, ...safeUser } = user;
    return safeUser;
};

// ユーザーデータ取得パイプライン
const getUserData = pipeAsync(
    fetchUser,
    enrichUserData,
    filterSensitiveData
);
```

## パイプライン演算子の代替

TypeScriptにはパイプライン演算子がないため、以下のような代替手法があります：

```typescript
// メソッドチェーン風のパイプ
class Pipe<T> {
    constructor(private value: T) {}
    
    pipe<U>(fn: (value: T) => U): Pipe<U> {
        return new Pipe(fn(this.value));
    }
    
    getValue(): T {
        return this.value;
    }
}

// 使用例
const result = new Pipe(5)
    .pipe(x => x + 1)
    .pipe(x => x * 2)
    .pipe(x => x * x)
    .getValue();

console.log(result); // 144
```

## 実践演習

### 演習1: composeAll関数

異なる型を扱える`composeAll`関数を実装してください：

```typescript
// ヒント：型の配列を使用
function composeAll<T extends any[]>(...fns: T): any {
    // 実装
}
```

??? success "解答"
    ```typescript
    type Func = (arg: any) => any;
    
    function composeAll<T extends Func[]>(...fns: T): 
        T extends [...infer Rest, (arg: infer A) => infer B] 
            ? Rest extends [(arg: any) => A, ...Func[]]
                ? (arg: Parameters<Rest[0]>[0]) => B
                : never
            : never {
        return ((arg: any) => 
            fns.reduceRight((acc, fn) => fn(acc), arg)
        ) as any;
    }
    
    // 使用例
    const parseFloat = (s: string) => Number.parseFloat(s);
    const addOne = (n: number) => n + 1;
    const toString = (n: number) => n.toString();
    
    const composed = composeAll(toString, addOne, parseFloat);
    // composed: (arg: string) => string
    ```

### 演習2: データ変換パイプライン

商品の在庫管理システムのデータ変換パイプラインを作成してください：

```typescript
type RawProduct = {
    id: string;
    name: string;
    price: string; // 文字列で受信
    stock: string; // 文字列で受信
    tags: string;  // カンマ区切り
};

type Product = {
    id: string;
    name: string;
    price: number;
    stock: number;
    tags: string[];
    available: boolean;
    priceWithTax: number;
};

// この変換パイプラインを実装してください
const transformProduct = pipe(/* ... */);
```

??? success "解答"
    ```typescript
    const parsePrice = (product: RawProduct) => ({
        ...product,
        price: parseFloat(product.price)
    });
    
    const parseStock = (product: any) => ({
        ...product,
        stock: parseInt(product.stock, 10)
    });
    
    const parseTags = (product: any) => ({
        ...product,
        tags: product.tags.split(',').map((t: string) => t.trim())
    });
    
    const addAvailability = (product: any) => ({
        ...product,
        available: product.stock > 0
    });
    
    const addPriceWithTax = (taxRate: number) => (product: any) => ({
        ...product,
        priceWithTax: product.price * (1 + taxRate)
    });
    
    const transformProduct = pipe(
        parsePrice,
        parseStock,
        parseTags,
        addAvailability,
        addPriceWithTax(0.1) // 10%の税率
    );
    ```

## まとめ

この章では、関数合成とパイプラインについて学びました：

- ✅ 関数合成により小さな関数から複雑な処理を構築できる
- ✅ composeは右から左、pipeは左から右に関数を適用
- ✅ ポイントフリースタイルでより宣言的なコードが書ける
- ✅ パイプラインにより、データ変換の流れが明確になる

次の章では、関数の部分適用を可能にする「カリー化」について学びます。

[第5章: カリー化と部分適用 →](../chapter05/index.md){ .md-button .md-button--primary }