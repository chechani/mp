import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {Alert, FlatList, TouchableOpacity, View} from 'react-native';
import {
  useCreateNewGroupMutation,
  useGetBroadCastGroupQuery,
  useLazyGetCriteriaQuery,
  useLazyGetLogicalQperatorQuery,
  useLazyGetOperatorQuery,
} from '../../api/store/slice/broadCastGroupSlice';
import * as SvgIcon from '../../assets/index';
import DynamicFiltersRow from '../../Components/Colums/BroadCastGroup/DynamicFiltersRow';
import GroupInfo from '../../Components/Colums/BroadCastGroup/GroupInfo';
import GroupListEmpty from '../../Components/Colums/BroadCastGroup/GroupListEmpty';
import ListFooterComponent from '../../Components/Colums/BroadCastGroup/ListFooterComponent';
import {styles} from '../../Components/Colums/BroadCastGroup/styles';
import BroadCastGroupColum from '../../Components/Colums/BroadCastGroupColum';
import CommonHeader from '../../Components/Common/CommoneHeader';
import ContainerComponent from '../../Components/Common/ContainerComponent';
import CustomBottomSheetFlatList from '../../Components/Common/CustomBottomSheetFlatList';
import CustomButton from '../../Components/Common/CustomButton';
import LoadingScreen from '../../Components/Common/Loader';
import TextComponent from '../../Components/Common/TextComponent';
import {useTheme} from '../../Components/hooks';
import NavigationString from '../../Navigations/NavigationString';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import Colors from '../../theme/colors';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {
  CommonToastMessage,
  navigate,
  openDrawer,
} from '../../Utils/helperFunctions';

// ListHeaderComponent remains the same as in the original code
const ListHeaderComponent = ({
  groupName,
  title,
  setCreateGroup,
  isDarkMode,
  selectedContacts,
  isContactBtn,
}) => {
  return (
    <View>
      <TextComponent
        text={'Create New Group'}
        color={isDarkMode ? Colors.dark.black : Colors.light.white}
        size={textScale(16)}
        style={{alignSelf: 'center', marginVertical: spacing.MARGIN_4}}
        font={fontNames.ROBOTO_FONT_FAMILY_MEDIUM}
      />
      <GroupInfo
        groupName={groupName}
        title={title}
        setCreateGroup={setCreateGroup}
      />
      {isContactBtn && (
        <CustomButton
          title={
            selectedContacts?.length
              ? `Selected Contacts ${selectedContacts?.length}`
              : 'Select Contacts'
          }
          onPress={() => navigate(NavigationString.selectConatctForCreateGroup)}
          buttonStyle={{marginHorizontal: spacing.MARGIN_10}}
        />
      )}
    </View>
  );
};

const BroadCastGroup = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const selectedContact = route.params?.contact;
  const clearContact = () => {
    navigation.setParams({contact: undefined});
  };

  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;
  const createGroupRef = useRef(null);
  const contactRef = useRef(null);
  const isMounted = useRef(true);
  const dynamicFiltersSubOptionRef = useRef(null);

  const {
    data: GetBroadCastGroup,
    isLoading: isLoadingGetBroadCast,
    isError: isErrorGetBroadCast,
    refetch: refetchBroadCastGroup,
  } = useGetBroadCastGroupQuery();

  // Lazy query triggers
  const [triggerGetCriteria] = useLazyGetCriteriaQuery();
  const [triggerGetOperator] = useLazyGetOperatorQuery();
  const [triggerGetLogicalQperator] = useLazyGetLogicalQperatorQuery();

  const [createNewGroup] = useCreateNewGroupMutation();

  // State variables
  const [createGroup, setCreateGroup] = useState({
    title: '',
    groupName: '',
  });
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isDynamicFilters, setIsDynamicFilters] = useState(true);
  const [isContactBtn, setIsContactBtn] = useState(true);
  const [dynamicFilters, setDynamicFilters] = useState([]);
  const [dynamicFiltersSubOption, setDynamicFiltersSubOption] = useState([]);
  const [dynamicSelectedFilterType, setDynamicSelectedFilterType] =
    useState('');
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(null);

  // Reset form function
  const resetForm = useCallback(() => {
    clearContact();
    setDynamicFilters([]);
    setCreateGroup({title: '', groupName: ''});
  }, []);

  // Create group handler
  const createGroupHandler = async () => {
    if (!createGroup.groupName.trim()) {
      CommonToastMessage('info', 'Please enter a group name.');
      return;
    }
    if (!createGroup.title.trim()) {
      CommonToastMessage('info', 'Please enter a title.');
      return;
    }
    setIsCreatingGroup(true);

    try {
      let payload = {
        group_name: createGroup.groupName.trim(),
        title: createGroup.title.trim(),
      };

      if (dynamicFilters.length > 0) {
        payload = {
          ...payload,
          is_dynamic_group: 1,
          dynamic_filters: dynamicFilters.map(filter => ({
            filter_on_field: filter.filterOnField,
            criteria: filter.operator,
            value: filter.value,
            logical_operator: filter.logicalOperator,
          })),
        };
      } else {
        const formattedContacts = selectedContact?.map(contact => ({
          group_member: contact.trim(),
        }));
        payload = {
          ...payload,
          is_dynamic_group: 0,
          contacts: formattedContacts,
        };
      }

      const response = await createNewGroup(payload);

      if (!isMounted.current) return;

      if (response.data?.status_code === 200) {
        CommonToastMessage('success', 'Group created successfully');
        createGroupRef.current?.dismiss();
        resetForm();
        refetchBroadCastGroup();
      } else {
        CommonToastMessage('error', response.data?.message);
      }
    } catch (error) {
      if (!isMounted.current) return;
      console.error('Error creating group:', error);
      Alert.alert(
        'Error',
        error.message || 'An error occurred while creating the group.',
      );
    } finally {
      if (isMounted.current) {
        setIsCreatingGroup(false);
      }
    }
  };

  // Add filter row
  const addFilterRow = () => {
    if (isContactBtn) {
      setIsContactBtn(false);
    }
    setDynamicFilters(prevFilters => [
      ...prevFilters,
      {filterOnField: '', operator: '', value: '', logicalOperator: ''},
    ]);
  };

  // Improved dynamic filter API call handler
  const handleDynamicFilterApiCall = async (filterType, index) => {
    try {
      let result;
      switch (filterType) {
        case 'filterOnField':
          result = await triggerGetCriteria();
          break;
        case 'operator':
          result = await triggerGetOperator();
          break;
        case 'logicalOperator':
          result = await triggerGetLogicalQperator();
          break;
        default:
          return;
      }

      if (result?.data?.status_code === 200) {
        setDynamicFiltersSubOption(result.data.data);
        setDynamicSelectedFilterType(filterType);
        setSelectedFilterIndex(index);
        dynamicFiltersSubOptionRef.current?.present();
      } else {
        CommonToastMessage('error', 'Failed to fetch options');
      }
    } catch (error) {
      console.error(`Error fetching ${filterType} options:`, error);
      CommonToastMessage('error', `Failed to fetch ${filterType} options`);
    }
  };

  // Handle option selection
  const handleSelectOption = option => {
    setDynamicFilters(prevFilters => {
      const updatedFilters = [...prevFilters];
      if (selectedFilterIndex !== null) {
        updatedFilters[selectedFilterIndex][dynamicSelectedFilterType] =
          option.name || option;
      }
      return updatedFilters;
    });
    dynamicFiltersSubOptionRef.current?.dismiss();
  };

  // Handle filter change
  const handleFilterChange = (index, key, value) => {
    setDynamicFilters(prevFilters => {
      const updatedFilters = [...prevFilters];
      updatedFilters[index] = {
        ...updatedFilters[index],
        [key]: value,
      };
      return updatedFilters;
    });
  };

  const handleRemoveRow = index => {
    if (index === 0) {
      setIsContactBtn(true);
    }
    setDynamicFilters(prevFilters => prevFilters.filter((_, i) => i !== index));
  };

  return (
    <>
      <ContainerComponent noPadding useScrollView={false}>
        <View style={styles.container}>
          <CommonHeader
            title={'Broadcast Group'}
            showLeftIcon={true}
            leftIcon={SvgIcon.MenuIcon}
            onLeftIconPress={openDrawer}
            showRightIcons={true}
            rightIcons={[SvgIcon.ReloadIcon]}
            onRightIconPress={refetchBroadCastGroup}
          />

          {isLoadingGetBroadCast ? (
            <LoadingScreen color={colors.green} />
          ) : (
            <FlatList
              data={GetBroadCastGroup?.data}
              keyExtractor={item => item?.name?.toString()}
              renderItem={({item}) => <BroadCastGroupColum item={item} />}
              ListEmptyComponent={
                <GroupListEmpty
                  isErrorGetBroadCast={isErrorGetBroadCast}
                  isDarkMode={isDarkMode}
                />
              }
            />
          )}
        </View>
      </ContainerComponent>
      <CustomButton
        title={`Create Group`}
        onPress={() => {
          setDynamicFilters([]), setIsContactBtn(true);
          setIsDynamicFilters(true), createGroupRef.current?.present();
        }}
        iconLeft={
          <SvgIcon.AddICon
            color={colors.white}
            width={spacing.WIDTH_30}
            height={spacing.HEIGHT_30}
          />
        }
        buttonStyle={styles.createGroupButton}
      />

      <CustomBottomSheetFlatList
        ref={createGroupRef}
        snapPoints={['90%']}
        enableDynamicSizing={false}
        data={dynamicFilters}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => (
          <DynamicFiltersRow
            index={index}
            filter={item}
            isDarkMode={false}
            onFilterChange={handleFilterChange}
            onDynamicFilterApiCall={filterType =>
              handleDynamicFilterApiCall(filterType, index)
            }
            onRemoveRow={handleRemoveRow}
          />
        )}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <ListHeaderComponent
            groupName={createGroup.groupName}
            title={createGroup.title}
            setCreateGroup={setCreateGroup}
            contactRef={contactRef}
            setIsDynamicFilters={setIsDynamicFilters}
            isDarkMode={isDarkMode}
            selectedContacts={selectedContact}
            isContactBtn={isContactBtn}
          />
        }
        ListFooterComponent={
          <ListFooterComponent
            isDynamicFilters={isDynamicFilters}
            dynamicFilters={dynamicFilters}
            addFilterRow={addFilterRow}
            createGroupHandler={createGroupHandler}
            isCreatingGroup={isCreatingGroup}
          />
        }
      />

      <CustomBottomSheetFlatList
        ref={dynamicFiltersSubOptionRef}
        data={dynamicFiltersSubOption}
        snapPoints={['60%']}
        keyExtractor={(item, index) => {
          if (item.hasOwnProperty('name')) {
            return `criteria-${item.name
              .toLowerCase()
              .replace(/\s+/g, '-')}-${index}`;
          }

          if (typeof item === 'string') {
            return `operator-${item
              .toLowerCase()
              .replace(/\s+/g, '-')}-${index}`;
          }
          return `item-${index}`;
        }}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              style={{
                paddingHorizontal: spacing.PADDING_10,
                paddingVertical: spacing.PADDING_16,
              }}
              onPress={() => handleSelectOption(item)}>
              <TextComponent
                text={item.name || item}
                size={textScale(16)}
                color={Colors.default.white}
                font={fontNames.ROBOTO_FONT_FAMILY_MEDIUM}
              />
            </TouchableOpacity>
          );
        }}
      />
    </>
  );
};

export default BroadCastGroup;
