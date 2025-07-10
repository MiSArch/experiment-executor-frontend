export class ExperimentConfig {
  testUUID!: string;
  testVersion!: string;
  testName?: string;
  loadType!: string;
  goals!: Goal[];
  warmUp!: WarmUp;
  steadyState!: SteadyState;
}

class Goal {
  metric!: string;
  threshold!: string;
  color!: string;
}

class WarmUp {
  duration!: number;
  rate!: number;
}

class SteadyState {
  duration!: number;
  rate!: number;
}