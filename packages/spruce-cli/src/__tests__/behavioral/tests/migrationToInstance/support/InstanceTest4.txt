import {
    FormViewController,
    SkillViewControllerId,
    buttonAssert,
    formAssert,
    interactor,
    navigationAssert,
    vcAssert,
} from '@sprucelabs/heartwood-view-controllers'
import { selectAssert } from '@sprucelabs/schema'
import { SelectChoice } from '@sprucelabs/spruce-core-schemas'
import { FormCardViewController } from '@sprucelabs/spruce-form-utils'
import { eventFaker, fake, seed } from '@sprucelabs/spruce-test-fixtures'
import { assert, generateId, test, suite } from '@sprucelabs/test-utils'
import GenerateSkillViewController, {
    CurrentChallengeSchema,
    GenerateStorySchema,
} from '../../../generation/Generate.svc'
import { storyElements } from '../../../generation/storyElements'
import AbstractEightBitTest from '../../support/AbstractEightBitTest'
import {
    GenerateStoryTargetAndPayload,
    GetStoryStatusTargetAndPayload,
} from '../../support/EventFaker'

@fake.login()
@suite()
export default class GenerateSkillViewTest extends AbstractEightBitTest {
    private vc!: SpyGenerateSkillView
    private checkStatusIntervalCb: undefined | (() => Promise<void>)
    private checkStatusIntervalMs!: number | undefined
    private intervalId!: string
    private passedIntervalIdToClear?: string

    @seed('familyMembers', 3)
    protected async beforeEach(): Promise<void> {
        await super.beforeEach()

        this.views.setController(
            'eightbitstories.generate',
            SpyGenerateSkillView
        )
        this.views.setController('forms.card', SpyFormCard)

        this.vc = this.Vc()

        await this.eventFaker.fakeListFamilyMembers(() => this.members.find({}))
        await this.loadVc()

        delete this.checkStatusIntervalCb
        delete this.checkStatusIntervalMs
        delete this.passedIntervalIdToClear

        this.intervalId = generateId()

        //@ts-ignore
        GenerateSkillViewController.setInterval = (
            cb: () => Promise<void>,
            intervalMs: number
        ) => {
            this.checkStatusIntervalMs = intervalMs
            this.checkStatusIntervalCb = cb
            return this.intervalId
        }

        //@ts-ignore
        GenerateSkillViewController.clearInterval = (id: string) => {
            this.passedIntervalIdToClear = id
        }
    }

    @test()
    protected async requiresLogin() {
        await vcAssert.assertLoginIsRequired(this.vc)
    }

    @test()
    protected async rendersExpectedCards() {
        vcAssert.assertSkillViewRendersCards(this.vc, [
            'elements',
            'members',
            'currentChallenge',
            'controls',
        ])
    }

    @test()
    protected async controlsCardRendersExpectedButtons() {
        buttonAssert.cardRendersButtons(this.controlsVc, ['back', 'generate'])
    }

    @test()
    protected async rendersAlertAndRedirectsIfNoMembers() {
        await this.eventFaker.fakeListFamilyMembers(() => [])
        this.vc = this.Vc()
        await vcAssert.assertRendersAlertThenRedirects({
            vc: this.vc,
            router: this.views.getRouter(),
            destination: {
                id: 'eightbitstories.root',
            },
            action: () => this.loadVc(),
        })
    }

    @test()
    protected async clickingBackGoesBackToRoot() {
        await vcAssert.assertActionRedirects({
            action: () => interactor.clickButton(this.controlsVc, 'back'),
            destination: {
                id: 'eightbitstories.root',
            },
            router: this.views.getRouter(),
        })
    }

    @test()
    protected elementsAndMembersCardsRendersForms() {
        formAssert.cardRendersForm(this.elementsVc)
        formAssert.cardRendersForm(this.membersVc)
        formAssert.cardRendersForm(this.currentChallengeVc)
    }

    @test()
    protected async formCardsDoNotRenderButtons() {
        assert.isFalse(this.elementsFormVc.getShouldRenderSubmitControls())
        assert.isFalse(this.membersFormVc.getShouldRenderSubmitControls())
        assert.isFalse(
            this.currentChallengeFormVc.getShouldRenderSubmitControls()
        )
    }

    @test()
    protected async elementsFormRendersExpectedFields() {
        formAssert.formRendersFields(this.elementsFormVc, ['elements'])
    }

    @test()
    protected async elementsFormRendersExpectedChoices() {
        const schema = this.elementsFormVc.getSchema()
        selectAssert.assertSelectChoicesMatch(
            schema.fields.elements.options.choices,
            storyElements.map((element) => element.id)
        )
    }

    @test()
    protected async rendersElementsAsTags() {
        formAssert.formFieldRendersAs(this.elementsFormVc, 'elements', 'tags')
    }

    @test()
    protected async membersFormRendersExpectedFields() {
        formAssert.formRendersFields(this.membersFormVc, ['members'])
    }

    @test()
    protected async membersFormRendersAsTags() {
        formAssert.formFieldRendersAs(this.membersFormVc, 'members', 'tags')
    }

    @test()
    protected async membersRendersExpectedChoices() {
        const members = await this.getAllMembers()
        const expected = members.map((member) => member.id)

        const schema = this.membersFormVc.getSchema()
        selectAssert.assertSelectChoicesMatch(
            schema.fields.members.options.choices as SelectChoice[],
            expected
        )
    }

    @test()
    protected async currentChallengeFormRendersAsExpected() {
        formAssert.formRendersField(
            this.currentChallengeFormVc,
            'currentChallenge'
        )
        formAssert.formFieldRendersAs(
            this.currentChallengeFormVc,
            'currentChallenge',
            'textarea'
        )
    }

    @test()
    protected async clickingGenerateSetsControlsToBusy() {
        await this.eventFaker.fakeGenerateStory(() => {})

        await this.selectFirstMember()
        await this.selectFirstElement()

        const promise = this.clickGenerateAndAssertRedirect()
        this.assertFooterIsBusy()

        await promise
    }

    @test()
    protected async rendersAlertIfFailsToGenerateStory() {
        await eventFaker.makeEventThrow(
            'eightbitstories.generate-story::v2023_09_05'
        )

        const alertVc = await vcAssert.assertRendersAlert(this.vc, () =>
            this.clickGenerate()
        )

        this.assertFooterIsBusy()

        await alertVc.hide()

        this.assertFooterIsNotBusy()
    }

    @test('submits selected members and elements 1', [0], [0])
    @test('submits selected members and elements 2', [1], [2])
    @test('submits selected members and elements 3', [0, 1], [2, 3])
    protected async generatePassesSelectedMembersAndElements(
        memberIdxs: number[],
        elementIdxs: number[]
    ) {
        let passedPayload: GenerateStoryTargetAndPayload['payload'] | undefined

        await this.eventFaker.fakeGenerateStory(({ payload }) => {
            passedPayload = payload
        })

        const selectedMembers = await this.selectMembers(memberIdxs)
        const selectedElements = await this.selectElements(elementIdxs)

        const currentChallenge = generateId()
        await this.currentChallengeFormVc.setValue(
            'currentChallenge',
            currentChallenge
        )

        await this.clickGenerateAndAssertRedirect()

        assert.isEqualDeep(passedPayload, {
            familyMembers: selectedMembers,
            storyElements: selectedElements,
            currentChallenge,
            storyHash: this.vc.getHash(),
        })
    }

    @test()
    protected async generatingStoryRedirectsToStoryWithArgs() {
        await this.eventFaker.fakeGenerateStory()

        await this.selectFirstElement()
        await this.selectFirstMember()

        const destination = {
            id: 'eightbitstories.story' as SkillViewControllerId,
            args: {
                story: generateId(),
            },
        }

        await this.clickGenerateAndAssertRedirect(destination)
    }

    @test()
    protected async callingDestroyRemovesDidGenerateListener() {
        await this.vc.destroy()

        await eventFaker.handleReactiveEvent(
            'eightbitstories.did-generate-story::v2023_09_05'
        )

        await this.emitDidGenerate()
    }

    @test()
    protected async rendersNullNavigation() {
        navigationAssert.skillViewDoesNotRenderNavigation(this.vc)
    }

    @test()
    protected async checksForGeneratedStoryAfterSubmitting() {
        let passedTarget: GetStoryStatusTargetAndPayload['target'] | undefined
        await this.eventFaker.fakeGetStoryGenerationStatus(({ target }) => {
            passedTarget = target
        })

        await this.fakeGenerateSelectEverythingClickGenerateAndInvokeIntervalCb()

        assert.isEqualDeep(passedTarget, {
            storyHash: this.vc.getHash(),
        })
    }

    @test()
    protected async passesExpectedIntervalToChecksAfterSubmit() {
        await this.eventFaker.fakeGenerateStory()
        await this.selectElementFamilyMemberAndClickGenerate()
        assert.isEqual(this.checkStatusIntervalMs, 1000 * 10)
    }

    @test()
    protected async doesNotSetIntervalIfGenerateThrows() {
        await eventFaker.makeEventThrow(
            'eightbitstories.generate-story::v2023_09_05'
        )

        await vcAssert.assertRendersAlert(this.vc, () =>
            this.selectElementFamilyMemberAndClickGenerate()
        )
        assert.isUndefined(
            this.checkStatusIntervalCb,
            'should not have been set'
        )
    }

    @test()
    protected async redirectsIfResponseIsStoryGenerated() {
        const storyId = generateId()
        await this.eventFaker.fakeGetStoryGenerationStatus(() => {
            return {
                status: 'ready',
                storyId,
            }
        })

        await this.fakeGenerateSelectEverythingAndClickGenerate()
        await vcAssert.assertActionRedirects({
            action: () => this.checkStatusIntervalCb?.(),
            destination: {
                id: 'eightbitstories.story',
                args: {
                    story: storyId,
                },
            },
            router: this.views.getRouter(),
        })
    }

    @test()
    protected async clearsTimeoutOnBlur() {
        await this.fakeGenerateSelectEverythingAndClickGenerate()
        assert.isFalsy(this.passedIntervalIdToClear)
        await interactor.blur(this.vc)
        assert.isEqual(
            this.passedIntervalIdToClear,
            this.intervalId,
            'did not pass response to setInterval to clearInterval'
        )
    }

    private async fakeGenerateSelectEverythingClickGenerateAndInvokeIntervalCb() {
        await this.fakeGenerateSelectEverythingAndClickGenerate()
        await this.checkStatusIntervalCb?.()
    }

    private async fakeGenerateSelectEverythingAndClickGenerate() {
        await this.eventFaker.fakeGenerateStory()
        await this.selectElementFamilyMemberAndClickGenerate()
    }

    private async selectElementFamilyMemberAndClickGenerate() {
        await this.selectFirstElement()
        await this.selectFirstMember()
        await this.clickGenerate()
    }

    private async clickGenerateAndAssertRedirect(destination?: {
        id: SkillViewControllerId
        args: { story: string }
    }) {
        await vcAssert.assertActionRedirects({
            action: async () => {
                await this.clickGenerate()
                await this.emitDidGenerate(destination?.args?.story)
            },
            router: this.views.getRouter(),
            destination,
        })
    }

    private async emitDidGenerate(storyId?: string) {
        await this.fakedClient.emitAndFlattenResponses(
            'eightbitstories.did-generate-story::v2023_09_05',
            {
                target: {
                    personId: generateId(),
                },
                payload: {
                    storyId: storyId ?? generateId(),
                },
            }
        )
    }

    private async selectFirstElement() {
        const selectedElement = await this.selectElement(0)
        return selectedElement
    }

    private async selectElement(idx: number) {
        const selectedElements = await this.selectElements([idx])
        return selectedElements[0]
    }

    private async selectElements(allIdxs: number[]) {
        const selectedElements = allIdxs.map((idx) => storyElements[idx].id)
        await this.elementsFormVc.setValue('elements', selectedElements)
        return selectedElements
    }

    private async selectFirstMember() {
        const selectedMember = await this.selectMember(0)
        return selectedMember
    }

    private async selectMember(idx: number) {
        const selectedMembers = await this.selectMembers([idx])
        return selectedMembers[0]
    }

    private async selectMembers(allIdxs: number[]) {
        const members = await this.getAllMembers()
        const selectedMembers = allIdxs.map((idx) => members[idx].id)
        await this.membersFormVc.setValue('members', selectedMembers as any)
        return selectedMembers
    }

    private async getAllMembers() {
        return await this.members.find({})
    }

    private assertFooterIsNotBusy() {
        assert.isFalse(this.getIsFooterBusy())
    }

    private assertFooterIsBusy() {
        assert.isTrue(this.getIsFooterBusy())
    }

    private getIsFooterBusy(): boolean | null | undefined {
        return this.controlsVc.getFooter()?.isBusy
    }

    private async clickGenerate() {
        await interactor.clickButton(this.controlsVc, 'generate')
    }

    private get membersFormVc() {
        return this.vc.getMembersFormVc()
    }

    private get elementsFormVc() {
        return this.vc.getElementsFormVc()
    }

    private async loadVc() {
        await this.views.load(this.vc)
    }

    private get membersVc() {
        return this.vc.getMembersVc()
    }

    private get currentChallengeVc() {
        return this.vc.getCurrentChallengeVc()
    }

    private get currentChallengeFormVc() {
        return this.currentChallengeVc.getFormVc() as FormViewController<CurrentChallengeSchema>
    }

    private get elementsVc() {
        return this.vc.getElementsVc()
    }

    private get controlsVc() {
        return this.vc.getControlsCardVc()
    }

    private Vc(): SpyGenerateSkillView {
        return this.views.Controller(
            'eightbitstories.generate',
            {}
        ) as SpyGenerateSkillView
    }
}

class SpyGenerateSkillView extends GenerateSkillViewController {
    public getHash() {
        return this.storyHash!
    }

    public getCurrentChallengeVc() {
        return this.currentChallengeVc
    }

    public getMembersFormVc() {
        return this.getMembersVc().getFormVc() as FormViewController<GenerateStorySchema>
    }
    public getElementsFormVc() {
        return this.getElementsVc().getFormVc() as FormViewController<GenerateStorySchema>
    }
    public getElementsVc() {
        return this.elementsVc as SpyFormCard
    }
    public getMembersVc() {
        return this.membersVc as SpyFormCard
    }
    public getControlsCardVc() {
        return this.controlsVc
    }
}

class SpyFormCard extends FormCardViewController {
    public getFormVc() {
        return this.formVc
    }
}
