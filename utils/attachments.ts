import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, Platform } from 'react-native';
import { FileAttachment } from '../store/types';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

/** Map a MIME type to a MaterialCommunityIcons name */
export const getFileIcon = (mimeType: string): string => {
  if (!mimeType) return 'file-outline';
  if (mimeType.startsWith('image/')) return 'image-outline';
  if (mimeType === 'application/pdf') return 'file-pdf-box';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-word-box';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel-box';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint-box';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'folder-zip-outline';
  if (mimeType.startsWith('video/')) return 'file-video-outline';
  if (mimeType.startsWith('audio/')) return 'file-music-outline';
  if (mimeType.startsWith('text/')) return 'file-document-outline';
  return 'file-outline';
};

/** Format bytes into a human-readable string */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const makeAttachment = (
  name: string,
  uri: string,
  mimeType: string,
  size: number
): FileAttachment => ({
  id: Math.random().toString(36).substring(2, 9),
  name,
  uri,
  mimeType: mimeType || 'application/octet-stream',
  size,
  addedAt: new Date().toISOString(),
});

/** Pick a file via the system document picker */
export const pickFile = async (): Promise<FileAttachment | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.length) return null;

    const asset = result.assets[0];
    const size = asset.size ?? 0;

    if (size > MAX_FILE_SIZE) {
      Alert.alert('File Too Large', `Maximum file size is 25 MB. This file is ${formatFileSize(size)}.`);
      return null;
    }

    return makeAttachment(
      asset.name,
      asset.uri,
      asset.mimeType ?? 'application/octet-stream',
      size,
    );
  } catch {
    return null;
  }
};

/** Pick an image from the device gallery */
export const pickImage = async (): Promise<FileAttachment | null> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library in Settings.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.length) return null;

    const asset = result.assets[0];
    const size = asset.fileSize ?? 0;

    if (size > MAX_FILE_SIZE) {
      Alert.alert('File Too Large', `Maximum file size is 25 MB.`);
      return null;
    }

    const filename = asset.uri.split('/').pop() ?? 'image.jpg';
    const mimeType = asset.mimeType ?? 'image/jpeg';

    return makeAttachment(filename, asset.uri, mimeType, size);
  } catch {
    return null;
  }
};

/** Take a photo with the device camera */
export const takePhoto = async (): Promise<FileAttachment | null> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access in Settings.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) return null;

    const asset = result.assets[0];
    const size = asset.fileSize ?? 0;
    const filename = asset.uri.split('/').pop() ?? 'photo.jpg';

    return makeAttachment(filename, asset.uri, asset.mimeType ?? 'image/jpeg', size);
  } catch {
    return null;
  }
};

/** Open a file using the OS default handler. */
export const openFile = async (uri: string, mimeType?: string): Promise<void> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      Alert.alert('File Not Found', 'This file may have been moved or deleted from the device.');
      return;
    }

    if (Platform.OS === 'android') {
      try {
        const contentUri = await FileSystem.getContentUriAsync(uri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1, // Intent.FLAG_GRANT_READ_URI_PERMISSION
          type: mimeType || 'application/octet-stream'
        });
      } catch (e) {
        // If IntentLauncher fails, fall back to sharing
        await Sharing.shareAsync(uri, { 
          dialogTitle: uri.split('/').pop() ?? 'Open file',
          mimeType: mimeType || 'application/octet-stream'
        });
      }
    } else {
      // iOS "Open In..." menu
      await Sharing.shareAsync(uri, {
        UTI: mimeType, // iOS uses UTI but sometimes accepts mimeType
      });
    }
  } catch (e) {
    Alert.alert('Error', 'Could not open the file.');
  }
};

/** Check if a file still exists on disk */
export const fileExists = async (uri: string): Promise<boolean> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  } catch {
    return false;
  }
};
