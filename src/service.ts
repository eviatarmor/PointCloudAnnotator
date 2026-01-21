/**
 * Represents a 3D point cloud annotation with spatial coordinates and metadata
 */
export interface Annotation {
    label: string;      // Display label for the annotation
    x: number;          // X coordinate in 3D space
    y: number;          // Y coordinate in 3D space
    z: number;          // Z coordinate in 3D space
    timestamp?: string; // Optional ISO timestamp of when the annotation was created
}

/**
 * Service for managing point cloud annotations via REST API
 * Handles CRUD operations for spatial annotations
 */
class AnnotationService {
    private readonly apiUrl: string;

    /**
     * @param apiUrl Base URL for the annotation API endpoints
     */
    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    /**
     * Retrieves all annotations from the server
     * @returns Promise resolving to array of annotations
     * @throws Error if the API request fails
     */
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

    /**
     * Adds a new annotation to the point cloud
     * Server generates the timestamp automatically
     * @param annotation Annotation data without timestamp
     * @returns Promise resolving to the created annotation with server-generated timestamp
     * @throws Error if the API request fails
     */
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

    /**
     * Removes an annotation by its label identifier
     * @param label Unique label of the annotation to remove
     * @throws Error if the API request fails or annotation doesn't exist
     */
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

// Environment-based configuration
const dev = import.meta.env.DEV;
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL;

/**
 * Singleton instance of the annotation service
 * Uses localhost in development, production API gateway otherwise
 */
const annotationService = new AnnotationService(dev
    ? "http://localhost:3001"
    : API_BASE_URL);
export {annotationService};
