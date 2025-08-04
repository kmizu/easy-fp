# 第5章: カリー化と部分適用

## この章で学ぶこと

- カリー化の概念と仕組み
- 部分適用との違い
- TypeScriptでのカリー化の実装
- 実践的な使用例

## カリー化とは？

**カリー化（Currying）**は、複数の引数を取る関数を、1つの引数を取る関数の連鎖に変換する技法です。

### 基本的な例

```typescript
// 通常の関数
function add(a: number, b: number): number {
    return a + b;
}

// カリー化された関数
function addCurried(a: number): (b: number) => number {
    return (b: number) => a + b;
}

// 使用例
const add5 = addCurried(5);
console.log(add5(3)); // 8
console.log(add5(7)); // 12

// 直接呼び出し
console.log(addCurried(5)(3)); // 8
```

## カリー化の実装

### 手動でのカリー化

```typescript
// 3引数の関数をカリー化
function multiply(a: number): (b: number) => (c: number) => number {
    return (b: number) => (c: number) => a * b * c;
}

const result = multiply(2)(3)(4); // 24

// 段階的な適用
const multiplyBy2 = multiply(2);
const multiplyBy2And3 = multiplyBy2(3);
const final = multiplyBy2And3(4); // 24
```

### 汎用的なcurry関数

```typescript
// 2引数関数用のcurry
function curry2<A, B, C>(
    fn: (a: A, b: B) => C
): (a: A) => (b: B) => C {
    return (a: A) => (b: B) => fn(a, b);
}

// 使用例
const add = (a: number, b: number) => a + b;
const curriedAdd = curry2(add);

console.log(curriedAdd(5)(3)); // 8
```

### 可変長引数のcurry

```typescript
// より柔軟なcurry実装
function curry<T extends (...args: any[]) => any>(
    fn: T,
    ...args: any[]
): any {
    if (args.length >= fn.length) {
        return fn(...args);
    }
    return (...nextArgs: any[]) => 
        curry(fn, ...args, ...nextArgs);
}

// 使用例
const sum = (a: number, b: number, c: number) => a + b + c;
const curriedSum = curry(sum);

console.log(curriedSum(1)(2)(3)); // 6
console.log(curriedSum(1, 2)(3)); // 6
console.log(curriedSum(1)(2, 3)); // 6
```

## 部分適用との違い

**部分適用（Partial Application）**は、関数にいくつかの引数を固定して、残りの引数を受け取る新しい関数を作ることです。

```typescript
// 部分適用
function partial<T extends any[], U extends any[], R>(
    fn: (...args: [...T, ...U]) => R,
    ...fixedArgs: T
): (...remainingArgs: U) => R {
    return (...remainingArgs: U) => 
        fn(...fixedArgs, ...remainingArgs);
}

// 使用例
const greet = (greeting: string, name: string, punctuation: string) => 
    `${greeting}, ${name}${punctuation}`;

const sayHello = partial(greet, "Hello");
console.log(sayHello("Alice", "!")); // "Hello, Alice!"

const sayHelloAlice = partial(greet, "Hello", "Alice");
console.log(sayHelloAlice(".")); // "Hello, Alice."
```

### カリー化 vs 部分適用

| カリー化 | 部分適用 |
|---------|--------|
| 常に1つの引数を取る関数を返す | 任意の数の引数を固定できる |
| 完全に適用されるまで関数を返し続ける | 一度の適用で新しい関数を作る |
| 数学的な概念に基づく | より実用的なアプローチ |

## 実践的な使用例

### 設定可能な処理の作成

```typescript
// ログ出力関数
const log = curry(
    (level: string, timestamp: Date, message: string) => {
        console.log(`[${level}] ${timestamp.toISOString()}: ${message}`);
    }
);

// 特定のログレベルの関数を作成
const info = log("INFO");
const error = log("ERROR");
const debug = log("DEBUG");

// 現在時刻でログ出力
const now = new Date();
info(now)("Application started");
error(now)("Connection failed");
```

### データ処理パイプライン

```typescript
// フィルタリング関数
const filter = curry(
    <T>(predicate: (item: T) => boolean, array: T[]) => 
        array.filter(predicate)
);

// マッピング関数
const map = curry(
    <T, U>(fn: (item: T) => U, array: T[]) => 
        array.map(fn)
);

// 特定の条件でフィルタリング
const filterActive = filter((user: User) => user.isActive);
const filterAdults = filter((user: User) => user.age >= 18);

// 変換関数
const getName = map((user: User) => user.name);
const toUpperCase = map((name: string) => name.toUpperCase());

// パイプラインの構築
const getActiveAdultNames = pipe(
    filterActive,
    filterAdults,
    getName,
    toUpperCase
);
```

### イベントハンドラーの作成

```typescript
// イベントハンドラー生成関数
const createHandler = curry(
    (eventType: string, selector: string, callback: Function) => {
        document.querySelectorAll(selector).forEach(element => {
            element.addEventListener(eventType, callback as EventListener);
        });
    }
);

// 特定のイベントタイプのハンドラー
const onClick = createHandler("click");
const onHover = createHandler("mouseenter");

// 使用例
onClick(".button")(() => console.log("Button clicked"));
onClick(".link")(() => console.log("Link clicked"));
onHover(".card")(() => console.log("Card hovered"));
```

### バリデーション関数の組み合わせ

```typescript
// バリデーション関数
const minLength = curry(
    (min: number, value: string) => 
        value.length >= min || `Must be at least ${min} characters`
);

const maxLength = curry(
    (max: number, value: string) => 
        value.length <= max || `Must be at most ${max} characters`
);

const matches = curry(
    (pattern: RegExp, value: string) => 
        pattern.test(value) || `Does not match required pattern`
);

// 特定のバリデーションルール
const minLength8 = minLength(8);
const maxLength20 = maxLength(20);
const hasNumber = matches(/\d/);
const hasUpperCase = matches(/[A-Z]/);

// パスワードバリデーション
const validatePassword = (password: string) => {
    const validators = [minLength8, maxLength20, hasNumber, hasUpperCase];
    
    for (const validate of validators) {
        const result = validate(password);
        if (result !== true) {
            return { valid: false, error: result };
        }
    }
    
    return { valid: true };
};
```

## 実践演習

### 演習1: 計算機能のカリー化

以下の計算関数をカリー化してください：

```typescript
function calculate(operation: string, a: number, b: number): number {
    switch (operation) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return a / b;
        default: throw new Error("Unknown operation");
    }
}

// カリー化バージョンを実装
function calculateCurried(/* ... */) {
    // 実装
}
```

??? success "解答"
    ```typescript
    function calculateCurried(operation: string) {
        return (a: number) => (b: number) => {
            switch (operation) {
                case "+": return a + b;
                case "-": return a - b;
                case "*": return a * b;
                case "/": return a / b;
                default: throw new Error("Unknown operation");
            }
        };
    }
    
    // 使用例
    const add = calculateCurried("+");
    const multiply = calculateCurried("*");
    
    console.log(add(5)(3)); // 8
    console.log(multiply(4)(7)); // 28
    
    // 便利な関数を作成
    const double = multiply(2);
    const increment = add(1);
    
    console.log(double(10)); // 20
    console.log(increment(5)); // 6
    ```

### 演習2: 関数合成とカリー化

カリー化を使ってデータ変換パイプラインを作成してください：

```typescript
type Product = {
    name: string;
    price: number;
    category: string;
};

// 以下の機能を実装
// 1. カテゴリーでフィルタリング
// 2. 価格に税金を追加
// 3. 価格でソート
```

??? success "解答"
    ```typescript
    const filterByCategory = curry(
        (category: string, products: Product[]) =>
            products.filter(p => p.category === category)
    );
    
    const addTax = curry(
        (taxRate: number, products: Product[]) =>
            products.map(p => ({
                ...p,
                price: p.price * (1 + taxRate)
            }))
    );
    
    const sortByPrice = curry(
        (order: "asc" | "desc", products: Product[]) =>
            [...products].sort((a, b) => 
                order === "asc" ? a.price - b.price : b.price - a.price
            )
    );
    
    // パイプラインの作成
    const getElectronicsWithTax = pipe(
        filterByCategory("Electronics"),
        addTax(0.1), // 10%の税金
        sortByPrice("asc")
    );
    
    // 使用例
    const products: Product[] = [
        { name: "Laptop", price: 1000, category: "Electronics" },
        { name: "Shirt", price: 50, category: "Clothing" },
        { name: "Phone", price: 800, category: "Electronics" }
    ];
    
    const result = getElectronicsWithTax(products);
    // [{ name: "Phone", price: 880, ... }, { name: "Laptop", price: 1100, ... }]
    ```

## まとめ

この章では、カリー化と部分適用について学びました：

- ✅ カリー化は複数引数の関数を1引数関数の連鎖に変換
- ✅ 部分適用は引数を段階的に固定する技法
- ✅ カリー化により、設定可能で再利用可能な関数を作成できる
- ✅ 関数合成と組み合わせることで、強力なデータ処理パイプラインを構築できる

次の章では、イミュータブルなデータ操作を実現する「関数型データ構造」について学びます。

[第6章: 関数型データ構造 →](../chapter06/index.md){ .md-button .md-button--primary }