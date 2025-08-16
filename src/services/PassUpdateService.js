class PassUpdateService {
  constructor() {
    this.eventSource = null;
    this.connected = false;
    this.userId = null;
    this.onUpdateCallback = null;
    this.retryCount = 0;
    this.pollingInterval = null;
    this.maxRetries = 5;
    this.baseDelay = 1000;
  }

  // Connect to SSE stream
  connect(userId, onUpdateCallback) {
    this.userId = userId;
    this.onUpdateCallback = onUpdateCallback;
    this.retryCount = 0;
    
    const url = `https://applepass-7188044708.us-central1.run.app/api/sse/subscribe/${userId}`;
    this.eventSource = new EventSource(url);
    
    this.eventSource.onopen = () => {
      this.connected = true;
      this.retryCount = 0; // Reset retry count on successful connection
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
      // Auto-reconnect after delay
      setTimeout(() => this.reconnect(), this.baseDelay);
    };
  }

  // Subscribe to updates for a specific pass
  subscribeToPass(passId) {
    if (!this.connected || !this.userId) {
      console.error('Not connected to SSE');
      return;
    }

    fetch(`https://applepass-7188044708.us-central1.run.app/api/sse/subscribe/${this.userId}/pass/${passId}`, {
      method: 'POST'
    })
    .then(response => {
      if (response.ok) {
        console.log('Subscribed to pass updates:', passId);
      } else {
        console.error('Failed to subscribe to pass:', response.status);
      }
    })
    .catch(error => {
      console.error('Error subscribing to pass:', error);
    });
  }

  // Unsubscribe from a specific pass
  unsubscribeFromPass(passId) {
    if (!this.userId) {
      console.error('No user ID available');
      return;
    }

    fetch(`https://applepass-7188044708.us-central1.run.app/api/sse/subscribe/${this.userId}/pass/${passId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        console.log('Unsubscribed from pass updates:', passId);
      } else {
        console.error('Failed to unsubscribe from pass:', response.status);
      }
    })
    .catch(error => {
      console.error('Error unsubscribing from pass:', error);
    });
  }

  // Handle incoming pass updates
  handlePassUpdate(update) {
    console.log('Pass update received:', update);
    
    if (this.onUpdateCallback) {
      this.onUpdateCallback(update);
    }
    
    // Show notification to user
    this.showNotification(update);
  }

  // Show notification to user
  showNotification(update) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pass Updated', {
        body: update.message || 'Your pass has been updated',
        icon: '/favicon.ico'
      });
    }
  }

  // Exponential backoff for reconnection
  reconnect() {
    if (this.retryCount < this.maxRetries) {
      const delay = this.baseDelay * Math.pow(2, this.retryCount);
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.retryCount + 1}/${this.maxRetries})`);
      
      setTimeout(() => {
        this.connect(this.userId, this.onUpdateCallback);
        this.retryCount++;
      }, delay);
    } else {
      console.error('Max reconnection attempts reached, falling back to polling');
      // Fall back to polling
      this.startPolling();
    }
  }

  // Fallback to polling if SSE fails
  startPolling() {
    console.log('Starting polling fallback');
    this.pollingInterval = setInterval(() => {
      this.checkForUpdates();
    }, 30000); // Check every 30 seconds
  }

  // Check for updates via polling
  checkForUpdates() {
    if (!this.userId) return;

    fetch(`https://applepass-7188044708.us-central1.run.app/api/passes/check-updates/${this.userId}`)
      .then(response => response.json())
      .then(updates => {
        if (updates && updates.length > 0) {
          updates.forEach(update => this.handlePassUpdate(update));
        }
      })
      .catch(error => {
        console.error('Error checking for updates:', error);
      });
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.connected,
      retryCount: this.retryCount,
      polling: !!this.pollingInterval
    };
  }

  // Disconnect from SSE
  disconnect() {
    this.stopPolling();
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.connected = false;
    this.userId = null;
    this.onUpdateCallback = null;
    console.log('SSE disconnected');
  }
}

export default PassUpdateService;
