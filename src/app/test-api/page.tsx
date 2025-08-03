'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function TestApiPage() {
  const { data: session } = useSession();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testApi = async (endpoint: string, name: string) => {
    try {
      setLoading(true);
      const response = await fetch(endpoint);
      const data = await response.json();
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          data: data,
          success: response.ok
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'ERROR',
          data: error instanceof Error ? error.message : 'Unknown error',
          success: false
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    if (!session) return;
    
    setResults({});
    
    // Test all API endpoints
    await testApi('/api/test-db', 'Database Connection');
    await testApi('/api/workspaces', 'Workspaces');
    await testApi('/api/tasks', 'Tasks (All)');
    
    // Get workspace ID from workspaces response first
    const workspacesResponse = await fetch('/api/workspaces');
    if (workspacesResponse.ok) {
      const workspaces = await workspacesResponse.json();
      if (workspaces.length > 0) {
        await testApi(`/api/spaces?workspaceId=${workspaces[0].id}`, 'Spaces');
        await testApi(`/api/lists?spaceId=test`, 'Lists (will fail - no space)');
      }
    }
  };

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
        <p>Please sign in to test the API endpoints.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="mb-4">
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run API Tests'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([name, result]: [string, any]) => (
          <div key={name} className="border p-4 rounded">
            <h3 className="font-semibold mb-2">
              {name} - 
              <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                {result.success ? ' SUCCESS' : ' FAILED'}
              </span>
              <span className="text-gray-500 ml-2">({result.status})</span>
            </h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Session Info:</h3>
        <pre className="text-sm">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}