import { onRequestPost as __api_gemini_ts_onRequestPost } from "/Users/admin/Documents/CODING/Create-Image-Studio/functions/api/gemini.ts"

export const routes = [
    {
      routePath: "/api/gemini",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_gemini_ts_onRequestPost],
    },
  ]