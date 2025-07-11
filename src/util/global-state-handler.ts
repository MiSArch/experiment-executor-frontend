import {ref} from "vue";
import {ExperimentConfig} from "../model/experiment-config.ts";
import {KotlinScenarioModel} from "../model/gatling-work.ts";
import {MiSArchConfig} from "../model/misarch-config.ts";
import {ChaostoolkitConfig} from "../model/chaostoolkit-config.ts";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const testUuid = ref('')
export const testVersion = ref('')

export const showOverlay = ref(true)
export const showDeleteOverlay = ref(false)
export const showHelpOverlay = ref(false)
export const callingSection = ref('');
export const showMisarchEditor = ref(false)
export const showChaostoolkitEditor = ref(false)
export const showGraphOverlay = ref(false)
export const showWarmUpOverlay = ref(false)
export const showExperimentGoals = ref(true)
export const showAlert = ref(false)
export const alertText = ref('')

export const config = ref<ExperimentConfig>(new ExperimentConfig());

export const misarchExperimentConfig = ref<MiSArchConfig[]>([])

export const chaostoolkitConfig = ref<ChaostoolkitConfig>(new ChaostoolkitConfig())

export const gatlingConfigs = ref<{ fileName: string; workFileContent: string; workModel: KotlinScenarioModel, userSteps: number[] }[]>([])
export const userStepsResetState = ref<{ fileName: string; userSteps: number[] }[]>([])

export function toggleHelpOverlay(caller: string) {
  showHelpOverlay.value = true;
  callingSection.value = caller;
}

export function toggleAlert(message: string) {
  showAlert.value = true;
  alertText.value = message;
}

export function resetGlobalState() {
  testUuid.value = ''
  testVersion.value = ''
  showHelpOverlay.value = false
  showDeleteOverlay.value = false
  showAlert.value = false
  alertText.value = ''
  showOverlay.value = true
  showGraphOverlay.value = false
  showWarmUpOverlay.value = false
  showMisarchEditor.value = false
  showChaostoolkitEditor.value = false
  config.value = new ExperimentConfig()
  misarchExperimentConfig.value = []
  chaostoolkitConfig.value = new ChaostoolkitConfig()
  gatlingConfigs.value = []
}