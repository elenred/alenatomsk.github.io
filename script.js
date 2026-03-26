const canvas = document.querySelector(".lines");

if (canvas instanceof HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const lines = [];
    const lineCount = 18;

    function resizeCanvas() {
        if (!context) {
            return;
        }

        const scale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(window.innerWidth * scale);
        canvas.height = Math.floor(window.innerHeight * scale);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        context.setTransform(scale, 0, 0, scale, 0, 0);
    }

    function createLine() {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            angle: Math.random() * Math.PI * 2,
            baseAngle: Math.random() * Math.PI * 2,
            length: 300 + Math.random() * 800,
            speed: 0.0003 + Math.random() * 0.001
        };
    }

    function initializeLines() {
        lines.length = 0;
        for (let index = 0; index < lineCount; index += 1) {
            lines.push(createLine());
        }
    }

    function draw() {
        if (!context) {
            return;
        }

        context.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (const line of lines) {
            const dx = pointer.x - line.x;
            const dy = pointer.y - line.y;
            const distance = Math.hypot(dx, dy);
            const influence = Math.max(0, 1 - distance / 500);
            const mouseAngle = Math.atan2(dy, dx);

            line.baseAngle += reducedMotionQuery.matches ? 0 : line.speed;
            line.angle = line.baseAngle + influence * Math.sin(mouseAngle) * 0.8;

            const halfLength = line.length / 2;
            const cosine = Math.cos(line.angle);
            const sine = Math.sin(line.angle);
            const startX = line.x - cosine * halfLength;
            const startY = line.y - sine * halfLength;
            const endX = line.x + cosine * halfLength;
            const endY = line.y + sine * halfLength;

            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(endX, endY);
            context.strokeStyle = `hsla(0, 0%, ${25 + influence * 30}%, ${0.15 + influence * 0.25})`;
            context.lineWidth = 0.8 + influence * 2;
            context.stroke();
        }

        window.requestAnimationFrame(draw);
    }

    function resetPointer() {
        pointer.x = window.innerWidth / 2;
        pointer.y = window.innerHeight / 2;
    }

    function updatePointer(clientX, clientY) {
        pointer.x = clientX;
        pointer.y = clientY;
    }

    resizeCanvas();
    initializeLines();
    resetPointer();

    window.addEventListener("resize", () => {
        resizeCanvas();
        initializeLines();
        resetPointer();
    });
    window.addEventListener("mousemove", (event) => {
        updatePointer(event.clientX, event.clientY);
    });
    window.addEventListener("touchmove", (event) => {
        const touch = event.touches[0];
        if (touch) {
            updatePointer(touch.clientX, touch.clientY);
        }
    }, { passive: true });
    window.addEventListener("touchend", resetPointer);
    document.addEventListener("mouseleave", resetPointer);

    if (typeof reducedMotionQuery.addEventListener === "function") {
        reducedMotionQuery.addEventListener("change", resetPointer);
    } else if (typeof reducedMotionQuery.addListener === "function") {
        reducedMotionQuery.addListener(resetPointer);
    }

    window.requestAnimationFrame(draw);
}
