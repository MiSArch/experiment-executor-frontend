import {ref} from "vue";
import {TestConfig} from "../model/test-config.ts";
import {KotlinScenarioModel} from "../model/gatling-work.ts";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const testUuid = ref('')
export const testVersion = ref('')

export const showOverlay = ref(true)

export const chaostoolkitConfig = ref('')
export const misarchExperimentConfig = ref('')
export const config = ref<TestConfig>(new TestConfig());
export const gatlingConfigs = ref<{ fileName: string; workFileContent: string; workModel: KotlinScenarioModel, userSteps: number[] }[]>([])

export const showMisarchEditor = ref(false)
export const showChaostoolkitEditor = ref(false)