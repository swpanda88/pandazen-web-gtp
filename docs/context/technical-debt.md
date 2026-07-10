# Technical Debt

Known issues that we have intentionally deferred but must fix eventually.

1. **Error Handling**: Many fetch requests lack generic global error handling. If a 500 occurs, we show a toast but don't log it to a central service.
2. **Types/Validation**: We have no server-side schema validation beyond basic JS `if` checks. We may want Zod or Joi eventually.
