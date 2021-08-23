export class MarketAuthParamsDto {
    apiKey: string

    constructor(dto: MarketAuthParamsDto) {
        Object.assign(this, dto)
    }
}
