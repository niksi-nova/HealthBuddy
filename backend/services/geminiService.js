import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { Document } from '@langchain/core/documents';

/**
 * OpenAI Service using LangChain
 * CRITICAL: Implements strict safety guidelines
 * Much more reliable than Gemini API
 */

class OpenAILangChainService {
    constructor() {
        this.llm = null;
        this.initialized = false;

        // Medical disclaimer
        this.disclaimer = '\n\n⚠️ **Medical Disclaimer:** This is educational information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your healthcare provider for medical concerns.';
    }

    /**
     * Initialize LangChain with OpenAI
     */
    _initialize() {
        if (this.initialized) return;

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
            this.llm = null;
        } else {
            this.llm = new ChatOpenAI({
                modelName: 'gpt-4o-mini', // Fast and affordable
                apiKey: apiKey,
                temperature: 0.3,
                maxTokens: 2048,
            });
            console.log('✅ OpenAI LangChain initialized successfully');
        }

        this.initialized = true;
    }

    /**
     * Generate medical response using LangChain RAG
     */
    async generateMedicalResponse(question, context) {
        this._initialize();

        if (!this.llm) {
            throw new Error('OpenAI API key not configured');
        }

        try {
            // Build context documents from lab results
            const documents = this._buildContextDocuments(context);

            // Create safe prompt template with STRICT anti-diagnosis rules
            const prompt = ChatPromptTemplate.fromTemplate(`
You are a medical lab results assistant. You explain lab values but NEVER diagnose.

ABSOLUTE RULES (NEVER BREAK THESE):
1. NEVER say "you have [disease]" or "you don't have [disease]"
2. NEVER say "no indication of [disease]" or "this indicates [disease]"
3. NEVER say "you are healthy" or "you are suffering from"
4. ALWAYS end with "please consult a doctor for proper diagnosis"

WHAT YOU CAN DO:
- State if lab values are normal, low, or high
- Explain what markers measure
- Say "low probability based on these markers" or "these markers are in normal range"
- Suggest lifestyle changes (diet, exercise)

RESPONSE FORMAT:
- For condition questions (e.g., "do I have anemia"):
  "Your Hemoglobin is X (normal/low/high). While these markers appear normal, only a doctor can diagnose anemia after a complete evaluation."
  
- For summary questions:
  List key markers with their status, note any out of range values.

- Keep it SHORT: 2-4 sentences max

Context from medical records:
{context}

User Question: {input}

Remember: You CANNOT diagnose. State the lab values and recommend consulting a doctor.
`);

            // Create document chain
            const documentChain = await createStuffDocumentsChain({
                llm: this.llm,
                prompt: prompt,
            });

            // Invoke the chain with documents
            const result = await documentChain.invoke({
                input: question,
                context: documents,
            });

            // Validate and add disclaimer
            let response = this._validateAndFilterResponse(result);
            response += this.disclaimer;

            return {
                success: true,
                response: response,
                model: 'gpt-4o-mini'
            };

        } catch (error) {
            console.error('OpenAI LangChain error:', error);
            throw new Error(`Failed to generate response: ${error.message}`);
        }
    }

    /**
     * Build LangChain documents from context
     */
    _buildContextDocuments(context) {
        const { labResults, reportSummaries, memberInfo } = context;
        const documents = [];

        // Add member info document
        if (memberInfo) {
            let memberText = `Patient Context:\n`;
            memberText += `Age: ${memberInfo.age} years\n`;
            memberText += `Gender: ${memberInfo.gender}\n`;
            if (memberInfo.conditions && memberInfo.conditions.length > 0) {
                memberText += `Existing conditions: ${memberInfo.conditions.join(', ')}\n`;
            }

            documents.push(new Document({
                pageContent: memberText,
                metadata: { type: 'patient_info' }
            }));
        }

        // Add lab results documents
        if (labResults && labResults.length > 0) {
            let labText = 'Recent Lab Results:\n\n';
            labResults.forEach(result => {
                const date = new Date(result.testDate).toLocaleDateString();
                labText += `${result.marker}: ${result.value} ${result.unit} (tested on ${date})\n`;
                if (result.isAbnormal) {
                    labText += `  ⚠️ This value is flagged as abnormal\n`;
                }
            });

            documents.push(new Document({
                pageContent: labText,
                metadata: { type: 'lab_results', count: labResults.length }
            }));
        }

        // Add report summaries documents
        if (reportSummaries && reportSummaries.length > 0) {
            reportSummaries.forEach((summary, idx) => {
                documents.push(new Document({
                    pageContent: summary,
                    metadata: { type: 'report_summary', index: idx }
                }));
            });
        }

        return documents;
    }

    /**
     * Validate response doesn't contain forbidden medical advice
     */
    _validateAndFilterResponse(text) {
        const forbiddenPhrases = [
            /you have (diabetes|anemia|cancer|disease|condition)/gi,
            /you don'?t have (diabetes|anemia|cancer|disease|condition)/gi,
            /you are diagnosed with/gi,
            /no indication of/gi,
            /this indicates/gi,
            /suggests? (you have|the presence of)/gi,
            /you are (healthy|suffering)/gi,
            /confirms? (that you|the diagnosis)/gi,
            /take (this medication|these pills)/gi,
            /prescribed? (medication|drug|medicine)/gi,
            /you need to take/gi,
            /start taking/gi,
        ];

        for (const pattern of forbiddenPhrases) {
            if (pattern.test(text)) {
                console.warn('⚠️  Response contained forbidden medical advice, filtering...');
                text = text.replace(pattern, 'consult your doctor about');
            }
        }

        return text;
    }
}

// Singleton instance
const openAIService = new OpenAILangChainService();

export default openAIService;
