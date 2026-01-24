'use client';

import { useAppStore } from '@/stores/useAppStore';
import Button from '@/components/ui/Button';

export default function ZustandExample() {
  const { user, theme, isLoading, setUser, clearUser, setTheme, setLoading } = useAppStore();

  const handleLogin = () => {
    setUser({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      token: 'sample-token-123',
    });
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Zustand Store Example</h2>
      
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">User State:</h3>
          <div className="bg-gray-50 p-3 rounded">
            {user.id ? (
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">ID:</span> {user.id}</p>
                <p><span className="font-medium">Name:</span> {user.name}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Token:</span> {user.token ? user.token.substring(0, 20) + '...' : 'N/A'}</p>
              </div>
            ) : (
              <p className="text-gray-500">No user logged in</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Theme:</h3>
          <p className="bg-gray-50 p-3 rounded text-sm">
            Current theme: <span className="font-medium">{theme}</span>
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Loading State:</h3>
          <p className="bg-gray-50 p-3 rounded text-sm">
            {isLoading ? (
              <span className="text-[#10b981] font-medium">Loading...</span>
            ) : (
              <span className="text-gray-600">Not loading</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-4 border-t">
        <Button onClick={handleLogin} size="sm">Set User</Button>
        <Button onClick={clearUser} variant="outline" size="sm">Clear User</Button>
        <Button onClick={handleToggleTheme} variant="outline" size="sm">Toggle Theme</Button>
        <Button onClick={handleLoading} variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Test Loading'}
        </Button>
      </div>
    </div>
  );
}

