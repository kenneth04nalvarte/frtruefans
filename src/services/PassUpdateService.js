class PassUpdateService {
  constructor() {
    this.eventSource = null;
    this.connected = false;
    this.userId = null;
    this.onUpdateCallback = null;
    this.retryCount = 0;
    this.pollingInterval = null;
  }

  // Connect to SSE stream
  connect(userId, onUpdateCallback) {
    this.userId = userId;
    this.onUpdateCallback = onUpdateCallback;
    
    const url = `https://applepass-originator-ojhsb2liva-uc.a.run.app/api/sse/subscribe/${userId}`;
    this.eventSource = new EventSource(url);
    
    this.eventSource.onopen = () => {
      this.connected = true;
      this.retryCount = 0;
      console.log('SSE connected for user:', userId);
    };
    
    // Listen for pass updates
    this.eventSource.addEventListener('pass-update', (event) => {
      try {
        const update = JSON.parse(event.data);
        this.handlePassUpdate(update);
      } catch (error) {
        console.error('Error parsing pass update:', error);
      }
    });
    
    // Handle connection errors
    this.eventSource.onerror = (error) => {
      this.connected = false;
      console.error('SSE connection error:', error);
      // Auto-reconnect after 5 seconds
      setTimeout(() => this.reconnect(), 5000);
    };
  }

  // Subscribe to updates for a specific pass
  subscribeToPass(passId) {
    if (!this.connected || !this.userId) {
      console.error('Not connected to SSE');
      return;
    }

    fetch(`https://applepass-originator-ojhsb2liva-uc.a.run.app/api/sse/subscribe/${this.userId}/pass/${passId}`, {
      method: 'POST'
    })
    .then(response => {
      if (response.ok) {
        console.log('Subscribed to pass updates:', passId);
      }
    })
    .catch(error => {
      console.error('Error subscribing to pass:', error);
    });
  }

  // Handle incoming pass updates
  handlePassUpdate(update) {
    console.log('Pass update received:', update);
    
    if (this.onUpdateCallback) {
      this.onUpdateCallback(update);
    }
    
    // You can also show a notification here
    this.showNotification(update);
  }

  // Show notification to user
  showNotification(update) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pass Updated', {
        body: update.message,
        icon: '/path/to/your/icon.png'
      });
    }
  }

  // Exponential backoff for reconnection
  reconnect() {
    const maxRetries = 5;
    const baseDelay = 1000;
    
    if (this.retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, this.retryCount);
      setTimeout(() => {
        this.connect(this.userId, this.onUpdateCallback);
        this.retryCount++;
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      // Fall back to polling
      this.startPolling();
    }
  }

  // Fallback to polling if SSE fails
  startPolling() {
    this.pollingInterval = setInterval(() => {
      this.checkForUpdates();
    }, 30000); // Check every 30 seconds
  }

  checkForUpdates() {
    // Implement polling logic here
    fetch(`https://applepass-originator-ojhsb2liva-uc.a.run.app/api/passes/check-updates/${this.userId}`)
      .then(response => response.json())
      .then(updates => {
        if (updates.length > 0) {
          updates.forEach(update => this.handlePassUpdate(update));
        }
      })
      .catch(error => {
        console.error('Error checking for updates:', error);
      });
  }

  // Disconnect from SSE
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.connected = false;
  }
}

export default PassUpdateService;
