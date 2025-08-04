# 第1章: 関数型プログラミングの基礎

## この章で学ぶこと

- 関数型プログラミングとは何か
- 命令型プログラミングとの違い
- TypeScriptで関数型プログラミングを学ぶメリット
- イミュータビリティ（不変性）の基本

## 関数型プログラミングとは？

関数型プログラミング（Functional Programming, FP）は、**関数を中心に据えたプログラミングパラダイム**です。

### 主な特徴

1. **関数が第一級オブジェクト** - 関数を変数に代入したり、引数として渡したりできる
2. **イミュータビリティ** - データは不変で、新しいデータを作成する
3. **副作用の最小化** - 関数の外部に影響を与えない
4. **宣言的プログラミング** - 「何をするか」を記述する

## 命令型 vs 関数型

同じ問題を2つのアプローチで解いてみましょう。

### 例: 配列の合計を求める

=== "命令型アプローチ"

    ```typescript
    function sumImperative(numbers: number[]): number {
        let total = 0;
        for (let i = 0; i < numbers.length; i++) {
            total += numbers[i];  // 状態を変更
        }
        return total;
    }

    const result = sumImperative([1, 2, 3, 4, 5]);
    console.log(result); // 15
    ```

=== "関数型アプローチ"

    ```typescript
    function sumFunctional(numbers: number[]): number {
        return numbers.reduce((acc, num) => acc + num, 0);
    }

    const result = sumFunctional([1, 2, 3, 4, 5]);
    console.log(result); // 15
    ```

### 違いのポイント

| 命令型 | 関数型 |
|--------|--------|
| HOW（どのように）を記述 | WHAT（何を）を記述 |
| 状態を変更する | 新しい値を生成する |
| forループで反復 | 高階関数（reduce）を使用 |

## TypeScriptで関数型プログラミングを学ぶメリット

### 1. 強力な型システム

TypeScriptの型システムは関数型プログラミングと相性が良い：

```typescript
// 関数の型を明確に定義
type MapFunction<T, U> = (value: T) => U;

// ジェネリクスで汎用的な関数を作成
function map<T, U>(array: T[], fn: MapFunction<T, U>): U[] {
    return array.map(fn);
}

// 型安全に使用
const numbers = [1, 2, 3];
const doubled = map(numbers, x => x * 2); // number[]型と推論される
```

### 2. 実用的な学習

TypeScriptは実際の開発で広く使われているため、学んだことをすぐに活用できます。

### 3. 段階的な導入

既存のTypeScriptコードに、少しずつ関数型のパターンを導入できます。

## イミュータビリティ（不変性）

関数型プログラミングの核心的な概念の一つが**イミュータビリティ**です。

### ミュータブル（可変）な例

```typescript
// 悪い例：元の配列を変更
const users = [
    { id: 1, name: "Alice", age: 25 },
    { id: 2, name: "Bob", age: 30 }
];

// 元の配列を直接変更してしまう
users[0].age = 26;
console.log(users[0].age); // 26 - 元のデータが変更された！
```

### イミュータブル（不変）な例

```typescript
// 良い例：新しいオブジェクトを作成
const users = [
    { id: 1, name: "Alice", age: 25 },
    { id: 2, name: "Bob", age: 30 }
];

// 新しい配列を作成
const updatedUsers = users.map(user =>
    user.id === 1 
        ? { ...user, age: 26 }  // スプレッド構文で新しいオブジェクトを作成
        : user
);

console.log(users[0].age);        // 25 - 元のデータは変更されない
console.log(updatedUsers[0].age); // 26 - 新しいデータ
```

### イミュータビリティのメリット

1. **予測可能性** - データがいつ、どこで変更されたか追跡しやすい
2. **バグの減少** - 意図しない変更による副作用を防げる
3. **並行処理** - データ競合の心配がない
4. **デバッグが容易** - 状態の履歴を追跡できる

## 実践演習

### 演習1: イミュータブルな更新

以下のコードをイミュータブルに書き換えてください：

```typescript
// ミュータブルなコード
function addTodo(todos: Todo[], newTodo: Todo): Todo[] {
    todos.push(newTodo);
    return todos;
}
```

??? success "解答"
    ```typescript
    // イミュータブルなコード
    function addTodo(todos: Todo[], newTodo: Todo): Todo[] {
        return [...todos, newTodo];  // 新しい配列を作成
    }
    ```

### 演習2: 関数型スタイルで書き換え

以下の命令型コードを関数型スタイルで書き換えてください：

```typescript
// 命令型：偶数だけを2倍にする
function doubleEvens(numbers: number[]): number[] {
    const result: number[] = [];
    for (const num of numbers) {
        if (num % 2 === 0) {
            result.push(num * 2);
        }
    }
    return result;
}
```

??? success "解答"
    ```typescript
    // 関数型スタイル
    function doubleEvens(numbers: number[]): number[] {
        return numbers
            .filter(num => num % 2 === 0)
            .map(num => num * 2);
    }
    ```

## まとめ

この章では、関数型プログラミングの基本概念を学びました：

- ✅ 関数型プログラミングは関数を中心としたパラダイム
- ✅ 命令型と比べて宣言的で、状態変更を避ける
- ✅ TypeScriptの型システムは関数型プログラミングと相性が良い
- ✅ イミュータビリティにより、予測可能で保守しやすいコードが書ける

次の章では、関数型プログラミングの核心である「純粋関数」について詳しく学びます。

[第2章: 純粋関数と副作用 →](../chapter02/index.md){ .md-button .md-button--primary }