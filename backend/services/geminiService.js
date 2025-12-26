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

            // Create safe prompt template
            const prompt = ChatPromptTemplate.fromTemplate(`
You are a concise medical information assistant. Keep responses brief and to the point.

Your role is STRICTLY LIMITED to:
1. **Explaining medical terms and lab markers** - Short, clear explanations
2. **General health education** - Brief explanations of what tests measure
3. **Lifestyle suggestions** - Quick, actionable diet/exercise tips
4. **Doctor recommendations** - Suggest consulting healthcare provider when needed

You MUST NEVER:
- Diagnose any medical conditions or diseases
- Prescribe medications or specific treatments
- Provide definitive medical advice or treatment plans
- Make claims about what the user "has" or "doesn't have"

RESPONSE STYLE:
- Keep answers SHORT (2-4 sentences max)
- Be direct and clear
- Use bullet points for lists
- Avoid lengthy explanations
- If you don't have enough information, say so in ONE sentence
- Always recommend consulting a healthcare provider for medical decisions

Context from medical records:
{context}

User Question: {input}

Provide a brief, helpful response. Be concise but complete.
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
            /you have (diabetes|anemia|cancer|disease)/gi,
            /you are diagnosed with/gi,
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
