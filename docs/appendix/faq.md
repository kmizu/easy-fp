# よくある質問（FAQ）

関数型プログラミングを学ぶ上でよくある質問と回答をまとめました。

## 🔰 初心者からの質問

### Q: なぜ `let` ではなく `const` を使うの？

**A:** 関数型プログラミングでは、データを変更せずに新しいデータを作ることを重視します。`const`を使うことで、変数の再代入を防ぎ、予期しない変更からコードを守れます。

```typescript
// ❌ 避けたい
let total = 0;
total = total + 100;  // 変更している

// ✅ 推奨
const initialTotal = 0;
const newTotal = initialTotal + 100;  // 新しい値を作る
```

### Q: スプレッド構文（`...`）って何？

**A:** スプレッド構文は、配列やオブジェクトの中身を展開する記法です。元のデータを変更せずに新しいデータを作るときに便利です。

```typescript
// 配列の場合
const array1 = [1, 2, 3];
const array2 = [...array1, 4];  // [1, 2, 3, 4]

// オブジェクトの場合
const user = { name: "Alice", age: 25 };
const updatedUser = { ...user, age: 26 };  // 新しいオブジェクト
```

### Q: `map`、`filter`、`reduce` の違いは？

**A:** それぞれ異なる目的で使います：

- **map**: 各要素を変換して新しい配列を作る
- **filter**: 条件に合う要素だけを残した新しい配列を作る
- **reduce**: 配列を1つの値にまとめる

```typescript
const numbers = [1, 2, 3, 4, 5];

// map: 各要素を2倍に
const doubled = numbers.map(n => n * 2);  // [2, 4, 6, 8, 10]

// filter: 偶数だけを残す
const evens = numbers.filter(n => n % 2 === 0);  // [2, 4]

// reduce: 合計を計算
const sum = numbers.reduce((total, n) => total + n, 0);  // 15
```

## 💭 概念についての質問

### Q: 純粋関数って何がいいの？

**A:** 純粋関数には以下のメリットがあります：

1. **テストが簡単**: 同じ入力なら必ず同じ結果
2. **デバッグが楽**: 外部の状態に依存しない
3. **並行処理で安全**: データ競合が起きない

```typescript
// 純粋関数
function calculateTax(price: number, rate: number): number {
    return price * rate;  // 外部に依存しない
}

// テストが簡単！
expect(calculateTax(1000, 0.1)).toBe(100);  // 必ず成功
```

### Q: 副作用は悪いもの？

**A:** いいえ！副作用自体は悪くありません。プログラムは最終的に画面表示やデータ保存などの副作用が必要です。大事なのは「副作用を管理する」ことです。

```typescript
// 計算と副作用を分離
function calculateTotal(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
}

function displayTotal(total: number): void {
    console.log(`合計: ${total}円`);  // 副作用
}

// 使うときは組み合わせる
const total = calculateTotal(items);  // 純粋関数
displayTotal(total);                   // 副作用
```

### Q: イミュータビリティは効率が悪くない？

**A:** 確かに新しいオブジェクトを作るとメモリを使いますが：

1. 現代のJavaScriptエンジンは最適化が優秀
2. 構造の共有により、実際はそれほどメモリを使わない
3. バグの削減による開発効率の向上の方が大きい

パフォーマンスが本当に問題になったときに、その部分だけ最適化すれば十分です。

## 🛠️ 実践的な質問

### Q: 既存のコードを関数型に書き換えるには？

**A:** 段階的に進めましょう：

1. **ステップ1**: `let`を`const`に変える
2. **ステップ2**: forループを`map`/`filter`/`reduce`に
3. **ステップ3**: 副作用を関数の外に出す

```typescript
// Before: 命令型
let results = [];
for (let i = 0; i < items.length; i++) {
    if (items[i].active) {
        results.push(items[i].name.toUpperCase());
    }
}

// After: 関数型
const results = items
    .filter(item => item.active)
    .map(item => item.name.toUpperCase());
```

### Q: エラー処理はどうすればいい？

**A:** 関数型では、エラーを値として扱います：

```typescript
// Resultタイプを使う
type Result<T, E> = 
    | { success: true; value: T }
    | { success: false; error: E };

function divide(a: number, b: number): Result<number, string> {
    if (b === 0) {
        return { success: false, error: "ゼロで除算できません" };
    }
    return { success: true, value: a / b };
}

// 使い方
const result = divide(10, 2);
if (result.success) {
    console.log(`結果: ${result.value}`);
} else {
    console.log(`エラー: ${result.error}`);
}
```

### Q: 状態管理はどうやるの？

**A:** 状態を引数として受け取り、新しい状態を返します：

```typescript
type State = {
    count: number;
    items: string[];
};

// 状態を更新する純粋関数
function addItem(state: State, item: string): State {
    return {
        ...state,
        count: state.count + 1,
        items: [...state.items, item]
    };
}

// 使い方
let state: State = { count: 0, items: [] };
state = addItem(state, "Apple");
state = addItem(state, "Orange");
```

## 🤔 よくある勘違い

### Q: 関数型プログラミングは難しい？

**A:** 最初は新しい考え方に戸惑うかもしれませんが、基本的なパターンを覚えれば、むしろコードがシンプルになります。全部を一度に理解する必要はありません！

### Q: すべてを純粋関数にしないといけない？

**A:** いいえ！現実的なアプリケーションでは、副作用は必要です。目標は「副作用をゼロにする」ことではなく、「副作用を管理しやすくする」ことです。

### Q: オブジェクト指向と関数型は対立する？

**A:** そんなことはありません！TypeScriptでは両方の良いところを組み合わせて使えます。クラスの中で純粋関数を使ったり、イミュータブルなデータ構造を使ったりできます。

## 📚 学習のアドバイス

### Q: どこから始めればいい？

**A:** 以下の順番がおすすめです：

1. `const`を使う習慣をつける
2. `map`、`filter`、`reduce`をマスターする
3. 純粋関数を意識して書く
4. 副作用を分離する練習をする

### Q: 練習に良いプロジェクトは？

**A:** 以下のようなプロジェクトがおすすめ：

- ToDoリストアプリ（状態管理の練習）
- 電卓アプリ（純粋関数の練習）
- データ変換ツール（map/filter/reduceの練習）

---

!!! tip "困ったときは"
    わからないことがあったら、遠慮なく[GitHubのIssue](https://github.com/kmizu/easy-fp/issues)で質問してください！