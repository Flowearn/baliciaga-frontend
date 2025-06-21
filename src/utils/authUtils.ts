import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Decodes a JWT token to extract the payload
 */
function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Checks if the current user is a member of the InternalStaff group
 */
export async function isInternalStaff(): Promise<boolean> {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    
    if (!idToken) {
      return false;
    }
    
    const decodedToken = decodeJWT(idToken);
    if (!decodedToken) {
      return false;
    }
    
    const groups = decodedToken['cognito:groups'] || [];
    return groups.includes('InternalStaff');
  } catch (error) {
    console.error('Error checking InternalStaff status:', error);
    return false;
  }
}

/**
 * Gets the user's Cognito groups from the JWT token
 */
export async function getUserGroups(): Promise<string[]> {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    
    if (!idToken) {
      return [];
    }
    
    const decodedToken = decodeJWT(idToken);
    if (!decodedToken) {
      return [];
    }
    
    return decodedToken['cognito:groups'] || [];
  } catch (error) {
    console.error('Error getting user groups:', error);
    return [];
  }
}