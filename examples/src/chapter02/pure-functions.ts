/**
 * 第2章: 純粋関数と副作用
 * 純粋関数の実装と副作用の分離
 */

// 純粋関数の例
export function add(a: number, b: number): number {
    return a + b;
}

export function multiply(a: number, b: number): number {
    return a * b;
}

// 配列操作の純粋関数
export function doubleArray(numbers: number[]): number[] {
    return numbers.map(n => n * 2);
}

export function filterEven(numbers: number[]): number[] {
    return numbers.filter(n => n % 2 === 0);
}

// ユーザーデータの変換（純粋関数）
export type RawUser = {
    firstName: string;
    lastName: string;
    email: string;
    status: 'active' | 'inactive' | 'pending';
};

export type ProcessedUser = {
    fullName: string;
    email: string;
    isActive: boolean;
    initials: string;
};

export function transformUserData(user: RawUser): ProcessedUser {
    return {
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email.toLowerCase(),
        isActive: user.status === 'active',
        initials: `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    };
}

// 価格計算の純粋関数
export type CartItem = {
    productId: string;
    price: number;
    quantity: number;
};

export type DiscountRule = {
    minQuantity: number;
    discountPercent: number;
};

export function calculateItemTotal(item: CartItem): number {
    return item.price * item.quantity;
}

export function applyDiscount(
    total: number,
    discountRule: DiscountRule,
    quantity: number
): number {
    if (quantity >= discountRule.minQuantity) {
        return total * (1 - discountRule.discountPercent / 100);
    }
    return total;
}

export function calculateCartTotal(
    items: CartItem[],
    discountRule?: DiscountRule
): number {
    const subtotal = items.reduce(
        (sum, item) => sum + calculateItemTotal(item),
        0
    );

    if (discountRule) {
        const totalQuantity = items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );
        return applyDiscount(subtotal, discountRule, totalQuantity);
    }

    return subtotal;
}

// メモ化の実装
export function memoize<TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => TResult
): (...args: TArgs) => TResult {
    const cache = new Map<string, TResult>();

    return (...args: TArgs): TResult => {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
}

// 高価な計算のシミュレーション
export function fibonacci(n: number): number {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// メモ化されたフィボナッチ
export const memoizedFibonacci = memoize(fibonacci);

// 実行例
if (require.main === module) {
    // 純粋関数のテスト
    console.log('add(2, 3):', add(2, 3));
    console.log('add(2, 3):', add(2, 3)); // 同じ結果

    // ユーザーデータ変換
    const rawUser: RawUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'JOHN.DOE@EXAMPLE.COM',
        status: 'active'
    };

    const processedUser = transformUserData(rawUser);
    console.log('Processed user:', processedUser);

    // カート計算
    const cartItems: CartItem[] = [
        { productId: 'A001', price: 1000, quantity: 2 },
        { productId: 'B002', price: 500, quantity: 3 }
    ];

    const discount: DiscountRule = {
        minQuantity: 5,
        discountPercent: 10
    };

    console.log('Cart total:', calculateCartTotal(cartItems));
    console.log('Cart total with discount:', calculateCartTotal(cartItems, discount));
}