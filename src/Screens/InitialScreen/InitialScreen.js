import React, {useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  removeDomain,
  selectUrl,
  setDomain,
} from '../../api/store/slice/domainSlice';
import * as SvgIcon from '../../assets';
import CustomBottomSheet from '../../Components/Common/CustomBottomSheet';
import CustomButton from '../../Components/Common/CustomButton';
import CustomInput from '../../Components/Common/CustomInput';

import LinearGradient from 'react-native-linear-gradient';
import TextComponent from '../../Components/Common/TextComponent';
import {useAppDispatch, useAppSelector, useTheme} from '../../Components/hooks';
import NavigationString from '../../Navigations/NavigationString';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import Colors, {gradientColorTokensMap} from '../../theme/colors';
import THEME_COLOR from '../../Utils/Constant';
import {getColorForParticipant, replace} from '../../Utils/helperFunctions';

const InitialScreen = () => {
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;
  const bottomSheetRef = useRef(null);
  const dispatch = useAppDispatch();
  const domainState = useAppSelector(state => state.domains);

  const [domain, setDomainInput] = useState('');

  const handleAddMoreUrl = () => {
    bottomSheetRef.current?.present();
  };

  const handleAddUrl = async () => {
    let formattedDomain = domain
      .trim()
      .toLowerCase()
      .replace(/(^\w+:|^)\/\//, '');

    const domainRegex =
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)?[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;

    if (!formattedDomain || !domainRegex.test(formattedDomain)) {
      Alert.alert('Please enter a valid domain');
    } else {
      try {
        const fullDomain = `https://${formattedDomain}`;
        await dispatch(setDomain(fullDomain)).unwrap();
        setDomainInput('');
        bottomSheetRef.current?.dismiss();
      } catch (error) {
        console.error('Error adding domain:', error);
      }
    }
  };

  const selectDomainUrl = async key => {
    try {
      await dispatch(selectUrl(key)).unwrap();
    } catch (error) {
      console.log('error during select url in initialScreen');
    } finally {
      replace(NavigationString.LoginScreen);
    }
  };

  const handleRemoveDomain = async key => {
    await dispatch(removeDomain(key)).unwrap();
  };
  return (
    <LinearGradient
      colors={
        isDarkMode
          ? gradientColorTokensMap.White
          : gradientColorTokensMap.DarkGR
      }
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={[{flex: 1}]}>
      <FlatList
        data={domainState?.domains}
        inverted
        keyExtractor={item => item.key.toString()}
        renderItem={({item}) => {
          const {Color} = getColorForParticipant(item?.key);
          return (
            <TouchableOpacity
              onPress={() => selectDomainUrl(item.key)}
              key={item.key.toString()}
              style={[styles.domainCard]}>
              {/* Domain Icon */}
              <SvgIcon.DomainIcon
                width={spacing.WIDTH_40}
                height={spacing.HEIGHT_40}
                style={styles.icon}
                color={isDarkMode ? Colors.dark.black : Colors.light.white}
              />

              {/* Domain Text */}
              <View style={styles.textContainer}>
                <TextComponent
                  text={item?.domain}
                  style={[styles.domainText, {color: Colors.default.black}]}
                />
              </View>

              {/* Remove Button */}
              <TouchableOpacity
                style={styles.removeIconContainer}
                onPress={() => handleRemoveDomain(item.key)}>
                <SvgIcon.Wrong
                  width={spacing.WIDTH_24}
                  height={spacing.HEIGHT_24}
                  color={Color}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
      <CustomButton
        title={'Add Domain'}
        onPress={handleAddMoreUrl}
        style={{
          width: '95%',
          alignSelf: 'center',
          marginVertical: spacing.MARGIN_10,
        }}
      />
      <CustomBottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={['40%', '50%']}
        enablePanDownToClose={true}>
        <View style={{paddingHorizontal: spacing.PADDING_10}}>
          <CustomInput
            placeholder="example.waflow.in"
            value={domain}
            onChange={setDomainInput}
            label="Domain"
            required={true}
            inputStyles={{
              color: isDarkMode ? Colors.dark.black : Colors.light.white,
            }}
            showFirstChildren={true}
            FirstChildren={
              <View style={{marginRight: 8}}>
                <SvgIcon.DomainIcon
                  color={isDarkMode ? Colors.dark.black : Colors.light.white}
                />
              </View>
            }
          />
          <CustomButton title={'Add'} onPress={handleAddUrl} />
        </View>
      </CustomBottomSheet>
    </LinearGradient>
  );
};

export default InitialScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  domainListContainer: {
    flex: 1,
    paddingTop: spacing.MARGIN_20,
  },
  domainCard: {
    backgroundColor: Colors.default.backgroundTransparent,
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: spacing.RADIUS_12,
    marginVertical: spacing.MARGIN_6,
    marginHorizontal: spacing.MARGIN_10,
    padding: spacing.PADDING_10,
    marginBottom: spacing.MARGIN_16,
  },
  icon: {
    marginRight: spacing.MARGIN_10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  domainText: {
    fontSize: textScale(16),
    fontWeight: 'bold',
  },
  removeIconContainer: {
    padding: spacing.PADDING_4,
  },
});
