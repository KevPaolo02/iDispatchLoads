import type { Database } from "@/types/database";

type DriverRow = Database["public"]["Tables"]["drivers"]["Row"];
type LoadRow = Database["public"]["Tables"]["loads"]["Row"];

export type DriverMatch = {
  driver: DriverRow;
  score: number;
  reasons: string[];
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function parseLocation(location: string) {
  const [city = "", state = ""] = location.split(",").map((segment) => segment.trim());

  return {
    city: normalize(city),
    state: normalize(state),
    full: normalize(location),
  };
}

function routeTokens(routes: unknown) {
  if (!Array.isArray(routes)) {
    return [];
  }

  return routes
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.toLowerCase());
}

function isTrailerCompatible(vehicleType: string, trailerType: string) {
  const normalizedVehicle = normalize(vehicleType);
  const normalizedTrailer = normalize(trailerType);

  if (!normalizedTrailer) {
    return false;
  }

  if (normalizedVehicle.includes("enclosed")) {
    return normalizedTrailer.includes("enclosed");
  }

  if (normalizedVehicle.includes("motorcycle")) {
    return normalizedTrailer.includes("single") || normalizedTrailer.includes("enclosed") || normalizedTrailer.includes("open");
  }

  if (normalizedVehicle.includes("inoperable")) {
    return normalizedTrailer.includes("open") || normalizedTrailer.includes("hotshot") || normalizedTrailer.includes("single");
  }

  return true;
}

export function getRankedDriverMatches(load: LoadRow, drivers: DriverRow[]) {
  const pickupCity = normalize(load.pickup_city);
  const pickupState = normalize(load.pickup_state);
  const deliveryState = normalize(load.delivery_state);

  return drivers
    .filter((driver) => driver.is_available)
    .filter((driver) => isTrailerCompatible(load.vehicle_type, driver.trailer_type))
    .map<DriverMatch>((driver) => {
      const reasons: string[] = [];
      let score = 45;

      const location = parseLocation(driver.current_location);
      const preferredRoutes = routeTokens(driver.preferred_routes);
      const normalizedTrailer = normalize(driver.trailer_type);

      if (location.city && location.city === pickupCity) {
        score += 40;
        reasons.push("Exact pickup city match");
      } else if (location.state && location.state === pickupState) {
        score += 28;
        reasons.push("Already in pickup state");
      } else if (location.full) {
        score += 10;
        reasons.push(`Current location ${driver.current_location}`);
      }

      if (preferredRoutes.some((route) => route.includes(pickupState) || route.includes(deliveryState))) {
        score += 18;
        reasons.push("Preferred route overlaps the lane");
      }

      if (preferredRoutes.some((route) => route.includes(load.pickup_city.toLowerCase()))) {
        score += 10;
        reasons.push("Preferred route includes pickup market");
      }

      if (normalizedTrailer.includes("enclosed") && normalize(load.vehicle_type).includes("enclosed")) {
        score += 12;
        reasons.push("Enclosed trailer available");
      } else if (normalizedTrailer.includes("open")) {
        score += 8;
        reasons.push("Open trailer available");
      }

      return {
        driver,
        score,
        reasons,
      };
    })
    .sort((left, right) => right.score - left.score);
}
