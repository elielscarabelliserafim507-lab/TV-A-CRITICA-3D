const clockEl = document.getElementById('gameClock');
const periodEl = document.getElementById('dayPeriod');
const skyOverlay = document.getElementById('skyOverlay');
const gameCanvas = document.getElementById('game');

function getPeriod(hour) {
  if (hour >= 6 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'sunset';
  if (hour >= 5 && hour < 6) return 'sunrise';
  return 'night';
}

function updateTimeCycle() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const decimalHour = hour + minute / 60 + second / 3600;
  const period = getPeriod(hour);

  if (clockEl) {
    clockEl.textContent = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  const labels = {
    day: 'DIA',
    sunset: 'ENTARDECER',
    sunrise: 'AMANHECER',
    night: 'NOITE'
  };
  if (periodEl) periodEl.textContent = labels[period];

  document.body.dataset.timePeriod = period;

  let brightness = 1;
  let saturate = 1;
  let overlay = 'rgba(0,0,0,0)';

  if (period === 'night') {
    brightness = 0.48;
    saturate = 0.78;
    overlay = 'rgba(4,16,48,0.34)';
  } else if (period === 'sunset') {
    const t = Math.min(1, Math.max(0, (decimalHour - 17) / 2));
    brightness = 0.92 - t * 0.25;
    saturate = 1.08;
    overlay = `rgba(92,36,12,${0.10 + t * 0.13})`;
  } else if (period === 'sunrise') {
    const t = Math.min(1, Math.max(0, decimalHour - 5));
    brightness = 0.64 + t * 0.33;
    saturate = 0.92 + t * 0.08;
    overlay = `rgba(92,50,20,${0.18 - t * 0.11})`;
  }

  if (gameCanvas) {
    gameCanvas.style.filter = `brightness(${brightness}) saturate(${saturate})`;
  }
  if (skyOverlay) skyOverlay.style.background = overlay;
}

updateTimeCycle();
setInterval(updateTimeCycle, 15000);
