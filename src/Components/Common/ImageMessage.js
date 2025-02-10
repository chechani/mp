import {useState} from 'react';
import {Image} from 'react-native';
import {setLocalHttpsInDomain} from '../../Config/url';

const ImageMessage = ({message, baseUrl, style, source}) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = `${setLocalHttpsInDomain}${baseUrl}${message}`;
  const defaultUrl =
    'https://images.ctfassets.net/zykafdb0ssf5/68qzkHjCboFfCsSxV2v9S6/4da75033db02c1339de2a3effb461f7a/missing.png';

  return (
    <Image
      source={{uri: imageError ? defaultUrl : imageUrl || source}}
      style={style}
      defaultSource={{uri: defaultUrl}}
      onError={() => {
        setImageError(true);
      }}
    />
  );
};

export default ImageMessage;
