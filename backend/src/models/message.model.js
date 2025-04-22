// Import mongoose để định nghĩa schema và model
import mongoose from "mongoose";

// Định nghĩa schema cho tin nhắn
const messageSchema = new mongoose.Schema(
  {
    // ID của người gửi tin nhắn
    senderId: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của user
      ref: "User",                          // Liên kết với model "User"
      required: true,                     
    },

    // ID của người nhận tin nhắn
    receiverId: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của user
      ref: "User",                          // Liên kết với model "User"
      required: true,                      
    },

    // Nội dung tin nhắn dạng text (có thể rỗng nếu là ảnh)
    text: {
      type: String,
    },

    // Đường dẫn ảnh nếu tin nhắn là hình ảnh (có thể rỗng nếu là text)
    image: {
      type: String,
    },
  },
  {
    // Tự động thêm createdAt và updatedAt cho mỗi bản ghi
    timestamps: true,
  }
);

// Tạo model Message dựa trên schema
const Message = mongoose.model("Message", messageSchema);

// Export model để dùng trong controller/service
export default Message;
