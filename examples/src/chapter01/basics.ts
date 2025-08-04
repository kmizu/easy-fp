/**
 * 第1章: 関数型プログラミングの基礎
 * 基本的な概念とイミュータビリティ
 */

// 命令型アプローチ
export function sumImperative(numbers: number[]): number {
    let total = 0;
    for (let i = 0; i < numbers.length; i++) {
        total += numbers[i];
    }
    return total;
}

// 関数型アプローチ
export function sumFunctional(numbers: number[]): number {
    return numbers.reduce((acc, num) => acc + num, 0);
}

// イミュータブルな更新
export type Todo = {
    id: number;
    text: string;
    completed: boolean;
};

// ミュータブルな例（避けるべき）
export function toggleTodoMutable(todo: Todo): Todo {
    todo.completed = !todo.completed; // 元のオブジェクトを変更
    return todo;
}

// イミュータブルな例（推奨）
export function toggleTodoImmutable(todo: Todo): Todo {
    return {
        ...todo,
        completed: !todo.completed
    };
}

// 配列のイミュータブルな操作
export function addTodo(todos: Todo[], newTodo: Todo): Todo[] {
    return [...todos, newTodo]; // 新しい配列を作成
}

export function removeTodo(todos: Todo[], id: number): Todo[] {
    return todos.filter(todo => todo.id !== id);
}

export function updateTodo(todos: Todo[], id: number, updates: Partial<Todo>): Todo[] {
    return todos.map(todo =>
        todo.id === id
            ? { ...todo, ...updates }
            : todo
    );
}

// 実行例
if (require.main === module) {
    const numbers = [1, 2, 3, 4, 5];
    console.log('命令型の合計:', sumImperative(numbers));
    console.log('関数型の合計:', sumFunctional(numbers));

    const todos: Todo[] = [
        { id: 1, text: 'TypeScriptを学ぶ', completed: false },
        { id: 2, text: '関数型プログラミングを理解する', completed: false }
    ];

    const newTodos = addTodo(todos, {
        id: 3,
        text: 'サンプルコードを書く',
        completed: false
    });

    console.log('元の配列:', todos.length); // 2
    console.log('新しい配列:', newTodos.length); // 3
}