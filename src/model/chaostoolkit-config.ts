
export class ChaostoolkitConfig {
  title!: string;
  description!: string;
  method!: Array<Probe | Action>;
  'steady-state-hypothesis'?: SteadyStateHypothesis;
  rollbacks?: Action[];
  tags?: string[];
  configuration?: Record<string, any>;
  secrets?: Record<string, Record<string, any>>;
  extensions?: Record<string, any>[];
  contributions?: Record<string, string>
  controls?: Control[];
  runtime?: Record<string, any>;
}

class SteadyStateHypothesis {
  title!: string;
  probes!: Probe[];
  controls?: Control[];
}

export class Probe {
  type!: 'probe';
  name!: string;
  provider!: Provider;
  tolerance?: Tolerance;
  configuration?: string[];
  background?: boolean;
  controls?: Control[];
}

export class Action {
  type!: 'action';
  name!: string;
  provider!: Provider;
  pauses?: Pause;
  configuration?: string[];
  background?: boolean;
  controls?: Control[];
}

export const METHOD_OPTIONS = [
  { label: 'Action', value: 'action' },
  { label: 'Probe', value: 'probe' },
];

export type Provider = PythonProvider | ProcessProvider | HttpProvider;

export const PROVIDER_OPTIONS = [
  { label: 'Python', value: 'python' },
  { label: 'Process', value: 'process' },
  { label: 'HTTP', value: 'http' }
];

class PythonProvider {
  type: 'python' = 'python';
  module!: string;
  func!: string;
  arguments?: Record<string, any>;
  secrets?: Record<string, Record<string, any>>;
}

export class HttpProvider {
  type: 'http' = 'http';
  url!: string;
  method?: string;
  headers?: Record<string, string>;
  expected_status?: number;
  arguments?: Record<string, any>;
  timeout?: number;
  secrets?: Record<string, Record<string, any>>;
}

class ProcessProvider {
  type: 'process' = 'process';
  path!: string;
  arguments?: string[] | string;
  timeout?: number;
  secrets?: Record<string, Record<string, any>>;
}

class Pause {
 before!: number;
 after!: number
}

// Tolerance variations
type Scalar = string | number | boolean;
type Tolerance = Scalar
    | Scalar[]
    | RegexTolerance
    | JsonPathTolerance
    | RangeTolerance
    | ProbeTolerance;

class RegexTolerance {
  type: 'regex' = 'regex';
  pattern!: string;
  target?: string;
}

class JsonPathTolerance {
  type: 'jsonpath' = 'jsonpath';
  path!: string;
  expect?: Scalar;
}

class RangeTolerance {
  type: 'range' = 'range';
  range!: [number, number];
}

class ProbeTolerance {
  type: 'probe' = 'probe';
  name!: string;
  provider!: Provider;
}

class Control {
  name!: string;
  provider!: PythonProvider;
  scope?: 'before' | 'after';
  automatic?: boolean;
}