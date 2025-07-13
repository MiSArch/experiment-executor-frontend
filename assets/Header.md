# 🧪 MiSArch Experiment Tool - Help Section

This help page provides an overview of the MiSArch Experiment Tool, its features, and how to use it.

The **MiSArch Experiment Tool** is designed to:
- 📈 Facilitate the management and execution of complex load testing experiments using [**Gatling**](https://gatling.io);
- 💥 Combining load testing with chaos engineering principles using [**ChaosToolkit**](https://chaostoolkit.org) and the custom [**MiSArch Experiment Failure Config**](https://misarch.github.io/docs/docs/dev-manuals/other-repositories/experiment-config-frontend); 
- 🌐 Providing a user-friendly **interface** for **configuring** and **running** experiments;
- 📊 Offering **visualization** and analysis of the results using [**Grafana**](https://grafana.com).

> 💡 For **every configuration possible** in the MiSArch Experiment Tool, there is a **corresponding help page** that explains the configuration in detail (visible after the test creation).

---

## ⚙️ Experiment Creation
You can either load an **existing experiment** or create a **new experiment**. When creating a new experiment, you must configure the following parameters:
- 🔢 **Load Test Type**: Select one of the available load test types:
  - 👨‍🎓 **Realistic**: A **realistic** load test that simulates **real user behavior**, based on the data of [this study](https://www.sciencedirect.com/science/article/pii/S1389128620312263), including pre-defined **failure sets**.
  - ↕️ **Elasticity**: A load test that simulates **increases and decreases** in load to test if the system under test **scales** properly **up and down**.
  - 📈 **Scalability**: A load test that simulates **increases in load** to test if the system under test **scales** properly **up**.
  - 🛡️ **Resilience**: A load test that simulates **failures** and **different load patterns** to see if the system under test to test can **handle failures** gracefully.
- ⏳ **Duration**: Set the duration of the load test in seconds (e.g. `300` for 5 minutes).
- 👥 **Maximum Arriving Users** (realistic only): Set the maximum number of users that will arrive at the system under test per second during the load test (e.g. `1000`).
- 📈 **Growth Rate** (all except realistic): Set the growth rate of the load test, i.e. how fast do the arriving users grow (e.g. `1.0` for one more user arriving than in the previous second).

> 💡 The new experiment can be **configured** in every dimension after creation, the four types only give **start values** to play around with and help to test the specific non-functional requirement.

---

## 💾 Experiment Management
You can manage your experiments in the following ways:
- 🛠️ **Create**: Create a new experiment configuration.
- 📂 **Load**: Load an existing experiment configuration stored in the backend.
- 💾 **Save**: Save the current experiment configuration.
- ▶️ **Run**: Execute the experiment using the configured tools.
- ⏹️ **Stop**: Stop the currently running experiment.
- 🗑️ **Delete**: Delete the current experiment configuration or version.
- 2️⃣ **New Version**: Create a new version of the current experiment configuration to modify certain things without overwriting the old config.

> ⚠️ When **executing** or **loading** an experiment, your current state is **saved** in the current experiment version.
---

## 📚 Step-By-Step Experiment Execution
- 1️⃣ **Create a new experiment** by setting the parameters load test type, duration, maximum arriving users, and growth rate or **load an existing one**.
- 2️⃣ (Optional) **Configure and add scenarios** to the experiment, defining the user interactions with the system.
- 3️⃣ (Optional) **Fine-tune the load** by modifying the **arriving users** per second for each scenario in the experiment.
- 4️⃣ (Optional) **Configure the ChaosToolkit and MiSArch Failure Config**  actions or MiSArch Failure Sets to introduce failures during the load test.
- 5️⃣ (Optional) **Configure the goals**  for the load test, such as response times, and error rates or configure the automatic goal detection.
- 6️⃣ (Optional) **Configure a warm-up phase** to prepare the system before the actual load test starts.
- 7️⃣ **Run the experiment** by clicking the `Execute` button.
- 8️⃣ **Wait for the experiment to finish** and observe the results in the **Grafana dashboard**.

---

## 💡Concepts
The following concepts are essential to understand how the MiSArch Experiment Tool works:
- 🧪 **Experiment**: A structured, versionable set of configurations for the different tools, persisted in the backend, containing:
  - #️⃣ **Test-UUID**: A unique identifier for the experiment (stored in the experiment-config JSON file).
  - 📅 **Test-Version**: The version of the experiment configuration (stored in the experiment-config JSON file).
  - 📈 **Gatling Config**: Load testing configurations seperated by work (session Kotlin files) and load (for each session in a CSV file).
  - 💥 **ChaosToolkit Config**: Chaos engineering configurations for e.g. Docker or Kubernetes in a JSON file.
  - 💣 **MiSArch Experiment Failure Config**: Latency and Resource Exhaustion configurations for MiSArch in a JSON file.
  - 🎯 **Goals**: The user-metrics that the load test should achieve during the test (stored in the experiment-config JSON file).
      
- 🧺 **Load Testing**: The process of simulating user traffic to test the performance and scalability of a system (done with [Gatling](https://gatling.io)).
  - ⚠️ Important concepts in load testing:
    - 💪 **Work**: The actual domain-specific interaction of users with the system, such as browsing a catalog or placing an order (in Gatling this is called a **'scenario'**).
    - 👥 **Load**: The number of users that are currently interacting with the system, based on the work.
    - 🌊 **Workload**: The combination of work and load, i.e. the actual total requests sent by users to the system.
    - 📭 **Open Workload**: Open Workload means that users are continuously arriving at the system, simulating a steady stream of traffic, all executing an entire scenario.
    - 📫 **Closed Workload**: Means a limit of users is set, and the load is kept constant by replacing users that leave the system with new ones, simulating a pre-defined number of users executing a scenario.

- 💥 **Chaos Engineering**: The practice of intentionally introducing **failures** into a system to test its resilience and ability to recover (done with [ChaosToolkit](https://chaostoolkit.org) and the [MiSArch Experiment Failure Config](https://misarch.github.io/docs/docs/dev-manuals/other-repositories/experiment-config-frontend)).
  - ⚠️ Possible failure points in chaos engineering:
    - ⏳ **Latency**: The **delay** introduced in the system to simulate **network** or **processing delays**.
    - 💣 **Resource Exhaustion**: The intentional **consumption** of system **resources** (CPU or memory) to test the system's behavior under **stress**.
    - 🔧 **Infrastructure Issues**: The introduction of **issues** in the **infrastructure**, such as **killed pods or containers**.

- 📊 **Observability**: The practice of monitoring and analyzing the system's behavior during the load test to identify performance bottlenecks and issues (done with [OpenTelemetry](https://opentelemetry.io), [Prometheus](https://prometheus.io), and [Grafana](https://grafana.com)).
    - **⚠️ Important concepts in observability**:
      - 📈 **Metrics**: **Quantitative measurements** of the system's performance, such as response times, error rates, and throughput (collected on different levels using OpenTelemetry and Gatling).
      - 📊 **Dashboards**: **Visual representations** of the metrics collected during the load test, providing insights into the system's behavior.