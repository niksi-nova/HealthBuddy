import pdfParse from 'pdf-parse-fork';
import Tesseract from 'tesseract.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Text Extraction Service
 * Extracts text from PDF files and images using OCR
 */

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<{text: string, pageCount: number}>}
 */
export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);

        return {
            text: data.text.trim(),
            pageCount: data.numpages
        };
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
};

/**
 * Extract text from image using OCR
 * @param {string} filePath - Path to image file
 * @returns {Promise<{text: string}>}
 */
export const extractTextFromImage = async (filePath) => {
    try {
        console.log('🔍 Starting OCR for image...');

        const { data: { text } } = await Tesseract.recognize(
            filePath,
            'eng',
            {
                logger: info => {
                    if (info.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
                    }
                }
            }
        );

        console.log('✅ OCR completed');

        return {
            text: text.trim(),
            pageCount: 1
        };
    } catch (error) {
        console.error('Image OCR error:', error);
        throw new Error(`Failed to extract text from image: ${error.message}`);
    }
};

/**
 * Extract text from file based on type
 * @param {string} filePath - Path to file
 * @param {string} fileType - Type of file ('pdf' or 'image')
 * @returns {Promise<{text: string, pageCount: number}>}
 */
export const extractText = async (filePath, fileType) => {
    try {
        // Check if file exists
        await fs.access(filePath);

        if (fileType === 'pdf') {
            return await extractTextFromPDF(filePath);
        } else if (fileType === 'image') {
            return await extractTextFromImage(filePath);
        } else {
            throw new Error(`Unsupported file type: ${fileType}`);
        }
    } catch (error) {
        console.error('Text extraction error:', error);
        throw new Error(`Failed to extract text: ${error.message}`);
    }
};

/**
 * Detect report type from extracted text
 * Uses simple keyword matching
 * @param {string} text - Extracted text
 * @returns {string} - Detected report type
 */
export const detectReportType = (text) => {
    const lowerText = text.toLowerCase();

    const reportTypes = {
        'Blood Test': ['blood test', 'hemoglobin', 'platelet', 'wbc', 'rbc', 'glucose', 'cholesterol'],
        'X-Ray': ['x-ray', 'radiograph', 'radiology'],
        'MRI': ['mri', 'magnetic resonance'],
        'CT Scan': ['ct scan', 'computed tomography'],
        'Ultrasound': ['ultrasound', 'sonography'],
        'Prescription': ['prescription', 'rx:', 'medication', 'dosage'],
        'Consultation': ['consultation', 'diagnosis', 'patient history'],
        'Vaccination': ['vaccination', 'vaccine', 'immunization']
    };

    for (const [type, keywords] of Object.entries(reportTypes)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            return type;
        }
    }

    return 'General';
};
