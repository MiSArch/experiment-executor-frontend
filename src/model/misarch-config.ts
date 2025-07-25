export class MiSArchConfig {
  failures!: MisArchFailure[];
  pauses!: Pauses;
}
export class Pauses {
  before!: number;
  after!: number;
}

export class MisArchFailure {
  name!: string;
  pubSubDeterioration!: PubSubDeterioration | null;
  serviceInvocationDeterioration!: ServiceInvocationDeterioration[] | null;
  artificialMemoryUsage!: number | null;
  artificialCPUUsage!: ArtificialCPUUsage[] | null;
}

class PubSubDeterioration {
  delay!: number;
  delayProbability!: number;
  errorProbability!: number;
}

class ServiceInvocationDeterioration {
  path!: string;
  delay!: number;
  delayProbability!: number;
  errorProbability!: number;
  errorCode!: number;
}

class ArtificialCPUUsage {
  usageDuration!: number;
  pauseDuration!: number;
}