export interface Helpline {
    label: string;
    number: string;
    icon?: string;
}

export const helplines: Record<string, Helpline[]> = {
    india: [
        { label: "Emergency (All-in-one)", number: "112", icon: "🚨" },
        { label: "Police", number: "100", icon: "👮" },
        { label: "Ambulance", number: "102", icon: "🚑" },
        { label: "Fire Brigade", number: "101", icon: "🔥" },
        { label: "Women Helpline", number: "1091", icon: "👩" },
        { label: "Child Helpline", number: "1098", icon: "👶" },
        { label: "Disaster Management", number: "108", icon: "🌪️" },
    ],
    default: [
        { label: "Universal Emergency", number: "112", icon: "🚨" },
    ]
};

export function getHelplinesByLocation(lat?: number, lng?: number): Helpline[] {
    if (!lat || !lng) return helplines.default;

    // India Rough Bounding Box
    if (lat >= 8 && lat <= 38 && lng >= 68 && lng <= 97) {
        return helplines.india;
    }

    return helplines.default;
}
