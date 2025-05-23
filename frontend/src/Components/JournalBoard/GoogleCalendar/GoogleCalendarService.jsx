class GoogleCalendarService {
  constructor(authToken) {
    this.accessToken = authToken;
    if (!this.accessToken) {
      console.error('GoogleCalendarService: No access token provided');
    }
  }

  async createEvent(task) {
    try {
      const { content, dueDate, dueTime, description = '' } = task;
      
      if (!dueDate) {
        throw new Error('Task must have a due date to create a calendar event');
      }

      // Format date and time
      const startDateTime = this.formatDateTime(dueDate, dueTime || '00:00');
      // End time defaults to 1 hour after start if not specified
      const endDateTime = this.formatDateTime(
        dueDate, 
        dueTime ? this.addOneHour(dueTime) : '01:00'
      );

      const event = {
        summary: content,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        reminders: {
          useDefault: true,
        },
      };

      // Log request details for debugging (omit sensitive data)
      console.log('Creating calendar event with data:', {
        summary: event.summary,
        start: event.start,
        end: event.end,
        usingToken: !!this.accessToken
      });

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create event');
      }

      const data = await response.json();
      return {
        success: true,
        eventId: data.id,
        eventLink: data.htmlLink,
      };
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updateEvent(eventId, task) {
    try {
      const { content, dueDate, dueTime, description = '' } = task;
      
      // Format date and time
      const startDateTime = this.formatDateTime(dueDate, dueTime || '00:00');
      const endDateTime = this.formatDateTime(
        dueDate, 
        dueTime ? this.addOneHour(dueTime) : '01:00'
      );

      const event = {
        summary: content,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update event');
      }

      const data = await response.json();
      return {
        success: true,
        eventId: data.id,
        eventLink: data.htmlLink,
      };
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async deleteEvent(eventId) {
    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete event');
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async listEvents(maxResults = 10) {
    try {
      const now = new Date().toISOString();
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to list events');
      }

      const data = await response.json();
      return {
        success: true,
        events: data.items || [],
      };
    } catch (error) {
      console.error('Error listing Google Calendar events:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Helper methods
  formatDateTime(date, time) {
    const [hours, minutes] = time.split(':');
    const dateObj = new Date(date);
    dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    return dateObj.toISOString();
  }

  addOneHour(time) {
    const [hours, minutes] = time.split(':');
    let hoursInt = parseInt(hours, 10);
    hoursInt = (hoursInt + 1) % 24;
    return `${hoursInt.toString().padStart(2, '0')}:${minutes}`;
  }
}

export default GoogleCalendarService;