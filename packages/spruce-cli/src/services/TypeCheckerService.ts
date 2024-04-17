import ImportService from './ImportService'

export default class TypeCheckerService {
    private importer: ImportService
    public constructor(importer: ImportService) {
        this.importer = importer
    }
    public check = async (tsFile: string) => {
        await this.importer.importAll(tsFile)
    }
}
