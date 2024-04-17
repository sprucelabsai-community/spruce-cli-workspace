import { namesUtil } from '@sprucelabs/spruce-skill-utils'
import {
    DirectoryTemplateContextSkill,
    DirectoryTemplateCode,
} from '@sprucelabs/spruce-templates'
import AbstractWriter, { WriteResults } from '../../../writers/AbstractWriter'

export default class SkillGenerator extends AbstractWriter {
    public async writeSkill(
        destinationDir: string,
        options: DirectoryTemplateContextSkill & { filesToSkip?: string[] }
    ): Promise<WriteResults> {
        const { filesToSkip, ...context } = options

        return this.writeDirectoryTemplate({
            destinationDir,
            code: DirectoryTemplateCode.Skill,
            filesToSkip,
            firstFileWriteMessage:
                'As I was upgrading your skill, I found some files I want to overwrite. Lemme take you through them now.',
            context: {
                ...context,
                name: namesUtil.toKebab(options.name),
            },
        })
    }
}
