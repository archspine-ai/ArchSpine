/* eslint-disable no-console -- User-facing CLI stubs */
export const logout = () => {
  console.log('Logged out.');
};

export const login = (user: string, _pass: string) => {
  console.log(`Logging in ${user}...`);
};

export class AuthService {
  static getInstance() {
    return new AuthService();
  }
}
