# 付録: TypeScriptの型システムと関数型プログラミング

## TypeScriptの高度な型機能

関数型プログラミングを実践する上で役立つTypeScriptの型機能を紹介します。

## ジェネリクス

### 基本的なジェネリクス

```typescript
// 単一の型パラメータ
function identity<T>(value: T): T {
    return value;
}

// 複数の型パラメータ
function pair<T, U>(first: T, second: U): [T, U] {
    return [first, second];
}

// 制約付きジェネリクス
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}
```

### 高階型（Higher-Kinded Types）のエミュレーション

```typescript
// TypeScriptには直接的な高階型はないが、エミュレートできる
interface Functor<F> {
    map<A, B>(fa: F & { _A: A }, f: (a: A) => B): F & { _A: B };
}

// Optionファンクター
type Option<A> = { type: "none" } | { type: "some"; value: A };

const optionFunctor: Functor<Option<any>> = {
    map: (fa, f) => {
        if (fa.type === "none") return fa as any;
        return { type: "some", value: f(fa.value) };
    }
};
```

## 条件型

### 基本的な条件型

```typescript
// 条件による型の分岐
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>;   // true
type Test2 = IsString<number>;   // false

// より実用的な例
type Nullable<T> = T | null | undefined;
type NonNullable<T> = T extends null | undefined ? never : T;
```

### inferキーワード

```typescript
// 関数の戻り値の型を抽出
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Promiseの中身の型を抽出
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// 使用例
type Example1 = ReturnType<() => string>;        // string
type Example2 = UnwrapPromise<Promise<number>>;  // number
```

## マップ型

### 基本的なマップ型

```typescript
// すべてのプロパティをオプショナルにする
type Partial<T> = {
    [K in keyof T]?: T[K];
};

// すべてのプロパティを読み取り専用にする
type Readonly<T> = {
    readonly [K in keyof T]: T[K];
};

// 特定のプロパティを除外
type Omit<T, K extends keyof any> = {
    [P in Exclude<keyof T, K>]: T[P];
};
```

### 条件付きマップ型

```typescript
// null/undefinedを除外
type NonNullableProperties<T> = {
    [K in keyof T]: NonNullable<T[K]>;
};

// 関数型のプロパティのみを抽出
type FunctionProperties<T> = {
    [K in keyof T as T[K] extends Function ? K : never]: T[K];
};
```

## テンプレートリテラル型

```typescript
// 文字列の組み合わせ
type EventType = "click" | "focus" | "blur";
type EventHandler = `on${Capitalize<EventType>}`;
// "onClick" | "onFocus" | "onBlur"

// パス型の構築
type Path<T> = T extends object
    ? {
        [K in keyof T]: K extends string
            ? T[K] extends object
                ? K | `${K}.${Path<T[K]>}`
                : K
            : never;
      }[keyof T]
    : never;

type User = {
    name: string;
    address: {
        city: string;
        country: string;
    };
};

type UserPath = Path<User>;
// "name" | "address" | "address.city" | "address.country"
```

## 関数型プログラミング向けの型ユーティリティ

### パイプライン型

```typescript
// 型安全なパイプライン
type Pipe<T extends any[]> = T extends [
    (...args: any[]) => infer R1,
    (arg: R1) => infer R2,
    ...infer Rest
] ? Rest extends [(arg: any) => any, ...any[]]
    ? Pipe<[(arg: R1) => R2, ...Rest]>
    : (arg: Parameters<T[0]>[0]) => R2
  : T extends [(...args: any[]) => infer R]
    ? T[0]
    : never;

// 使用例
declare function pipe<T extends [Function, ...Function[]]>(
    ...fns: T
): Pipe<T>;

const pipeline = pipe(
    (x: number) => x.toString(),
    (s: string) => s.length,
    (n: number) => n > 5
);
// pipeline: (x: number) => boolean
```

### カリー化の型

```typescript
// カリー化された関数の型
type Curry<F> = F extends (a: infer A, ...args: infer R) => infer Z
    ? R extends []
        ? F
        : (a: A) => Curry<(...args: R) => Z>
    : never;

// 使用例
declare function curry<F extends Function>(fn: F): Curry<F>;

const add = (a: number, b: number, c: number) => a + b + c;
const curriedAdd = curry(add);
// curriedAdd: (a: number) => (b: number) => (c: number) => number
```

## 実用的な型パターン

### タグ付きユニオン

```typescript
// 成功/失敗を表現
type Success<T> = { type: "success"; value: T };
type Failure<E> = { type: "failure"; error: E };
type Result<T, E> = Success<T> | Failure<E>;

// 型ガードの自動生成
function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
    return result.type === "success";
}
```

### ファントム型

```typescript
// 型レベルでの状態管理
type UserId = string & { _brand: "UserId" };
type PostId = string & { _brand: "PostId" };

// 型安全なID作成
const userId = (id: string): UserId => id as UserId;
const postId = (id: string): PostId => id as PostId;

// コンパイルエラー：型が異なる
// const id: UserId = postId("123");
```

### 型レベル計算

```typescript
// 配列の長さを型レベルで取得
type Length<T extends readonly any[]> = T["length"];

type Tuple = readonly [1, 2, 3, 4, 5];
type TupleLength = Length<Tuple>; // 5

// 再帰的な型定義
type Repeat<T, N extends number, R extends any[] = []> = 
    R["length"] extends N ? R : Repeat<T, N, [...R, T]>;

type FiveStrings = Repeat<string, 5>;
// [string, string, string, string, string]
```

## 型推論の活用

### constアサーション

```typescript
// より厳密な型推論
const colors = ["red", "green", "blue"] as const;
// readonly ["red", "green", "blue"]

const config = {
    host: "localhost",
    port: 3000,
    ssl: false
} as const;
// 各プロパティがリテラル型として推論される
```

### satisfiesオペレータ（TypeScript 4.9+）

```typescript
// 型チェックしつつ、推論を保持
type Config = {
    host: string;
    port: number;
    ssl?: boolean;
};

const config = {
    host: "localhost",
    port: 3000
} satisfies Config;

// configの型は { host: string; port: number } として推論される
// Config型の制約も満たす
```

## 関数型ライブラリとの統合

### fp-tsライブラリの型

```typescript
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";

// Option型の使用
const divide = (a: number, b: number): O.Option<number> =>
    b === 0 ? O.none : O.some(a / b);

// Either型の使用
const safeParse = (json: string): E.Either<Error, unknown> =>
    E.tryCatch(
        () => JSON.parse(json),
        error => new Error(String(error))
    );

// パイプラインでの組み合わせ
const result = pipe(
    "10",
    s => parseInt(s, 10),
    O.fromPredicate(n => !isNaN(n)),
    O.map(n => n * 2),
    O.getOrElse(() => 0)
);
```

## まとめ

TypeScriptの型システムは、関数型プログラミングのパターンを型安全に実装するための強力な機能を提供します：

- ✅ ジェネリクスにより、汎用的で再利用可能な関数を作成できる
- ✅ 条件型とマップ型により、複雑な型変換を表現できる
- ✅ タグ付きユニオンにより、代数的データ型を実現できる
- ✅ 型推論により、冗長な型注釈を減らしつつ型安全性を保てる

これらの機能を活用することで、より安全で表現力豊かな関数型プログラミングが可能になります。