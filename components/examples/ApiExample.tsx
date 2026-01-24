'use client';

import { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface TestResponse {
  message: string;
  timestamp: string;
  status: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  count: number;
}

export default function ApiExample() {
  const [testData, setTestData] = useState<TestResponse | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<TestResponse>('/test');
      setTestData(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Error: ${err.message} (Status: ${err.status})`);
      } else {
        setError('Failed to fetch test data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<UsersResponse>('/sample-users');
      if (data.data) {
        setUsers(data.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Error: ${err.message} (Status: ${err.status})`);
      } else {
        setError('Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTest();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">API Integration Example</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Test Endpoint</h3>
            <div className="bg-gray-50 p-4 rounded mb-3">
              {loading && !testData ? (
                <p className="text-gray-500">Loading...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : testData ? (
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Message:</span> {testData.message}</p>
                  <p><span className="font-medium">Status:</span> {testData.status}</p>
                  <p><span className="font-medium">Timestamp:</span> {new Date(testData.timestamp).toLocaleString()}</p>
                </div>
              ) : null}
            </div>
            <Button onClick={fetchTest} size="sm" disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Test Data'}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold text-gray-700 mb-2">Users Endpoint</h3>
            <div className="bg-gray-50 p-4 rounded mb-3 min-h-[100px]">
              {loading && users.length === 0 ? (
                <p className="text-gray-500">Loading...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : users.length > 0 ? (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="p-2 bg-white rounded border">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No users loaded. Click the button to fetch.</p>
              )}
            </div>
            <Button onClick={fetchUsers} size="sm" disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Users'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

