export interface ScenarioStep {
  type: 'exec' | 'http' | 'pause';
  name?: string;
  code?: string;
  method?: string;
  url?: string;
  body?: string;
  checks?: string[];
  durationMin?: number;
  durationMax?: number;
}

export class KotlinScenarioModel {
  scenarioName: string;
  steps: ScenarioStep[];

  constructor(scenarioName: string, steps: ScenarioStep[]) {
    this.scenarioName = scenarioName;
    this.steps = steps;
  }

  // TODO verify this is generic enough to handle all Kotlin scenarios
  static parse(kotlinCode: string): KotlinScenarioModel {
    const nameMatch = kotlinCode.match(/val\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
    const scenarioName = nameMatch ? nameMatch[1] : 'Unknown';

    const steps: ScenarioStep[] = [];
    const lines = kotlinCode.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      // --- Pause step
      if (line.includes('.pause')) {
        const pauseMatch = line.match(/Duration\.ofMillis\((\d+)\),\s*Duration\.ofMillis\((\d+)\)/);
        if (pauseMatch) {
          steps.push({
            type: 'pause',
            durationMin: parseInt(pauseMatch[1], 10),
            durationMax: parseInt(pauseMatch[2], 10),
          });
        }
        i++;
        continue;
      }

      // --- Multiline exec block (e.g. exec { session -> ... })
      if (line.includes('.exec') && line.includes('{') && !line.includes('http')) {
        let braceCount = 0;
        const blockLines: string[] = [];

        do {
          const currentLine = lines[i];
          braceCount += (currentLine.match(/{/g) || []).length;
          braceCount -= (currentLine.match(/}/g) || []).length;
          blockLines.push(currentLine);
          i++;
        } while (braceCount > 0 && i < lines.length);

        steps.push({
          type: 'exec',
          code: blockLines.join('\n').trim(),
        });
        continue;
      }

      // --- exec(http(...)) block
      if (line.includes('http(')) {
        const blockLines: string[] = [];
        let parenCount = 1;

        do {
          const currentLine = lines[i];
          parenCount += (currentLine.match(/\(/g) || []).length;
          parenCount -= (currentLine.match(/\)/g) || []).length;
          blockLines.push(currentLine);
          i++;
        } while (parenCount > 0 && i < lines.length);

        const block = blockLines.join('\n');

        const httpNameMatch = block.match(/http\("([^"]+)"\)/);
        // TODO Allow for different HTTP methods (GET, PUT, DELETE, etc.)
        const postUrlMatch = block.match(/\.post\("([^"]+)"\)/);
        const bodyMatch = block.match(/\.body\(\s*StringBody\("([^"]+)"\)\s*\)/s);
        const checkMatches = [...block.matchAll(/\.check\(((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*)\)/gs)].map(m => m[1].trim());

        steps.push({
          type: 'http',
          name: httpNameMatch?.[1],
          method: 'POST',
          url: postUrlMatch?.[1],
          body: bodyMatch?.[1],
          checks: checkMatches,
        });
        continue;
      }

      // Skip unrecognized lines
      i++;
    }

    return new KotlinScenarioModel(scenarioName, steps);
  }

  toKotlin(): string {
    const lines: string[] = [];
    lines.push("package org.misarch\n\nimport io.gatling.javaapi.core.CoreDsl.*\nimport io.gatling.javaapi.http.HttpDsl.http\nimport java.time.Duration\n");
    lines.push(`val ${this.scenarioName.replace(/\s+/g, '')} = scenario("${this.scenarioName}")`);

    for (const step of this.steps) {
      if (step.type === 'pause') {
        lines.push(
            `.pause(Duration.ofMillis(${step.durationMin}), Duration.ofMillis(${step.durationMax}))`
        );
      } else if (step.type === 'http') {
        const bodyLine = step.body ? `.body(StringBody("${step.body}"))` : '';
        const checks = (step.checks || []).map(c => `\n    .check(${c})`).join('');
        lines.push(
            `.exec(\n  http("${step.name}").post("${step.url}")${bodyLine}${checks}\n)`
        );
      } else if (step.type === 'exec') {
        if (step.code != null) {
          lines.push(step.code);
        }
      }
    }

    return lines.join('\n');
  }
}