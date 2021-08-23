export class ExceptionWithObject extends Error {
    private obj: any

    constructor(obj: any) {
        super(JSON.stringify(obj))
        this.obj = obj
    }

    getObject() {
        return this.obj
    }
}
