import {Linking} from 'react-native';

const openPDFFile = async fileUrl => {
  console.log('fileUrl', fileUrl);

  // try {
  //   // Ensure the URL starts with "http://" or "https://"
  //   if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
  //     // Attempt to share the file URL
  //     await Share.open({
  //       url: fileUrl,
  //       type: 'application/pdf',
  //     });
  //   } else {
  //     console.error('Invalid file URL:', fileUrl);
  //   }
  // } catch (error) {
  //   console.error('Error opening file:', error);
  //   // Fallback to open the URL directly if sharing fails
  //   if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
  //     Linking.openURL(fileUrl).catch(err =>
  //       console.error('Error opening URL:', err),
  //     );
  //   } else {
  //     console.error('URL is not valid for opening:', fileUrl);
  //   }
  // }

  try {
    // Ensure the URL starts with "http://" or "https://"
    if (
      fileUrl &&
      (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))
    ) {
      // Open the PDF URL in the browser
      await Linking.openURL(fileUrl);
    } else {
      Alert.alert(
        'Invalid URL',
        'Please provide a valid URL starting with http:// or https://',
      );
      console.error('Invalid file URL:', fileUrl);
    }
  } catch (error) {
    console.error('Error opening URL:', error);
    Alert.alert('Error', 'Unable to open PDF in browser.');
  }
};

export default openPDFFile;
