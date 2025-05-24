export class TestConfig {
  testUUID!: string;
  failure!: Failure;
  workLoad!: WorkLoad;
  goals!: Goal[];
}

class ChaosToolkit {
  pathUri!: string;
}

class ExperimentConfig {
  pathUri!: string;
  endpointHost!: string;
}

class Failure {
  chaosToolkit!: ChaosToolkit;
  experimentConfig!: ExperimentConfig;
}

class Gatling {
  pathUri!: string;
  endpointHost!: string;
  tokenEndpointHost!: string;
}

class WorkLoad {
  gatling!: Gatling;
}

class Goal {
  metric!: string;
  threshold!: string;
  color!: string;
}
