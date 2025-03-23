
import { v4 as uuidv4 } from 'uuid';

// Types for our local authentication system
export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface AuthSession {
  user: User | null;
  expires_at: number; // Unix timestamp
}

export interface AuthError {
  message: string;
}

// In-memory database simulation
class LocalAuthService {
  private storagePrefix = 'app_auth_';
  
  // Store user in localStorage
  private storeUser(user: User): void {
    localStorage.setItem(`${this.storagePrefix}user_${user.id}`, JSON.stringify(user));
  }
  
  // Get user by email
  private getUserByEmail(email: string): User | null {
    // Loop through localStorage to find user with matching email
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${this.storagePrefix}user_`)) {
        const userData = localStorage.getItem(key);
        if (userData) {
          const user = JSON.parse(userData) as User;
          if (user.email === email) {
            return user;
          }
        }
      }
    }
    return null;
  }
  
  // Store session in localStorage
  private storeSession(session: AuthSession): void {
    localStorage.setItem(`${this.storagePrefix}session`, JSON.stringify(session));
  }
  
  // Get current session
  getSession(): { data: { session: AuthSession | null } } {
    const sessionData = localStorage.getItem(`${this.storagePrefix}session`);
    let session: AuthSession | null = null;
    
    if (sessionData) {
      session = JSON.parse(sessionData) as AuthSession;
      
      // Check if session has expired
      if (session.expires_at < Date.now()) {
        this.signOut();
        return { data: { session: null } };
      }
    }
    
    return { data: { session } };
  }
  
  // Sign up with email and password
  async signUp({ email, password, options }: { 
    email: string; 
    password: string; 
    options?: { data?: { username: string } } 
  }): Promise<{ data: { user: User | null }; error: AuthError | null }> {
    try {
      // Check if user already exists
      const existingUser = this.getUserByEmail(email);
      if (existingUser) {
        return { 
          error: { message: 'User with this email already exists' },
          data: { user: null }
        };
      }
      
      // Create new user
      const user: User = {
        id: uuidv4(),
        email,
        username: options?.data?.username || email.split('@')[0],
        created_at: new Date().toISOString()
      };
      
      // Store password securely (in a real app, you'd hash this)
      localStorage.setItem(`${this.storagePrefix}pwd_${user.id}`, password);
      
      // Store user
      this.storeUser(user);
      
      // Create and store session
      const session: AuthSession = {
        user,
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      };
      this.storeSession(session);
      
      return { data: { user }, error: null };
    } catch (err) {
      return { 
        error: { message: err instanceof Error ? err.message : 'Unknown error occurred' },
        data: { user: null }
      };
    }
  }
  
  // Sign in with email and password
  async signInWithPassword({ email, password }: { 
    email: string;
    password: string;
  }): Promise<{ data: { user: User | null }; error: AuthError | null }> {
    try {
      // Find user by email
      const user = this.getUserByEmail(email);
      if (!user) {
        return { 
          error: { message: 'Invalid login credentials' },
          data: { user: null }
        };
      }
      
      // Verify password
      const storedPassword = localStorage.getItem(`${this.storagePrefix}pwd_${user.id}`);
      if (storedPassword !== password) {
        return { 
          error: { message: 'Invalid login credentials' },
          data: { user: null }
        };
      }
      
      // Create and store session
      const session: AuthSession = {
        user,
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      };
      this.storeSession(session);
      
      return { data: { user }, error: null };
    } catch (err) {
      return { 
        error: { message: err instanceof Error ? err.message : 'Unknown error occurred' },
        data: { user: null }
      };
    }
  }
  
  // Sign out
  async signOut(): Promise<void> {
    localStorage.removeItem(`${this.storagePrefix}session`);
  }
  
  // Listen for auth state changes
  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void): { 
    data: { subscription: { unsubscribe: () => void } } 
  } {
    // Simple implementation to check session every second
    const interval = setInterval(() => {
      const { data: { session } } = this.getSession();
      callback('SIGNED_IN', session);
    }, 1000);
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            clearInterval(interval);
          }
        }
      }
    };
  }
}

export const localAuth = new LocalAuthService();
