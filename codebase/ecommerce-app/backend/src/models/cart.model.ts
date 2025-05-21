import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  calculateTotalPrice(): number;
}

const cartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total price before saving
cartSchema.pre('save', function (next) {
  this.totalPrice = this.calculateTotalPrice();
  next();
});

// Method to calculate total price
cartSchema.methods.calculateTotalPrice = function (): number {
  return this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
