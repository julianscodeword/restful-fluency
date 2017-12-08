#restful-fluency
A fluent builder for creating REST and HTTP-based APIs.

##Usage
Install the node package:
```
npm install --save restful-fluency
```

Import the server builder in your javascript code:
```javascript
const ServerBuilder = require('./server-builder');
```

##Server Types

| Server Type | Description                     |
| ----------- | ------------------------------- |
| DEFAULT     | Uses restify.                   |
| RESTIFY     | Uses restify to serve requests. |

##Server Configuration Options
| Option                   | Description                              |
| ------------------------ | ---------------------------------------- |
| whichListensOnPort(port) | The port that the server will use to listen for incoming requests. |
| withARestfulApi()        | Add a new REST API                       |
| build()                  | Builds the server with the current configuration. |

###REST API Configuration Options
| Option                                | Description                              |
| ------------------------------------- | ---------------------------------------- |
| thatUsesMongoModel(model)             | The mongo (mongoose) model that will back this REST API. |
| accessibleFrom(resourcePrefix)        | The resource prefix to use.              |
| withReadonlyAccess(hasReadAccessOnly) | Set this to true if you want to disallow write operations. |
| and()                                 | Finalise the API and go back to configuring the server. |

##Example

```javascript
ServerBuilder.DEFAULT
.withARestfulApi().thatUsesMongoModel(productModel).accessibleFrom('product').withReadonlyAccess().and()
.withARestfulApi().thatUsesMongoModel(orderModel).accessibleFrom('order').and()
.whichListensOnPort(8080)
.build();
```

