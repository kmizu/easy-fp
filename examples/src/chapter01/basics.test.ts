import {
    sumImperative,
    sumFunctional,
    toggleTodoImmutable,
    addTodo,
    removeTodo,
    updateTodo,
    type Todo
} from './basics';

describe('Chapter 1: Basics', () => {
    describe('sum functions', () => {
        it('should calculate sum correctly (imperative)', () => {
            expect(sumImperative([1, 2, 3, 4, 5])).toBe(15);
            expect(sumImperative([])).toBe(0);
            expect(sumImperative([10])).toBe(10);
        });

        it('should calculate sum correctly (functional)', () => {
            expect(sumFunctional([1, 2, 3, 4, 5])).toBe(15);
            expect(sumFunctional([])).toBe(0);
            expect(sumFunctional([10])).toBe(10);
        });
    });

    describe('immutable operations', () => {
        const todo: Todo = {
            id: 1,
            text: 'Test todo',
            completed: false
        };

        it('should toggle todo immutably', () => {
            const toggled = toggleTodoImmutable(todo);
            
            expect(toggled.completed).toBe(true);
            expect(todo.completed).toBe(false); // 元のオブジェクトは変更されない
            expect(toggled).not.toBe(todo); // 新しいオブジェクト
        });

        it('should add todo immutably', () => {
            const todos: Todo[] = [todo];
            const newTodo: Todo = {
                id: 2,
                text: 'New todo',
                completed: false
            };
            
            const result = addTodo(todos, newTodo);
            
            expect(result.length).toBe(2);
            expect(todos.length).toBe(1); // 元の配列は変更されない
            expect(result[1]).toBe(newTodo);
        });

        it('should remove todo immutably', () => {
            const todos: Todo[] = [
                { id: 1, text: 'Todo 1', completed: false },
                { id: 2, text: 'Todo 2', completed: false },
                { id: 3, text: 'Todo 3', completed: false }
            ];
            
            const result = removeTodo(todos, 2);
            
            expect(result.length).toBe(2);
            expect(todos.length).toBe(3); // 元の配列は変更されない
            expect(result.find(t => t.id === 2)).toBeUndefined();
        });

        it('should update todo immutably', () => {
            const todos: Todo[] = [
                { id: 1, text: 'Todo 1', completed: false },
                { id: 2, text: 'Todo 2', completed: false }
            ];
            
            const result = updateTodo(todos, 1, { completed: true });
            
            expect(result[0]?.completed).toBe(true);
            expect(todos[0]?.completed).toBe(false); // 元の配列は変更されない
            expect(result[1]).toBe(todos[1]); // 変更されていないオブジェクトは同じ参照
        });
    });
});