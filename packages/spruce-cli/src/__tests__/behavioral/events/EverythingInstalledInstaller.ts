import { FeatureDependency } from '../../../features/AbstractFeature'
import FeatureInstaller from '../../../features/FeatureInstaller'
import {
	FeatureCode,
	FeatureInstallResponse,
	FeatureMap,
} from '../../../features/features.types'

export default class EverythingInstalledInstaller implements FeatureInstaller {
	private featureMap: Partial<FeatureMap> = {}

	public mapFeature<C extends keyof FeatureMap>(
		code: C,
		feature: FeatureMap[C]
	): void {
		this.featureMap[code] = feature
	}

	public async install(): Promise<FeatureInstallResponse> {
		return {}
	}
	public async getInstalledFeatures() {
		return Object.values(this.featureMap)
	}
	public getFeatureDependencies(): FeatureDependency[] {
		return []
	}
	public getAllCodes(): FeatureCode[] {
		return Object.keys(this.featureMap) as FeatureCode[]
	}

	public async isInstalled(_code: keyof FeatureMap): Promise<boolean> {
		return true
	}
	public markAsSkippedThisRun(_code: keyof FeatureMap): void {}
	public markAsPermanentlySkipped(_code: keyof FeatureMap): void {}
	public isMarkedAsSkipped(_code: keyof FeatureMap): boolean {
		return false
	}
	public getFeature<C extends keyof FeatureMap>(code: C): FeatureMap[C] {
		return this.featureMap[code]!
	}
	public async areInstalled(_codes: FeatureCode[]): Promise<boolean> {
		return true
	}
}
