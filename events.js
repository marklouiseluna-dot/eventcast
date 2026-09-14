// Both homepage and registration form read from this.

const EVENTS = [
    {
        id: "wedding",
        image: "images/wedding.jpg",
        name: "Guerrero-Valladolid Wedding",
        city: "Paris",
        date: "2026-09-16",
        displayDate: "September 16, 2026",
        location: "Paris, France",
        badge: "Wedding",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        description: "A celebration of love with family and friends. Free to attend."
    },
    {
        id: "birthday",
        image: "images/birthday.jpg",
        name: "Kyla's 25th Birthday",
        city: "Sorsogon City",
        date: "2026-09-15",
        displayDate: "September 15, 2026",
        location: "Sorsogon City, Philippines",
        badge: "Birthday",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        description: "A rooftop celebration with music and food. Free to attend."
    },
    {
        id: "techcorp",
        image: "images/techSummit.jpg",
        name: "TechCorp Annual Summit",
        city: "Singapore",
        date: "2026-09-14",
        displayDate: "September 14, 2026",
        location: "Singapore",
        badge: "Corporate Event",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        description: "A full-day summit for developers and designers. Free registration."
    },
    {
        id: "beach",
        image: "images/beachparty.jpg",
        name: "Beach Sunset Party",
        city: "Bali",
        date: "2026-09-17",
        displayDate: "September 17, 2026",
        location: "Bali, Indonesia",
        badge: "Outdoor Party",
        gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        description: "An evening of music, bonfires, and ocean views. Free to attend."
    },
    {
        id: "hackathon",
        image: "images/hackathon.jpg",
        name: "Hackathon 2026",
        city: "New York",
        date: "2026-09-15",
        displayDate: "September 15, 2026",
        location: "United States",
        badge: "Software Engineering",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        description: "Hackathon competition for developer and aspiring developers."
    },
    {    
        id: "concert",
        image: "images/bruno.jpg",
        name: "The Romantic Tour",
        city: "Bulacan",
        date: "2026-12-22",
        displayDate: "December 22, 2026",
        location: "Bulacan, Philippines",
        badge: "Live Concert",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        description: "Join us for an unforgettable night of music and romance."
    },
];


// HELPER: Find an event by its name
function findEventByName(name) {
    return EVENTS.find(e => e.name === name);
}