import {
  createLoader,
  createSerializer,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const publicSearchParams = {
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

export const adminSearchParams = {
  q: parseAsString.withDefault(""),
  status: parseAsStringLiteral(["all", "draft", "published"] as const).withDefault("all"),
};

export const loadPublicSearchParams = createLoader(publicSearchParams);
export const loadAdminSearchParams = createLoader(adminSearchParams);
export const serializePublicSearch = createSerializer(publicSearchParams);
export const serializeAdminSearch = createSerializer(adminSearchParams);
