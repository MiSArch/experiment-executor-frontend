# 💥 ChaosToolkit Failure Configuration

The **ChaosToolkit** is a powerful, extensible tool for defining and executing chaos experiments in cloud-native systems.  
It allows you to inject failures, observe system behavior, and validate resiliency through declarative experiments written.
> ⚠️ In this editor, **only JSON** and **no YAML** is supported.

This interface lets you configure chaos experiments using ChaosToolkit, with optional pauses, probes, and steady-state hypotheses.
For full details, refer to the [📚 ChaosToolkit documentation](https://chaostoolkit.org).

---

## 🛠️ Interface Overview

You can build a **sequence of chaos experiments** that include:

- 🧪 **A Steady-State Hypothesis**: Define what “normal” looks like upfront before the experiment.
- 🔍 **Probes**: Validate system behavior before/after actions.
- 💥 **Actions**: Inject failure into the system.
- ⏸️ **Pauses**: Add delays before or after steps.

---

## 📝 Editor vs Simple UI

You can define experiments using either:

- **Editor**: Write full experiment specs in JSON.
- **Simple UI**: Fill out individual fields to build the spec visually.

These modes are **synchronized** and can be toggled via the **button in the top right corner**.

---

## ⚙️ Configuration Structure

> For a full example and reference see the [📚 ChaosToolkit documentation](https://chaostoolkit.org/reference/api/experiment).

A ChaosToolkit experiment consists of the following key elements:

### 🧪 Steady-State Hypothesis

Defines the **normal operating conditions** of your system.  
The experiment will **only proceed** if these checks pass.  
The steady-state hypothesis is **optional** (add or remove using the **'+' or 'x' buttons**).

- 🔍 **Probes**: Assertions about the system (e.g. HTTP status, metrics)
- 📌 Each probe uses:
    - **Name**: Logical name for readability
    - **Tolerance**: Expected result or threshold (this can be any sort of JSON value or object fitting to the function)
    - **Provider Type**: `probe`
    - **Provider**: The method of measurement (`http`, `process`, or `python`)
    - **Secrets**: Optional chaostoolkit secrets to use in the provider (e.g. API keys, tokens)

> 💡 Provider examples and explanations are provided below.

### 🔁 Method (Experiment Steps)

The **method** is a list of actions and optional **pauses** to inject chaos.  
A method can either be an **action** (to apply a failure) or a **probe** (to observe system behavior):

- ⚙️ **Actions**: Define the failures to apply (e.g. stop service, introduce latency)
- 🔍 **Probes**: Run during the experiment to observe behavior
- ⏸️ **Pauses**: Insert delays between steps using  (in seconds)
- 📌 Each probe or action uses:
    - **Name**: Logical name for readability
    - **Tolerance (probe only)**: Expected result or threshold (this can be any sort of JSON value or object fitting to the function)
    - **Provider Type**: `probe`
    - **Provider**: The method of execution/measurement (`http`, `process`, or `python`)
    - **Secrets**: Optional chaostoolkit secrets to use in the provider (e.g. API keys, tokens)

> 💡 Provider examples and explanations are provided below.

### 🧰 Provider Examples

ChaosToolkit supports three **provider types** that define how actions and probes are executed: `http`, `process`, or `python`.  
For a full list of available extensions, see the [📚 ChaosToolkit Extensions](https://chaostoolkit.org/drivers/overview/) documentation.

### 🐍 Python Provider

- The **Python provider** allows you to use **Python functions** of chaos-toolkit extensions.
- For the **Kubernetes provider**, see the [📚 chaosk8s documentation](https://chaostoolkit.org/drivers/kubernetes/).
- For our **custom Docker provider** see the documentation on the bottom of the page.

These examples show how to kill the containers of the MiSArch gateway in local Docker or Kubernetes:
```json
{
  "type": "python",
  "module": "misarch_chaostoolkit.chaostoolkit_docker",
  "func": "kill_containers",
  "arguments": {
    "names": [
      "infrastructure-docker-gateway-1",
      "infrastructure-docker-gateway-dapr-1",
      "infrastructure-docker-gateway-ecs-1"
    ]
  }
}

```
```json
{
  "type": "python",
  "module": "chaosk8s.pod.actions",
  "func": "terminate_pods",
  "arguments": {
    "label_selector": "app=misarch-gateway",
    "ns": "misarch"
  }
}
```

- `module`: Fully qualified Python module (must be an existing extension)
- `func`: Function name to call
- `arguments`: Dictionary of keyword arguments and values (depends on the specific function documentation)

> 🔬 Most chaos-toolkit extensions rely on specific Python functions.

### 🌐 HTTP Provider

The **HTTP provider** is used to perform HTTP requests for probing or triggering external services.

The example below shows how to perform a simple HTTP GET request to an example URL:
```json
{
  "type": "http",
  "arguments": {
    "example": "true"
  },
  "url": "https://example.com",
  "method": "GET",
  "headers": {
    "Content-Type": "application/json"
  },
  "expected_status": 200,
  "timeout": "10"
}
```

- `method`: HTTP method (`GET`, `POST`, etc.)
- `url`: Full URL to call
- `expected_status`: (Optional) Expected HTTP status code
- `timeout`: Timeout in seconds
- `arguments`: (Optional) Additional query parameters (`GET`) or body data (`POST`)

> ⚠️ The HTTP provider is most often used for **probes** (health checks, response validation).


### 🖥️ Process Provider

The **process provider** allows running **shell commands or scripts** on the system running the experiment.

The example below shows how to terminate the `nginx` process using the `killall` command:
```json
{
  "type": "process",
  "name": "terminate nginx",
  "provider": {
    "type": "process",
    "path": "killall",
    "arguments": [
      "nginx"
    ]
  }
}
```

- `path`: The command to run (e.g., `killall`, `bash`)
- `arguments`: Optional list of arguments

> ⚠️ Use this for **OS-level fault injection** or **local health probes**.

---

## 🐳 ChaosToolkit Docker Python Provider
As there is no official Docker provider for the ChaosToolkit, we provide a custom Python provider to interact with Docker containers.
This provider has the following functions:

- `kill_containers`: Kills one or more Docker containers by name.
- `start_containers`: Pauses one or more Docker containers by name.
- `are_containers_running`: Checks if one or more Docker containers are running by name.

All three functions take a list of container names as an argument.

> ⚠️ Note that other than in Kubernetes, the killed container will **not restart** automatically, so start_containers should be called after kill_containers.

Examples:
```json
{
  "type": "python",
  "module": "misarch_chaostoolkit.chaostoolkit_docker",
  "func": "kill_containers",
  "arguments": {
    "names": [
      "infrastructure-docker-gateway-1",
      "infrastructure-docker-gateway-dapr-1",
      "infrastructure-docker-gateway-ecs-1"
    ]
  }
}
```
```json
{
  "type": "python",
  "module": "misarch_chaostoolkit.chaostoolkit_docker",
  "func": "start_containers",
  "arguments": {
    "names": [
      "infrastructure-docker-gateway-1",
      "infrastructure-docker-gateway-dapr-1",
      "infrastructure-docker-gateway-ecs-1"
    ]
  }
}
```
```json
{
  "type": "python",
  "module": "misarch_chaostoolkit.chaostoolkit_docker",
  "func": "are_containers_running",
  "arguments": {
    "names": [
      "infrastructure-docker-gateway-1",
      "infrastructure-docker-gateway-dapr-1",
      "infrastructure-docker-gateway-ecs-1"
    ]
  }
}
```

---

## 💡 Example

The following full examples demonstrates a **steady-state hypothesis** that checks if the `catalog` service is healthy, followed by a method that 
introduces a failure by killing the `gateway` containers and then starting them again:

> ⚠️ Note that than in Kubernetes the killed container will restart automatically, in Docker you need to call the `start_containers` function after `kill_containers`.

Docker:
```json
{
  "title": "test-uuid:v1",
  "description": "test-uuid:v1",
  "steady-state-hypothesis": {
    "title": "Container is running",
    "probes": [
      {
        "type": "probe",
        "name": "Container is running",
        "provider": {
          "type": "python",
          "module": "misarch_chaostoolkit.chaostoolkit_docker",
          "func": "are_containers_running",
          "arguments": {
            "names": [
              "infrastructure-docker-gateway-1",
              "infrastructure-docker-gateway-dapr-1",
              "infrastructure-docker-gateway-ecs-1"
            ]
          }
        },
        "tolerance": true
      }
    ]
  },
  "method": [
    {
      "type": "action",
      "name": "Kill Containers",
      "provider": {
        "type": "python",
        "module": "misarch_chaostoolkit.chaostoolkit_docker",
        "func": "kill_containers",
        "arguments": {
          "names": [
            "infrastructure-docker-gateway-1",
            "infrastructure-docker-gateway-dapr-1",
            "infrastructure-docker-gateway-ecs-1"
          ]
        }
      },
      "pauses": {
        "before": 0,
        "after": 7
      }
    },
    {
      "type": "action",
      "name": "Restart Containers",
      "provider": {
        "type": "python",
        "module": "misarch_chaostoolkit.chaostoolkit_docker",
        "func": "start_containers",
        "arguments": {
          "names": [
            "infrastructure-docker-gateway-1",
            "infrastructure-docker-gateway-dapr-1",
            "infrastructure-docker-gateway-ecs-1"
          ]
        }
      }
    }
  ]
}
```

Kubernetes:
```json
{
  "title": "test-uuid:v1",
  "description": "test-uuid:v1",
  "steady-state-hypothesis": {
    "title": "Pod is running",
    "probes": [
      {
        "type": "probe",
        "name": "Pod is running",
        "provider": {
          "type": "python",
          "module": "chaosk8s.probes",
          "func": "deployment_available_and_healthy",
          "arguments": {
            "name": "misarch-gateway",
            "ns": "misarch"
          }
        },
        "tolerance": true
      }
    ]
  },
  "method": [
    {
      "type": "action",
      "name": "Kill Pods",
      "provider": {
        "type": "python",
        "module": "chaosk8s.pod.actions",
        "func": "terminate_pods",
        "arguments": {
          "label_selector": "app=misarch-gateway",
          "ns": "misarch"
        }
      },
      "pauses": {
        "before": 12,
        "after": 7
      }
    }
  ]
}
```