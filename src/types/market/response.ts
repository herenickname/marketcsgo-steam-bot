export type TMarketGoodResponse = { success: boolean }
export type TMarketErrorResponse = {
    success: boolean
    error?: string
}

export type TMarketResponse<T extends TMarketGoodResponse> = T & TMarketErrorResponse
