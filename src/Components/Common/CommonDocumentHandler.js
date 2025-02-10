import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import {setLocalHttpsInDomain} from '../../Config/url';

const CommonDocumentHandler = ({baseUrl, item}) => {
  const fileName = item?.attach?.split('/').pop();
  const [isDownloading, setIsDownloading] = useState(false);
  const [filePath, setFilePath] = useState(null);

  useEffect(() => {
    // Set the file path based on local directory and file name
    const path = `${RNFS.DocumentDirectoryPath}${
      fileName?.startsWith('/') ? '' : '/'
    }${fileName}`;
    setFilePath(path);
  }, [fileName]);

  const downloadFile = async () => {
    setIsDownloading(true);
    try {
      const fileUrl = `${setLocalHttpsInDomain}${baseUrl}${
        item?.attach?.startsWith('/') ? '' : '/'
      }${item?.attach}`;
      const options = {
        fromUrl: fileUrl,
        toFile: filePath,
      };
      await RNFS.downloadFile(options).promise;
      Alert.alert(
        'Download Complete',
        'The file has been downloaded successfully',
      );
    } catch (error) {
      Alert.alert('Download Error', 'Failed to download file');
      console.error('File download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const openFile = async () => {
    try {
      if (filePath) {
        if (Platform.OS === 'android') {
          await FileViewer.open(filePath, {showOpenWithDialog: true});
        } else {
          await FileViewer.open(filePath);
        }
      } else {
        Alert.alert('Open Error', 'Invalid file path');
      }
    } catch (error) {
      Alert.alert('Open Error', 'Failed to open file');
      console.error('File open error:', error);
    }
  };

  const handleDocument = async () => {
    // Check if the file already exists locally
    const fileExists = await RNFS.exists(filePath);
    if (fileExists) {
      openFile(); // Open if file already exists
    } else {
      downloadFile(); // Download if file does not exist
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleDocument} style={styles.button}>
        {isDownloading ? (
          <ActivityIndicator color={'green'} />
        ) : (
          <Text style={styles.buttonText}>Download or Open Document</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CommonDocumentHandler;
