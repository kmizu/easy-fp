# 第6章: 関数型データ構造

## この章で学ぶこと

- イミュータブルなデータ構造の操作
- 配列とオブジェクトの不変更新
- 再帰的データ構造
- レンズの基礎

## イミュータブルなデータ操作

関数型プログラミングでは、データを変更する代わりに新しいデータを作成します。

### 配列のイミュータブル操作

```typescript
// 要素の追加
const append = <T>(arr: T[], item: T): T[] => [...arr, item];
const prepend = <T>(arr: T[], item: T): T[] => [item, ...arr];

// 要素の削除
const removeAt = <T>(arr: T[], index: number): T[] => [
    ...arr.slice(0, index),
    ...arr.slice(index + 1)
];

// 要素の更新
const updateAt = <T>(arr: T[], index: number, value: T): T[] => [
    ...arr.slice(0, index),
    value,
    ...arr.slice(index + 1)
];

// 使用例
const numbers = [1, 2, 3, 4, 5];
const updated = updateAt(numbers, 2, 99);
console.log(numbers); // [1, 2, 3, 4, 5] - 元の配列は変更されない
console.log(updated); // [1, 2, 99, 4, 5]
```

### オブジェクトのイミュータブル操作

```typescript
// プロパティの更新
const updateProp = <T, K extends keyof T>(
    obj: T,
    key: K,
    value: T[K]
): T => ({
    ...obj,
    [key]: value
});

// プロパティの削除
const removeProp = <T, K extends keyof T>(
    obj: T,
    key: K
): Omit<T, K> => {
    const { [key]: _, ...rest } = obj;
    return rest;
};

// ネストしたオブジェクトの更新
const updateNested = <T>(
    obj: T,
    path: string[],
    value: any
): T => {
    if (path.length === 0) return value;
    
    const [head, ...tail] = path;
    return {
        ...obj,
        [head]: updateNested((obj as any)[head], tail, value)
    };
};

// 使用例
type User = {
    id: number;
    name: string;
    address: {
        city: string;
        country: string;
    };
};

const user: User = {
    id: 1,
    name: "Alice",
    address: { city: "Tokyo", country: "Japan" }
};

const updated = updateNested(user, ["address", "city"], "Osaka");
console.log(user.address.city); // "Tokyo" - 元のオブジェクトは変更されない
console.log(updated.address.city); // "Osaka"
```

## 再帰的データ構造

### リスト構造

```typescript
// シンプルなリストの実装
type List<T> = null | { value: T; next: List<T> };

// リスト操作関数
const cons = <T>(value: T, list: List<T>): List<T> => ({ value, next: list });
const head = <T>(list: List<T>): T | undefined => list?.value;
const tail = <T>(list: List<T>): List<T> => list?.next ?? null;

// リストの変換
const mapList = <T, U>(fn: (value: T) => U, list: List<T>): List<U> => {
    if (list === null) return null;
    return cons(fn(list.value), mapList(fn, list.next));
};

// リストのフィルタリング
const filterList = <T>(predicate: (value: T) => boolean, list: List<T>): List<T> => {
    if (list === null) return null;
    if (predicate(list.value)) {
        return cons(list.value, filterList(predicate, list.next));
    }
    return filterList(predicate, list.next);
};

// 使用例
const myList = cons(1, cons(2, cons(3, cons(4, null))));
const doubled = mapList(x => x * 2, myList);
const evens = filterList(x => x % 2 === 0, myList);
```

### ツリー構造

```typescript
// 二分木の定義
type Tree<T> = 
    | { type: "leaf" }
    | { type: "node"; value: T; left: Tree<T>; right: Tree<T> };

// ツリーの作成
const leaf = <T>(): Tree<T> => ({ type: "leaf" });
const node = <T>(value: T, left: Tree<T>, right: Tree<T>): Tree<T> => 
    ({ type: "node", value, left, right });

// ツリーの操作
const mapTree = <T, U>(fn: (value: T) => U, tree: Tree<T>): Tree<U> => {
    if (tree.type === "leaf") return leaf();
    return node(
        fn(tree.value),
        mapTree(fn, tree.left),
        mapTree(fn, tree.right)
    );
};

// ツリーの畳み込み
const foldTree = <T, U>(
    onLeaf: () => U,
    onNode: (value: T, left: U, right: U) => U,
    tree: Tree<T>
): U => {
    if (tree.type === "leaf") return onLeaf();
    return onNode(
        tree.value,
        foldTree(onLeaf, onNode, tree.left),
        foldTree(onLeaf, onNode, tree.right)
    );
};

// ツリーの高さを計算
const height = <T>(tree: Tree<T>): number => 
    foldTree(
        () => 0,
        (_, left, right) => 1 + Math.max(left, right),
        tree
    );
```

## レンズの基礎

**レンズ（Lens）**は、ネストしたデータ構造へのアクセスと更新を抽象化する機能パターンです。

### シンプルなレンズの実装

```typescript
// レンズの型定義
type Lens<S, A> = {
    get: (s: S) => A;
    set: (a: A) => (s: S) => S;
};

// レンズの作成
const lens = <S, A>(
    get: (s: S) => A,
    set: (a: A) => (s: S) => S
): Lens<S, A> => ({ get, set });

// プロパティレンズ
const prop = <T, K extends keyof T>(key: K): Lens<T, T[K]> => 
    lens(
        s => s[key],
        a => s => ({ ...s, [key]: a })
    );

// レンズの合成
const compose = <A, B, C>(
    lens1: Lens<A, B>,
    lens2: Lens<B, C>
): Lens<A, C> => 
    lens(
        a => lens2.get(lens1.get(a)),
        c => a => lens1.set(lens2.set(c)(lens1.get(a)))(a)
    );

// レンズの操作
const view = <S, A>(lens: Lens<S, A>, s: S): A => lens.get(s);
const set = <S, A>(lens: Lens<S, A>, a: A, s: S): S => lens.set(a)(s);
const over = <S, A>(lens: Lens<S, A>, fn: (a: A) => A, s: S): S => 
    lens.set(fn(lens.get(s)))(s);
```

### レンズの使用例

```typescript
type Company = {
    name: string;
    address: Address;
};

type Address = {
    street: string;
    city: string;
    country: string;
};

type Employee = {
    name: string;
    company: Company;
};

// レンズの定義
const companyLens = prop<Employee, "company">("company");
const addressLens = prop<Company, "address">("address");
const cityLens = prop<Address, "city">("city");

// レンズの合成
const employeeCityLens = compose(
    compose(companyLens, addressLens),
    cityLens
);

// 使用例
const employee: Employee = {
    name: "Alice",
    company: {
        name: "TechCorp",
        address: {
            street: "123 Main St",
            city: "Tokyo",
            country: "Japan"
        }
    }
};

// データの取得
const city = view(employeeCityLens, employee);
console.log(city); // "Tokyo"

// データの更新
const updated = set(employeeCityLens, "Osaka", employee);
console.log(updated.company.address.city); // "Osaka"
console.log(employee.company.address.city); // "Tokyo" - 元のデータは変更されない

// 関数を適用
const uppercased = over(employeeCityLens, s => s.toUpperCase(), employee);
console.log(uppercased.company.address.city); // "TOKYO"
```

## 実践的なデータ構造の操作

### イミュータブルな状態管理

```typescript
// アプリケーションの状態
type AppState = {
    users: User[];
    selectedUserId: number | null;
    filters: {
        searchTerm: string;
        isActive: boolean;
    };
};

// 状態更新関数
const updateState = <K extends keyof AppState>(
    state: AppState,
    key: K,
    value: AppState[K]
): AppState => ({ ...state, [key]: value });

// ユーザーの追加
const addUser = (state: AppState, user: User): AppState => 
    updateState(state, "users", [...state.users, user]);

// フィルターの更新
const updateFilter = <K extends keyof AppState["filters"]>(
    state: AppState,
    filterKey: K,
    value: AppState["filters"][K]
): AppState => ({
    ...state,
    filters: {
        ...state.filters,
        [filterKey]: value
    }
});

// レンズを使ったアプローチ
const filtersLens = prop<AppState, "filters">("filters");
const searchTermLens = prop<AppState["filters"], "searchTerm">("searchTerm");
const appSearchTermLens = compose(filtersLens, searchTermLens);

// 検索ワードの更新
const updateSearchTerm = (state: AppState, term: string): AppState =>
    set(appSearchTermLens, term, state);
```

## 実践演習

### 演習1: イミュータブルな配列操作

以下の関数を実装してください：

```typescript
// 指定したインデックスに要素を挿入
function insertAt<T>(arr: T[], index: number, item: T): T[] {
    // 実装
}

// 条件に一致する最初の要素を更新
function updateFirst<T>(
    arr: T[],
    predicate: (item: T) => boolean,
    update: (item: T) => T
): T[] {
    // 実装
}
```

??? success "解答"
    ```typescript
    function insertAt<T>(arr: T[], index: number, item: T): T[] {
        return [
            ...arr.slice(0, index),
            item,
            ...arr.slice(index)
        ];
    }
    
    function updateFirst<T>(
        arr: T[],
        predicate: (item: T) => boolean,
        update: (item: T) => T
    ): T[] {
        const index = arr.findIndex(predicate);
        if (index === -1) return arr;
        
        return [
            ...arr.slice(0, index),
            update(arr[index]!),
            ...arr.slice(index + 1)
        ];
    }
    ```

### 演習2: レンズの活用

ネストしたオブジェクトを操作するユーティリティ関数を作成してください：

```typescript
type Blog = {
    title: string;
    author: {
        name: string;
        email: string;
        profile: {
            bio: string;
            avatar: string;
        };
    };
    posts: Post[];
};

type Post = {
    id: number;
    title: string;
    content: string;
    tags: string[];
};

// 以下の操作をレンズを使って実装：
// 1. 著者のバイオを更新
// 2. 特定のポストにタグを追加
```

??? success "解答"
    ```typescript
    // レンズの定義
    const authorLens = prop<Blog, "author">("author");
    const profileLens = prop<Blog["author"], "profile">("profile");
    const bioLens = prop<Blog["author"]["profile"], "bio">("bio");
    const postsLens = prop<Blog, "posts">("posts");
    
    // 著者のバイオにアクセスするレンズ
    const authorBioLens = compose(
        compose(authorLens, profileLens),
        bioLens
    );
    
    // 著者のバイオを更新
    const updateAuthorBio = (blog: Blog, newBio: string): Blog =>
        set(authorBioLens, newBio, blog);
    
    // 特定のポストにタグを追加
    const addTagToPost = (blog: Blog, postId: number, tag: string): Blog =>
        over(postsLens, posts => 
            posts.map(post => 
                post.id === postId
                    ? { ...post, tags: [...post.tags, tag] }
                    : post
            ),
            blog
        );
    
    // 使用例
    const blog: Blog = {
        title: "My Blog",
        author: {
            name: "Alice",
            email: "alice@example.com",
            profile: {
                bio: "Software Developer",
                avatar: "avatar.jpg"
            }
        },
        posts: [
            { id: 1, title: "First Post", content: "...", tags: ["intro"] }
        ]
    };
    
    const updated1 = updateAuthorBio(blog, "Senior Software Developer");
    const updated2 = addTagToPost(blog, 1, "typescript");
    ```

## まとめ

この章では、関数型データ構造について学びました：

- ✅ イミュータブルなデータ操作により、予測可能なコードが書ける
- ✅ 再帰的データ構造は関数型プログラミングで自然に扱える
- ✅ レンズにより、ネストしたデータのアクセスと更新が簡潔になる
- ✅ これらのパターンにより、複雑な状態管理も安全に行える

次の章では、関数型プログラミングにおける「エラーハンドリング」について学びます。

[第7章: エラーハンドリング →](../chapter07/index.md){ .md-button .md-button--primary }