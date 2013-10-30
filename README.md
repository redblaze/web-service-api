# Web Service API

A set of libs to facilitate the build of JSON based web services.  It automatically supports arbitrary batched service calls.

## Install

```text
npm install web-service-api
```

## Table of Contents

* [APIs](#toc-APIs)
* [Types, Validators and Type Definitions](#toc-TVTD)

<a name="toc-APIs"/>
## APIs

* API
  * [new API](#new-API)
  * [api.add](#api-add)
  * [api.handleRequests](#api-handleRequests)
  * [API.EXCEPTION](#API-EXCEPTION)
* TypeCheck
  * [TypeCheck.validate](#TypeCheck-validate)
  * [TypeCheck.EXCEPTION](#TypeCheck-EXCEPTION)
* Err
  * [new Err](#new-Err)

<a name="new-API"/>
### new API(config)

The config parameter is of the following form:

```js
{
    "typeDefs": TypeDefinition
}
```

A detailed description of type definitions can be found [here](#ref-type-definition).

<a name="api-add"/>
### api.add(service_name, action_name, signature, implementation)

The APIs are layered in two levels: services and actions.  On the top
level, we have services, under each of which we have a list of
actions.  So as to define an API, we need to specify the service name
and the action name.  The signature of an API is almost the same as
the declaration of an "Object" [type](#ref-type).  It is of the
following form:

```js
{
    args: {
       "param1": type1,
       "param2": type2,
       /* ... */
    },
    validator: function(v) {
    }
}
```

Both fields are optional.  In particular, if there is no "args" field
specified, then the API being defined does not take any arguments.
The implementation of an API is a procedure of the following
signature:

```js
function(context, args, callback) {
    /* implementation of the API */
}
```

Here's a simple example:

```js
api.add("Math", "add", {
    args: {
        a: {"type": "Number"},
        b: {"type": "Number"}
    }
}, function(context, args, cb) {
   var a = args["a"];
   var b = args["b"];
   cb(null, a + b);
});
```

<a name="api-handleRequests"/>
### api.handleRequests(requests, callback)

The "requests" parameter is, naturally, a list of requests, where each request is an object of the following form:

```js
{
    "service": service_name,
    "action": action_name,
    "args": arguments
}
```

For instance, to call the Math.add API we defined above:

```js
api.handleRequests([
    {
        "service": "Math",
        "action": "add",
        "args": {
            "a": 100,
            "b": 200
        }
    }
], cb);
```

<a name="API-EXCEPTION"/>
### API.EXCEPTION

```js
{
    EXCEPTION: {
        SERVICE_FIELD_MISSING_ERROR: 'service_field_missing_error',
        ACTION_FIELD_MISSING_ERROR: 'action_field_missing_error',
        SERVICE_NOT_FOUND_ERROR: 'service_not_found_error',
        ACTION_NOT_FOUND_ERROR: 'action_not_found_error',
        PARAMETER_VALIDATION_ERROR: 'parameter_validation_error',
        SERVICE_CALL_ERROR: 'service_call_error'
    }
}
```

The names of these exceptions are self-explaining.

<a name="TypeCheck-validate"/>
### TypeCheck.validate(config)

The config object is of the following form:

```js
{
    "guard": boolean,
    "message": error_message
}
```

The "guard" field is the boolean value that is being asserted (to be
true).  The error message will be included in the API parameter
checking failure error object that will be returned to the client (as
the output of [api.handleRequests](#api-handleRequests)).



<a name="TypeCheck-EXCEPTION"/>
### TypeCheck.EXCEPTION

```js
{
    EXCEPTION: {
        /* mandatory */
        MANDATORY_INPUT_IS_NULL_ERROR: 'mandatory_input_is_null_error',
        /* type */
        TYPE_ERROR_NOT_A_STRING: 'type_error_not_a_string',
        TYPE_ERROR_NOT_A_NUMBER: 'type_error_not_a_number',
        TYPE_ERROR_NOT_A_BOOLEAN: 'type_error_not_a_boolean',
        TYPE_ERROR_NOT_A_DATE: 'type_error_not_a_date',
        TYPE_ERROR_NOT_AN_OBJECT: 'type_error_not_an_object',
        TYPE_ERROR_NOT_A_UNION: 'type_error_not_a_union',
        TYPE_ERROR_NOT_AN_ARRAY: 'type_error_not_an_array',
        TYPE_ERROR_NOT_AN_ALIAS: 'type_error_not_an_alias',
        /* structure */
        OBJECT_FIELD_ERROR: 'object_field_error',
        UNION_VARIANT_ERROR: 'union_variant_error',
        UNION_VARIANT_NOT_FOUND_ERROR: 'union_variant_not_found_error',
        ARRAY_ELEMENT_ERROR: 'array_element_error',
        /* validate */
        VALIDATOR_ERROR: 'validator_error'
    }
}
```

<a name="new-Err"/>
### new Err(error_message, error_object)

The "Err" class is provided as a wrapper to runtime exceptions.  All
the user defined exceptions (that is, whenever you use the throw
statement) should be wrapped using this class.  The error_message
parameter will become handy in log mining, and the error_object will
be the eventual error object being passed back to the client (as the
output of api.handleRequests).  For example:

```js
throw new Err(
    "The user: " + user_id + " is not found",
    {
        code: "user_not_found_error"
    }
);
```

<a name="toc-TVTD"/>
## Types, Validators and Type Definitions

<a name="ref-type"/>
### Types

We support the following types, which can be used to defined input data structures for web service APIs:

* [String](#type-String)
* [Number](#type-Number)
* [Date](#type-Date)
* [Boolean](#type-Boolean)
* [Object](#type-Object)
* [Union](#type-Union)
* [Array](#type-Array)
* [Alias](#type-Alias)

<a name="type-String"/>
__String__

```json
{
    "type": "String"
}
```

Example value: 

```text
"123"
```

<a name="type-Number"/>
__Number__

```json
{
    "type": "Number"
}
```

Example value: 

```text
123
```

<a name="type-Date"/>
__Date__

```json
{
    "type": "Date"
}
```

Dates are all represented as timestamps.  Example value: 

```text
1383003118000
```

<a name="type-Boolean"/>
__Boolean__

```json
{
    "type": "Boolean"
}
```

Example value:

```text
true
```

<a name="type-Object"/>
__Object__

```js
{
    "type": "Object",
    "fields": {
        "field1": TypeDefinition1,
        "field2": TypeDefinition2,
        /* ... */
    }
}
```

Example type alias definition: 

```js
{
    "User": {
        "type": "Object",
        "fields": {
            "first_name": {"type": "String"},
            "last_name": {"type": "String"},
            "age": {"type": "Number"}
        },
    }
}
```
Here we define a type alias "User", which is essentially an "Object" type with specific fields.

Example value: 

```json
{
    "first_name": "Dexter",
    "last_name": "Morgan",
    "age": 42
}
```

<a name="type-Union"/>
__Union__

```js
{
    "type": "Union",
    "variants": {
        "variant1": TypeDefinition1,
        "variant2": TypeDefinition2,
        /* ... */
    }
}
```

Example type:

```js
{
    "NewOrExistingUser": {
        "type": "Union",
        "variants": {
            "new_user": {
                "type": "Alias",
                "alias": "User"
            },
            "existing_user": {
                "type": "Object",
                "fields": {
                    "user_id": {
                        "type": "Number"
                    }
                }
            }
        }
    }
}
```

Here we define a type alias "NewOrExistingUser", which has two
variants: either a new user or an existing user.  In the new user
case, it is an object of "User" type; in the existing user case, it is
an object that only contains a user_id.

Example value: 

```js
{
    "new_user": {
        "first_name": "Debra",
        "last_name": "Morgan",
        "Age": 34
    }
}
```

Another example value: 

```js
{
    "exsiting_user": {
        "user_id": 1001
    }
}
```

Note that a value of "Union" type is always a singleton object where the top level key is tagging the variant.

<a name="type-Array"/>
__Array__

```js
{
    "type": "Array",
    "element": Typedefinition
}
```

Example type: 

```js
{
    "UserList": {
        "type": "Array",
        "element": {
            "type": "Alias",
            "alias": "User"
        }
    }
}
```

This defines a type for user lists.  Example value:

```js
[
    {
        first_name: "Dexter",
        last_name: "Morgan",
        age: 42
    },
    {
        first_name: "Debra",
        last_name: "Morgan",
        age: 35
    },
    {
        first_name: "Harrison",
        last_name: "Morgan",
        age: 6
    }
]   
```

<a name="type-Alias"/>
__Alias__

Aliases provide a way to cross reference and reuse type definitions.
It also allows the definition of recursive type structures (which
probably should not be used in common cases).

```js
{
    "type": "Alias",
    "alias": "AliasName"
}
```

Here's a contrived example of recurisve type:

```js
{
    "Tree": {
        "type": "Union",
        "variants": {
            "node": {
                "type": "Object",
                "fields": {
                    "left_child": {"type": "Alias", "alias": "Tree"}
                    "right_child": {"type": "Alias", "alias": "Tree"}
                }
            }
            "leaf": {"type": "String"}
        }
    }
}
```

Example value:

```js
{
    "node": {
        "left_child": {
            "leaf": "foo"
        },
        "right_child": {
            "node": {
                "left_child": {
                    "leaf": "bar"
                },
                "right_child": {
                    "leaf": "kaz"
                }
            }
        }
    }
}
```

### Validators

Each type definition can have a validator function associated with it.
Given a value to be checked against a type, the value will be first
checked against the structure of the type, and then checked using the
validator.  In particular, validators can be used to created subtypes,
which could be very handy in many cases.  For example:

```js
{
    "Email": {
        "type": "String",
        "validator": function(v) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            TypeCheck.validate({
                guard: re.test(v),
                message: "Not a valid email address."
            });
        }
    }
}
```

We difine a subtype (alias) of the type "String" for validating email
inputs.  An "Email" is a "String", together with a validator to assert
that the format of the string conforms to email addresses.  For another example:

```js
{
    "Age": {
        "type": "Number",
        "validator": function(v) {
            TypeCheck.validate({
                guard: v.age > 0 and v.age < 150,
                message: "Age is out of normal range."
            });
        }
    }
}
```

We define a subtype of "Number" for age values.  For a number to be an
age, it has to be restricted in some range.

<a name="ref-type-definition"/>
### Type Definitions

A Type Definition is a hashmap from type names to [types](#ref-type).
We can sum up all the example we have listed above and give the
following type definition:

```js
{
    "User": {
        "type": "Object",
        "fields": {
            "first_name": {"type": "String"},
            "last_name": {"type": "String"},
            "age": {"type": "Alias", "alias": "Age"},
            "email": {"type": "Alias", "alias": "Email"}
        },
    },
    
    "NewOrExistingUser": {
        "type": "Union",
        "variants": {
            "new_user": {
                "type": "Alias",
                "alias": "User"
            },
            "existing_user": {
                "type": "Object",
                "fields": {
                    "user_id": {
                        "type": "Number"
                    }
                }
            }
        }
    },

    "UserList": {
        "type": "Array",
        "element": {
            "type": "Alias",
            "alias": "User"
        }
    },

    "Email": {
        "type": "String",
        "validator": function(v) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            TypeCheck.validate({
                guard: re.test(v),
                message: "Not a valid email address."
            });
        }
    },

    "Age": {
        "type": "Number",
        "validator": function(v) {
            TypeCheck.validate({
                guard: v.age > 0 and v.age < 150,
                message: "Age is out of normal range."
            });
        }
    }
}
```


