// Example client-side code for connecting to WebSocket
const socket = io('http://localhost:3000');

// Register user after authentication
function registerUser(userId, userType) {
  socket.emit('register', { userId, userType });
}

// Listen for notifications
socket.on('notification', (notification) => {
  console.log('Received notification:', notification);
  
  // Handle different notification types
  switch (notification.type) {
    case 'vaccination_due':
      showVaccinationAlert(notification);
      break;
    case 'new_treatment':
      showTreatmentNotification(notification);
      break;
    case 'appointment_rescheduled':
      showAppointmentUpdate(notification);
      break;
    // Add more handlers for other notification types
  }
});

// Example handler functions
function showVaccinationAlert(notification) {
  // Show a prominent alert for vaccination due
  // Example: Display a toast notification
}

function showTreatmentNotification(notification) {
  // Show treatment notification
  // Example: Update UI with new treatment information
}

function showAppointmentUpdate(notification) {
  // Show appointment update
  // Example: Update calendar and show a notification
}

// Connection status handlers
socket.on('connect', () => {
  console.log('Connected to notification service');
  
  // Re-register user if we have user info in local storage
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');
  
  if (userId && userType) {
    registerUser(userId, userType);
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from notification service');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
}); 