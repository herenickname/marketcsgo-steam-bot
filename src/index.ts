import * as boxen from 'boxen'
import * as chalk from 'chalk'
import { AuthenticationValues, EnvStrategy, PromptStrategy } from './classes/authentication-values'
import { MarketAPI } from './classes/market'
import { SteamBot } from './classes/steam'
import { runSteamBot, updateMarketInventory } from './features'

async function main() {
    console.log(boxen(chalk.green.bold('SteamBot') + ' by ' + chalk.blue('@herenickname'), { padding: 1, margin: 1 }))

    const auth = new AuthenticationValues([EnvStrategy, PromptStrategy])
    await auth.execute()
    await auth.marketValue()

    const market = new MarketAPI(auth.marketValue())
    const steam = new SteamBot(auth.steamValue())

    steam.authentication$.subscribe((x) => console.log(x))
    steam.tfaConfirmations$.subscribe((x) => console.log(x))
    steam.offerSending$.subscribe((x) => console.log(x))

    await updateMarketInventory(market)
    await runSteamBot(market, steam)
}
main()
