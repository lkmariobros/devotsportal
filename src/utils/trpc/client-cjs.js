"use client";

// Create a proxy-based mock that can handle any property access
function createTRPCProxy() {
  // Mock data for specific procedures
  const mockData = {
    users: {
      getAgents: {
        agents: [
          {
            id: '1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            status: 'Active',
            team: 'Sales Team',
            transactionCount: 5,
            commissionYTD: 25000
          },
          {
            id: '2',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@example.com',
            status: 'Active',
            team: 'Marketing Team',
            transactionCount: 3,
            commissionYTD: 15000
          }
        ],
        totalCount: 2,
        agentChange: 10
      },
      getRecentAgentActivity: {
        activities: []
      }
    },
    commissions: {
      getCommissionDetails: {
        transactions: [],
        chartData: []
      }
    },
    transactions: {
      getAllTransactions: {
        transactions: [],
        totalCount: 0
      },
      getCommissionForecast: {
        data: [],
        totalAmount: 0
      }
    }
  };

  const handler = {
    get: function(target, prop) {
      // Handle common tRPC methods
      if (prop === 'createClient' || prop === 'Provider') {
        return function mockFn() {
          return arguments[0]?.children || {};
        };
      }

      // Handle specific procedures
      if (mockData[prop]) {
        return new Proxy(mockData[prop], handler);
      }

      // Handle query methods
      if (prop === 'useQuery') {
        return function() {
          // Find the path to this procedure
          let currentTarget = target;
          let path = [];
          while (currentTarget && currentTarget._path) {
            path.unshift(currentTarget._path);
            currentTarget = currentTarget._parent;
          }

          // Try to get mock data for this path
          let data = mockData;
          for (const segment of path) {
            data = data?.[segment];
            if (!data) break;
          }

          return {
            data: data || {},
            isLoading: false,
            error: null,
            refetch: function() { return Promise.resolve({}); }
          };
        };
      }

      // Handle mutation methods
      if (prop === 'useMutation') {
        return function() { return [function() {}, { isLoading: false }]; };
      }

      // Return a new proxy for nested properties
      const newProxy = new Proxy({}, handler);
      newProxy._path = prop;
      newProxy._parent = target;
      return newProxy;
    },
    apply: function() { return new Proxy({}, handler); }
  };

  return new Proxy({}, handler);
}

// Export the trpc object with the proxy using CommonJS syntax
module.exports = {
  trpc: createTRPCProxy()
};