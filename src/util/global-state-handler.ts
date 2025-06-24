import {ref} from "vue";
import {ExperimentConfig} from "../model/experiment-config.ts";
import {KotlinScenarioModel} from "../model/gatling-work.ts";
import {MiSArchConfig} from "../model/misarch-config.ts";
import {ChaostoolkitConfig} from "../model/chaostoolkit-config.ts";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const testUuid = ref('')
export const testVersion = ref('')

export const showOverlay = ref(true)
export const showMisarchEditor = ref(false)
export const showChaostoolkitEditor = ref(false)

export const config = ref<ExperimentConfig>(new ExperimentConfig());

export const misarchExperimentConfig = ref<MiSArchConfig[]>([])

export const chaostoolkitConfig = ref<ChaostoolkitConfig>(new ChaostoolkitConfig())

export const gatlingConfigs = ref<{ fileName: string; workFileContent: string; workModel: KotlinScenarioModel, userSteps: number[] }[]>([])

export function resetGlobalState() {
  testUuid.value = ''
  testVersion.value = ''
  showOverlay.value = true
  showMisarchEditor.value = false
  showChaostoolkitEditor.value = false
  config.value = new ExperimentConfig()
  misarchExperimentConfig.value = []
  chaostoolkitConfig.value = new ChaostoolkitConfig()
  gatlingConfigs.value = []
}