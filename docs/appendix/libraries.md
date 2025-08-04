# 付録: 推奨ライブラリ

TypeScriptで関数型プログラミングを実践する際に役立つライブラリを紹介します。

## fp-ts

最も人気のあるTypeScript向け関数型プログラミングライブラリです。

### インストール

```bash
npm install fp-ts
```

### 基本的な使い方

```typescript
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array";

// Option型
const divide = (a: number, b: number): O.Option<number> =>
    b === 0 ? O.none : O.some(a / b);

const result = pipe(
    divide(10, 2),
    O.map(x => x * 2),
    O.getOrElse(() => 0)
);

// Either型
const parseJSON = <T = unknown>(s: string): E.Either<Error, T> =>
    E.tryCatch(
        () => JSON.parse(s) as T,
        error => new Error(String(error))
    );

// 配列操作
const numbers = [1, 2, 3, 4, 5];
const doubled = pipe(
    numbers,
    A.map(x => x * 2),
    A.filter(x => x > 5)
);
```

### TaskEither：非同期エラーハンドリング

```typescript
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";

const fetchUser = (id: number): TE.TaskEither<Error, User> =>
    TE.tryCatch(
        () => fetch(`/api/users/${id}`).then(res => res.json()),
        error => new Error(String(error))
    );

const program = pipe(
    fetchUser(1),
    TE.chain(user => fetchUser(user.friendId)),
    TE.map(friend => friend.name)
);

// 実行
program().then(
    E.fold(
        error => console.error(error),
        name => console.log(name)
    )
);
```

## Ramda

JavaScriptで最も歴史のある関数型ライブラリの一つです。

### インストール

```bash
npm install ramda
npm install -D @types/ramda
```

### 基本的な使い方

```typescript
import * as R from "ramda";

// カリー化された関数
const add = R.add;
const add5 = add(5);
console.log(add5(3)); // 8

// 関数合成
const processData = R.pipe(
    R.map(R.multiply(2)),
    R.filter(R.gt(R.__, 5)),
    R.reduce(R.add, 0)
);

console.log(processData([1, 2, 3, 4, 5])); // 18

// オブジェクト操作
const user = { name: "Alice", age: 30, city: "Tokyo" };
const getName = R.prop("name");
const getAge = R.prop("age");

console.log(getName(user)); // "Alice"
```

## Effect-TS (旧称 @effect/core)

新世代の関数型プログラミングライブラリで、より実用的なアプローチを提供します。

### インストール

```bash
npm install effect
```

### 基本的な使い方

```typescript
import { Effect, pipe } from "effect";

// エフェクトの作成
const divide = (a: number, b: number): Effect.Effect<never, string, number> =>
    b === 0
        ? Effect.fail("Division by zero")
        : Effect.succeed(a / b);

// エフェクトの合成
const program = pipe(
    divide(10, 2),
    Effect.flatMap(result => Effect.succeed(result * 2)),
    Effect.catchAll(error => Effect.succeed(0))
);

// 実行
const result = Effect.runSync(program);
```

## Sanctuary

より厳密な型安全性を提供する関数型ライブラリです。

### インストール

```bash
npm install sanctuary
```

### 基本的な使い方

```typescript
import S from "sanctuary";

// Maybeモナド
const safeDivide = (a: number) => (b: number) =>
    b === 0 ? S.Nothing : S.Just(a / b);

const result = S.pipe([
    S.chain(safeDivide(10)),
    S.map(S.mult(2)),
    S.maybe(0)(S.I)
])(S.Just(5));

console.log(result); // 4
```

## purify-ts

シンプルで使いやすい関数型ユーティリティライブラリです。

### インストール

```bash
npm install purify-ts
```

### 基本的な使い方

```typescript
import { Maybe, Either, List } from "purify-ts";

// Maybe型
const divide = (a: number, b: number): Maybe<number> =>
    b === 0 ? Maybe.empty() : Maybe.of(a / b);

divide(10, 2)
    .map(x => x * 2)
    .orDefault(0);

// Either型
const parseAge = (input: string): Either<string, number> => {
    const age = parseInt(input);
    return isNaN(age)
        ? Either.left("Invalid age")
        : Either.right(age);
};

// List操作
List.of([1, 2, 3, 4, 5])
    .map(x => x * 2)
    .filter(x => x > 5)
    .toArray();
```

## io-ts

ランタイム型チェックとバリデーションのためのライブラリです。

### インストール

```bash
npm install io-ts
```

### 基本的な使い方

```typescript
import * as t from "io-ts";
import { isLeft } from "fp-ts/Either";

// ランタイム型の定義
const User = t.type({
    id: t.number,
    name: t.string,
    email: t.string,
    age: t.number
});

type User = t.TypeOf<typeof User>;

// バリデーション
const validateUser = (input: unknown) => {
    const result = User.decode(input);
    
    if (isLeft(result)) {
        console.error("Validation failed:", result.left);
        return null;
    }
    
    return result.right;
};

// 使用例
const validUser = validateUser({
    id: 1,
    name: "Alice",
    email: "alice@example.com",
    age: 30
});
```

## ユーティリティライブラリの比較

| ライブラリ | 特徴 | 学習曲線 | 使用場面 |
|-----------|------|----------|----------|
| fp-ts | 最も包括的、Haskell風 | 急 | 大規模プロジェクト |
| Ramda | 実用的、豊富な関数 | 緩やか | 一般的な用途 |
| Effect-TS | 実世界向け、高性能 | 中程度 | 複雑な非同期処理 |
| Sanctuary | 厳密な型安全性 | 急 | 高信頼性が必要な場合 |
| purify-ts | シンプル、初心者向け | 緩やか | 小〜中規模プロジェクト |

## 選択の指針

### fp-tsを選ぶべき場合
- Haskellなどの純粋関数型言語の経験がある
- 包括的な関数型プログラミング環境が必要
- 大規模なプロジェクトで一貫性を保ちたい

### Ramdaを選ぶべき場合
- 既存のJavaScriptプロジェクトに導入したい
- 実用的な関数型プログラミングを求めている
- 豊富なユーティリティ関数が必要

### Effect-TSを選ぶべき場合
- 複雑な非同期処理を扱う
- エラーハンドリングを体系的に行いたい
- パフォーマンスが重要

### purify-tsを選ぶべき場合
- 関数型プログラミングを始めたばかり
- シンプルなAPIを好む
- 小規模なプロジェクト

## 実装例：TODO アプリケーション

各ライブラリを使った簡単な実装例：

### fp-ts版

```typescript
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as A from "fp-ts/Array";

type Todo = { id: number; text: string; completed: boolean };

const findTodo = (todos: Todo[], id: number): O.Option<Todo> =>
    pipe(
        todos,
        A.findFirst(todo => todo.id === id)
    );

const updateTodo = (todos: Todo[], id: number, updates: Partial<Todo>) =>
    pipe(
        findTodo(todos, id),
        O.map(todo => ({ ...todo, ...updates })),
        O.fold(
            () => todos,
            updated => todos.map(t => t.id === id ? updated : t)
        )
    );
```

### Ramda版

```typescript
import * as R from "ramda";

const findTodo = (id: number) => R.find(R.propEq("id", id));

const updateTodo = (id: number, updates: Partial<Todo>) =>
    R.map(R.when(
        R.propEq("id", id),
        R.mergeLeft(updates)
    ));

const toggleTodo = (id: number) =>
    updateTodo(id, { completed: R.not });
```

## まとめ

- 各ライブラリには特徴があり、プロジェクトの要件に応じて選択する
- 小規模プロジェクトではpurify-tsやRamdaから始めるのがおすすめ
- 大規模プロジェクトではfp-tsやEffect-TSが適している
- 複数のライブラリを組み合わせることも可能（例：fp-ts + io-ts）

関数型プログラミングの概念を理解した上で、これらのライブラリを活用することで、より実践的で保守性の高いコードを書くことができます。