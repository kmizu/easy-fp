# 第9章: 実践プロジェクト

## この章で学ぶこと

- 関数型プログラミングの実践的な適用
- TODOアプリケーションの関数型実装
- 状態管理の関数型アプローチ
- テスタブルなアーキテクチャの構築

## プロジェクト概要

関数型プログラミングの概念を活用して、TODOアプリケーションを実装します。

### 要件

- TODOの追加・削除・更新
- TODOの完了状態の切り替え
- フィルタリング（全て、アクティブ、完了済み）
- ローカルストレージへの永続化
- 非同期でのデータ同期（シミュレーション）

## ドメインモデル

```typescript
// TODOアイテムの型定義
type TodoId = string;

type Todo = {
    id: TodoId;
    title: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
};

// フィルターの種類
type FilterType = "all" | "active" | "completed";

// アプリケーション状態
type AppState = {
    todos: Todo[];
    filter: FilterType;
    isLoading: boolean;
    error: string | null;
};
```

## 純粋関数によるビジネスロジック

### TODOの操作関数

```typescript
// TODOの作成
const createTodo = (title: string): Todo => ({
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date()
});

// TODOリストへの追加
const addTodo = (todos: Todo[], title: string): Todo[] => {
    if (title.trim() === "") return todos;
    return [...todos, createTodo(title)];
};

// TODOの更新
const updateTodo = (
    todos: Todo[],
    id: TodoId,
    updates: Partial<Omit<Todo, "id" | "createdAt">>
): Todo[] => 
    todos.map(todo =>
        todo.id === id
            ? { ...todo, ...updates, updatedAt: new Date() }
            : todo
    );

// TODOの削除
const removeTodo = (todos: Todo[], id: TodoId): Todo[] =>
    todos.filter(todo => todo.id !== id);

// 完了状態の切り替え
const toggleTodo = (todos: Todo[], id: TodoId): Todo[] =>
    updateTodo(todos, id, { 
        completed: !todos.find(t => t.id === id)?.completed 
    });

// すべて完了/未完了にする
const toggleAll = (todos: Todo[], completed: boolean): Todo[] =>
    todos.map(todo => ({
        ...todo,
        completed,
        updatedAt: new Date()
    }));

// 完了済みをクリア
const clearCompleted = (todos: Todo[]): Todo[] =>
    todos.filter(todo => !todo.completed);
```

### フィルタリング関数

```typescript
// フィルタリングロジック
const filterTodos = (todos: Todo[], filter: FilterType): Todo[] => {
    switch (filter) {
        case "active":
            return todos.filter(todo => !todo.completed);
        case "completed":
            return todos.filter(todo => todo.completed);
        case "all":
        default:
            return todos;
    }
};

// 統計情報の計算
type TodoStats = {
    total: number;
    active: number;
    completed: number;
};

const calculateStats = (todos: Todo[]): TodoStats => ({
    total: todos.length,
    active: todos.filter(todo => !todo.completed).length,
    completed: todos.filter(todo => todo.completed).length
});
```

## 状態管理

### Reduxスタイルのアクション

```typescript
// アクションタイプ
type Action =
    | { type: "ADD_TODO"; payload: string }
    | { type: "REMOVE_TODO"; payload: TodoId }
    | { type: "TOGGLE_TODO"; payload: TodoId }
    | { type: "UPDATE_TODO"; payload: { id: TodoId; title: string } }
    | { type: "TOGGLE_ALL"; payload: boolean }
    | { type: "CLEAR_COMPLETED" }
    | { type: "SET_FILTER"; payload: FilterType }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "SET_TODOS"; payload: Todo[] };

// リデューサー（純粋関数）
const reducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case "ADD_TODO":
            return {
                ...state,
                todos: addTodo(state.todos, action.payload)
            };
        
        case "REMOVE_TODO":
            return {
                ...state,
                todos: removeTodo(state.todos, action.payload)
            };
        
        case "TOGGLE_TODO":
            return {
                ...state,
                todos: toggleTodo(state.todos, action.payload)
            };
        
        case "UPDATE_TODO":
            return {
                ...state,
                todos: updateTodo(
                    state.todos,
                    action.payload.id,
                    { title: action.payload.title }
                )
            };
        
        case "TOGGLE_ALL":
            return {
                ...state,
                todos: toggleAll(state.todos, action.payload)
            };
        
        case "CLEAR_COMPLETED":
            return {
                ...state,
                todos: clearCompleted(state.todos)
            };
        
        case "SET_FILTER":
            return {
                ...state,
                filter: action.payload
            };
        
        case "SET_LOADING":
            return {
                ...state,
                isLoading: action.payload
            };
        
        case "SET_ERROR":
            return {
                ...state,
                error: action.payload
            };
        
        case "SET_TODOS":
            return {
                ...state,
                todos: action.payload
            };
        
        default:
            return state;
    }
};
```

### 状態管理のストア実装

```typescript
// シンプルなストア実装
type Listener<T> = (state: T) => void;
type Unsubscribe = () => void;

class Store<S, A> {
    private state: S;
    private listeners: Set<Listener<S>> = new Set();
    
    constructor(
        private reducer: (state: S, action: A) => S,
        initialState: S
    ) {
        this.state = initialState;
    }
    
    getState(): S {
        return this.state;
    }
    
    dispatch(action: A): void {
        this.state = this.reducer(this.state, action);
        this.listeners.forEach(listener => listener(this.state));
    }
    
    subscribe(listener: Listener<S>): Unsubscribe {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}

// ストアの作成
const initialState: AppState = {
    todos: [],
    filter: "all",
    isLoading: false,
    error: null
};

const store = new Store(reducer, initialState);
```

## 永続化レイヤー

### ローカルストレージの操作

```typescript
// ストレージのキー
const STORAGE_KEY = "todos-fp";

// シリアライズ/デシリアライズ
const serializeTodo = (todo: Todo): any => ({
    ...todo,
    createdAt: todo.createdAt.toISOString(),
    updatedAt: todo.updatedAt.toISOString()
});

const deserializeTodo = (data: any): Result<Todo, string> => {
    try {
        return ok({
            id: data.id,
            title: data.title,
            completed: data.completed,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
        });
    } catch (error) {
        return err("Invalid todo data");
    }
};

// ストレージ操作
const storage = {
    save: (todos: Todo[]): Result<void, string> => {
        try {
            const data = todos.map(serializeTodo);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return ok(undefined);
        } catch (error) {
            return err("Failed to save todos");
        }
    },
    
    load: (): Result<Todo[], string> => {
        try {
            const json = localStorage.getItem(STORAGE_KEY);
            if (!json) return ok([]);
            
            const data = JSON.parse(json);
            if (!Array.isArray(data)) return err("Invalid data format");
            
            const results = data.map(deserializeTodo);
            const errors = results.filter(isErr);
            
            if (errors.length > 0) {
                return err("Some todos could not be loaded");
            }
            
            return ok(results.map(r => (r as Ok<Todo>).value));
        } catch (error) {
            return err("Failed to load todos");
        }
    }
};
```

### 非同期同期のシミュレーション

```typescript
// APIクライアントのモック
const mockApi = {
    fetchTodos: (): AsyncResult<Todo[], string> => 
        async () => {
            // ネットワーク遅延のシミュレーション
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // ランダムにエラーを発生
            if (Math.random() < 0.1) {
                return err("Network error");
            }
            
            // ストレージからデータを取得
            return storage.load();
        },
    
    saveTodo: (todo: Todo): AsyncResult<Todo, string> =>
        async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (Math.random() < 0.05) {
                return err("Failed to save");
            }
            
            return ok(todo);
        }
};
```

## 副作用の管理

### エフェクトハンドラー

```typescript
// 副作用の定義
type Effect =
    | { type: "SAVE_TO_STORAGE"; payload: Todo[] }
    | { type: "LOAD_FROM_STORAGE" }
    | { type: "SYNC_WITH_SERVER" };

// エフェクトハンドラー
const handleEffect = (
    effect: Effect,
    dispatch: (action: Action) => void
): void => {
    switch (effect.type) {
        case "SAVE_TO_STORAGE":
            const saveResult = storage.save(effect.payload);
            if (isErr(saveResult)) {
                dispatch({ type: "SET_ERROR", payload: saveResult.error });
            }
            break;
            
        case "LOAD_FROM_STORAGE":
            const loadResult = storage.load();
            if (isOk(loadResult)) {
                dispatch({ type: "SET_TODOS", payload: loadResult.value });
            } else {
                dispatch({ type: "SET_ERROR", payload: loadResult.error });
            }
            break;
            
        case "SYNC_WITH_SERVER":
            dispatch({ type: "SET_LOADING", payload: true });
            
            runTask(mockApi.fetchTodos()).then(result => {
                dispatch({ type: "SET_LOADING", payload: false });
                
                if (isOk(result)) {
                    dispatch({ type: "SET_TODOS", payload: result.value });
                } else {
                    dispatch({ type: "SET_ERROR", payload: result.error });
                }
            });
            break;
    }
};
```

## UIコンポーネント（React例）

```typescript
// カスタムフック
const useTodoStore = () => {
    const [state, setState] = useState(store.getState());
    
    useEffect(() => {
        const unsubscribe = store.subscribe(setState);
        return unsubscribe;
    }, []);
    
    const dispatch = useCallback((action: Action) => {
        store.dispatch(action);
        
        // 自動保存
        if (["ADD_TODO", "REMOVE_TODO", "TOGGLE_TODO", "UPDATE_TODO", "TOGGLE_ALL", "CLEAR_COMPLETED"].includes(action.type)) {
            handleEffect(
                { type: "SAVE_TO_STORAGE", payload: store.getState().todos },
                store.dispatch.bind(store)
            );
        }
    }, []);
    
    return { state, dispatch };
};

// TODOリストコンポーネント
const TodoList: React.FC = () => {
    const { state, dispatch } = useTodoStore();
    
    const visibleTodos = filterTodos(state.todos, state.filter);
    const stats = calculateStats(state.todos);
    
    const handleAddTodo = (title: string) => {
        dispatch({ type: "ADD_TODO", payload: title });
    };
    
    const handleToggle = (id: TodoId) => {
        dispatch({ type: "TOGGLE_TODO", payload: id });
    };
    
    const handleRemove = (id: TodoId) => {
        dispatch({ type: "REMOVE_TODO", payload: id });
    };
    
    // 初回ロード
    useEffect(() => {
        handleEffect(
            { type: "LOAD_FROM_STORAGE" },
            dispatch
        );
    }, [dispatch]);
    
    return (
        <div>
            <TodoInput onAdd={handleAddTodo} />
            
            <TodoItems
                todos={visibleTodos}
                onToggle={handleToggle}
                onRemove={handleRemove}
            />
            
            <TodoFooter
                stats={stats}
                currentFilter={state.filter}
                onFilterChange={(filter) => 
                    dispatch({ type: "SET_FILTER", payload: filter })
                }
                onClearCompleted={() => 
                    dispatch({ type: "CLEAR_COMPLETED" })
                }
            />
            
            {state.error && <ErrorMessage message={state.error} />}
            {state.isLoading && <LoadingSpinner />}
        </div>
    );
};
```

## テスト

### ビジネスロジックのテスト

```typescript
describe("Todo operations", () => {
    describe("addTodo", () => {
        it("should add a new todo", () => {
            const todos: Todo[] = [];
            const result = addTodo(todos, "New task");
            
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("New task");
            expect(result[0].completed).toBe(false);
        });
        
        it("should not add empty todo", () => {
            const todos: Todo[] = [];
            const result = addTodo(todos, "   ");
            
            expect(result).toHaveLength(0);
        });
    });
    
    describe("toggleTodo", () => {
        it("should toggle todo completion", () => {
            const todo = createTodo("Test");
            const todos = [todo];
            
            const result = toggleTodo(todos, todo.id);
            
            expect(result[0].completed).toBe(true);
            expect(todos[0].completed).toBe(false); // 元の配列は変更されない
        });
    });
});

describe("Reducer", () => {
    it("should handle ADD_TODO action", () => {
        const state: AppState = {
            todos: [],
            filter: "all",
            isLoading: false,
            error: null
        };
        
        const newState = reducer(state, {
            type: "ADD_TODO",
            payload: "New todo"
        });
        
        expect(newState.todos).toHaveLength(1);
        expect(newState.todos[0].title).toBe("New todo");
    });
});
```

## まとめ

この実践プロジェクトでは：

- ✅ ビジネスロジックを純粋関数として実装
- ✅ 状態管理を不変データ構造で実現
- ✅ 副作用を明確に分離して管理
- ✅ エラーハンドリングを一貫して実装
- ✅ テスタブルなアーキテクチャを構築

関数型プログラミングの原則に従うことで、予測可能で保守しやすいアプリケーションを構築できました。

## 発展課題

1. **Undo/Redo機能**: 状態の履歴を管理して実装
2. **楽観的更新**: 非同期操作の改善
3. **データ検証**: より厳密な型とバリデーション
4. **パフォーマンス最適化**: メモ化とセレクターの活用

[付録: TypeScriptの型システム →](../appendix/typescript-types.md){ .md-button .md-button--primary }