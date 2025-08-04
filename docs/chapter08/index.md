# 第8章: 非同期処理と関数型

## この章で学ぶこと

- 非同期処理の関数型パターン
- Promiseの関数型的な扱い方
- 非同期関数の合成
- エラーハンドリングとの組み合わせ

## 非同期処理と純粋性

非同期処理は本質的に副作用を含みますが、関数型のアプローチで扱うことで：

- 非同期処理の合成が容易になる
- エラーハンドリングが一貫する
- テストしやすくなる

## Promiseの関数型ラッパー

### Task型の実装

```typescript
// Task型：遅延実行される非同期処理
type Task<T> = () => Promise<T>;

// Task型のコンストラクタ
const task = <T>(fn: () => Promise<T>): Task<T> => fn;

// 即座に解決されるTask
const taskOf = <T>(value: T): Task<T> => 
    () => Promise.resolve(value);

// Task型の基本操作
const mapTask = <T, U>(
    task: Task<T>,
    fn: (value: T) => U
): Task<U> => 
    () => task().then(fn);

const flatMapTask = <T, U>(
    task: Task<T>,
    fn: (value: T) => Task<U>
): Task<U> => 
    () => task().then(value => fn(value)());

// Task型の実行
const runTask = <T>(task: Task<T>): Promise<T> => task();
```

### AsyncResult型：非同期処理とエラーハンドリングの組み合わせ

```typescript
// 前章のResult型を使用
type AsyncResult<T, E> = Task<Result<T, E>>;

// AsyncResult型のコンストラクタ
const asyncOk = <T, E = never>(value: T): AsyncResult<T, E> => 
    taskOf(ok(value));

const asyncErr = <T = never, E = unknown>(error: E): AsyncResult<T, E> => 
    taskOf(err(error));

// AsyncResult型の操作
const mapAsync = <T, U, E>(
    asyncResult: AsyncResult<T, E>,
    fn: (value: T) => U
): AsyncResult<U, E> => 
    mapTask(asyncResult, result => mapResult(result, fn));

const flatMapAsync = <T, U, E>(
    asyncResult: AsyncResult<T, E>,
    fn: (value: T) => AsyncResult<U, E>
): AsyncResult<U, E> => 
    async () => {
        const result = await asyncResult();
        if (isErr(result)) return result;
        return fn(result.value)();
    };
```

## 非同期処理の合成

### 順次実行

```typescript
// 複数の非同期処理を順番に実行
const sequence = <T>(tasks: Task<T>[]): Task<T[]> => 
    async () => {
        const results: T[] = [];
        for (const task of tasks) {
            results.push(await task());
        }
        return results;
    };

// パイプライン的な非同期処理
const pipeAsync = <T>(...fns: Array<(arg: any) => Task<any>>): (arg: T) => Task<any> => 
    (arg: T) => 
        fns.reduce(
            (acc, fn) => flatMapTask(acc, fn),
            taskOf(arg)
        );
```

### 並列実行

```typescript
// 並列実行のヘルパー関数
const parallel = <T>(tasks: Task<T>[]): Task<T[]> => 
    () => Promise.all(tasks.map(task => task()));

// 並列実行with制限
const parallelLimit = <T>(
    limit: number,
    tasks: Task<T>[]
): Task<T[]> => 
    async () => {
        const results: T[] = [];
        const executing: Promise<void>[] = [];

        for (const [index, task] of tasks.entries()) {
            const promise = task().then(result => {
                results[index] = result;
            });

            executing.push(promise);

            if (executing.length >= limit) {
                await Promise.race(executing);
                executing.splice(
                    executing.findIndex(p => 
                        p === promise || 
                        (p as any)[Symbol.for("resolved")] === true
                    ),
                    1
                );
            }
        }

        await Promise.all(executing);
        return results;
    };
```

## 実践的な非同期パターン

### APIクライアントの実装

```typescript
type ApiError = {
    code: string;
    message: string;
};

type ApiClient = {
    get: <T>(path: string) => AsyncResult<T, ApiError>;
    post: <T>(path: string, data: unknown) => AsyncResult<T, ApiError>;
};

const createApiClient = (baseUrl: string, apiKey: string): ApiClient => {
    const request = <T>(
        method: string,
        path: string,
        body?: unknown
    ): AsyncResult<T, ApiError> => 
        async () => {
            try {
                const response = await fetch(`${baseUrl}${path}`, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-Key": apiKey
                    },
                    body: body ? JSON.stringify(body) : undefined
                });

                if (!response.ok) {
                    const error = await response.json();
                    return err({
                        code: error.code || "UNKNOWN",
                        message: error.message || "Request failed"
                    });
                }

                const data = await response.json();
                return ok(data as T);
            } catch (error) {
                return err({
                    code: "NETWORK_ERROR",
                    message: error instanceof Error ? error.message : "Unknown error"
                });
            }
        };

    return {
        get: <T>(path: string) => request<T>("GET", path),
        post: <T>(path: string, data: unknown) => request<T>("POST", path, data)
    };
};
```

### データフェッチングパイプライン

```typescript
type User = { id: number; name: string; email: string };
type Post = { id: number; userId: number; title: string; content: string };
type Comment = { id: number; postId: number; text: string };

const fetchUserWithPosts = (
    client: ApiClient,
    userId: number
): AsyncResult<{ user: User; posts: Post[] }, ApiError> => {
    // ユーザー情報を取得
    const userTask = client.get<User>(`/users/${userId}`);
    
    // ユーザーの投稿を取得
    const postsTask = flatMapAsync(
        userTask,
        user => client.get<Post[]>(`/users/${user.id}/posts`)
    );

    // 両方の結果を組み合わせる
    return async () => {
        const userResult = await userTask();
        const postsResult = await postsTask();

        if (isErr(userResult)) return userResult;
        if (isErr(postsResult)) return postsResult;

        return ok({
            user: userResult.value,
            posts: postsResult.value
        });
    };
};

// 投稿とコメントを並列で取得
const fetchPostWithComments = (
    client: ApiClient,
    postId: number
): AsyncResult<{ post: Post; comments: Comment[] }, ApiError> => 
    async () => {
        const [postResult, commentsResult] = await parallel([
            client.get<Post>(`/posts/${postId}`),
            client.get<Comment[]>(`/posts/${postId}/comments`)
        ])();

        if (isErr(postResult)) return postResult;
        if (isErr(commentsResult)) return commentsResult;

        return ok({
            post: postResult.value,
            comments: commentsResult.value
        });
    };
```

### リトライとタイムアウト

```typescript
// リトライ機能付きTask
const retryTask = <T>(
    task: Task<T>,
    maxAttempts: number,
    delay: number = 1000
): Task<T> => 
    async () => {
        let lastError: Error;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await task();
            } catch (error) {
                lastError = error as Error;
                
                if (attempt < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, delay * attempt));
                }
            }
        }

        throw lastError!;
    };

// タイムアウト機能
const timeoutTask = <T>(
    task: Task<T>,
    ms: number
): Task<T> => 
    () => Promise.race([
        task(),
        new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error("Timeout")), ms)
        )
    ]);

// 組み合わせて使用
const robustFetch = <T>(url: string): AsyncResult<T, ApiError> => {
    const fetchTask = task(async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<T>;
    });

    const withRetryAndTimeout = pipe(
        (t: Task<T>) => timeoutTask(t, 5000),
        (t: Task<T>) => retryTask(t, 3)
    );

    return async () => {
        try {
            const result = await withRetryAndTimeout(fetchTask)();
            return ok(result);
        } catch (error) {
            return err({
                code: "FETCH_ERROR",
                message: error instanceof Error ? error.message : "Unknown error"
            });
        }
    };
};
```

### 非同期イベントストリーム

```typescript
// 非同期イテレーターを使った関数型ストリーム処理
type AsyncStream<T> = AsyncIterable<T>;

const fromArray = <T>(items: T[]): AsyncStream<T> => ({
    async *[Symbol.asyncIterator]() {
        for (const item of items) {
            yield item;
        }
    }
});

const mapStream = <T, U>(
    fn: (value: T) => U | Promise<U>
) => async function* (stream: AsyncStream<T>): AsyncStream<U> {
    for await (const value of stream) {
        yield await fn(value);
    }
};

const filterStream = <T>(
    predicate: (value: T) => boolean | Promise<boolean>
) => async function* (stream: AsyncStream<T>): AsyncStream<T> {
    for await (const value of stream) {
        if (await predicate(value)) {
            yield value;
        }
    }
};

// 使用例
const processUserStream = pipe(
    mapStream(async (userId: number) => {
        const response = await fetch(`/api/users/${userId}`);
        return response.json() as Promise<User>;
    }),
    filterStream((user: User) => user.email.includes("@example.com")),
    mapStream((user: User) => ({
        name: user.name,
        email: user.email
    }))
);
```

## 実践演習

### 演習1: 非同期バリデーション

非同期バリデーションを実装してください：

```typescript
type AsyncValidator<T> = (value: T) => AsyncResult<T, ValidationError>;

// ユーザー名が既に使用されているかチェック
const checkUsernameAvailable: AsyncValidator<string> = (username) => {
    // 実装
};

// 複数の非同期バリデーションを組み合わせる
function combineAsyncValidators<T>(
    validators: AsyncValidator<T>[]
): AsyncValidator<T> {
    // 実装
}
```

??? success "解答"
    ```typescript
    const checkUsernameAvailable: AsyncValidator<string> = (username) => 
        async () => {
            try {
                const response = await fetch(`/api/check-username/${username}`);
                const { available } = await response.json();
                
                if (!available) {
                    return err({
                        field: "username",
                        message: "Username is already taken"
                    });
                }
                
                return ok(username);
            } catch (error) {
                return err({
                    field: "username",
                    message: "Failed to check username availability"
                });
            }
        };
    
    function combineAsyncValidators<T>(
        validators: AsyncValidator<T>[]
    ): AsyncValidator<T> {
        return (value: T) => async () => {
            const results = await parallel(
                validators.map(validator => validator(value))
            )();
            
            const errors: ValidationError[] = [];
            
            for (const result of results) {
                if (isErr(result)) {
                    errors.push(result.error);
                }
            }
            
            if (errors.length > 0) {
                return err(errors[0]); // または全エラーを返す
            }
            
            return ok(value);
        };
    }
    ```

### 演習2: 非同期データ集約

複数のAPIからデータを取得して集約する関数を実装してください：

```typescript
type Weather = { temperature: number; condition: string };
type News = { headlines: string[] };
type Stock = { symbol: string; price: number };

type Dashboard = {
    weather: Weather;
    news: News;
    stocks: Stock[];
};

// この関数を実装
function fetchDashboard(
    client: ApiClient
): AsyncResult<Dashboard, ApiError> {
    // 実装
}
```

??? success "解答"
    ```typescript
    function fetchDashboard(
        client: ApiClient
    ): AsyncResult<Dashboard, ApiError> {
        return async () => {
            // 並列でデータを取得
            const tasks = parallel([
                client.get<Weather>("/api/weather"),
                client.get<News>("/api/news"),
                client.get<Stock[]>("/api/stocks")
            ]);
            
            const results = await tasks();
            
            // エラーチェック
            const errors: ApiError[] = [];
            const values: any[] = [];
            
            for (const result of results) {
                if (isErr(result)) {
                    errors.push(result.error);
                } else {
                    values.push(result.value);
                }
            }
            
            if (errors.length > 0) {
                return err(errors[0]);
            }
            
            const [weather, news, stocks] = values;
            
            return ok({
                weather: weather as Weather,
                news: news as News,
                stocks: stocks as Stock[]
            });
        };
    }
    
    // より関数型的なアプローチ
    function fetchDashboardFP(
        client: ApiClient
    ): AsyncResult<Dashboard, ApiError> {
        const weatherTask = client.get<Weather>("/api/weather");
        const newsTask = client.get<News>("/api/news");
        const stocksTask = client.get<Stock[]>("/api/stocks");
        
        return flatMapAsync(weatherTask, weather =>
            flatMapAsync(newsTask, news =>
                mapAsync(stocksTask, stocks => ({
                    weather,
                    news,
                    stocks
                }))
            )
        );
    }
    ```

## まとめ

この章では、非同期処理を関数型のアプローチで扱う方法について学びました：

- ✅ Task型により、非同期処理を値として扱える
- ✅ AsyncResult型でエラーハンドリングと非同期処理を統合
- ✅ 非同期処理の合成により、複雑な処理フローを構築できる
- ✅ 関数型のパターンにより、非同期処理もテストしやすくなる

次の章では、これまで学んだ内容を活用して実践的なプロジェクトを作成します。

[第9章: 実践プロジェクト →](../chapter09/index.md){ .md-button .md-button--primary }