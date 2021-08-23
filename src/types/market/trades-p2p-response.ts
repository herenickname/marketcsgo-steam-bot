type Item = Readonly<{
    appid: number
    contextid: number
    assetid: string
    amount: number
}>

type Offer = Readonly<{
    hash: string
    partner: number
    token: string
    tradeoffermessage: string
    items: Item[]
    created: boolean
}>

export type TMarketTradesResponse = Readonly<{
    success: boolean
    offers: Offer[]
}>
