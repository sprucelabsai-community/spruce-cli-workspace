import Schema, {
	SchemaDefinitionValues
} from '@sprucelabs/schema'

import onboardingStoreDefinition from '../../schemas/onboarding.definition'

type OnboardingStoreDefinition = typeof onboardingStoreDefinition
export interface IOnboardingStoreDefinition extends OnboardingStoreDefinition {}

Description missing in schema defined in src/schemas/onboarding.definition.ts
export interface IOnboardingStore extends SchemaDefinitionValues<IOnboardingStoreDefinition> {}
export interface IOnboardingStoreInstance extends Schema<IOnboardingStoreDefinition> {}
