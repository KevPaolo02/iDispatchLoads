# Driver Location Level 2 Note

Date: 2026-05-08

## What Changed

Codex added a Level 2 driver location update flow.

The driver can now open:

```text
/driver
```

and update current location from a mobile-friendly Spanish form:

```text
Mi Ubicacion
Ciudad, estado
Newark, NJ
Actualizar
```

The form calls:

```text
updateDriverLocationAction
```

in:

```text
app/(dashboard)/actions.ts
```

It updates:

```text
drivers.current_location
```

No schema change was made.

## Why

The dispatcher needs route planning to know where the driver actually is before choosing a load. For the current 1-driver workflow, a manual city/state update gives most of the value without the complexity of browser GPS, permissions, latitude/longitude storage, or privacy review.

The route planner already reads `drivers.current_location`, so this update immediately feeds:

```text
/dispatcher
```

and improves lane scoring, deadhead warnings, and driver-zone decisions.

## Validation

The action requires location input like:

```text
Newark, NJ
Brooklyn, NY
Trenton, NJ
```

It uppercases the state code and rejects loose input without a two-letter state.

## Deferred

GPS/live location is intentionally deferred.

Future GPS work should add:

- explicit driver consent
- `latitude`
- `longitude`
- `location_updated_at`
- privacy rules
- role-based driver auth

Until driver-specific auth exists, this is still an internal/private view behind the same Supabase login.
