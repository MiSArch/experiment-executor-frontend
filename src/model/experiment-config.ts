export class ExperimentConfig {
  testUUID!: string;
  testVersion!: string;
  testName?: string;
  loadType!: string;
  goals!: Goal[];
}

class Goal {
  metric!: string;
  threshold!: string;
  color!: string;
}
