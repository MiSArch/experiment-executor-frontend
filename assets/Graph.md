# 📈 MiSArch Experiment Tool Graph

The Graph you see in the MiSArch Experiment Tool is a **visual representation** of the **experiment configuration**.

--- 

## 📖 Content
The graph displays the following elements:
- ✖️ **X-Axis**: **Duration** of the entire experiment in seconds
- 📈 **Approx. Total Users**: The approximate number of users **arriving** per second that will execute the respective scenario starting at the respective second.
- 📊 **Approx. Total Requests**: The approximate number of requests that will be sent to the system per second, based on the **number of users** and the **scenario's request rate**.
- 💥 **ChaosToolkit Actions / MiSArch Failure Sets**: The points in time when a **ChaosToolkit Action** or a **MiSArch Failure Set** is applied based on the **configured pauses**, which can affect the system's behavior during the experiment.

---

## 💡 Explanation
How are the values calculated?
- 📈 **Approx. Total Users**: This is calculated by summing up the number of users arriving per second for each scenario. The system stores the arriving users for each scenario in a list. The list has an entry for each second of the experiment, and the value is the number of users arriving at that second for this scenario.
- 📊 **Approx. Total Requests**: This is calculated by multiplying the number of arriving users per second with the request rate of the scenario. The request rate is defined in the scenario and represents how many requests are sent per user per second, based on the configured pauses between requests in the scenario.

---

## 📝 Concepts
The following definitions are important to understand how Gatling simulates user traffic:
- 💪 **Work**: The actual domain-specific interaction of users with the system, such as browsing a catalog or placing an order (in Gatling this is called a **'scenario'**).
- 👥 **Load**: The number of users that are currently interacting with the system, based on the work.
- 🌊 **Workload**: The combination of work and load, i.e. the actual total requests sent by users to the system.
- 📭 **Open Workload**: Open Workload means that users are continuously arriving at the system, simulating a steady stream of traffic, all executing an entire scenario.
- 📫 **Closed Workload**: Means a limit of users is set, and the load is kept constant by replacing users that leave the system with new ones, simulating a pre-defined number of users executing a scenario.

>💡 MiSArch Experiment Tool uses **Open Workloads** to simulate user traffic, meaning users continuously arrive at the system and execute a scenario, as they are more realistic.
