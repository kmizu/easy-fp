# 第2章: 純粋関数と副作用

## この章で学ぶこと

- 純粋関数の定義と特徴
- 副作用とは何か
- 参照透過性の概念
- 実践的な純粋関数の書き方

## 純粋関数とは？

**純粋関数（Pure Function）**は、関数型プログラミングの中核となる概念です。

### 純粋関数の2つの条件

1. **同じ入力に対して常に同じ出力を返す**
2. **副作用を持たない**

### 純粋関数の例

```typescript
// 純粋関数
function add(a: number, b: number): number {
    return a + b;
}

// 常に同じ結果
console.log(add(2, 3)); // 5
console.log(add(2, 3)); // 5
console.log(add(2, 3)); // 5
```

### 純粋でない関数の例

```typescript
// 外部の変数に依存
let taxRate = 0.1;

function calculatePrice(price: number): number {
    return price * (1 + taxRate); // 外部変数に依存
}

// 純粋でない：外部の状態によって結果が変わる
console.log(calculatePrice(100)); // 110
taxRate = 0.2;
console.log(calculatePrice(100)); // 120
```

## 副作用とは？

**副作用（Side Effect）**とは、関数の実行が外部の状態に影響を与えることです。

### 一般的な副作用の種類

1. **グローバル変数の変更**
2. **ファイルシステムへの書き込み**
3. **データベースへのアクセス**
4. **HTTPリクエスト**
5. **コンソールへの出力**
6. **DOM操作**

### 副作用の例

```typescript
// 副作用あり：グローバル変数を変更
let count = 0;

function incrementCounter(): number {
    count++; // 副作用：外部の状態を変更
    return count;
}

// 副作用あり：コンソール出力
function logUser(user: User): void {
    console.log(user); // 副作用：外部への出力
}

// 副作用あり：DOM操作
function updateTitle(title: string): void {
    document.title = title; // 副作用：DOMを変更
}
```

## 参照透過性

**参照透過性（Referential Transparency）**は、式をその評価結果で置き換えても、プログラムの動作が変わらない性質です。

### 参照透過な例

```typescript
// 純粋関数
function double(x: number): number {
    return x * 2;
}

// 以下の2つは同じ結果
const result1 = double(5) + double(3);
const result2 = 10 + 6; // double(5)を10に、double(3)を6に置き換え

console.log(result1 === result2); // true
```

### 参照透過でない例

```typescript
let counter = 0;

function getNextId(): number {
    return ++counter; // 副作用あり
}

// 以下の2つは異なる結果
const result1 = getNextId() + getNextId(); // 1 + 2 = 3
const result2 = getNextId() + getNextId(); // 3 + 4 = 7

console.log(result1 === result2); // false
```

## 純粋関数の実践的な書き方

### 1. 引数として必要な値をすべて受け取る

```typescript
// 悪い例：外部の設定に依存
const config = { apiUrl: "https://api.example.com" };

function fetchUserBad(id: number) {
    return fetch(`${config.apiUrl}/users/${id}`); // 外部変数に依存
}

// 良い例：設定を引数として受け取る
function fetchUserGood(id: number, apiUrl: string) {
    return fetch(`${apiUrl}/users/${id}`);
}
```

### 2. 新しいデータを返す

```typescript
// 悪い例：引数を直接変更
function sortArrayBad(array: number[]): number[] {
    return array.sort(); // 元の配列を変更してしまう
}

// 良い例：新しい配列を返す
function sortArrayGood(array: number[]): number[] {
    return [...array].sort(); // コピーしてからソート
}
```

### 3. 計算と副作用を分離する

```typescript
// 悪い例：計算と副作用が混在
function calculateAndLogTotal(prices: number[]): number {
    const total = prices.reduce((sum, price) => sum + price, 0);
    console.log(`Total: ${total}`); // 副作用
    return total;
}

// 良い例：計算と副作用を分離
function calculateTotal(prices: number[]): number {
    return prices.reduce((sum, price) => sum + price, 0);
}

function logTotal(total: number): void {
    console.log(`Total: ${total}`);
}

// 使用例
const total = calculateTotal([10, 20, 30]);
logTotal(total); // 副作用は別の場所で
```

## 純粋関数のメリット

### 1. テストが簡単

```typescript
// 純粋関数のテスト
describe('add', () => {
    it('should add two numbers', () => {
        expect(add(2, 3)).toBe(5);
        expect(add(-1, 1)).toBe(0);
        expect(add(0, 0)).toBe(0);
    });
});
```

### 2. 並行処理で安全

```typescript
// 純粋関数は並行実行しても安全
const results = await Promise.all([
    processData(data1),
    processData(data2),
    processData(data3)
]);
```

### 3. メモ化が可能

```typescript
// 結果をキャッシュできる
function memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
    const cache = new Map<T, R>();
    
    return (arg: T): R => {
        if (cache.has(arg)) {
            return cache.get(arg)!;
        }
        const result = fn(arg);
        cache.set(arg, result);
        return result;
    };
}

const expensiveCalculation = memoize((n: number) => {
    // 重い計算
    return n * n;
});
```

## 実践演習

### 演習1: 純粋関数に書き換える

以下の関数を純粋関数に書き換えてください：

```typescript
let users: User[] = [];

function addUser(name: string): void {
    users.push({ id: users.length + 1, name });
}
```

??? success "解答"
    ```typescript
    function addUser(users: User[], name: string): User[] {
        const newUser = { id: users.length + 1, name };
        return [...users, newUser];
    }
    
    // 使用例
    let users: User[] = [];
    users = addUser(users, "Alice");
    users = addUser(users, "Bob");
    ```

### 演習2: 副作用を分離する

以下のコードの副作用を分離してください：

```typescript
async function processUserData(userId: number): Promise<void> {
    const response = await fetch(`/api/users/${userId}`);
    const user = await response.json();
    const processedData = {
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
        isActive: user.status === 'active'
    };
    localStorage.setItem(`user-${userId}`, JSON.stringify(processedData));
    console.log('User processed:', processedData);
}
```

??? success "解答"
    ```typescript
    // 純粋関数：データ変換
    function transformUserData(user: RawUser): ProcessedUser {
        return {
            ...user,
            fullName: `${user.firstName} ${user.lastName}`,
            isActive: user.status === 'active'
        };
    }
    
    // 副作用：データ取得
    async function fetchUser(userId: number): Promise<RawUser> {
        const response = await fetch(`/api/users/${userId}`);
        return response.json();
    }
    
    // 副作用：データ保存
    function saveToLocalStorage(userId: number, data: ProcessedUser): void {
        localStorage.setItem(`user-${userId}`, JSON.stringify(data));
    }
    
    // 副作用：ログ出力
    function logProcessedUser(data: ProcessedUser): void {
        console.log('User processed:', data);
    }
    
    // 組み合わせて使用
    async function processUserData(userId: number): Promise<void> {
        const user = await fetchUser(userId);
        const processedData = transformUserData(user);
        saveToLocalStorage(userId, processedData);
        logProcessedUser(processedData);
    }
    ```

## まとめ

この章では、純粋関数と副作用について学びました：

- ✅ 純粋関数は同じ入力に対して常に同じ出力を返し、副作用を持たない
- ✅ 副作用は外部の状態に影響を与える操作
- ✅ 参照透過性により、式を結果で置き換えても動作が変わらない
- ✅ 純粋関数はテストしやすく、並行処理で安全で、メモ化が可能

次の章では、関数を値として扱う「高階関数」について学びます。

[第3章: 高階関数 →](../chapter03/index.md){ .md-button .md-button--primary }