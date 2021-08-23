import * as prompts from 'prompts'
import { MarketAuthParamsDto } from '../dtos/market-auth.dto'
import { SteamAuthParamsDto } from '../dtos/steam-auth.dto'

class AuthenticationValuesStrategy {
    protected steam: SteamAuthParamsDto
    protected market: MarketAuthParamsDto
    async execute(): Promise<void> {
        throw new Error('Abstract class')
    }
    steamValue() {
        return this.steam
    }
    marketValue() {
        return this.market
    }
}

export class AuthenticationValues extends AuthenticationValuesStrategy {
    private readonly strategies: typeof AuthenticationValuesStrategy[] = []

    constructor(strategies: typeof AuthenticationValuesStrategy[]) {
        super()
        this.strategies = strategies
    }

    async execute() {
        for (const Strategy of this.strategies) {
            const instance = new Strategy()

            try {
                await instance.execute()
                Object.assign(this, instance)
                return
            } catch (e) {
                continue
            }
        }

        throw new Error('Невозможно получить данные авторизации следуя существующим стратегиям')
    }
}

export class EnvStrategy extends AuthenticationValuesStrategy {
    async execute() {
        const { MARKET_API_KEY, STEAM_LOGIN, STEAM_PASSWORD, STEAM_SHAREDSECRET, STEAM_IDENTITYSECRET } = process.env

        if (!MARKET_API_KEY || !STEAM_LOGIN || !STEAM_PASSWORD || !STEAM_SHAREDSECRET || !STEAM_IDENTITYSECRET) {
            throw new Error()
        }

        this.steam = new SteamAuthParamsDto({
            accountName: STEAM_LOGIN,
            password: STEAM_PASSWORD,
            sharedSecret: STEAM_SHAREDSECRET,
            identitySecret: STEAM_IDENTITYSECRET
        })

        this.market = new MarketAuthParamsDto({
            apiKey: MARKET_API_KEY
        })
    }
}

export class PromptStrategy extends AuthenticationValuesStrategy {
    async execute(attempts = 0) {
        if (attempts === 3) {
            process.exit()
        }

        console.log('\nВведите данные бота ниже (esc - выход)...\n')

        const questions = [
            {
                type: 'text' as any,
                name: 'accountName',
                message: 'Логин в Steam',
                validate: (value) => value.length > 1
            },
            {
                type: 'password' as any,
                name: 'password',
                message: 'Пароль от аккаунта',
                validate: (value) => value.length > 1
            },
            {
                type: 'text' as any,
                name: 'sharedSecret',
                message: 'Shared Secret из 2FA',
                validate: (value) => value.length === 28
            },
            {
                type: 'text' as any,
                name: 'identitySecret',
                message: 'Identity Secret из 2FA',
                validate: (value) => value.length === 28
            },
            {
                type: 'text' as any,
                name: 'marketApiKey',
                message: 'CSGO.TM API Key',
                validate: (value) => value.length > 30
            }
        ]

        const response = await prompts(questions)

        this.steam = new SteamAuthParamsDto({
            accountName: response.accountName,
            password: response.password,
            sharedSecret: response.sharedSecret,
            identitySecret: response.identitySecret
        })

        this.market = new MarketAuthParamsDto({
            apiKey: response.marketApiKey
        })
    }

    steamValue() {
        return this.steam
    }

    marketValue() {
        return this.market
    }
}
