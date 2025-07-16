# 🎯 Experiment Goals Configuration

The **Goal Configuration** allows you to define **measurable goals** in terms of user metrics such as latency for your experiments.  
The configuration can be either done **manually** or automatically using an automated steady-state-hypothesis.

You can switch between the two modes using the **Auto / Manual button** in the top right corner of the configuration dialog.

---

## ⚙️ Manual Configuration

The manual configuration allows you to define the goal in terms of a **metric** and a **threshold**.  
It also lets you define a **color** for the goal, which will be used in the resulting Grafana dashboard to visualize the goal.
The dashboard will only highlight the goal if the metric is **above the threshold**.

### 📈 Metric

A metric is a measurable value that can be used to evaluate the performance of your experiment.
Each metric can be assigned a **maximum** threshold value:

- ⏳ For time-based metrics assign the **maximum allowed response time** in **milliseconds** (e.g. `800`)
- 📊 For percentage-based metrics assign the **maximum allowed percentage** (e.g. `95`)

Metrics are collected by [Gatling](https://gatling.io) and parsed by the MiSArch Experiment Tool, to be evaluated and displayed  in [Grafana](https://grafana.com/docs/grafana/latest/).
The following metrics are available:

| Metric                                               | Description                                                                                                     |
|------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| percentage reqs with resp. time t < 800 ms           | Maximum percentage of requests with a response time below 800ms from all requests (e.g. `90`).                  |
| percentage reqs with resp. time 800 ms < t < 1200 ms | Maximum percentage of requests with a response time between 800ms and 1200ms from all requests (e.g. `20`).     |
| percentage reqs with resp. time t > 1200 ms          | Maximum percentage of requests with a response time above 1200ms from all requests (e.g. `20`).                 |
| percentage failed requests                           | Maximum percentage of failed requests from all requests (e.g. `5`).                                             |
| percentage mean requests/sec ok                      | Maximum percentage of successful requests per second from all requests per second (e.g. `80`).                  |
| percentage mean requests/sec ko                      | Maximum percentage of failed requests per second from all requests per second (e.g. `20`).                      |
| min response time                                    | Highest allowed minimum response time of all requests in milliseconds (e.g. `800`).                             |
| mean response time                                   | Highest allowed average response time of all requests in milliseconds (e.g. `800`).                             |
| max response time                                    | Highest allowed maximum response time of all requests in milliseconds (e.g. `800`).                             |
| min response time ok                                 | Highest allowed minimum response time of successful requests in milliseconds (e.g. `800`).                      |
| mean response time ok                                | Highest allowed average response time of successful requests in milliseconds (e.g. `800`).                      |
| max response time ok                                 | Highest allowed maximum response time of successful requests in milliseconds (e.g. `800`).                      |
| min response time ko                                 | Highest allowed minimum response time of failed requests in milliseconds (e.g. `800`).                          |                                                                                               |
| mean response time ko                                | Highest allowed average response time of failed requests in milliseconds (e.g. `800`).                          |
| max response time ko                                 | Highest allowed maximum response time of failed requests in milliseconds (e.g. `800`).                          |
| 50th percentile response time                        | Highest allowed response time for the 50th percentile of all requests in milliseconds (e.g. `800`).             |
| 75th percentile response time                        | Highest allowed response time for the 75th percentile of all requests in milliseconds (e.g. `800`).             |
| 95th percentile response time                        | Highest allowed response time for the 95th percentile of all requests in milliseconds (e.g. `800`).             |
| 99th percentile response time                        | Highest allowed response time for the 99th percentile of all requests in milliseconds (e.g. `800`).             |
| 50th percentile response time ok                     | Highest allowed response time for the 50th percentile of successful requests in milliseconds (e.g. `800`).      |
| 75th percentile response time ok                     | Highest allowed response time for the 75th percentile of successful requests in milliseconds (e.g. `800`).      |
| 95th percentile response time ok                     | Highest allowed response time for the 95th percentile of successful requests in <br/>milliseconds (e.g. `800`). |
| 99th percentile response time ok                     | Highest allowed response time for the 99th percentile of successful requests in <br/>milliseconds (e.g. `800`). |
| 50th percentile response time ko                     | Highest allowed response time for the 50th percentile of failed requests in milliseconds (e.g. `800`).          |
| 75th percentile response time ko                     | Highest allowed response time for the 75th percentile of failed requests in milliseconds (e.g. `800`).          |
| 95th percentile response time ko                     | Highest allowed response time for the 95th percentile of failed requests in milliseconds (e.g. `800`).          |
| 99th percentile response time ko                     | Highest allowed response time for the 99th percentile of failed requests in milliseconds (e.g. `800`).          |
## 🪄 Auto Configuration

The MiSArch Experiment Tool provides an **automatic configuration** for the goals of your experiment.
It configures every metric you find above in the **Manual Configuration** section, based on the results of a **steady-state hypothesis** execution.

- 🎯 The automatic configuration allows the system to automatically define goals in terms of a **steady-state hypothesis**.
- 📈 Before running the experiment, your scenarios will be executed with a **constant user rate** for a configured **duration**.
- 🛑 After this execution the collected metrics will be used as the **thresholds for the goals**.
- 🧮 For time-based metrics you can define a **factor** to multiply the collected values with, to define a more relaxed goal.
- 🔺 All thresholds exceeded in the actual run will be displayed in the resulting Grafana dashboard in **red** color.

### ⚙️ Configurations:

- **Rate**: The constant user rate for the steady-state hypothesis execution in **users per second** (e.g. `10`).
- **Duration**: The duration of the steady-state hypothesis execution in seconds (e.g. `60`).
- **Factor**: The factor to multiply the collected values with for time-based metrics (e.g. `1.2`).

> 💡 If you also configure a **warm-up phase**, the warm-up phase will be executed **before** the steady-state hypothesis phase.
