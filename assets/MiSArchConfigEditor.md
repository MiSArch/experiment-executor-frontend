# 💥 MiSArch Experiment Failure Configuration

The **MiSArch Experiment Failure** feature allows users to **simulate failures** of specific MiSArch components.

It operates using a **sidecar container** that proxies all network traffic and resides in the same pod as the MiSArch component.  
This traffic can be **intercepted and modified** to emulate a range of network-based failure scenarios.

MiSArch leverages **Dapr** features such as **PubSub** and **service-mesh**, which can be selectively failed.  
If you're not familiar with Dapr, refer to the [📚 Dapr documentation](https://docs.dapr.io) for more information.

In addition to network-related failures, the sidecar container can also simulate **resource exhaustion** (CPU, memory).

> ⚠️ **Note:** Container configuration is static, but the failure **behavior** can be non-deterministic using probability for failure.


## 🛠️ Interface Overview

You can configure **a series of failure sets** with optional pauses in between.  
Once applied, a configuration **persists** until it is **overwritten** or **cleared**.

---

## 📝 Editor vs Simple UI

You can define experiments using either:

- **Editor**: Write full experiment specs in JSON.
- **Simple UI**: Fill out individual fields to build the spec visually.

These modes are **synchronized** and can be toggled via the **button in the top right corner**.

---

## ⚙️ Configuration Structure

Each configuration includes the following components:

### 🔹 Failure Set

A **Failure Set** is a collection of one or more **failures** applied **at the same time**. 
- **⏳ Pauses**: configure pauses in seconds before and after setting the configuration of the failure set

> ⚠️ Avoid applying more than **one failure to the same component** within a single set.


### 🔸 Failure

A **Failure** targets a specific MiSArch component.

- **Service Name** is **required**
- All other fields are **optional**
- To **activate** a failure: use the **'+' button** and set configuration values
- To **deactivate** a failure: use the **'x' button** to **remove** the configuration


### Service Name
The simple (logical) name of the affected service (e.g. `catalog`, `gateway`).

### PubSub Deterioration

Simulates degraded performance in **Dapr PubSub** by introducing:

- ⏱️ **Delay** (ms): Time added before forwarding a message (e.g. `1000`)
- 🎲 **Delay Probability**: Likelihood of applying the delay (e.g. `0.57`)
- ❌ **Error Rate**: Proportion of invocations that will fail (e.g. `0.57`)

> This applies to **all PubSub events** for the specified service.

### Service Invocation Deterioration

Simulates network errors/delays on **HTTP requests** to specific paths.

- 📍 **HTTP Path to Fail**: Target path (e.g. `/`)
- ⏱️ **Delay** (ms): Delay before response (e.g. `1000`)
- 🎲 **Delay Probability**: Chance the delay will be applied (e.g. `0.57`)
- 📉 **HTTP Error Code**: Response code to return (e.g. `500`)
- 🎲 **Error Probability**: Chance the error code is returned (e.g. `0.57`)

> You can configure **multiple paths** using the **'+' button**.

### Artificial Memory Usage

Simulates **high memory consumption** by allocating memory in the sidecar.

- 💾 **Memory Usage**: Memory used in bytes (e.g. `1000000000` for 1 GiBi)

### Artificial CPU Usage

Simulates **high CPU load** via a busy loop in the sidecar.

- 🌀 **Usage Duration** (ms): Time the CPU is busy (e.g. `1000`)
- ⏸️ **Pause Duration** (ms): Time the loop pauses (e.g. `1000`)

> ⚠️ If no pause is configured, the usage runs **continuously** and nothing will be processed anymore.


---
## 💡 Example

The following example demonstrates a **failure set** that applies a **series of failures** to the `catalog` service with a pause before and after the set:

```json
{
  "failureSets": [
    {
      "failures": [
        {
          "serviceName": "catalog",
          "pubsubDeterioration": {
            "delayMs": 1000,
            "delayProbability": 0.57,
            "errorRate": 0.57
          },
          "serviceInvocationDeterioration": {
            "httpPathToFail": "/",
            "delayMs": 1000,
            "delayProbability": 0.57,
            "httpErrorCode": 500,
            "errorProbability": 0.57
          },
          "artificialMemoryUsage": {
            "memoryUsageBytes": 1000000000
          },
          "artificialCpuUsage": {
            "usageDurationMs": 1000,
            "pauseDurationMs": 1000
          }
        }
      ],
      "pauses": {
        "before": 12,
        "after": 34
      }
    }
  ]
}
```