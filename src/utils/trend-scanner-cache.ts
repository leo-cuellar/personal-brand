import type { CategoryTrendsResult } from "../../services/api-wrapper/perplexity";

interface TrendScannerCache {
    date: string; // formato YYYY-MM-DD
    data: CategoryTrendsResult[];
}

const CACHE_PREFIX = "trend-scanner-cache-";

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
function getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Obtiene el cache del Trend Scanner para un personalBrandId específico
 * Retorna null si no hay cache o si la fecha no es la de hoy
 */
export function getTrendScannerCache(
    personalBrandId: string
): CategoryTrendsResult[] | null {
    if (typeof window === "undefined") {
        return null; // Server-side, no cache
    }

    try {
        const cacheKey = `${CACHE_PREFIX}${personalBrandId}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (!cachedData) {
            return null;
        }

        const cache: TrendScannerCache = JSON.parse(cachedData);
        const today = getTodayDateString();

        // Si la fecha del cache es diferente a hoy, retornar null
        if (cache.date !== today) {
            return null;
        }

        return cache.data;
    } catch (error) {
        console.error("Error reading trend scanner cache:", error);
        return null;
    }
}

/**
 * Guarda el cache del Trend Scanner para un personalBrandId específico
 */
export function saveTrendScannerCache(
    personalBrandId: string,
    data: CategoryTrendsResult[]
): void {
    if (typeof window === "undefined") {
        return; // Server-side, no guardar
    }

    try {
        const cacheKey = `${CACHE_PREFIX}${personalBrandId}`;
        const today = getTodayDateString();

        const cache: TrendScannerCache = {
            date: today,
            data,
        };

        localStorage.setItem(cacheKey, JSON.stringify(cache));
    } catch (error) {
        console.error("Error saving trend scanner cache:", error);
    }
}

const ADDED_IDEAS_PREFIX = "trend-scanner-added-ideas-";

/**
 * Verifica si una URL ya fue agregada como idea para un personalBrandId específico
 */
export function isTrendAdded(
    personalBrandId: string,
    url: string
): boolean {
    if (typeof window === "undefined") {
        return false; // Server-side, siempre retornar false
    }

    try {
        const key = `${ADDED_IDEAS_PREFIX}${personalBrandId}`;
        const addedUrls = localStorage.getItem(key);

        if (!addedUrls) {
            return false;
        }

        const urls: string[] = JSON.parse(addedUrls);
        return urls.includes(url);
    } catch (error) {
        console.error("Error checking if trend was added:", error);
        return false;
    }
}

/**
 * Marca una URL como agregada para un personalBrandId específico
 */
export function markTrendAsAdded(
    personalBrandId: string,
    url: string
): void {
    if (typeof window === "undefined") {
        return; // Server-side, no guardar
    }

    try {
        const key = `${ADDED_IDEAS_PREFIX}${personalBrandId}`;
        const existingUrls = localStorage.getItem(key);

        let urls: string[] = [];
        if (existingUrls) {
            urls = JSON.parse(existingUrls);
        }

        // Solo agregar si no existe ya
        if (!urls.includes(url)) {
            urls.push(url);
            localStorage.setItem(key, JSON.stringify(urls));
        }
    } catch (error) {
        console.error("Error marking trend as added:", error);
    }
}

