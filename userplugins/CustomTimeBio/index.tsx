/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import { RestAPI } from "@webpack/common";

const settings = definePluginSettings({
    customBio: {
        type: OptionType.STRING,
        description: "Your bio with #TIME as the placeholder for the time.",
        default: `Medicine Student | AYBÜ TIP
Backend Developer | PHP - Python - Shell
Gamer | Every Game
| FLUX |
Time : #TIME
Flutter Enthusiast | Dart
"Kong" | Code is science, code is art`,
    },
    timeFormat: {
        type: OptionType.STRING,
        description: "Time format (12hr or 24hr).",
        default: "12hr", // Default to 12-hour format
    },
    updateInterval: {
        type: OptionType.SLIDER,
        description: "Update interval in seconds.",
        default: 60,
        markers: [10, 30, 60, 120],
    },
});

function getCurrentTime() {
    const now = new Date();
    const use12HourFormat = settings.store.timeFormat === "12hr"; // Check user preference
    return new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
        hour12: use12HourFormat, // Use 12-hour format if preferred
    }).format(now);
}

async function updateBio(bioTemplate) {
    const time = getCurrentTime();
    const bio = bioTemplate.replace("#TIME", time); // Replace placeholder with time
    console.log("Updating bio to:", bio);
    try {
        await RestAPI.patch({
            url: "/users/@me",
            body: { bio },
        });
        console.log("Bio updated successfully:", bio);
    } catch (error) {
        console.error("Failed to update bio:", error);
    }
    console.log("Next update in", settings.store.updateInterval, "seconds");
}

export default definePlugin({
    name: "CustomTimeBio",
    description: "Automatically updates your Discord bio with the current time in Turkey (Ankara).",
    authors: [{ name: "KONG", id: 294197403572240385n }],
    settings,

    start() {
        this.intervalId = setInterval(() => {
            const bioTemplate = settings.store.customBio;
            updateBio(bioTemplate);
        }, settings.store.updateInterval * 1000); // Convert seconds to milliseconds
    },

    stop() {
        clearInterval(this.intervalId);
    },
});
