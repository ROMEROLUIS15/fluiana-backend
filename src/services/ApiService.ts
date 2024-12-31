
//ApiService.ts

export class ApiService {
    private baseUrl: string;
  
    constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
    }
  
    // Método para realizar solicitudes GET
    async get(endpoint: string): Promise<any> {
      try {
        const response = await fetch(`${this.baseUrl}/${endpoint}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error after logging it
      }
    }
  
    // Método para realizar solicitudes POST
    async post(endpoint: string, data: any): Promise<any> {
      try {
        const response = await fetch(`${this.baseUrl}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Error posting data:', error);
        throw error; // Re-throw the error after logging it
      }
    }
  
    // Método para realizar solicitudes PUT
    async put(endpoint: string, data: any): Promise<any> {
      try {
        const response = await fetch(`${this.baseUrl}/${endpoint}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Error updating data:', error);
        throw error; // Re-throw the error after logging it
      }
    }
  
    // Método para realizar solicitudes DELETE
    async delete(endpoint: string): Promise<any> {
      try {
        const response = await fetch(`${this.baseUrl}/${endpoint}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Error deleting data:', error);
        throw error; // Re-throw the error after logging it
      }
    }
  }
  