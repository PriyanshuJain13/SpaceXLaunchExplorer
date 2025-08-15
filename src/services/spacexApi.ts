import { Launch, Launchpad } from '../types/api';

const BASE_URL = 'https://api.spacexdata.com';

class SpaceXApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SpaceXApiError';
  }
}

export const spacexApi = {
  async getLaunches(limit = 20, offset = 0): Promise<Launch[]> {
    try {
      const response = await fetch(`${BASE_URL}/v5/launches/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {},
          options: {
            limit,
            offset,
            sort: { date_utc: 'desc' },
            select: [
              'id', 'name', 'date_utc', 'success', 'links', 
              'launchpad', 'details', 'flight_number'
            ],
          },
        }),
      });

      if (!response.ok) {
        throw new SpaceXApiError(
          `Failed to fetch launches: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      return data.docs;
    } catch (error) {
      if (error instanceof SpaceXApiError) {
        throw error;
      }
      throw new SpaceXApiError('Network error occurred');
    }
  },

  async getLaunchpad(id: string): Promise<Launchpad> {
    try {
      const response = await fetch(`${BASE_URL}/v4/launchpads/${id}`);
      
      if (!response.ok) {
        throw new SpaceXApiError(
          `Failed to fetch launchpad: ${response.statusText}`,
          response.status
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof SpaceXApiError) {
        throw error;
      }
      throw new SpaceXApiError('Network error occurred');
    }
  },
};