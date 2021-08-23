type Item = {
    market_hash_name: string
    volume: string
    price: string
}

export type TMarketPricesResponse = {
    success: boolean
    time: number
    currency: string
    items: Item[]
}
