import { coreEventContracts } from '@sprucelabs/mercury-types'
import appointmentsDidBookAppointmentsEventContract_v2021_06_23, {
	DidBookAppointmentsEventContract as AppointmentsDidBookAppointmentsEventContract_v2021_06_23,
} from '#spruce/events/appointments/didBookAppointments.v2021_06_23.contract'
import formsConvertPdfToFormEventContract_v2021_07_02, {
	ConvertPdfToFormEventContract as FormsConvertPdfToFormEventContract_v2021_07_02,
} from '#spruce/events/forms/convertPdfToForm.v2021_07_02.contract'
import formsConvertPdfToSchemasEventContract_v2021_07_02, {
	ConvertPdfToSchemasEventContract as FormsConvertPdfToSchemasEventContract_v2021_07_02,
} from '#spruce/events/forms/convertPdfToSchemas.v2021_07_02.contract'
import formsCreateFormEventContract_v2021_07_02, {
	CreateFormEventContract as FormsCreateFormEventContract_v2021_07_02,
} from '#spruce/events/forms/createForm.v2021_07_02.contract'
import formsListCompletedFormsEventContract_v2021_07_02, {
	ListCompletedFormsEventContract as FormsListCompletedFormsEventContract_v2021_07_02,
} from '#spruce/events/forms/listCompletedForms.v2021_07_02.contract'
import formsListFormsEventContract_v2021_07_02, {
	ListFormsEventContract as FormsListFormsEventContract_v2021_07_02,
} from '#spruce/events/forms/listForms.v2021_07_02.contract'
import heartwoodDidRegisterSkillViewsEventContract_v2021_02_11, {
	DidRegisterSkillViewsEventContract as HeartwoodDidRegisterSkillViewsEventContract_v2021_02_11,
} from '#spruce/events/heartwood/didRegisterSkillViews.v2021_02_11.contract'
import heartwoodGenerateUrlEventContract_v2021_02_11, {
	GenerateUrlEventContract as HeartwoodGenerateUrlEventContract_v2021_02_11,
} from '#spruce/events/heartwood/generateUrl.v2021_02_11.contract'
import heartwoodGetSkillViewsEventContract_v2021_02_11, {
	GetSkillViewsEventContract as HeartwoodGetSkillViewsEventContract_v2021_02_11,
} from '#spruce/events/heartwood/getSkillViews.v2021_02_11.contract'
import heartwoodRegisterSkillViewsEventContract_v2021_02_11, {
	RegisterSkillViewsEventContract as HeartwoodRegisterSkillViewsEventContract_v2021_02_11,
} from '#spruce/events/heartwood/registerSkillViews.v2021_02_11.contract'

export default [
	appointmentsDidBookAppointmentsEventContract_v2021_06_23,
	formsConvertPdfToFormEventContract_v2021_07_02,
	formsConvertPdfToSchemasEventContract_v2021_07_02,
	formsCreateFormEventContract_v2021_07_02,
	formsListCompletedFormsEventContract_v2021_07_02,
	formsListFormsEventContract_v2021_07_02,
	heartwoodDidRegisterSkillViewsEventContract_v2021_02_11,
	heartwoodGenerateUrlEventContract_v2021_02_11,
	heartwoodGetSkillViewsEventContract_v2021_02_11,
	heartwoodRegisterSkillViewsEventContract_v2021_02_11,
	...coreEventContracts,
]

declare module '@sprucelabs/mercury-types/build/types/mercury.types' {
	interface SkillEventSignatures {
		'appointments.did-book-appointments::v2021_06_23': AppointmentsDidBookAppointmentsEventContract_v2021_06_23['eventSignatures']['appointments.did-book-appointments::v2021_06_23']

		'forms.convert-pdf-to-form::v2021_07_02': FormsConvertPdfToFormEventContract_v2021_07_02['eventSignatures']['forms.convert-pdf-to-form::v2021_07_02']

		'forms.convert-pdf-to-schemas::v2021_07_02': FormsConvertPdfToSchemasEventContract_v2021_07_02['eventSignatures']['forms.convert-pdf-to-schemas::v2021_07_02']

		'forms.create-form::v2021_07_02': FormsCreateFormEventContract_v2021_07_02['eventSignatures']['forms.create-form::v2021_07_02']

		'forms.list-completed-forms::v2021_07_02': FormsListCompletedFormsEventContract_v2021_07_02['eventSignatures']['forms.list-completed-forms::v2021_07_02']

		'forms.list-forms::v2021_07_02': FormsListFormsEventContract_v2021_07_02['eventSignatures']['forms.list-forms::v2021_07_02']

		'heartwood.did-register-skill-views::v2021_02_11': HeartwoodDidRegisterSkillViewsEventContract_v2021_02_11['eventSignatures']['heartwood.did-register-skill-views::v2021_02_11']

		'heartwood.generate-url::v2021_02_11': HeartwoodGenerateUrlEventContract_v2021_02_11['eventSignatures']['heartwood.generate-url::v2021_02_11']

		'heartwood.get-skill-views::v2021_02_11': HeartwoodGetSkillViewsEventContract_v2021_02_11['eventSignatures']['heartwood.get-skill-views::v2021_02_11']

		'heartwood.register-skill-views::v2021_02_11': HeartwoodRegisterSkillViewsEventContract_v2021_02_11['eventSignatures']['heartwood.register-skill-views::v2021_02_11']
	}
}
