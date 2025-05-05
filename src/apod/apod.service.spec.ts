import { describe, it, vi, beforeEach, expect } from "vitest";
import { cacheApod, getCachedApod } from "../db/apodCache.repository.js";
import getApod from "./apod.service.js";
import axios from "axios";
vi.mock("axios");
vi.mock("../db/apodCache.repository");

describe("getApod", () => {
  const mockDay = "2025-04-28";

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(Date.prototype, "toISOString").mockReturnValue(
      `${mockDay}T00:00:00.000Z`,
    );
  });

  it("returns cached data if available", async () => {
    vi.mocked(getCachedApod).mockResolvedValue({
      title: "Cached APOD",
      date: mockDay,
      explanation: "lorem ipsum",
      media_type: "jpeg",
      url: "example.com",
    });

    const result = await getApod();

    expect(getCachedApod).toHaveBeenCalledWith(mockDay);
    expect(result.title).toBe("Cached APOD");
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("fetches from NASA API and caches if not cached", async () => {
    vi.mocked(getCachedApod).mockResolvedValue(null);
    vi.mocked(axios.get).mockResolvedValue({ data: { title: "Fresh APOD" } });
    vi.mocked(cacheApod).mockResolvedValue();

    const result = await getApod();

    expect(axios.get).toHaveBeenCalled();
    expect(cacheApod).toHaveBeenCalledWith({ title: "Fresh APOD" });
    expect(result.title).toBe("Fresh APOD");
  });

  it("throws if the NASA API fails", async () => {
    vi.mocked(getCachedApod).mockResolvedValue(null);
    vi.mocked(axios.get).mockRejectedValue(new Error("API down"));

    await expect(getApod()).rejects.toThrow("Failed to fetch NASA APOD data");
  });
});
