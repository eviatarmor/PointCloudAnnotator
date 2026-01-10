export interface Annotation {
    label: string;
    x: number;
    y: number;
    z: number;
    timestamp?: string;
}

class AnnotationService {
    private readonly apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    async getAllAnnotations(): Promise<Annotation[]> {
        try {
            const response = await fetch(`${this.apiUrl}/getAllAnnotations`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Failed to get annotations: ${response.statusText}`);
            }

            const data = await response.json();
            return data.annotations || [];
        } catch (error) {
            console.error('Error getting annotations:', error);
            throw error;
        }
    }

    async addAnnotation(annotation: Omit<Annotation, 'timestamp'>): Promise<Annotation> {
        try {
            const response = await fetch(`${this.apiUrl}/addAnnotation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(annotation),
            });

            if (!response.ok) {
                throw new Error(`Failed to add annotation: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error adding annotation:', error);
            throw error;
        }
    }

    async removeAnnotation(label: string): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/removeAnnotation`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({label}),
            });

            if (!response.ok) {
                throw new Error(`Failed to remove annotation: ${response.statusText}`);
            }

            await response.json();
        } catch (error) {
            console.error('Error removing annotation:', error);
            throw error;
        }
    }
}

const dev = import.meta.env.DEV;
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL;

const annotationService = new AnnotationService(dev
    ? "http://localhost:3001"
    : API_BASE_URL);
export {annotationService};
