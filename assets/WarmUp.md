# 🔥 Warm-Up Configuration

The MiSArch Experiment Tool allows you to **configure a warm-up phase** for your experiments.
This is useful to ensure that the system is in a **stable state** before the actual experiment starts.

The warm-up phase uses a **constant (closed) user load** for **all scenarios** for a configured period.

> 💡 If you also configure a **steady-state hypothesis**, the warm-up phase will be executed **before** the steady-state hypothesis phase.

---

## ⚙️ Configuration Structure

- ☑️ **Warm-Up Yes / No**: Enable or disable the warm-up phase. If you do not want to use a warm-up phase use the **'x' button** to remove the configuration.
- 👥 **Static User Rate**: The constant number of users that will be used for the warm-up phase for **each scenario** (e.g. `10`).
- ⏳ **Duration**: The duration of the warm-up phase in seconds (e.g. `60`).