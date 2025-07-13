# 👩‍👦‍👦 Gatling Arriving Users Configuration

The MiSArch Experiment Tool uses [Gatling](https://gatling.io) to simulate user traffic for experiments.
For detailed documentation on Gatling, refer to the [📚 Gatling documentation](https://gatling.io/docs/).  

The Gatling Arriving Users configuration allows you to define the **user traffic** for your experiments based on your **work (scenarios)**.

---

## ⚙️ Configuration Structure
You can configure the user traffic for each scenario in your experiment:

- 📝 **Scenario**: Select the scenario that you want to modify the user traffic for.
- ⏱️ **Duration**: The duration of the user traffic in seconds for the selected scenario (e.g. `60`).
- ⏳ **From-/To-Second**: The time range in seconds the user traffic should be applied for the selected scenario (e.g. `0` to `60`).
- 👥 **Arriving Users**: The number of arriving users per second in the time range for the selected scenario (e.g. `10`).
- 🔄 **Reset**: Resets the configuration for the selected scenario to the last saved values.

---

## 📝 Concepts
The following definitions are important to understand how Gatling simulates user traffic:
- 💪 **Work**: The actual domain-specific interaction of users with the system, such as browsing a catalog or placing an order (in Gatling this is called a **'scenario'**).
- 👥 **Load**: The number of users that are currently interacting with the system, based on the work.
- 🌊 **Workload**: The combination of work and load, i.e. the actual total requests sent by users to the system.
- 📭 **Open Workload**: Open Workload means that users are continuously arriving at the system, simulating a steady stream of traffic, all executing an entire scenario.
- 📫 **Closed Workload**: Means a limit of users is set, and the load is kept constant by replacing users that leave the system with new ones, simulating a pre-defined number of users executing a scenario.

>💡 MiSArch Experiment Tool uses **Open Workloads** to simulate user traffic, meaning users continuously arrive at the system and execute a scenario, as they are more realistic.
