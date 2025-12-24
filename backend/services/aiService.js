import { getGenerativeModel } from '../config/gemini.js';
import { generateEmbedding } from './embeddingService.js';
import MedicalRecord from '../models/MedicalRecord.js';
import mongoose from 'mongoose';

/**
 * AI Service - RAG Pipeline for Medical Record Analysis
 * Implements Retrieval-Augmented Generation with anti-hallucination safeguards
 */

/**
 * Query medical records using RAG
 * @param {string} question - User's question
 * @param {string} familyMemberId - Family member ID
 * @param {number} topK - Number of relevant chunks to retrieve
 * @returns {Promise<{answer: string, sources: Array, confidence: string}>}
 */
export const queryWithRAG = async (question, familyMemberId, topK = 5) => {
    try {
        console.log(`🤖 Processing question for member: ${familyMemberId}`);

        // Step 1: Generate embedding for the question
        const questionEmbedding = await generateEmbedding(question);

        // Step 2: Perform vector search to find relevant chunks
        const relevantDocs = await performVectorSearch(
            questionEmbedding,
            familyMemberId,
            topK
        );

        // Step 3: Check if we have sufficient data
        if (!relevantDocs || relevantDocs.length === 0) {
            return {
                answer: "I don't have enough information in the uploaded records to answer that question. Please upload relevant medical reports first.",
                sources: [],
                confidence: 'none'
            };
        }

        // Step 4: Build context from retrieved chunks
        const context = buildContext(relevantDocs);

        // Step 5: Generate answer using Gemini with strict prompting
        const { answer, confidence } = await generateAnswer(question, context);

        // Step 6: Extract sources
        const sources = extractSources(relevantDocs);

        console.log(`✅ Answer generated with confidence: ${confidence}`);

        return {
            answer,
            sources,
            confidence
        };
    } catch (error) {
        console.error('RAG query error:', error);
        throw new Error(`Failed to process question: ${error.message}`);
    }
};

/**
 * Perform vector search in MongoDB Atlas
 * @param {number[]} queryEmbedding - Question embedding
 * @param {string} familyMemberId - Family member ID
 * @param {number} limit - Number of results
 * @returns {Promise<Array>}
 */
const performVectorSearch = async (queryEmbedding, familyMemberId, limit) => {
    try {
        // Check if vector search index exists
        // For now, we'll use a fallback approach if vector search is not set up

        const objectId = new mongoose.Types.ObjectId(familyMemberId);

        try {
            // Try vector search first
            const results = await MedicalRecord.vectorSearch(
                queryEmbedding,
                objectId,
                limit
            );

            if (results && results.length > 0) {
                return results;
            }
        } catch (vectorError) {
            console.warn('⚠️  Vector search not available, using fallback method');
        }

        // Fallback: Get all records and compute similarity manually
        const records = await MedicalRecord.find({
            familyMemberId: objectId,
            processingStatus: 'completed'
        }).limit(20);

        if (records.length === 0) {
            return [];
        }

        // Compute cosine similarity for each chunk
        const scoredChunks = [];
        for (const record of records) {
            for (const chunk of record.chunks) {
                const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
                scoredChunks.push({
                    ...record.toObject(),
                    chunk: chunk,
                    score: similarity
                });
            }
        }

        // Sort by similarity and return top K
        scoredChunks.sort((a, b) => b.score - a.score);
        return scoredChunks.slice(0, limit);
    } catch (error) {
        console.error('Vector search error:', error);
        return [];
    }
};

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vec1 - First vector
 * @param {number[]} vec2 - Second vector
 * @returns {number} - Similarity score (0-1)
 */
const cosineSimilarity = (vec1, vec2) => {
    if (vec1.length !== vec2.length) {
        throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        norm1 += vec1[i] * vec1[i];
        norm2 += vec2[i] * vec2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};

/**
 * Build context string from retrieved documents
 * @param {Array} docs - Retrieved documents
 * @returns {string} - Context for LLM
 */
const buildContext = (docs) => {
    let context = '';

    docs.forEach((doc, index) => {
        const chunkText = doc.chunk?.text || doc.chunks?.[0]?.text || '';
        const fileName = doc.fileName || 'Unknown';
        const uploadDate = doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'Unknown';

        context += `\n[Source ${index + 1}: ${fileName} (${uploadDate})]\n${chunkText}\n`;
    });

    return context;
};

/**
 * Generate answer using Gemini with anti-hallucination prompting
 * @param {string} question - User's question
 * @param {string} context - Retrieved context
 * @returns {Promise<{answer: string, confidence: string}>}
 */
const generateAnswer = async (question, context) => {
    try {
        const model = getGenerativeModel();

        const prompt = `You are a helpful medical record assistant. Your ONLY job is to answer questions based STRICTLY on the provided medical records. Follow these rules:

1. ONLY use information from the provided sources below
2. If the answer is not in the sources, say "I don't have enough information in the uploaded records to answer that"
3. NEVER make assumptions or use external medical knowledge
4. ALWAYS cite which source you're using (e.g., "According to Source 1...")
5. Be clear, concise, and use simple language
6. If you're uncertain, say so

MEDICAL RECORDS:
${context}

QUESTION: ${question}

ANSWER (remember: only use the information above):`;

        const result = await model.generateContent(prompt);
        const answer = result.response.text();

        // Determine confidence based on answer content
        let confidence = 'medium';
        if (answer.toLowerCase().includes("don't have enough information") ||
            answer.toLowerCase().includes("not mentioned") ||
            answer.toLowerCase().includes("cannot find")) {
            confidence = 'none';
        } else if (answer.toLowerCase().includes("according to") ||
            answer.toLowerCase().includes("source")) {
            confidence = 'high';
        } else {
            confidence = 'low';
        }

        return { answer, confidence };
    } catch (error) {
        console.error('Answer generation error:', error);
        throw new Error(`Failed to generate answer: ${error.message}`);
    }
};

/**
 * Extract source information from documents
 * @param {Array} docs - Retrieved documents
 * @returns {Array} - Source citations
 */
const extractSources = (docs) => {
    const sources = [];
    const seenRecords = new Set();

    for (const doc of docs) {
        const recordId = doc._id.toString();

        if (!seenRecords.has(recordId)) {
            sources.push({
                recordId: doc._id,
                fileName: doc.fileName,
                uploadDate: doc.uploadDate,
                relevanceScore: doc.score || 0
            });
            seenRecords.add(recordId);
        }
    }

    return sources;
};
