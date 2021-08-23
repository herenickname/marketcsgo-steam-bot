type Item = {
    id: string
    classid: string
    instanceid: string
    market_hash_name: string
    market_price: number
    tradable: number
}

export type TMarketInventoryResponse = {
    success: boolean
    items: Item[]
}
