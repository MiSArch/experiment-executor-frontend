export class ExperimentConfig {
  testUUID!: string;
  testVersion!: string;
  workLoad!: WorkLoad;
  goals!: Goal[];
}

class Gatling {
  loadType!: string;
}

class WorkLoad {
  gatling!: Gatling;
}

class Goal {
  metric!: string;
  threshold!: string;
  color!: string;
}
