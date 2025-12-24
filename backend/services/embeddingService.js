import { getEmbeddingModel } from '../config/gemini.js';

/**
 * Embedding Service
 * Generates vector embeddings for text using Google Gemini
 */

/**
 * Generate embedding for a single text
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - 768-dimensional embedding vector
 */
export const generateEmbedding = async (text) => {
    try {
        if (!text || text.trim().length === 0) {
            throw new Error('Text cannot be empty');
        }

        const model = getEmbeddingModel();
        const result = await model.embedContent(text);

        return result.embedding.values;
    } catch (error) {
        console.error('Embedding generation error:', error);
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
};

/**
 * Generate embeddings for multiple texts in batch
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export const generateEmbeddingsBatch = async (texts) => {
    try {
        const embeddings = await Promise.all(
            texts.map(text => generateEmbedding(text))
        );
        return embeddings;
    } catch (error) {
        console.error('Batch embedding error:', error);
        throw new Error(`Failed to generate batch embeddings: ${error.message}`);
    }
};

/**
 * Chunk text into smaller pieces for embedding
 * @param {string} text - Full text to chunk
 * @param {number} chunkSize - Maximum characters per chunk
 * @param {number} overlap - Overlap between chunks
 * @returns {string[]} - Array of text chunks
 */
export const chunkText = (text, chunkSize = 1000, overlap = 200) => {
    if (!text || text.trim().length === 0) {
        return [];
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const chunk = text.slice(start, end).trim();

        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        // Move start position, accounting for overlap
        start = end - overlap;

        // Prevent infinite loop
        if (start >= text.length - overlap) {
            break;
        }
    }

    return chunks;
};

/**
 * Process document: chunk and embed
 * @param {string} text - Full document text
 * @returns {Promise<Array>} - Array of {text, embedding, index}
 */
export const processDocument = async (text) => {
    try {
        // Chunk the text
        const chunks = chunkText(text);

        if (chunks.length === 0) {
            throw new Error('No valid chunks generated from text');
        }

        console.log(`📄 Processing ${chunks.length} chunks...`);

        // Generate embeddings for each chunk
        const processedChunks = [];
        for (let i = 0; i < chunks.length; i++) {
            const embedding = await generateEmbedding(chunks[i]);
            processedChunks.push({
                text: chunks[i],
                embedding: embedding,
                chunkIndex: i
            });

            // Small delay to avoid rate limiting
            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`✅ Successfully processed ${processedChunks.length} chunks`);
        return processedChunks;
    } catch (error) {
        console.error('Document processing error:', error);
        throw new Error(`Failed to process document: ${error.message}`);
    }
};
