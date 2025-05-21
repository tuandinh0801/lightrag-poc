import mongoose, { Document, Schema } from 'mongoose';

export interface IReview {
  user: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  brand: string;
  stock: number;
  rating: number;
  numReviews: number;
  reviews: IReview[];
  sku: string;
  featured: boolean;
  isNew: boolean;
  onSale: boolean;
  tags: string[];
  attributes: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [100, 'Product name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Please provide a short description'],
      maxlength: [200, 'Short description cannot be more than 200 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    images: [
      {
        type: String,
        required: [true, 'Please provide at least one product image'],
      },
    ],
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
      index: true,
    },
    brand: {
      type: String,
      required: [true, 'Please provide a product brand'],
      index: true,
    },
    stock: {
      type: Number,
      required: [true, 'Please provide product stock'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    sku: {
      type: String,
      required: [true, 'Please provide a product SKU'],
      unique: true,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text' });

// Calculate average rating when reviews are modified
productSchema.pre('save', function (next) {
  if (this.isModified('reviews')) {
    if (this.reviews.length === 0) {
      this.rating = 0;
      this.numReviews = 0;
    } else {
      this.rating =
        this.reviews.reduce((acc, review) => acc + review.rating, 0) /
        this.reviews.length;
      this.numReviews = this.reviews.length;
    }
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
