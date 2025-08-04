# 用語集

関数型プログラミングでよく使われる用語を、初心者にもわかりやすく説明します。

## 🔤 アルファベット順

### F

#### **First-class Function（第一級関数）**
関数を変数に代入したり、他の関数の引数として渡したり、戻り値として返したりできる性質のこと。

```typescript
// 関数を変数に代入
const add = (a: number, b: number) => a + b;

// 関数を引数として渡す
[1, 2, 3].map(x => x * 2);
```

#### **Functional Programming（関数型プログラミング）**
関数を中心にプログラムを組み立てる考え方。データの変更を避け、新しいデータを作成することを重視する。

### H

#### **Higher-order Function（高階関数）**
関数を引数に取ったり、関数を返したりする関数のこと。

```typescript
// mapは高階関数（関数を引数に取る）
const doubled = [1, 2, 3].map(x => x * 2);
```

### I

#### **Immutability（イミュータビリティ、不変性）**
一度作成されたデータを変更しない性質。新しいデータを作成することで状態を更新する。

```typescript
// ❌ ミュータブル（変更する）
array.push(item);

// ✅ イミュータブル（新しい配列を作る）
const newArray = [...array, item];
```

### M

#### **Memoization（メモ化）**
関数の実行結果をキャッシュして、同じ引数で呼び出されたときに再計算を避ける最適化手法。

```typescript
const memoize = (fn) => {
    const cache = {};
    return (arg) => {
        if (arg in cache) return cache[arg];
        return cache[arg] = fn(arg);
    };
};
```

### P

#### **Pure Function（純粋関数）**
同じ入力に対して常に同じ出力を返し、副作用を持たない関数。

```typescript
// 純粋関数
const add = (a: number, b: number) => a + b;

// 純粋でない（外部変数に依存）
let total = 0;
const addToTotal = (n: number) => { total += n; };
```

### R

#### **Referential Transparency（参照透過性）**
式をその評価結果で置き換えても、プログラムの動作が変わらない性質。

```typescript
// double(5)を10に置き換えても同じ
const result1 = double(5) + 3;  // 13
const result2 = 10 + 3;          // 13
```

### S

#### **Side Effect（副作用）**
関数が計算結果を返す以外に、外部の状態に影響を与えること。

```typescript
// 副作用の例
console.log("Hello");           // コンソール出力
document.title = "New Title";   // DOM操作
localStorage.setItem("key", "value"); // ストレージ操作
```

## 🇯🇵 五十音順

### あ行

#### **イミュータビリティ（不変性）**
→ [Immutability](#immutability-1)を参照

### か行

#### **カリー化**
複数の引数を取る関数を、1つずつ引数を取る関数の連鎖に変換すること。

```typescript
// 通常の関数
const add = (a: number, b: number) => a + b;

// カリー化された関数
const curriedAdd = (a: number) => (b: number) => a + b;
const add5 = curriedAdd(5); // 5を足す関数
```

#### **関数合成**
複数の関数を組み合わせて新しい関数を作ること。

```typescript
const compose = (f, g) => (x) => f(g(x));
const addOne = x => x + 1;
const double = x => x * 2;
const addOneThenDouble = compose(double, addOne);
```

#### **高階関数**
→ [Higher-order Function](#higher-order-function)を参照

### さ行

#### **参照透過性**
→ [Referential Transparency](#referential-transparency)を参照

#### **純粋関数**
→ [Pure Function](#pure-function)を参照

### は行

#### **副作用**
→ [Side Effect](#side-effect)を参照

#### **部分適用**
関数の一部の引数を固定して、新しい関数を作ること。

```typescript
const greet = (greeting: string, name: string) => 
    `${greeting}, ${name}!`;

// 部分適用
const sayHello = (name: string) => greet("Hello", name);
sayHello("Alice"); // "Hello, Alice!"
```

### ま行

#### **メモ化**
→ [Memoization](#memoization)を参照

## 💡 よく混同される用語

### イミュータブル vs コンスタント

- **const（定数）**: 変数の再代入を防ぐ
- **イミュータブル**: データ自体の変更を防ぐ

```typescript
const array = [1, 2, 3];
array.push(4);  // constでも配列の中身は変更できる！

// イミュータブルな操作
const newArray = [...array, 4]; // 新しい配列を作る
```

### 純粋関数 vs 副作用のない関数

- **純粋関数**: 同じ入力→同じ出力 AND 副作用なし
- **副作用のない関数**: 副作用はないが、ランダムな値を返すなど、同じ入力でも結果が変わる可能性がある

### カリー化 vs 部分適用

- **カリー化**: n個の引数を取る関数を、1個ずつ引数を取るn個の関数に変換
- **部分適用**: 関数の一部の引数を固定（任意の個数）

## 📚 関連用語

- **ラムダ式**: 無名関数のこと。`x => x * 2`のような書き方
- **クロージャ**: 関数が外部の変数を記憶する仕組み
- **モナド**: エラー処理や非同期処理を扱うためのパターン（上級編）

---

!!! tip "学習のコツ"
    すべての用語を一度に覚える必要はありません。コードを書きながら、必要に応じて確認しましょう。