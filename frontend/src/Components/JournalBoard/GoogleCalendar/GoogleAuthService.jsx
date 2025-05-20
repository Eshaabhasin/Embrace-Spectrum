// GoogleAuthService.js

class GoogleAuthService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY || 'AIzaSyAURsPWRVmAgPiMpCDpPhyk7zaZhD7n_sY'; // ✅ API Key
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '50702259389-js1lr9a87a5ng2p446ge353vpg63bqt2.apps.googleusercontent.com'; // ✅ OAuth 2.0 Client ID
    this.scopes = 'https://www.googleapis.com/auth/calendar';

    this.tokenClient = null;
    this.isGapiLoaded = false;
    this.isGsiLoaded = false;
    this.scriptLoadPromises = {};
  }
  
  async loadGoogleApis() {
    try {
      // Load the Google API client library
      if (!this.isGapiLoaded) {
        await this.loadScript('https://apis.google.com/js/api.js');
        
        if (!window.gapi) {
          throw new Error('Failed to load Google API library');
        }
        
        await new Promise((resolve, reject) => {
          window.gapi.load('client', {
            callback: () => {
              this.isGapiLoaded = true;
              resolve();
            },
            onerror: (error) => reject(new Error('Error loading GAPI client: ' + error)),
            timeout: 5000, // 5 seconds timeout
            ontimeout: () => reject(new Error('Timeout loading GAPI client')),
          });
        });
        
        await window.gapi.client.init({
          apiKey: this.apiKey,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        });
      }

      // Load the Google Identity Services library
      if (!this.isGsiLoaded) {
        await this.loadScript('https://accounts.google.com/gsi/client');
        
        if (!window.google?.accounts?.oauth2) {
          throw new Error('Failed to load Google Identity Services');
        }
        
        this.isGsiLoaded = true;
        
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: this.scopes,
          prompt: '', // '' for silent refresh, 'consent' to show consent screen
          callback: (response) => {
            if (response.error) {
              console.error('Token client error:', response.error);
              // Don't throw here since it's in a callback - handle the error gracefully
              if (this.authCallback) {
                this.authCallback(null, new Error(response.error));
              }
              return;
            }
            
            // Store the access token in localStorage or state management
            localStorage.setItem('googleAccessToken', response.access_token);
            // Add token type to storage
            localStorage.setItem('googleTokenType', response.token_type || 'Bearer');
            localStorage.setItem('googleTokenExpiry', Date.now() + (response.expires_in || 3600) * 1000);
            
            // You can also trigger a callback here if needed
            if (this.authCallback) {
              this.authCallback(response.access_token);
            }
          },
        });
      }

      return { isLoaded: this.isGapiLoaded && this.isGsiLoaded };
    } catch (error) {
      console.error('Error loading Google APIs:', error);
      throw error;
    }
  }

  async signIn(callback) {
    this.authCallback = callback;
    
    try {
      if (!this.clientId) {
        throw new Error('Google Client ID is missing. Please check your environment variables.');
      }
      
      await this.loadGoogleApis();
      
      // Request an access token with UI consent
      this.tokenClient.requestAccessToken({ 
        prompt: 'consent',
        scope: this.scopes,
        include_granted_scopes: true
      });
      return { success: true };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      if (callback) callback(null, error);
      return { success: false, error: error.message };
    }
  }

  async silentSignIn(callback) {
    this.authCallback = callback;
    
    try {
      // Check if we have a stored token that's still valid
      const token = localStorage.getItem('googleAccessToken');
      const expiry = localStorage.getItem('googleTokenExpiry');
      
      if (token && expiry && Date.now() < parseInt(expiry, 10)) {
        if (callback) callback(token);
        return { success: true, accessToken: token };
      }
      
      if (!this.clientId) {
        throw new Error('Google Client ID is missing. Please check your environment variables.');
      }
      
      await this.loadGoogleApis();
      
      // Try to get a token silently (no UI prompt)
      this.tokenClient.requestAccessToken({ 
        prompt: '',
        scope: this.scopes
      });
      return { success: true };
    } catch (error) {
      console.error('Silent sign-in failed:', error);
      if (callback) callback(null, error);
      return { success: false, error: error.message };
    }
  }
  
  signOut() {
    try {
      const token = localStorage.getItem('googleAccessToken');
      if (token && window.google?.accounts?.oauth2) {
        // Revoke the token
        window.google.accounts.oauth2.revoke(token, () => {
          console.log('Token revoked');
        });
        
        // Clear stored token
        localStorage.removeItem('googleAccessToken');
        localStorage.removeItem('googleTokenType');
        localStorage.removeItem('googleTokenExpiry');
      }
      return { success: true };
    } catch (error) {
      console.error('Error signing out from Google:', error);
      return { success: false, error: error.message };
    }
  }
  
  getAccessToken() {
    const token = localStorage.getItem('googleAccessToken');
    const expiry = localStorage.getItem('googleTokenExpiry');
    
    if (token && expiry && Date.now() < parseInt(expiry, 10)) {
      return token;
    }
    
    return null;
  }

  getAuthHeaderValue() {
    const token = this.getAccessToken();
    const tokenType = localStorage.getItem('googleTokenType') || 'Bearer';
    
    if (token) {
      return `${tokenType} ${token}`;
    }
    
    return null;
  }
  
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // Helper to load external scripts (with deduplication)
  loadScript(src) {
    // Check if we're already loading this script
    if (this.scriptLoadPromises[src]) {
      return this.scriptLoadPromises[src];
    }

    // Check if the script is already in the DOM
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      this.scriptLoadPromises[src] = Promise.resolve();
      return this.scriptLoadPromises[src];
    }

    // Create a new promise for this script
    this.scriptLoadPromises[src] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log(`Script loaded: ${src}`);
        resolve();
      };
      
      script.onerror = (error) => {
        console.error(`Error loading script ${src}:`, error);
        delete this.scriptLoadPromises[src]; // Remove failed promise to allow retry
        reject(new Error(`Failed to load script: ${src}`));
      };
      
      document.head.appendChild(script);
    });

    return this.scriptLoadPromises[src];
  }
}

export default new GoogleAuthService();