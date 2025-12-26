import { ChromaClient } from 'chromadb';
import geminiService from './geminiService.js';

/**
 * Chroma Vector Store Service
 * Stores and retrieves medical report summaries
 * SECURITY: No raw numeric values, no PHI
 */

class ChromaService {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Initialize Chroma client (local storage)
            this.client = new ChromaClient({
                path: './chroma_data' // Local storage directory
            });

            this.initialized = true;
            console.log('✅ Chroma vector store initialized');
        } catch (error) {
            console.error('⚠️  Chroma initialization error (will retry on first use):', error.message);
            // Don't throw - allow the app to start even if Chroma fails
            this.initialized = false;
        }
    }

    /**
     * Get or create collection for a user
     * Each user has isolated collection for privacy
     */
    async getCollection(userId) {
        await this.initialize();

        const collectionName = `medical_reports_${userId}`;

        try {
            // Try to get existing collection
            const collection = await this.client.getOrCreateCollection({
                name: collectionName,
                metadata: { userId: userId.toString() }
            });

            return collection;
        } catch (error) {
            console.error('Error getting collection:', error);
            throw error;
        }
    }

    /**
     * Store report summary in vector database
     * CRITICAL: Only stores text summaries, no numeric values
     */
    async storeReportSummary(userId, reportId, summary, metadata = {}) {
        try {
            // Try to initialize if not already done
            if (!this.initialized) {
                await this.initialize();
            }

            // If still not initialized, skip storage
            if (!this.initialized || !this.client) {
                console.warn('⚠️  Chroma not available, skipping vector storage');
                return { success: false, message: 'Vector store not available' };
            }

            const collection = await this.getCollection(userId);

            // Generate embedding using Gemini
            const embedding = await geminiService.generateEmbedding(summary);

            // Store in Chroma
            await collection.add({
                ids: [reportId.toString()],
                embeddings: [embedding],
                documents: [summary],
                metadatas: [{
                    reportId: reportId.toString(),
                    userId: userId.toString(),
                    reportDate: metadata.reportDate || new Date().toISOString(),
                    memberName: metadata.memberName || 'Unknown',
                    ...metadata
                }]
            });

            console.log(`✅ Stored report summary for user ${userId}`);
            return { success: true };

        } catch (error) {
            console.error('⚠️  Vector storage error (non-blocking):', error.message);
            return { success: false, message: error.message };
        }
    }

    /**
     * Query vector store for relevant report summaries
     * Used for RAG context retrieval
     */
    async queryReports(userId, question, limit = 3) {
        try {
            // Try to initialize if not already done
            if (!this.initialized) {
                await this.initialize();
            }

            // If still not initialized, return empty array
            if (!this.initialized || !this.client) {
                console.warn('⚠️  Chroma not available, skipping vector search');
                return [];
            }

            const collection = await this.getCollection(userId);

            // Generate embedding for the question
            const questionEmbedding = await geminiService.generateEmbedding(question);

            // Query similar documents
            const results = await collection.query({
                queryEmbeddings: [questionEmbedding],
                nResults: limit
            });

            // Format results
            const summaries = [];
            if (results.documents && results.documents[0]) {
                results.documents[0].forEach((doc, idx) => {
                    const metadata = results.metadatas[0][idx];
                    summaries.push({
                        text: doc,
                        reportDate: metadata.reportDate,
                        memberName: metadata.memberName,
                        distance: results.distances[0][idx]
                    });
                });
            }

            return summaries;

        } catch (error) {
            console.error('⚠️  Vector search error (non-blocking):', error.message);
            return []; // Return empty array on error - don't break the chat
        }
    }

    /**
     * Generate safe report summary from lab results
     * CRITICAL: Removes specific numeric values to prevent hallucination
     */
    generateReportSummary(labResults, reportDate, memberInfo) {
        const date = new Date(reportDate).toLocaleDateString();
        let summary = `Medical report from ${date} for ${memberInfo.name} (${memberInfo.age} years, ${memberInfo.gender}).\n\n`;

        // Group results by category
        const categories = {
            'Complete Blood Count': ['hemoglobin', 'rbc', 'wbc', 'platelet', 'hematocrit'],
            'Blood Sugar': ['glucose', 'fbs', 'ppbs', 'hba1c'],
            'Lipid Profile': ['cholesterol', 'hdl', 'ldl', 'triglyceride'],
            'Liver Function': ['sgot', 'sgpt', 'bilirubin', 'alp'],
            'Kidney Function': ['creatinine', 'urea', 'bun']
        };

        // Categorize results
        const categorized = {};
        labResults.forEach(result => {
            const markerLower = result.marker.toLowerCase();
            let category = 'Other Tests';

            for (const [cat, markers] of Object.entries(categories)) {
                if (markers.some(m => markerLower.includes(m))) {
                    category = cat;
                    break;
                }
            }

            if (!categorized[category]) {
                categorized[category] = [];
            }

            // Store marker name and whether it's abnormal (not the actual value)
            categorized[category].push({
                marker: result.marker,
                isAbnormal: result.isAbnormal || false
            });
        });

        // Build summary text
        for (const [category, markers] of Object.entries(categorized)) {
            summary += `${category}:\n`;
            markers.forEach(m => {
                summary += `- ${m.marker}${m.isAbnormal ? ' (flagged)' : ''}\n`;
            });
            summary += '\n';
        }

        // Add existing conditions context
        if (memberInfo.conditions && memberInfo.conditions.length > 0) {
            summary += `Existing conditions: ${memberInfo.conditions.join(', ')}\n`;
        }

        return summary;
    }

    /**
     * Delete all reports for a user (for privacy/GDPR)
     */
    async deleteUserReports(userId) {
        try {
            const collectionName = `medical_reports_${userId}`;
            await this.client.deleteCollection({ name: collectionName });
            console.log(`✅ Deleted all reports for user ${userId}`);
            return { success: true };
        } catch (error) {
            console.error('Error deleting user reports:', error);
            throw error;
        }
    }
}

// Singleton instance
const chromaService = new ChromaService();

export default chromaService;
