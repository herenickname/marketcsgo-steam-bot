import { SteamAuthParamsDto } from '../dtos/steam-auth.dto'
import { ExceptionWithObject } from '../errors/ExceptionWithObject'
import { Subject } from 'rxjs'
import * as SteamTotp from 'steam-totp'
import * as SteamTradeofferManager from 'steam-tradeoffer-manager'
import * as SteamCommunity from 'steamcommunity'
import { TSteamAuthenticationResponse, TSteamConfirmationsResponse, TSteamOffer } from 'types/steam'

export class SteamBot {
    public readonly authentication$ = new Subject<TSteamAuthenticationResponse>()
    public readonly offerSending$ = new Subject<{ offer: TSteamOffer; status: string }>()
    public readonly tfaConfirmations$ = new Subject<TSteamConfirmationsResponse>()

    private trademanager
    private readonly community = new SteamCommunity()
    private readonly authParams: SteamAuthParamsDto

    constructor(authParams: SteamAuthParamsDto) {
        this.authParams = authParams
    }

    authenticate() {
        return new Promise((resolve, reject) => {
            this.community.login(
                {
                    accountName: this.authParams.accountName,
                    password: this.authParams.password,
                    twoFactorCode: SteamTotp.generateAuthCode(this.authParams.sharedSecret)
                },
                (err, sessionID, cookies, steamguard, oAuthToken) => {
                    if (err) {
                        const normalError = new ExceptionWithObject(err)
                        this.authentication$.error(normalError)
                        reject(normalError)
                    }

                    this.authentication$.next({ sessionID, cookies, steamguard, oAuthToken })

                    this.trademanager = new SteamTradeofferManager({
                        community: this.community,
                        pollInterval: -1
                    })

                    this.community.loggedIn((err, loggedIn) => {
                        if (err) {
                            const normalError = new ExceptionWithObject(err)
                            this.authentication$.error(normalError)
                            reject(normalError)
                        }

                        if (loggedIn) {
                            resolve(true)
                        }
                    })
                }
            )
        })
    }

    offerCreate(steamId32: number | string, token: string) {
        return this.trademanager.createOffer(`[U:1:${steamId32}]`, token) as TSteamOffer
    }

    offerSend(steamOffer: TSteamOffer) {
        return new Promise((resolve, reject) => {
            steamOffer.send((err, status) => {
                if (err) {
                    const normalError = new ExceptionWithObject(err)
                    this.offerSending$.error(normalError)
                    reject(normalError)
                }

                this.offerSending$.next({ offer: steamOffer, status })
                resolve(true)
            })
        })
    }

    tfaConfirmAll() {
        const time = SteamTotp.time(this.community._timeOffset)
        const confKey = SteamTotp.getConfirmationKey(this.authParams.identitySecret, time, 'conf')
        const allowKey = SteamTotp.getConfirmationKey(this.authParams.identitySecret, time, 'allow')

        return new Promise((resolve, reject) => {
            this.community.acceptAllConfirmations(time, confKey, allowKey, (err, confs) => {
                if (err) {
                    const normalError = new ExceptionWithObject(err)
                    this.tfaConfirmations$.error(normalError)
                    reject(normalError)
                }

                this.tfaConfirmations$.next(confs)
                resolve(confs)
            })
        })
    }
}
