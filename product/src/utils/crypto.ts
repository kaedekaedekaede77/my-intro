/**
 * Web Crypto API を使用したクライアントサイド暗号化・復号ユーティリティ
 * パスワードから PBKDF2 で鍵を生成し、AES-GCM (256-bit) で暗号化します。
 */

// 文字列を ArrayBuffer に変換
const encodeText = (text: string): Uint8Array => new TextEncoder().encode(text);

// ArrayBuffer を文字列に変換
const decodeText = (buffer: ArrayBuffer): string => new TextDecoder().decode(buffer);

// ArrayBuffer を Base64 文字列に変換
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Base64 文字列を ArrayBuffer に変換
const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * パスワードとソルトから暗号用鍵を生成する
 */
const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const passwordBuffer = encodeText(password);
  
  // パスワードをインポート元鍵として読み込む
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer as any,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // PBKDF2 を用いて AES-GCM 用の 256bit 鍵を誘導
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256'
    } as any,
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * データを暗号化する
 * @param plainText 暗号化する文字列
 * @param password パスワード
 * @returns Base64エンコードされた暗号文（ソルトと初期化ベクトルを含む）
 */
export const encryptData = async (plainText: string, password: string): Promise<string> => {
  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const key = await deriveKey(password, salt);
    const encodedData = encodeText(plainText);
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as any
      },
      key,
      encodedData as any
    );
    
    // ソルト、初期化ベクトル、暗号文を結合して Base64 化
    const combinedBuffer = new Uint8Array(salt.byteLength + iv.byteLength + encryptedBuffer.byteLength);
    combinedBuffer.set(salt, 0);
    combinedBuffer.set(iv, salt.byteLength);
    combinedBuffer.set(new Uint8Array(encryptedBuffer), salt.byteLength + iv.byteLength);
    
    return bufferToBase64(combinedBuffer.buffer);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('暗号化に失敗しました。');
  }
};

/**
 * データを復号する
 * @param cipherText Base64エンコードされた暗号データ
 * @param password パスワード
 * @returns 復号されたプレーンテキスト
 */
export const decryptData = async (cipherText: string, password: string): Promise<string> => {
  try {
    const combinedBuffer = new Uint8Array(base64ToBuffer(cipherText));
    
    const salt = combinedBuffer.slice(0, 16);
    const iv = combinedBuffer.slice(16, 28);
    const encryptedData = combinedBuffer.slice(28);
    
    const key = await deriveKey(password, salt);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as any
      },
      key,
      encryptedData as any
    );
    
    return decodeText(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('復号に失敗しました。パスワードが正しくない可能性があります。');
  }
};
