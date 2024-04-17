import { registerFieldType } from '@sprucelabs/schema'

class TestField {
    public static description = 'A test for us all'
    public static generateTypeDetails() {
        return {}
    }
}

export default registerFieldType({
    type: 'Test',
    //@ts-ignore
    class: TestField,
    package: '@sprucelabs/spruce-cli',
    importAs: 'SpruceCli',
})
