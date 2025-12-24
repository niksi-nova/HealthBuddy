import mongoose from 'mongoose';

/**
 * Family Member Schema
 * Represents individual family members managed by the admin
 */
const familyMemberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true // Index for faster queries
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    relation: {
        type: String,
        required: [true, 'Relation is required'],
        trim: true,
        examples: ['Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Grandchild']
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [0, 'Age cannot be negative'],
        max: [120, 'Please provide a valid age']
    },
    gender: {
        type: String,
        enum: {
            values: ['Male', 'Female', 'Other'],
            message: 'Gender must be Male, Female, or Other'
        },
        required: [true, 'Gender is required']
    },
    existingConditions: {
        type: [String],
        default: [],
        validate: {
            validator: function (arr) {
                return arr.length <= 20; // Max 20 conditions
            },
            message: 'Cannot have more than 20 existing conditions'
        }
    },
    avatarColor: {
        type: String,
        default: () => {
            // Generate a random pastel color for avatar
            const colors = ['#8B9D83', '#D4A59A', '#E8B44F', '#A8C5DD', '#E6B8AF', '#C9ADA7', '#9FC2CC'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    },
    profilePicture: {
        type: String,
        default: null // Path to uploaded image file
    }
}, {
    timestamps: true
});

// Index for efficient queries
familyMemberSchema.index({ userId: 1, createdAt: -1 });

// Virtual for medical records count
familyMemberSchema.virtual('recordsCount', {
    ref: 'MedicalRecord',
    localField: '_id',
    foreignField: 'familyMemberId',
    count: true
});

// Ensure virtuals are included in JSON
familyMemberSchema.set('toJSON', { virtuals: true });
familyMemberSchema.set('toObject', { virtuals: true });

const FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);

export default FamilyMember;
