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
import { assert, generateId, test } from '@sprucelabs/test-utils'
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
export default class GenerateSkillViewTest extends AbstractEightBitTest {
    private static vc: SpyGenerateSkillView
    private static checkStatusIntervalCb: undefined | (() => Promise<void>)
    private static checkStatusIntervalMs: number | undefined
    private static intervalId: string
    private static passedIntervalIdToClear?: string

    @seed('familyMembers', 3)
    protected static async beforeEach(): Promise<void> {
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
    protected static async requiresLogin() {
        await vcAssert.assertLoginIsRequired(this.vc)
    }

    @test()
    protected static async rendersExpectedCards() {
        vcAssert.assertSkillViewRendersCards(this.vc, [
            'elements',
            'members',
            'currentChallenge',
            'controls',
        ])
    }

    @test()
    protected static async controlsCardRendersExpectedButtons() {
        buttonAssert.cardRendersButtons(this.controlsVc, ['back', 'generate'])
    }

    @test()
    protected static async rendersAlertAndRedirectsIfNoMembers() {
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
    protected static async clickingBackGoesBackToRoot() {
        await vcAssert.assertActionRedirects({
            action: () => interactor.clickButton(this.controlsVc, 'back'),
            destination: {
                id: 'eightbitstories.root',
            },
            router: this.views.getRouter(),
        })
    }

    @test()
    protected static elementsAndMembersCardsRendersForms() {
        formAssert.cardRendersForm(this.elementsVc)
        formAssert.cardRendersForm(this.membersVc)
        formAssert.cardRendersForm(this.currentChallengeVc)
    }

    @test()
    protected static async formCardsDoNotRenderButtons() {
        assert.isFalse(this.elementsFormVc.getShouldRenderSubmitControls())
        assert.isFalse(this.membersFormVc.getShouldRenderSubmitControls())
        assert.isFalse(
            this.currentChallengeFormVc.getShouldRenderSubmitControls()
        )
    }

    @test()
    protected static async elementsFormRendersExpectedFields() {
        formAssert.formRendersFields(this.elementsFormVc, ['elements'])
    }

    @test()
    protected static async elementsFormRendersExpectedChoices() {
        const schema = this.elementsFormVc.getSchema()
        selectAssert.assertSelectChoicesMatch(
            schema.fields.elements.options.choices,
            storyElements.map((element) => element.id)
        )
    }

    @test()
    protected static async rendersElementsAsTags() {
        formAssert.formFieldRendersAs(this.elementsFormVc, 'elements', 'tags')
    }

    @test()
    protected static async membersFormRendersExpectedFields() {
        formAssert.formRendersFields(this.membersFormVc, ['members'])
    }

    @test()
    protected static async membersFormRendersAsTags() {
        formAssert.formFieldRendersAs(this.membersFormVc, 'members', 'tags')
    }

    @test()
    protected static async membersRendersExpectedChoices() {
        const members = await this.getAllMembers()
        const expected = members.map((member) => member.id)

        const schema = this.membersFormVc.getSchema()
        selectAssert.assertSelectChoicesMatch(
            schema.fields.members.options.choices as SelectChoice[],
            expected
        )
    }

    @test()
    protected static async currentChallengeFormRendersAsExpected() {
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
    protected static async clickingGenerateSetsControlsToBusy() {
        await this.eventFaker.fakeGenerateStory(() => {})

        await this.selectFirstMember()
        await this.selectFirstElement()

        const promise = this.clickGenerateAndAssertRedirect()
        this.assertFooterIsBusy()

        await promise
    }

    @test()
    protected static async rendersAlertIfFailsToGenerateStory() {
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
    protected static async generatePassesSelectedMembersAndElements(
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
    protected static async generatingStoryRedirectsToStoryWithArgs() {
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
    protected static async callingDestroyRemovesDidGenerateListener() {
        await this.vc.destroy()

        await eventFaker.handleReactiveEvent(
            'eightbitstories.did-generate-story::v2023_09_05'
        )

        await this.emitDidGenerate()
    }

    @test()
    protected static async rendersNullNavigation() {
        navigationAssert.skillViewDoesNotRenderNavigation(this.vc)
    }

    @test()
    protected static async checksForGeneratedStoryAfterSubmitting() {
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
    protected static async passesExpectedIntervalToChecksAfterSubmit() {
        await this.eventFaker.fakeGenerateStory()
        await this.selectElementFamilyMemberAndClickGenerate()
        assert.isEqual(this.checkStatusIntervalMs, 1000 * 10)
    }

    @test()
    protected static async doesNotSetIntervalIfGenerateThrows() {
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
    protected static async redirectsIfResponseIsStoryGenerated() {
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
    protected static async clearsTimeoutOnBlur() {
        await this.fakeGenerateSelectEverythingAndClickGenerate()
        assert.isFalsy(this.passedIntervalIdToClear)
        await interactor.blur(this.vc)
        assert.isEqual(
            this.passedIntervalIdToClear,
            this.intervalId,
            'did not pass response to setInterval to clearInterval'
        )
    }

    private static async fakeGenerateSelectEverythingClickGenerateAndInvokeIntervalCb() {
        await this.fakeGenerateSelectEverythingAndClickGenerate()
        await this.checkStatusIntervalCb?.()
    }

    private static async fakeGenerateSelectEverythingAndClickGenerate() {
        await this.eventFaker.fakeGenerateStory()
        await this.selectElementFamilyMemberAndClickGenerate()
    }

    private static async selectElementFamilyMemberAndClickGenerate() {
        await this.selectFirstElement()
        await this.selectFirstMember()
        await this.clickGenerate()
    }

    private static async clickGenerateAndAssertRedirect(destination?: {
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

    private static async emitDidGenerate(storyId?: string) {
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

    private static async selectFirstElement() {
        const selectedElement = await this.selectElement(0)
        return selectedElement
    }

    private static async selectElement(idx: number) {
        const selectedElements = await this.selectElements([idx])
        return selectedElements[0]
    }

    private static async selectElements(allIdxs: number[]) {
        const selectedElements = allIdxs.map((idx) => storyElements[idx].id)
        await this.elementsFormVc.setValue('elements', selectedElements)
        return selectedElements
    }

    private static async selectFirstMember() {
        const selectedMember = await this.selectMember(0)
        return selectedMember
    }

    private static async selectMember(idx: number) {
        const selectedMembers = await this.selectMembers([idx])
        return selectedMembers[0]
    }

    private static async selectMembers(allIdxs: number[]) {
        const members = await this.getAllMembers()
        const selectedMembers = allIdxs.map((idx) => members[idx].id)
        await this.membersFormVc.setValue('members', selectedMembers as any)
        return selectedMembers
    }

    private static async getAllMembers() {
        return await this.members.find({})
    }

    private static assertFooterIsNotBusy() {
        assert.isFalse(this.getIsFooterBusy())
    }

    private static assertFooterIsBusy() {
        assert.isTrue(this.getIsFooterBusy())
    }

    private static getIsFooterBusy(): boolean | null | undefined {
        return this.controlsVc.getFooter()?.isBusy
    }

    private static async clickGenerate() {
        await interactor.clickButton(this.controlsVc, 'generate')
    }

    private static get membersFormVc() {
        return this.vc.getMembersFormVc()
    }

    private static get elementsFormVc() {
        return this.vc.getElementsFormVc()
    }

    private static async loadVc() {
        await this.views.load(this.vc)
    }

    private static get membersVc() {
        return this.vc.getMembersVc()
    }

    private static get currentChallengeVc() {
        return this.vc.getCurrentChallengeVc()
    }

    private static get currentChallengeFormVc() {
        return this.currentChallengeVc.getFormVc() as FormViewController<CurrentChallengeSchema>
    }

    private static get elementsVc() {
        return this.vc.getElementsVc()
    }

    private static get controlsVc() {
        return this.vc.getControlsCardVc()
    }

    private static Vc(): SpyGenerateSkillView {
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
