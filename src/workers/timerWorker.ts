// Web Worker para el timer del escaneo
// Se ejecuta en un hilo separado para evitar bloqueos durante escaneos intensivos

let timerInterval: ReturnType<typeof setInterval> | null = null;
let seconds = 0;

// Iniciar el timer
self.onmessage = function(e) {
  const command = e.data.command;
  
  switch (command) {
    case 'start':
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      seconds = 0;
      timerInterval = setInterval(() => {
        seconds++;
        self.postMessage({
          command: 'tick',
          seconds: seconds
        });
      }, 1000);
      break;
      
    case 'stop':
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      break;
      
    case 'reset':
      seconds = 0;
      self.postMessage({
        command: 'tick',
        seconds: seconds
      });
      break;
  }
};
