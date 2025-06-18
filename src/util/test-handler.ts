import {testUuid, testVersion, backendUrl, config, chaostoolkitConfig, gatlingConfigs, misarchExperimentConfig} from "./global-state-handler.ts";

export class TestHandler {
  async persistAllConfigs(): Promise<void> {
    await this.persistGatlingConfigs();
    await this.persistConfig();
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

  async persistChaosToolkitConfig(): Promise<void> {
    await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/chaosToolkitConfig`, {
      method: 'PUT',
      body: chaostoolkitConfig.value
    })
  }

  async persistGatlingConfigs(): Promise<void> {
    const jsonData = JSON.stringify(gatlingConfigs.value.map(config => ({
      fileName: config.fileName,
      encodedWorkFileContent: btoa(config.workFileContent),
      encodedUserStepsFileContent: btoa(`userSteps\n${config.userSteps.join('\n')}`)
    })), null, 2);
    await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/gatlingConfig`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonData
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
