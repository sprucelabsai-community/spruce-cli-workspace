require('dotenv').config()

export const DEMO_NUMBER = process.env.DEMO_NUMBER ?? '***missing***'
export const DEMO_NUMBER_LOGIN_AS_SKILL =
	process.env.DEMO_NUMBER_LOGIN_AS_SKILL ?? '***missing***'
export const DEMO_NUMBER_INSTALL_SKILL =
	process.env.DEMO_NUMBER_INSTALL_SKILL ?? '***missing***'
export const DEMO_NUMBER_GLOBAL_EVENTS =
	process.env.DEMO_NUMBER_GLOBAL_EVENTS ?? '***missing***'
export const DEMO_NUMBER_EVENTS_ON_BOOT =
	process.env.DEMO_NUMBER_EVENTS_ON_BOOT ?? '***missing***'
export const DEMO_NUMBER_VIEWS_ON_BOOT =
	process.env.DEMO_NUMBER_VIEWS_ON_BOOT ?? '***missing***'
export const DEMO_NUMBER_CREATING_AN_EVENT =
	process.env.DEMO_NUMBER_CREATING_AN_EVENT ?? '***missing***'
export const DEMO_NUMBER_EVENT_STORE =
	process.env.DEMO_NUMBER_EVENT_STORE ?? '***missing***'
