document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const languageSelector = document.getElementById("language-selector");
    const getInspirationButton = document.getElementById("get-inspiration");
    const inspirationContent = document.getElementById("inspiration-content");
    const playAdhanButton = document.getElementById("play-adhan");
    const nextPrayerElement = document.getElementById("next-prayer");
    const timeRemainingElement = document.getElementById("time-remaining");

    const translations = {
        en: {
            daily_inspiration: "Daily Inspiration",
            get_inspiration: "Get Today's Inspiration",
            prayer_times: "Prayer Times",
            next_prayer: "Next Prayer:",
            time_remaining: "Time Remaining:",
            play_adhan: "Play Adhan",
            qibla_direction: "Qibla Direction",
            footer: "© 2024 Islamic Inspirations"
        },
        bn: {
            daily_inspiration: "প্রতিদিনের প্রেরণা",
            get_inspiration: "আজকের প্রেরণা পান",
            prayer_times: "নামাজের সময়সূচী",
            next_prayer: "পরবর্তী নামাজ:",
            time_remaining: "সময় বাকি:",
            play_adhan: "আজান চালান",
            qibla_direction: "কিবলার দিক",
            footer: "© ২০২৪ ইসলামিক প্রেরণা"
        },
        ar: {
            daily_inspiration: "الإلهام اليومي",
            get_inspiration: "احصل على إلهام اليوم",
            prayer_times: "أوقات الصلاة",
            next_prayer: "الصلاة التالية:",
            time_remaining: "الوقت المتبقي:",
            play_adhan: "تشغيل الأذان",
            qibla_direction: "اتجاه القبلة",
            footer: "© ٢٠٢٤ الإلهام الإسلامي"
        }
    };

    // Theme Toggle
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
    });

    // Language Selector
    languageSelector.addEventListener("change", (e) => {
        const selectedLang = e.target.value;
        document.querySelectorAll("[data-key]").forEach((element) => {
            const key = element.getAttribute("data-key");
            element.textContent = translations[selectedLang][key];
        });
        getDailyInspiration(); // Update inspiration in the selected language
    });

    // Inspirations
    const inspirations = [
        { en: "Be mindful of Allah and He will protect you.", bn: "আল্লাহকে স্মরণ করুন, তিনি আপনাকে রক্ষা করবেন।", ar: "كن على وعي بالله وسيرعاك." },
        { en: "The best among you are those who have the best manners.", bn: "তোমাদের মধ্যে যারা ভাল চরিত্রের, তারা সেরা।", ar: "خيركم أحسنكم أخلاقا." },
        { en: "Patience is the key to relief.", bn: "ধৈর্যই মুক্তির চাবি।", ar: "الصبر مفتاح الفرج." },
        { en: "Seek knowledge from the cradle to the grave.", bn: "জ্ঞান অর্জন করো দোলনা থেকে কবরে পর্যন্ত।", ar: "اطلب العلم من المهد إلى اللحد." }
    ];

    function getDailyInspiration() {
        const lang = languageSelector.value;
        const today = new Date().getDate(); // Get the day of the month (1-31)
        const inspiration = inspirations[today % inspirations.length]; // Rotate based on the day
        inspirationContent.textContent = inspiration[lang];
    }

    // Fetch Daily Inspiration on Load
    getDailyInspiration();

    // Also allow manual inspiration fetching
    getInspirationButton.addEventListener("click", getDailyInspiration);

    // Prayer Times Countdown
    const prayers = [
        { name: "Fajr", time: "05:30" },
        { name: "Dhuhr", time: "12:30" },
        { name: "Asr", time: "15:45" },
        { name: "Maghrib", time: "18:20" },
        { name: "Isha", time: "20:00" }
    ];

    function updatePrayerTimes() {
        const now = new Date();
        let nextPrayer = null;

        for (let prayer of prayers) {
            const [hours, minutes] = prayer.time.split(":");
            const prayerTime = new Date(now);
            prayerTime.setHours(hours, minutes, 0, 0);

            if (prayerTime > now) {
                nextPrayer = prayer;
                break;
            }
        }

        if (!nextPrayer) {
            nextPrayer = prayers[0];
        }

        nextPrayerElement.textContent = nextPrayer.name;
        const nextPrayerTime = new Date();
        nextPrayerTime.setHours(...nextPrayer.time.split(":").map(Number), 0, 0);

        const diff = nextPrayerTime - now;
        timeRemainingElement.textContent = new Date(diff).toISOString().substr(11, 8);
    }

    setInterval(updatePrayerTimes, 1000);

    // Play Adhan
    playAdhanButton.addEventListener("click", () => {
        const adhan = new Audio("https://www.islamicfinder.org/prayer/adhan.mp3");
        adhan.play();
    });

    // Qibla Compass
    function getQiblaDirection() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;

                    // Calculate Qibla direction (Kaaba coordinates: 21.4225° N, 39.8262° E)
                    const kaabaLat = 21.4225;
                    const kaabaLng = 39.8262;

                    const deltaLng = (kaabaLng - userLng) * (Math.PI / 180);
                    const userLatRad = userLat * (Math.PI / 180);
                    const kaabaLatRad = kaabaLat * (Math.PI / 180);

                    const x = Math.sin(deltaLng) * Math.cos(kaabaLatRad);
                    const y = Math.cos(userLatRad) * Math.sin(kaabaLatRad) -
                              Math.sin(userLatRad) * Math.cos(kaabaLatRad) * Math.cos(deltaLng);
                    const qiblaAngle = (Math.atan2(x, y) * (180 / Math.PI) + 360) % 360;

                    renderCompass(qiblaAngle);
                },
                (error) => {
                    alert("Error getting location. Please enable GPS.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    }

    // Render Compass
    function renderCompass(angle) {
        const canvas = document.getElementById("compass");
        const ctx = canvas.getContext("2d");

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Compass Circle
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 45, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw North Marker
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.lineTo(canvas.width / 2, 10);
        ctx.strokeStyle = "red";
        ctx.stroke();

        // Draw Qibla Marker
        const qiblaX = canvas.width / 2 + 45 * Math.sin((angle * Math.PI) / 180);
        const qiblaY = canvas.height / 2 - 45 * Math.cos((angle * Math.PI) / 180);

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.lineTo(qiblaX, qiblaY);
        ctx.strokeStyle = "green";
        ctx.stroke();
    }

    // Initialize Qibla Direction on Page Load
    getQiblaDirection();
});
