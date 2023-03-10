# Core

Core is a set of systems (frontend, backend etc.) that OpenSearch Dashboards and its plugins are built on top of.

## Plugin development
Core Plugin API Documentation:
 - [Core Public API](../core/public/public.api.md)
 - [Core Server API](../core/server/server.api.md)
 - [Conventions for Plugins](./CONVENTIONS.md)
 - [Testing OpenSearch Dashboards Plugins](./TESTING.md)
 - [OpenSearch Dashboards Platform Plugin API](./PRINCIPLES.md)
 
Internal Documentation:
 - [Saved Objects Migrations](./server/saved_objects/migrations/README.md)

## Integration with the "legacy" OpenSearch Dashboards

Most of the existing core functionality is still spread over "legacy" OpenSearch Dashboards and it will take some time to upgrade it.
OpenSearch Dashboards is started using existing "legacy" CLI that bootstraps `core` which in turn creates the "legacy" OpenSearch Dashboards server.
At the moment `core` manages HTTP connections, handles TLS configuration and base path proxy. All requests to OpenSearch Dashboards server
will hit HTTP server exposed by the `core` first and it will decide whether request can be solely handled by the new 
platform or request should be proxied to the "legacy" OpenSearch Dashboards. This setup allows `core` to gradually introduce any "pre-route"
processing logic, expose new routes or replace old ones handled by the "legacy" OpenSearch Dashboards currently.

Once config has been loaded and some of its parts were validated by the `core` it's passed to the "legacy" OpenSearch Dashboards where 
it will be additionally validated so that we can make config validation stricter with the new config validation system.
Even though the new validation system provided by the `core` is also based on Joi internally it is complemented with custom 
rules tailored to our needs (e.g. `byteSize`, `duration` etc.). That means that config values that were previously accepted
by the "legacy" OpenSearch Dashboards may be rejected by the `core` now.

Even though `core` has its own logging system it doesn't output log records directly (e.g. to file or terminal), but instead
forward them to the "legacy" OpenSearch Dashboards so that they look the same as the rest of the log records throughout OpenSearch Dashboards.

## Core API Review
To provide a stable API for plugin developers, it is important that the Core Public and Server API's are stable and
well documented. To reduce the chance of regressions, development on the Core API's includes an API signature review
process described below. Changes to the API signature which have not been accepted will cause the build to fail.

When changes to the Core API's signatures are made, the following process needs to be followed:
1. After changes have been made, run `yarn docs:acceptApiChanges` which performs the following:
   - Recompiles all typescript typings files
   - Updates the API review files `src/core/public/opensearch_dashboards.api.md` and `src/core/server/opensearch_dashboards.api.md`
   - Updates the Core API documentation in `docs/development/core/`
2. Review and commit the updated API Review files and documentation
3. Clearly flag any breaking changes in your pull request

