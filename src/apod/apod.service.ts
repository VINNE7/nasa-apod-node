import axios from "axios";
import { NasaApodResponse } from "./apod.types.js";
import { cacheApod, getCachedApod } from "../db/apodCache.repository.js";

const getApod = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const cached = await getCachedApod(today);
    if (cached) {
      return cached;
    }

    const response = await axios.get<NasaApodResponse>(
      `${process.env.NASA_API_URL}/apod`,
      {
        params: {
          api_key: process.env.NASA_API_KEY,
        },
      },
    );

    await cacheApod(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching NASA data:", error);
    throw error;
  }
};

export default getApod;
