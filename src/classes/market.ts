import axios from 'axios'
import { MarketAuthParamsDto } from 'dtos/market-auth.dto'
import { TMarketTradesResponse } from 'types/market/trades-p2p-response'
import { EMarketBadItem, EMarketBadPrice } from '../errors/market'
import { TMarketInventoryResponse } from '../types/market/inventory-response'
import { TMarketPricesResponse } from '../types/market/prices-response'
import { TMarketGoodResponse, TMarketResponse } from '../types/market/response'

export class MarketAPI {
    private apikey: string

    constructor(dto: MarketAuthParamsDto) {
        this.apikey = dto.apiKey
    }

    private async callGet<T extends TMarketGoodResponse>(
        url: string,
        params?: Record<string, string | number | boolean>
    ): Promise<T> {
        const { data } = await axios.get<TMarketResponse<T>>(url, {
            params: {
                key: this.apikey,
                ...params
            }
        })

        if (!data) {
            if (data.error) {
                switch (data.error) {
                    case 'price':
                        throw new EMarketBadPrice()

                    case 'bad_item':
                        throw new EMarketBadItem()
                }
            }

            throw new Error('An error occured while requesting market API')
        }

        return data
    }

    async prices() {
        const data = await this.callGet<TMarketPricesResponse>('https://market.csgo.com/api/v2/prices/RUB.json')

        if (data.currency !== 'RUB') {
            throw new Error('Currency is not RUB')
        }

        return data.items
    }

    async inventory() {
        const data = await this.callGet<TMarketInventoryResponse>('https://market.csgo.com/api/v2/my-inventory')
        return data.items
    }

    async addToSale(steamItemId: string | number, priceRubCents: string | number) {
        const data = await this.callGet<any>('https://market.csgo.com/api/v2/add-to-sale', {
            id: steamItemId,
            price: priceRubCents,
            cur: 'RUB'
        })
        return data.item_id
    }

    async inventoryUpdate() {
        await this.callGet('https://market.csgo.com/api/v2/update-inventory')
        return true
    }

    async ping() {
        await this.callGet('https://market.csgo.com/api/v2/ping')
        return true
    }

    async tradeRequests() {
        const data = await this.callGet<TMarketTradesResponse>(
            'https://market.csgo.com/api/v2/trade-request-give-p2p-all'
        )
        return data.offers || []
    }
}
