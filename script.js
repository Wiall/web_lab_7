document.getElementById("play").addEventListener("click", () => {
    document.getElementById("work").classList.remove("hidden");
});

document.getElementById("close").addEventListener("click", async () => {
    document.getElementById("work").classList.add("hidden");
    const localEvents = fetchFromLocalStorage();

    const serverEvents = await fetchFromServer();

    console.log("Events from LocalStorage:", localEvents);
    console.log("Events from Server:", serverEvents);

    renderEventsTable(localEvents, serverEvents);
});

function fetchFromLocalStorage() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    return events.map(event => {
        const timestamp = event.timestamp ? new Date(event.timestamp).toLocaleString() : "Invalid Date";
        const message = event.message || "undefined";
        return `${timestamp} - ${message}`;
    });
}

async function fetchFromServer() {
    try {
        const response = await fetch("server.php?events", {
            method: "GET",
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Server error: ${error.message}`);
        }

        const result = await response.json();
        if (result.status === "success") {
            return result.events;
        } else {
            console.error("Error fetching events:", result.message);
            return [];
        }
    } catch (error) {
        console.error("Error fetching events from server:", error);
        return [];
    }
}

document.getElementById("reload").addEventListener("click", () => {
    resetAnimation();
});


let isAnimating = false;

document.getElementById("start").addEventListener("click", () => {
    if (!isAnimating) {
        startAnimation();
        isAnimating = true;
        document.getElementById("start").textContent = "Stop";
    } else {
        stopAnimation();
        isAnimating = false;
        document.getElementById("start").textContent = "Start";
    }
});
let animationFrame;
let circles = [
    { id: "circle1", x: 10, y: 100, radius: 10, dx: 2, dy: 1, color: "red" },
    { id: "circle2", x: 300, y: 10, radius: 10, dx: 1, dy: 2, color: "green" },
];

function initCircles() {
    const anim = document.getElementById("anim");
    anim.innerHTML = "";

    circles.forEach(circle => {
        const el = document.createElement("div");
        el.id = circle.id;
        el.style.position = "absolute";
        el.style.width = `${circle.radius * 2}px`;
        el.style.height = `${circle.radius * 2}px`;
        el.style.borderRadius = "50%";
        el.style.backgroundColor = circle.color;
        el.style.left = `${circle.x}px`;
        el.style.top = `${circle.y}px`;
        anim.appendChild(el);
    });
}

function startAnimation() {
    function moveCircles() {
        const anim = document.getElementById("anim");
        const animBounds = anim.getBoundingClientRect();

        circles.forEach(circle => {
            circle.x += circle.dx;
            circle.y += circle.dy;

            if (circle.x <= 0 || circle.x + circle.radius * 2 >= animBounds.width) {
                circle.dx *= -1;
                logEvent(`Circle ${circle.id} hit a vertical wall.`);
            }
            if (circle.y <= 0 || circle.y + circle.radius * 2 >= animBounds.height) {
                circle.dy *= -1;
                logEvent(`Circle ${circle.id} hit a horizontal wall.`);
            }

            const el = document.getElementById(circle.id);
            el.style.left = `${circle.x}px`;
            el.style.top = `${circle.y}px`;
        });

        if (checkCollision(circles[0], circles[1])) {
            cancelAnimationFrame(animationFrame);
            logEvent("Circles collided! Animation stopped.");
            toggleButtons("reload");
            return;
        }

        animationFrame = requestAnimationFrame(moveCircles);
    }

    animationFrame = requestAnimationFrame(moveCircles);
}

function stopAnimation() {
    cancelAnimationFrame(animationFrame);
    logEvent("Animation stopped manually.");
}

function resetAnimation() {
    circles = [
        { id: "circle1", x: 10, y: 100, radius: 10, dx: 2, dy: 1, color: "red" },
        { id: "circle2", x: 300, y: 10, radius: 10, dx: 1, dy: 2, color: "green" },
    ];

    initCircles();

    isAnimating = false;
    document.getElementById("start").textContent = "Start";
    toggleButtons("start");

    document.getElementById("messages").innerHTML = "";

    logEvent("Animation reset and circles reloaded.");
}

function checkCollision(circle1, circle2) {
    const dx = circle1.x + circle1.radius - (circle2.x + circle2.radius);
    const dy = circle1.y + circle1.radius - (circle2.y + circle2.radius);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
}

function logEvent(message) {
    const messages = document.getElementById("messages");
    const event = document.createElement("div");
    const timestamp = new Date().toISOString();
    event.textContent = `[${timestamp}] ${message}`;
    messages.appendChild(event);

    saveToLocalStorage(message, timestamp);

    sendToServer({ message, timestamp });
}

function toggleButtons(state) {
    const startButton = document.getElementById("start");
    const reloadButton = document.getElementById("reload");

    if (state === "start") {
        startButton.style.display = "inline-block";
        reloadButton.style.display = "none";
    } else if (state === "reload") {
        startButton.style.display = "none";
        reloadButton.style.display = "inline-block";
    }
}

function saveToLocalStorage(message, timestamp) {
    const events = JSON.parse(localStorage.getItem("events")) || [];

    if (!message || !timestamp) {
        console.error("Invalid event data:", { message, timestamp });
        return;
    }

    const utcTimestamp = new Date(timestamp).toISOString();

    events.push({ message, timestamp: utcTimestamp });
    localStorage.setItem("events", JSON.stringify(events));
}

async function sendToServer(eventData) {
    try {
        const response = await fetch("server.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventData),
        });
        const result = await response.json();
        console.log("Server response:", result);
    } catch (error) {
        console.error("Error sending data to server:", error);
    }
}

function renderEventsTable(localEvents, serverEvents) {
    const block3table = document.getElementById("block3table");
    block3table.innerHTML = "";

    const table = document.createElement("table");
    table.style.width = "100%";
    table.border = "1";

    const headerRow = document.createElement("tr");

    const indexHeader = document.createElement("th");
    indexHeader.textContent = "#";
    headerRow.appendChild(indexHeader);

    const localHeader = document.createElement("th");
    localHeader.textContent = "LocalStorage Events";
    headerRow.appendChild(localHeader);

    const serverHeader = document.createElement("th");
    serverHeader.textContent = "Server Events";
    headerRow.appendChild(serverHeader);

    table.appendChild(headerRow);

    const maxRows = Math.max(localEvents.length, serverEvents.length);

    for (let i = 0; i < maxRows; i++) {
        const row = document.createElement("tr");

        const indexCell = document.createElement("td");
        indexCell.textContent = i + 1;
        row.appendChild(indexCell);

        const localCell = document.createElement("td");
        localCell.textContent = localEvents[i] || "";
        row.appendChild(localCell);

        const serverCell = document.createElement("td");
        serverCell.textContent = serverEvents[i] || "";
        row.appendChild(serverCell);

        table.appendChild(row);
    }

    block3table.appendChild(table);
}


document.getElementById("clearData").addEventListener("click", async () => {
    localStorage.removeItem("events");
    console.log("LocalStorage cleared.");

    try {
        const response = await fetch("server.php", {
            method: "DELETE",
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Server error: ${error.message}`);
        }

        const result = await response.json();
        console.log("Server response:", result);

        if (result.status === "success") {
            alert("Data cleared successfully!");
        } else {
            console.error("Error clearing server data:", result.message);
        }
    } catch (error) {
        console.error("Error clearing data from server:", error);
    }

    renderEventsTable([], []);
});

document.addEventListener("DOMContentLoaded", initCircles);
