# 第7章: エラーハンドリング

## この章で学ぶこと

- 関数型プログラミングにおけるエラー処理の考え方
- Option/Maybe型の実装と使い方
- Result/Either型の実装と使い方
- エラーの合成と連鎖

## 関数型エラーハンドリングの基本概念

関数型プログラミングでは、例外を投げる代わりに**エラーを値として扱います**。これにより：

- エラーが型システムで表現される
- エラー処理が明示的になる
- 関数の純粋性が保たれる

## Option/Maybe型

**Option型**（Maybe型とも呼ばれる）は、値が存在するかしないかを表現します。

### Option型の実装

```typescript
// Option型の定義
type None = { type: "none" };
type Some<T> = { type: "some"; value: T };
type Option<T> = None | Some<T>;

// コンストラクタ関数
const none = (): None => ({ type: "none" });
const some = <T>(value: T): Some<T> => ({ type: "some", value });

// 型ガード
const isNone = <T>(option: Option<T>): option is None => 
    option.type === "none";
const isSome = <T>(option: Option<T>): option is Some<T> => 
    option.type === "some";

// 基本的な操作
const map = <T, U>(
    option: Option<T>,
    fn: (value: T) => U
): Option<U> => {
    if (isNone(option)) return none();
    return some(fn(option.value));
};

const flatMap = <T, U>(
    option: Option<T>,
    fn: (value: T) => Option<U>
): Option<U> => {
    if (isNone(option)) return none();
    return fn(option.value);
};

const getOrElse = <T>(
    option: Option<T>,
    defaultValue: T
): T => {
    if (isNone(option)) return defaultValue;
    return option.value;
};
```

### Option型の使用例

```typescript
// 安全な除算
const safeDivide = (a: number, b: number): Option<number> => {
    if (b === 0) return none();
    return some(a / b);
};

// 配列から要素を安全に取得
const getAt = <T>(array: T[], index: number): Option<T> => {
    if (index < 0 || index >= array.length) return none();
    return some(array[index]);
};

// Option値の連鎖
const calculateScore = (data: any): Option<number> => {
    return flatMap(
        getAt(data.scores, 0),
        firstScore => flatMap(
            getAt(data.scores, 1),
            secondScore => map(
                safeDivide(firstScore + secondScore, 2),
                average => Math.round(average * 100)
            )
        )
    );
};
```

## Result/Either型

**Result型**（Either型とも呼ばれる）は、成功か失敗のいずれかを表現し、失敗時にはエラー情報を保持します。

### Result型の実装

```typescript
// Result型の定義
type Ok<T> = { type: "ok"; value: T };
type Err<E> = { type: "err"; error: E };
type Result<T, E> = Ok<T> | Err<E>;

// コンストラクタ関数
const ok = <T, E = never>(value: T): Result<T, E> => 
    ({ type: "ok", value });
const err = <T = never, E = unknown>(error: E): Result<T, E> => 
    ({ type: "err", error });

// 型ガード
const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => 
    result.type === "ok";
const isErr = <T, E>(result: Result<T, E>): result is Err<E> => 
    result.type === "err";

// 基本的な操作
const mapResult = <T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => U
): Result<U, E> => {
    if (isErr(result)) return result;
    return ok(fn(result.value));
};

const flatMapResult = <T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>
): Result<U, E> => {
    if (isErr(result)) return result;
    return fn(result.value);
};

const mapError = <T, E, F>(
    result: Result<T, E>,
    fn: (error: E) => F
): Result<T, F> => {
    if (isOk(result)) return result;
    return err(fn(result.error));
};
```

### Result型の使用例

```typescript
// エラーメッセージ付きのバリデーション
type ValidationError = {
    field: string;
    message: string;
};

const validateEmail = (email: string): Result<string, ValidationError> => {
    if (!email.includes("@")) {
        return err({
            field: "email",
            message: "Invalid email format"
        });
    }
    return ok(email);
};

const validateAge = (age: number): Result<number, ValidationError> => {
    if (age < 0 || age > 150) {
        return err({
            field: "age",
            message: "Age must be between 0 and 150"
        });
    }
    return ok(age);
};

// JSONのパース
const parseJSON = <T = unknown>(
    json: string
): Result<T, Error> => {
    try {
        return ok(JSON.parse(json) as T);
    } catch (error) {
        return err(error as Error);
    }
};
```

## エラーの合成

### 複数のResult値を組み合わせる

```typescript
// すべて成功した場合のみ成功を返す
const combineResults = <T, E>(
    results: Result<T, E>[]
): Result<T[], E[]> => {
    const values: T[] = [];
    const errors: E[] = [];

    for (const result of results) {
        if (isOk(result)) {
            values.push(result.value);
        } else {
            errors.push(result.error);
        }
    }

    if (errors.length > 0) {
        return err(errors);
    }
    return ok(values);
};

// 関数型のアプローチ
const sequence = <T, E>(
    results: Result<T, E>[]
): Result<T[], E> => {
    return results.reduce(
        (acc: Result<T[], E>, result: Result<T, E>) => 
            flatMapResult(acc, values =>
                mapResult(result, value => [...values, value])
            ),
        ok([])
    );
};
```

### バリデーションの組み合わせ

```typescript
type User = {
    name: string;
    email: string;
    age: number;
};

const validateName = (name: string): Result<string, ValidationError> => {
    if (name.length < 2) {
        return err({
            field: "name",
            message: "Name must be at least 2 characters"
        });
    }
    return ok(name);
};

// ユーザー情報の総合バリデーション
const validateUser = (
    name: string,
    email: string,
    age: number
): Result<User, ValidationError[]> => {
    const results = [
        validateName(name),
        validateEmail(email),
        validateAge(age)
    ];

    const combined = combineResults(results);

    if (isErr(combined)) {
        return combined;
    }

    const [validName, validEmail, validAge] = combined.value;
    return ok({
        name: validName as string,
        email: validEmail as string,
        age: validAge as number
    });
};
```

## 実践的なエラーハンドリングパターン

### Railway Oriented Programming

```typescript
// 処理の連鎖（Railway Pattern）
type Config = { apiKey: string; baseUrl: string };
type UserData = { id: number; name: string };

const loadConfig = (): Result<Config, string> => {
    const apiKey = process.env.API_KEY;
    const baseUrl = process.env.BASE_URL;

    if (!apiKey || !baseUrl) {
        return err("Missing configuration");
    }

    return ok({ apiKey, baseUrl });
};

const fetchUser = (
    config: Config,
    userId: number
): Promise<Result<UserData, string>> => {
    return fetch(`${config.baseUrl}/users/${userId}`, {
        headers: { "X-API-Key": config.apiKey }
    })
    .then(response => {
        if (!response.ok) {
            return err(`HTTP error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => ok(data as UserData))
    .catch(error => err(error.message));
};

// 処理の組み立て
const getUserName = async (userId: number): Promise<Result<string, string>> => {
    const configResult = loadConfig();
    
    if (isErr(configResult)) {
        return configResult;
    }

    const userResult = await fetchUser(configResult.value, userId);
    
    return mapResult(userResult, user => user.name);
};
```

### エラーリカバリー

```typescript
// エラー時の代替処理
const withDefault = <T, E>(
    result: Result<T, E>,
    defaultValue: T
): T => {
    if (isOk(result)) return result.value;
    return defaultValue;
};

// エラー時に別の処理を試行
const orElse = <T, E>(
    result: Result<T, E>,
    alternative: () => Result<T, E>
): Result<T, E> => {
    if (isOk(result)) return result;
    return alternative();
};

// リトライロジック
const retry = async <T, E>(
    fn: () => Promise<Result<T, E>>,
    maxAttempts: number,
    delay: number = 1000
): Promise<Result<T, E>> => {
    let lastError: E;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const result = await fn();
        
        if (isOk(result)) {
            return result;
        }
        
        lastError = result.error;
        
        if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    return err(lastError!);
};
```

## 実践演習

### 演習1: Option型のユーティリティ関数

以下の関数を実装してください：

```typescript
// Option型の配列から、Some値のみを抽出
function catOptions<T>(options: Option<T>[]): T[] {
    // 実装
}

// 条件に基づいてOption値を返す
function optionIf<T>(condition: boolean, value: () => T): Option<T> {
    // 実装
}
```

??? success "解答"
    ```typescript
    function catOptions<T>(options: Option<T>[]): T[] {
        return options
            .filter(isSome)
            .map(option => option.value);
    }
    
    function optionIf<T>(condition: boolean, value: () => T): Option<T> {
        if (condition) {
            return some(value());
        }
        return none();
    }
    ```

### 演習2: フォームバリデーション

Result型を使用して、フォームのバリデーションシステムを実装してください：

```typescript
type FormData = {
    username: string;
    password: string;
    confirmPassword: string;
    email: string;
    age: string;
};

type ValidatedForm = {
    username: string;
    password: string;
    email: string;
    age: number;
};

// この関数を実装
function validateForm(data: FormData): Result<ValidatedForm, ValidationError[]> {
    // 実装
}
```

??? success "解答"
    ```typescript
    const validateUsername = (username: string): Result<string, ValidationError> => {
        if (username.length < 3) {
            return err({
                field: "username",
                message: "Username must be at least 3 characters"
            });
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return err({
                field: "username",
                message: "Username can only contain letters, numbers, and underscores"
            });
        }
        return ok(username);
    };
    
    const validatePassword = (
        password: string,
        confirmPassword: string
    ): Result<string, ValidationError> => {
        if (password.length < 8) {
            return err({
                field: "password",
                message: "Password must be at least 8 characters"
            });
        }
        if (password !== confirmPassword) {
            return err({
                field: "confirmPassword",
                message: "Passwords do not match"
            });
        }
        return ok(password);
    };
    
    const validateAgeString = (ageStr: string): Result<number, ValidationError> => {
        const age = parseInt(ageStr, 10);
        if (isNaN(age)) {
            return err({
                field: "age",
                message: "Age must be a number"
            });
        }
        return validateAge(age);
    };
    
    function validateForm(data: FormData): Result<ValidatedForm, ValidationError[]> {
        const validations = [
            validateUsername(data.username),
            validatePassword(data.password, data.confirmPassword),
            validateEmail(data.email),
            validateAgeString(data.age)
        ];
        
        const combined = combineResults(validations);
        
        if (isErr(combined)) {
            return combined;
        }
        
        const [username, password, email, age] = combined.value;
        
        return ok({
            username: username as string,
            password: password as string,
            email: email as string,
            age: age as number
        });
    }
    ```

## まとめ

この章では、関数型プログラミングにおけるエラーハンドリングについて学びました：

- ✅ Option型により、値の存在/不在を型安全に扱える
- ✅ Result型により、成功/失敗とエラー情報を明示的に扱える
- ✅ エラーを値として扱うことで、純粋関数を保ちながらエラー処理ができる
- ✅ 複数のエラーを合成し、包括的なエラーハンドリングが可能

次の章では、非同期処理を関数型のアプローチで扱う方法について学びます。

[第8章: 非同期処理と関数型 →](../chapter08/index.md){ .md-button .md-button--primary }