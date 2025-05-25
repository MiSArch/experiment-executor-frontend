import {TestConfig} from '../model/test-config.ts';
import {testUuid} from "./test-uuid.ts";
import {ref} from "vue";

export const chaostoolkitConfig = ref('')
export const userSteps = ref<number[]>([])
export const misarchExperimentConfig = ref('')
export const config = ref<TestConfig>(new TestConfig());
export const gatlingWork = ref('')

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
    await fetch(`http://localhost:8888/experiment/${testUuid.value}/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonData
    })
  }

  async persistUserSteps(): Promise<void> {
    const csvData = `userSteps\n${userSteps.value.join('\n')}`;
    await fetch(`http://localhost:8888/experiment/${testUuid.value}/gatlingConfig/userSteps`, {
      method: 'PUT',
      body: csvData
    })
  }

  async persistChaosToolkitConfig(): Promise<void> {
    await fetch(`http://localhost:8888/experiment/${testUuid.value}/chaosToolkitConfig`, {
      method: 'PUT',
      body: chaostoolkitConfig.value
    })
  }

  async persistWork(): Promise<void> {
    await fetch(`http://localhost:8888/experiment/${testUuid.value}/gatlingConfig/work`, {
      method: 'PUT',
      body: gatlingWork.value
    })
  }

  async persistMisarchExperimentConfig(): Promise<void> {
    await fetch(`http://localhost:8888/experiment/${testUuid.value}/misarchExperimentConfig`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: misarchExperimentConfig.value
    })
  }
}

export const testHandler = new TestHandler();
