import { CONTRACT_ADDRESS, MODULE_PATH } from "../config/contract";
import { Types } from "aptos";

/**
 * Lấy nội dung tin nhắn từ message board
 * @param {AptosClient} client - Client Aptos 
 * @returns {Promise<string>} Nội dung tin nhắn
 */
export async function getMessage(client) {
  try {
    const message = await client.view({
      function: `${MODULE_PATH}::get_message_content`,
      type_arguments: [],
      arguments: []
    });
    
    return message[0];
  } catch (error) {
    console.error("Error getting message:", error);
    return "";
  }
}

/**
 * Kiểm tra xem tin nhắn có tồn tại không
 * @param {AptosClient} client - Client Aptos
 * @returns {Promise<boolean>} Kết quả kiểm tra
 */
export async function messageExists(client) {
  try {
    const exists = await client.view({
      function: `${MODULE_PATH}::exist_message`,
      type_arguments: [],
      arguments: []
    });
    
    return exists[0];
  } catch (error) {
    console.error("Error checking if message exists:", error);
    return false;
  }
}

/**
 * Đăng tin nhắn mới lên message board
 * @param {AptosClient} client - Client Aptos
 * @param {string} account - Địa chỉ tài khoản người dùng
 * @param {string} message - Nội dung tin nhắn
 * @returns {Promise<string>} Hash của giao dịch
 */
export async function postMessage(client, account, message) {
  try {
    const payload = {
      function: `${MODULE_PATH}::post_message`,
      type_arguments: [],
      arguments: [message]
    };

    const transaction = await client.generateTransaction(account, payload);
    const signedTxn = await client.signTransaction(account, transaction);
    const txnResult = await client.submitTransaction(signedTxn);
    
    return txnResult.hash;
  } catch (error) {
    console.error("Error posting message:", error);
    throw error;
  }
}
