/**
 * 第2章: 純粋関数と副作用
 * 
 * このファイルで学ぶこと：
 * 1. 純粋関数の特徴（同じ入力→同じ出力、副作用なし）
 * 2. 実践的なECサイトの例
 * 3. 副作用の分離
 * 4. メモ化によるパフォーマンス改善
 */

// ===================================
// 🌱 純粋関数の基本
// ===================================

/**
 * ✅ 純粋関数の例：税込価格の計算
 * - 同じ入力（価格と税率）なら必ず同じ結果
 * - 外部の状態に依存しない
 */
export function calculatePriceWithTax(price: number, taxRate: number): number {
    return price * (1 + taxRate);
}

/**
 * ❌ 純粋でない関数の例：グローバル変数に依存
 */
let globalTaxRate = 0.1; // 危険：外部から変更される可能性

export function calculatePriceBad(price: number): number {
    return price * (1 + globalTaxRate); // 外部変数に依存！
}

// ===================================
// 🛍️ ECサイトの実践例
// ===================================

// 商品の型定義
export type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
};

// カートアイテムの型定義
export type CartItem = {
    product: Product;
    quantity: number;
};

/**
 * 🌱 純粋関数：カートアイテムの小計を計算
 */
export function calculateItemSubtotal(item: CartItem): number {
    return item.product.price * item.quantity;
}

/**
 * 🌱 純粋関数：送料の計算
 * 3000円以上で送料無料
 */
export function calculateShipping(
    subtotal: number,
    shippingFee: number = 500,
    freeShippingThreshold: number = 3000
): number {
    return subtotal >= freeShippingThreshold ? 0 : shippingFee;
}

/**
 * 🌱 純粋関数：割引の適用
 */
export function applyDiscount(
    price: number,
    discountRate: number
): number {
    return price * (1 - discountRate);
}

/**
 * 🌱 純粋関数：カート全体の計算
 */
export function calculateCart(
    items: CartItem[],
    discountRate: number = 0,
    shippingFee: number = 500
): {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
} {
    // 小計を計算
    const subtotal = items.reduce(
        (sum, item) => sum + calculateItemSubtotal(item),
        0
    );
    
    // 割引額を計算
    const discountAmount = subtotal * discountRate;
    const afterDiscount = subtotal - discountAmount;
    
    // 送料を計算
    const shipping = calculateShipping(afterDiscount, shippingFee);
    
    // 税金を計算（10%）
    const tax = (afterDiscount + shipping) * 0.1;
    
    // 合計
    const total = afterDiscount + shipping + tax;
    
    return {
        subtotal,
        discount: discountAmount,
        shipping,
        tax,
        total
    };
}

// ===================================
// 💨 副作用の分離
// ===================================

/**
 * 🌱 純粋関数：商品の検索とフィルタリング
 */
export function searchProducts(
    products: Product[],
    keyword: string,
    maxPrice?: number
): Product[] {
    return products
        .filter(p => 
            p.name.toLowerCase().includes(keyword.toLowerCase()) ||
            p.category.toLowerCase().includes(keyword.toLowerCase())
        )
        .filter(p => maxPrice === undefined || p.price <= maxPrice)
        .sort((a, b) => a.price - b.price);
}

/**
 * 🌱 純粋関数：在庫のチェック
 */
export function canAddToCart(
    product: Product,
    quantity: number,
    currentCartQuantity: number = 0
): boolean {
    return product.stock >= currentCartQuantity + quantity;
}

/**
 * 💨 副作用を持つ関数：API呼び出し
 * 実際のアプリケーションでは分離して使用
 */
export async function fetchProductsFromAPI(
    apiUrl: string,
    category?: string
): Promise<Product[]> {
    const url = category 
        ? `${apiUrl}/products?category=${category}`
        : `${apiUrl}/products`;
    
    const response = await fetch(url);
    return response.json();
}

/**
 * 💨 副作用を持つ関数：ローカルストレージへの保存
 */
export function saveCartToLocalStorage(cart: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// ===================================
// 🚀 パフォーマンス最適化：メモ化
// ===================================

/**
 * メモ化のヘルパー関数
 * 高価な計算結果をキャッシュする
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
            console.log(`キャッシュから取得: ${key}`);
            return cache.get(key)!;
        }
        
        console.log(`新規計算: ${key}`);
        const result = fn(...args);
        cache.set(key, result);
        return result;
    }) as T;
}

/**
 * 高価な計算の例：商品のレコメンデーション
 */
export function calculateRecommendations(
    userId: number,
    products: Product[]
): Product[] {
    // 実際はもっと複雑なアルゴリズム
    console.log(`ユーザー${userId}のおすすめを計算中...`);
    return products
        .sort((a, b) => b.price - a.price)
        .slice(0, 5);
}

// メモ化されたバージョン
export const memoizedRecommendations = memoize(calculateRecommendations);

// ===================================
// 🚀 実行例
// ===================================
if (require.main === module) {
    console.log('=== 🌱 純粋関数の例 ===');
    
    // 税込価格の計算（純粋関数）
    console.log('1000円の税込価格（10%）:', calculatePriceWithTax(1000, 0.1));
    console.log('1000円の税込価格（10%）:', calculatePriceWithTax(1000, 0.1));
    console.log('↑ 同じ入力なら必ず同じ結果！\n');
    
    console.log('=== 🛍️ ECサイトのカート計算 ===');
    
    const products: Product[] = [
        { id: 'P001', name: 'ノートPC', price: 80000, category: 'electronics', stock: 5 },
        { id: 'P002', name: 'マウス', price: 2000, category: 'electronics', stock: 20 },
        { id: 'P003', name: 'キーボード', price: 5000, category: 'electronics', stock: 15 }
    ];
    
    const cart: CartItem[] = [
        { product: products[0], quantity: 1 },
        { product: products[1], quantity: 2 }
    ];
    
    // カートの計算（純粋関数）
    const cartResult = calculateCart(cart, 0.1); // 10%割引
    console.log('カート内容:');
    cart.forEach(item => {
        console.log(`  ${item.product.name} × ${item.quantity} = ¥${calculateItemSubtotal(item)}`);
    });
    console.log('\n計算結果:', cartResult);
    
    console.log('\n=== 🔍 商品検索（純粋関数） ===');
    const searchResult = searchProducts(products, 'ー', 10000);
    console.log('「ー」で10000円以下の商品:');
    searchResult.forEach(p => console.log(`  ${p.name}: ¥${p.price}`));
    
    console.log('\n=== 🚀 メモ化の効果 ===');
    const testProducts = products.slice(0, 3);
    
    // 1回目：計算される
    memoizedRecommendations(123, testProducts);
    
    // 2回目：キャッシュから取得
    memoizedRecommendations(123, testProducts);
    
    // 違うユーザー：新規計算
    memoizedRecommendations(456, testProducts);
}