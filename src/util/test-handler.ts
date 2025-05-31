import {TestConfig} from '../model/test-config.ts';
import {testUuid, testVersion} from "./test-uuid.ts";
import {ref} from "vue";

// TODO: move this to a more appropriate place
export const chaostoolkitConfig = ref('')
export const userSteps = ref<number[]>([])
export const misarchExperimentConfig = ref('')
export const config = ref<TestConfig>(new TestConfig());
export const gatlingWork = ref('')
export const backendUrl = import.meta.env.VITE_BACKEND_URL;

export class TestHandler {
  async persistAllConfigs(): Promise<void> {
    await this.persistWork();
    await this.persistConfig();
    await this.persistUserSteps();
    await this.persistChaosToolkitConfig();
    await this.persistMisarchExperimentConfig();
  }

  async persistConfig(): Promise<void> {
    const jsonData = JSON.stringify(config.value, null, 2);
    await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonData
    })
  }

  async persistUserSteps(): Promise<void> {
    const csvData = `userSteps\n${userSteps.value.join('\n')}`;
    await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/gatlingConfig/userSteps`, {
      method: 'PUT',
      body: csvData
    })
  }

  async persistChaosToolkitConfig(): Promise<void> {
    await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/chaosToolkitConfig`, {
      method: 'PUT',
      body: chaostoolkitConfig.value
    })
  }

  async persistWork(): Promise<void> {
    await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/gatlingConfig/work`, {
      method: 'PUT',
      body: gatlingWork.value
    })
  }

  async persistMisarchExperimentConfig(): Promise<void> {
    await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/misarchExperimentConfig`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: misarchExperimentConfig.value
    })
  }
}

export const testHandler = new TestHandler();
