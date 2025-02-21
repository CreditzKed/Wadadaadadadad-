// Initialize state variables first
let currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let activeRainIntensity = null;
let isThunderActive = false;
let rainInterval = null;

// Improved Notification System
class NotificationManager {
  constructor() {
    this.container = document.getElementById('notification-container');
    this.thunderSound = new Audio('https://actions.google.com/sounds/v1/weather/thunderstorm.ogg');
    this.rainSound = new Audio('/30 MINUTES Gentle Rain at Night, Rain Sounds for Sleep, Insomnia, Relaxing, Meditation, Yoga, Study.mp3');
    this.rainSound.loop = true;

    this.rainSound.onerror = (error) => {
      console.error("Error loading rain sound:", error);
    };
    this.thunderSound.onerror = (error) => {
      console.error("Error loading thunder sound:", error);
    };

    this.connectWebSocket();
  }

  connectWebSocket() {
    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.showNotification(data);
    };

    this.ws.onclose = () => {
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  showNotification(data) {
    const notification = document.createElement('div');
    notification.className = 'notification';

    notification.innerHTML = `
      <div class="notification-avatar" style="background-image: url('${data.avatar}')"></div>
      <div class="notification-content">
        <div class="notification-username">${data.username}</div>
        <div>${data.content}</div>
      </div>
    `;

    this.container.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
}

function generateWeatherEffects() {
  const container = document.querySelector('.background-container');

  if (!document.querySelector('.thunder')) {
    const thunder = document.createElement('div');
    thunder.className = 'thunder';
    container.appendChild(thunder);
  }

  setInterval(() => {
    const oldDrops = document.querySelectorAll('.rain');
    if (oldDrops.length > 100) {
      oldDrops[0].remove();
    }
  }, 1000);
}

function createRainDrop(intensity) {
  const maxDrops = document.querySelectorAll('.rain').length;
  if (maxDrops > 100) return;

  const rain = document.createElement('div');
  rain.className = `rain ${intensity}`;
  rain.style.left = `${Math.random() * 100}%`;
  rain.style.animationDelay = `${Math.random() * 2}s`;
  document.querySelector('.background-container').appendChild(rain);

  rain.addEventListener('animationend', () => rain.remove());
}

function generateStars() {
  const starsContainer = document.getElementById('stars');
  starsContainer.innerHTML = '';

  for (let i = 0; i < 200; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.width = `${Math.random() * 2}px`;
    star.style.height = star.style.width;
    star.style.animationDelay = `${Math.random() * 2}s`;
    starsContainer.appendChild(star);
  }
}

function toggleRainEffect(intensity) {
  if (rainInterval) {
    clearInterval(rainInterval);
    rainInterval = null;
    document.querySelectorAll('.rain').forEach(drop => drop.remove());
    return;
  }

  const frequencies = { soft: 200 };
  rainInterval = setInterval(() => createRainDrop(intensity), frequencies[intensity]);
}

function startRainCycle() {
  function enableRain() {
    toggleRainEffect('soft');
    setTimeout(disableRain, 600000); // 10 minutes
  }

  function disableRain() {
    toggleRainEffect('soft');
    setTimeout(enableRain, 600000); // 10 minutes
  }

  enableRain();
}

function updateTime() {
  const now = new Date();
  const timeElement = document.getElementById('time');
  const greetingElement = document.getElementById('greeting');

  const timeString = now.toLocaleTimeString('en-US', {
    timeZone: currentTimezone,
    hour12: true,
    hour: 'numeric',
    minute: 'numeric'
  });

  const hour = now.getHours();
  let greeting = hour < 12 ? 'Good morning' :
                hour < 18 ? 'Good afternoon' :
                'Good evening';

  timeElement.textContent = timeString;
  greetingElement.textContent = greeting;
}

function createTimezoneDropdown() {
  const modal = document.createElement('div');
  modal.className = 'timezone-dropdown-modal';

  const dropdown = document.createElement('div');
  dropdown.className = 'timezone-dropdown';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search timezone...';
  searchInput.className = 'timezone-search';
  dropdown.appendChild(searchInput);

  const timezoneOptionsContainer = document.createElement('div'); 
  timezoneOptionsContainer.className = 'timezone-options-container';
  dropdown.appendChild(timezoneOptionsContainer);

  function populateTimezones(timezonesToDisplay) {
    timezoneOptionsContainer.innerHTML = ''; 
    timezonesToDisplay.forEach(tz => {
      const option = document.createElement('div');
      option.className = 'timezone-option';
      option.textContent = tz;
      option.onclick = () => {
        currentTimezone = tz;
        updateTime();
        modal.remove();
      };
      timezoneOptionsContainer.appendChild(option);
    });
  }

  const timezones = Intl.supportedValuesOf('timeZone');
  populateTimezones(timezones); 


  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredTimezones = timezones.filter(tz => tz.toLowerCase().includes(searchTerm));
    populateTimezones(filteredTimezones);
  });

  modal.appendChild(dropdown);
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  document.body.appendChild(modal);
}

// Initialize everything
generateStars();
generateWeatherEffects();
updateTime();
setInterval(updateTime, 1000);

// Add click handler for timezone selection
document.getElementById('time').onclick = createTimezoneDropdown;

// Initialize notification system
const notifications = new NotificationManager();

// Initialize automatic rain cycle
startRainCycle();
