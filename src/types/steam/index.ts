export type TSteamAuthenticationResponse = { sessionID; cookies; steamguard; oAuthToken }
export type TSteamOffer = {
    addMyItem: (item: { assetid: number | string; appid: number; contextid: number; amount: number }) => boolean
    setMessage: (message: string) => void
    send: (callback: (err, status) => void) => void
}
export type TSteamConfirmationsResponse = {
    id: string
    type: 2
    creator: string
    key: string
    title: string
    receiving: string
    time: string
    icon: string
    offerID: string
}[]
