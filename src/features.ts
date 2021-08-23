import * as chalk from 'chalk'
import { MarketAPI } from './classes/market'
import { SteamBot } from './classes/steam'
import { EMarketBadItem } from './errors/market'

export async function updateMarketInventory(market: MarketAPI) {
    await market.inventoryUpdate()
    console.log(`Запросили обновление Steam-инвентаря на маркете`)

    const prices = await market.prices()
    const inventory = await market.inventory()

    for (const item of inventory) {
        const { price } = prices.find((x) => x.market_hash_name === item.market_hash_name)

        if (!price) {
            console.log(`Цена предмета ${chalk.green(item.market_hash_name)} неизвестна`)
            continue
        }

        const priceCents = Math.round(parseFloat(price) * 100)

        try {
            await market.addToSale(item.id, priceCents)
        } catch (e) {
            if (e instanceof EMarketBadItem) {
                console.error(`Не удалось выставить вещь ${chalk.green(item.market_hash_name)}, ошибка BadItem`)
                continue
            }
        }

        console.log(`${chalk.green(item.market_hash_name)} теперь продается за ${chalk.blue(price + ' RUB')}`)
    }

    await market.inventoryUpdate()
    console.log(`Запросили обновление Steam-инвентаря на маркете`)
}

export async function runSteamBot(market: MarketAPI, steam: SteamBot) {
    await steam.authenticate()

    setInterval(() => market.ping(), 2.5 * 60 * 1000)

    const ignoredTrades = []

    while (true) {
        await sleep(10_000)

        const marketOffers = await market.tradeRequests()

        if (!marketOffers.length) {
            continue
        }

        let sent = 0

        for (const marketOffer of marketOffers) {
            if (ignoredTrades.includes(marketOffer.hash)) {
                continue
            }

            const steamOffer = steam.offerCreate(marketOffer.partner, marketOffer.token)

            for (const item of marketOffer.items) {
                steamOffer.addMyItem({
                    assetid: item.assetid,
                    appid: item.appid,
                    contextid: item.contextid,
                    amount: item.amount
                })
            }

            steamOffer.setMessage(marketOffer.tradeoffermessage)

            try {
                await steam.offerSend(steamOffer).catch()
                ignoredTrades.push(marketOffer.hash)
                sent++
            } catch (e) {}

            await sleep(5_000)
        }

        if (sent > 0) {
            await steam.tfaConfirmAll()
        }
    }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(() => resolve(true), ms))
