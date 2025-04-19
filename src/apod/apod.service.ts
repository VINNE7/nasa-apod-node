import axios from "axios";
import { NasaApodResponse } from "./apod.types.js";
import { cacheApod, getCachedApod } from "../db/apodCache.repository.js";
import { NasaApiException } from "../utils/exceptions/nasaApiException.js";

const getApod = async () => {
  const today = new Date().toISOString().split("T")[0];
  const cached = await getCachedApod(today);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get<NasaApodResponse>(
      `${process.env.NASA_API_URL}/apod`,
      {
        params: { api_key: process.env.NASA_API_KEY },
      },
    );
    await cacheApod(response.data);
    return response.data;
  } catch (error) {
    throw new NasaApiException("Failed to fetch NASA APOD data", {
      cause: error,
      url: process.env.NASA_API_URL,
    });
  }
};

export default getApod;
