/**
 * 第1章: 関数型プログラミングの基礎
 * 
 * このファイルで学ぶこと：
 * 1. 命令型 vs 関数型の書き方の違い
 * 2. データを変えない書き方（イミュータビリティ）
 * 3. 実践的なECサイトの例
 */

// ===================================
// 🔄 命令型 vs 関数型の比較
// ===================================

/**
 * 👴 今までの書き方（命令型）
 * - forループを使って一つずつ処理
 * - 変数totalを更新していく
 */
export function calculateTotalImperative(prices: number[]): number {
    let total = 0;  // 合計を入れる箱を用意
    
    // 価格を一つずつ取り出して...
    for (let i = 0; i < prices.length; i++) {
        total += prices[i];  // 箱の中身を更新！
    }
    
    return total;
}

/**
 * 🌱 関数型の書き方
 * - reduceを使って「みんなを足した結果」を取得
 * - 変数を更新せず、新しい値を作る
 */
export function calculateTotalFunctional(prices: number[]): number {
    return prices.reduce((total, price) => total + price, 0);
    //                    ↑今までの合計  ↑今の価格  ↑最初は0
}

// ===================================
// 🔒 イミュータビリティ（データを変えない）
// ===================================

// ECサイトのショッピングカートアイテム
export type CartItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
};

/**
 * 😰 危険な書き方：元のデータを直接変更
 * この関数を使うと、元のカートアイテムが変わってしまう！
 */
export function updateQuantityMutable(item: CartItem, newQuantity: number): CartItem {
    item.quantity = newQuantity;  // 危険：元のオブジェクトを直接変更！
    return item;
}

/**
 * 😀 安全な書き方：新しいオブジェクトを作成
 * 元のカートアイテムは変更されない
 */
export function updateQuantityImmutable(item: CartItem, newQuantity: number): CartItem {
    return {
        ...item,              // 元のオブジェクトの内容をコピー
        quantity: newQuantity // quantityだけ新しい値に更新
    };
}

// ===================================
// 🛍️ 配列のイミュータブルな操作
// ===================================

/**
 * ショッピングカートにアイテムを追加
 * 元のカート配列は変更せず、新しい配列を返す
 */
export function addToCart(cart: CartItem[], newItem: CartItem): CartItem[] {
    return [...cart, newItem];  // スプレッド構文で新しい配列を作成
}

/**
 * カートからアイテムを削除
 * filterを使って、指定ID以外のアイテムだけを含む新しい配列を作成
 */
export function removeFromCart(cart: CartItem[], itemId: number): CartItem[] {
    return cart.filter(item => item.id !== itemId);
}

/**
 * カート内のアイテムを更新
 * mapを使って、指定IDのアイテムだけ変更した新しい配列を作成
 */
export function updateCartItem(
    cart: CartItem[], 
    itemId: number, 
    updates: Partial<CartItem>
): CartItem[] {
    return cart.map(item =>
        item.id === itemId
            ? { ...item, ...updates }  // 指定IDのアイテムだけ更新
            : item                     // 他のアイテムはそのまま
    );
}

/**
 * セール商品の合計金額を計算（関数型の例）
 */
export function calculateSaleTotal(cart: CartItem[], discountRate: number = 0.2): number {
    return cart
        .filter(item => item.name.includes('セール'))  // セール商品だけ選ぶ
        .map(item => item.price * item.quantity * (1 - discountRate))  // 割引後価格を計算
        .reduce((total, price) => total + price, 0);  // 合計を計算
}

// ===================================
// 🚀 実行例
// ===================================
if (require.main === module) {
    console.log('=== 🔄 命令型 vs 関数型の比較 ===');
    const prices = [100, 250, 300, 150, 500];
    console.log('商品の価格:', prices);
    console.log('命令型の合計:', calculateTotalImperative(prices));
    console.log('関数型の合計:', calculateTotalFunctional(prices));
    console.log();

    console.log('=== 🔒 イミュータビリティの例 ===');
    const appleItem: CartItem = { id: 1, name: 'Apple', price: 100, quantity: 3 };
    console.log('元のアイテム:', appleItem);
    
    // ミュータブルな更新（危険）
    const mutableResult = updateQuantityMutable({ ...appleItem }, 5);
    console.log('ミュータブル更新後:', mutableResult);
    
    // イミュータブルな更新（安全）
    const immutableResult = updateQuantityImmutable(appleItem, 5);
    console.log('イミュータブル更新後:', immutableResult);
    console.log('元のアイテムは変わらない:', appleItem);
    console.log();

    console.log('=== 🛍️ ショッピングカートの操作 ===');
    const cart: CartItem[] = [
        { id: 1, name: 'リンゴ', price: 100, quantity: 3 },
        { id: 2, name: 'バナナ（セール）', price: 80, quantity: 5 }
    ];
    console.log('初期カート:', cart);

    // アイテムを追加
    const newCart = addToCart(cart, { id: 3, name: 'オレンジ', price: 150, quantity: 2 });
    console.log('追加後のカート:', newCart);
    console.log('元のカートの長さ:', cart.length, '(変わらない)');
    console.log('新しいカートの長さ:', newCart.length);
    
    // セール商品の合計を計算
    console.log('\nセール商品の合計(20%OFF):', calculateSaleTotal(newCart));
}