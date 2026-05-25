import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        userId : { type : String, required : true, ref : "user"},
        name : { type : String, required : true },
        description : { type : String, required : true },
        price : { type : Number, required : true },
        offerPrice : { type : Number, required : true },
        image : { type : Array, required : true },
        category : { type : String, required : true },
        brand : { type : String, required : true },
        color: { type : String },
        date: { type: Date, required: true, default: Date.now },
        stock: { type: Number, required: true, default: 0 },
        visible: { type: Boolean, default: true },
        likes: [{ type: String }]
    }
)

const Product = mongoose.models.product || mongoose.model('product', productSchema)

export default Product
