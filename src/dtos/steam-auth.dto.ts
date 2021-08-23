export class SteamAuthParamsDto {
    accountName: string
    password: string
    sharedSecret: string
    identitySecret: string

    constructor(dto: SteamAuthParamsDto) {
        Object.assign(this, dto)
    }
}
