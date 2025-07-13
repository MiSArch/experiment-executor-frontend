# 📝 Work Configuration

The MiSArch Experiment Tool uses [Gatling](https://gatling.io) to simulate user traffic for experiments.
For detailed documentation on Gatling, refer to the [📚 Gatling documentation](https://gatling.io/docs/).

The **work configuration** in the MiSArch Experiment Tool allows you to define the **work** in the form of **Gatling scenarios** for your experiments.

---

## 💡 Concepts
[Gatling](https://gatling.io) is written in Scala and uses a **domain-specific language (DSL)** to define scenarios.
The DSL is a set of methods that can be used to define the behavior of users in the system.
It is available in Scala, Java and Kotlin.
> ⚠️ The MiSArch Experiment Tool **only** supports the **Kotlin DSL** for defining scenarios.

Gatling scenarios are simulating **user sessions**, which are sequences of requests that a user would perform in a real-world scenario.
You can store **session data** in the **session object**, which is passed between requests.

How is a scenario structured?
- 📦 **Package and Imports**: All scenarios **must** be in the `org.misarch` package and import the necessary Gatling classes.
- 📝 **Scenario Definition**: Each scenario is defined as a Kotlin function that starts with a **unique** name: 
    ```kotlin
    val abortedBuyProcessScenario = scenario("abortedBuyProcessScenario")
    ```
- 🔄 **Scenario Steps**: The scenario consists of a series of steps that define the behavior of users in the system, which are chained together using Kotlin's `.` operator:

  - 1️⃣ `exec {...}`: Executes a block of code, which can be used to perform actions such as storing session data.
  ```kotlin
    .exec { session ->
        // Store and retrieve session data
        session.getString("my-key", "my-value")
        session.set("my-other-key", "my-other-value")
    }
  ```
  - 2️⃣ `exec (http())`: Executes the HTTP request based on the `http`() chain. The response of a request can be stored in the session object using the `check()` method and retrieved in following `.exec{...}` blocks.
  ```kotlin
    .exec(
        http("Get Example")
            .get("http://example.org")
            .formParam("example", "example")
            .check(jsonPath("$.example").saveAs("my-key"))
        
    )
  ```
  - 3️⃣ `.pause(Duration.ofMillis(X), Duration.ofMillis(X))`: Pauses the scenario for a specified duration, which is in between the range of the first duration and the second duration. This can be used to simulate user think time or delays between requests.
  ```kotlin
    .pause(Duration.ofMillis(1000), Duration.ofMillis(2000))
  ```
  
> ⚠️ **Note:** The steps **must** always be defined like this: `exec {...}` then `exec(http()...)` then `.pause(Duration.ofMillis(X), Duration.ofMillis(X))`, **each in a new line** in order for the MiSArch Experiment Tool to correctly parse the scenario and calculate the approximate requests.

> 💡 **Tip:** If you want to create complex custom scenarios, leveraging all features of the Gatling DSL, you should use a proper Kotlin IDE to write the scenario.

---

## ⚙️ Configuration Structure
You can configure the work for your experiment in the following way:
- 📝 You can configure a work file for each scenario in your experiment based on the examples and explanations above and the Gatling Kotlin DSL.
- ➕ You can add or remove scenarios using the **'+' and 'x' buttons**.

> ⚠️️ When creating a new scenario you also must configure new load for it using the **Load Configuration**.


---
## 💡 Example
Here is an example of a scenario that simulates a user first fetching an access token from Keycloak then browsing a catalog and putting an item into the shopping cart.
Note, that MiSArch uses **GraphQL** for the API, so the scenario uses GraphQL **queries and mutations** to interact with the system.
A list of queries and mutations can be found in the [📚 MiSArch documentation](https://misarch.github.io/docs/graphql/schema).

```kotlin
package org.misarch

import io.gatling.javaapi.core.CoreDsl.*
import io.gatling.javaapi.http.HttpDsl.http
import java.time.Duration

val abortedBuyProcessScenario = scenario("abortedBuyProcessScenario")
    .exec { session ->
        session.set("targetUrl", "http://gateway:8080/graphql")
    }
    .exec(
        http("Get Access Token")
            .post("http://keycloak:80/keycloak/realms/Misarch/protocol/openid-connect/token")
            .formParam("client_id", "frontend")
            .formParam("grant_type", "password")
            .formParam("username", "gatling")
            .formParam("password", "123")
            .check(jsonPath("$.access_token").saveAs("accessToken"))
    )
    .pause(Duration.ofMillis(0), Duration.ofMillis(0))
    .exec { session ->
        session.set(
            "productsQuery",
            "{ \"query\": \"query { products(filter: { isPubliclyVisible: true }, first: 10, orderBy: { direction: ASC, field: ID }, skip: 0) { hasNextPage nodes { id internalName isPubliclyVisible } totalCount } }\" }"
        )
    }
    .exec(
        http("products").post("#{targetUrl}").header("Content-Type", "application/json").header("Authorization", "Bearer #{accessToken}").body(StringBody("#{productsQuery}"))
            .check(jsonPath("$.data.products.nodes[0].id").saveAs("productId"))
    )
    .pause(Duration.ofMillis(4000), Duration.ofMillis(10000))
    .exec { session ->
        val productId = session.getString("productId")
        session.set(
            "productQuery",
            "{ \"query\": \"query { product(id: \\\"$productId\\\") { categories { hasNextPage  totalCount } defaultVariant { id isPubliclyVisible averageRating } id internalName isPubliclyVisible variants { hasNextPage  totalCount } } }\" }"
        )
    }
    .exec(
        http("product").post("#{targetUrl}").header("Content-Type", "application/json").header("Authorization", "Bearer #{accessToken}").body(StringBody("#{productQuery}"))
            .check(jsonPath("$.data.product.defaultVariant.id").saveAs("productVariantId"))
    )
    .pause(Duration.ofMillis(50), Duration.ofMillis(150))
    .exec { session ->
        session.set(
            "usersQuery",
            "{ \"query\": \"query { users(first: 10, orderBy: { direction: ASC, field: ID }, skip: 0) { hasNextPage nodes {  id  birthday dateJoined gender username addresses { nodes { id } } } } }\" }"
        )
    }
    .exec(
        http("users").post("#{targetUrl}").header("Content-Type", "application/json").header("Authorization", "Bearer #{accessToken}").body(StringBody("#{usersQuery}"))
            .check(jsonPath("$.data.users.nodes[0].addresses.nodes[0].id").saveAs("addressId"))
            .check(jsonPath("$.data.users.nodes[0].id").saveAs("userId"))
    )
    .pause(Duration.ofMillis(50), Duration.ofMillis(150))
    .exec { session ->
        val userId = session.getString("userId")
        val productVariantId = session.getString("productVariantId")
        session.set(
            "createShoppingcartItemMutation",
            "{ \"query\": \"mutation { createShoppingcartItem( input: { id: \\\"$userId\\\" shoppingCartItem: { count: 1 productVariantId: \\\"$productVariantId\\\" } } ) { id } }\" }"
        )
    }
    .exec(
        http("createShoppingcartItemMutation").post("#{targetUrl}").header("Content-Type", "application/json").header("Authorization", "Bearer #{accessToken}").body(StringBody("#{createShoppingcartItemMutation}"))
            .check(jsonPath("$.data.createShoppingcartItem.id").saveAs("createShoppingcartItemId"))
    )
    .pause(Duration.ofMillis(0), Duration.ofMillis(0))
```