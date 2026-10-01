import { Router } from "express";
import { search, listAllSaheTags } from "../search/searchEngine";

export const searchRouter = Router();

searchRouter.get("/search", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  if (!q.trim()) {
    res.json({ query: q, incentives: [], programItems: [] });
    return;
  }
  res.json(search(q));
});

searchRouter.get("/search/tags", (_req, res) => {
  res.json({ tags: listAllSaheTags() });
});
