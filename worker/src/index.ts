import { isAuthorizedAdmin } from "./auth";
import { corsHeaders, errorResponse, jsonResponse, withCors } from "./cors";
import {
  deleteFood,
  deleteRecipe,
  listFoods,
  listHousehold,
  listInstructions,
  listPhotos,
  listRecipes,
  saveFood,
  saveRecipe,
} from "./repository";
import { Env, Food, RecipeDetails } from "./types";

type Resource = "recipes" | "foods" | "household" | "instructions" | "photos";
type WritableResource = "recipes" | "foods";

const cache = caches.default;

function cacheKeyFor(resource: Resource): Request {
  return new Request(`https://sheets-gateway.internal/${resource}`);
}

async function handleRead(
  request: Request,
  env: Env,
  resource: Resource,
  loader: () => Promise<unknown>,
): Promise<Response> {
  const key = cacheKeyFor(resource);
  const cached = await cache.match(key);
  if (cached) return withCors(request, env, cached);

  const data = await loader();
  const ttl = Number(env.READ_CACHE_TTL_SECONDS) || 60;
  const response = new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `max-age=${ttl}`,
    },
  });
  await cache.put(key, response.clone());
  return withCors(request, env, response);
}

async function purgeCache(resource: Resource): Promise<void> {
  await cache.delete(cacheKeyFor(resource));
}

async function handleWrite(
  request: Request,
  env: Env,
  resource: WritableResource,
): Promise<Response> {
  if (!isAuthorizedAdmin(request, env)) {
    return errorResponse(request, env, "Non autorisé", 401);
  }

  const url = new URL(request.url);
  const id = url.pathname.split("/").pop() ?? "";

  if (request.method === "DELETE") {
    const deleted =
      resource === "recipes"
        ? await deleteRecipe(env, id)
        : await deleteFood(env, id);
    if (!deleted) return errorResponse(request, env, "Introuvable", 404);
    await purgeCache(resource);
    return jsonResponse(request, env, { ok: true });
  }

  const body = (await request.json()) as RecipeDetails | Food;
  if (!body.id) return errorResponse(request, env, "Champ 'id' manquant", 400);

  if (resource === "recipes") {
    await saveRecipe(env, body as RecipeDetails);
  } else {
    await saveFood(env, body as Food);
  }
  await purgeCache(resource);
  return jsonResponse(request, env, { ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env),
      });
    }

    try {
      if (segments[0] === "recipes") {
        if (request.method === "GET" && segments.length === 1) {
          return handleRead(request, env, "recipes", () => listRecipes(env));
        }
        if (
          ["POST", "PUT", "DELETE"].includes(request.method) &&
          segments.length === 2
        ) {
          return handleWrite(request, env, "recipes");
        }
      }

      if (segments[0] === "foods") {
        if (request.method === "GET" && segments.length === 1) {
          return handleRead(request, env, "foods", () => listFoods(env));
        }
        if (
          ["POST", "PUT", "DELETE"].includes(request.method) &&
          segments.length === 2
        ) {
          return handleWrite(request, env, "foods");
        }
      }

      if (
        segments[0] === "household" &&
        request.method === "GET" &&
        segments.length === 1
      ) {
        return handleRead(request, env, "household", () => listHousehold(env));
      }

      if (
        segments[0] === "instructions" &&
        request.method === "GET" &&
        segments.length === 1
      ) {
        return handleRead(request, env, "instructions", () =>
          listInstructions(env),
        );
      }

      if (
        segments[0] === "photos" &&
        request.method === "GET" &&
        segments.length === 1
      ) {
        return handleRead(request, env, "photos", () => listPhotos(env));
      }

      return errorResponse(request, env, "Route inconnue", 404);
    } catch (error) {
      return errorResponse(
        request,
        env,
        error instanceof Error ? error.message : "Erreur interne",
        500,
      );
    }
  },
};
