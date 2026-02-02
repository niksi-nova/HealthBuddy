import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema - Admin/Head of Family
 * Represents the primary account holder who manages the family
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [18, 'Admin must be at least 18 years old'],
        max: [120, 'Please provide a valid age']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    gender: {
        type: String,
        enum: {
            values: ['Male', 'Female', 'Other'],
            message: 'Gender must be Male, Female, or Other'
        },
        required: [true, 'Gender is required']
    },
    avatarColor: {
        type: String,
        default: () => {
            // Generate a random pastel color for avatar
            const colors = ['#8B9D83', '#D4A59A', '#E8B44F', '#A8C5DD', '#E6B8AF'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    },
    profilePicture: {
        type: String,
        default: ''
    },
    existingConditions: {
        type: [String],
        default: []
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Method to get user without sensitive data
userSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
