import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useTheme } from '../hooks';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';

const CustomBottomSheetFlatList = forwardRef(
  (
    {
      snapPoints,
      onDismiss,
      modalStyle,
      backgroundStyle,
      onChange,
      data,
      renderItem,
      contentContainerStyle,
      contentContainerStyleModal,
      ListHeaderComponent,
      ListEmptyComponent,
      stickyHeaderIndicesFlatList,
      keyExtractor,
      onEndReached,
      onEndReachedThreshold,
      refreshControl,
      keyboardShouldPersistTaps,
      keyboardDismissMode,
      enablePanDownToClose = true,
      enableBackHandler = true,
      footerrenderFooter,
      invertStickyHeaders = false,
      inverted = false,
      FooterComponent, 
      footerStyle, 
      enableFooter = false, 
      ListFooterComponent,
      ...otherProps
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    const renderBackdrop = useCallback(
      (backdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      [],
    );

    useEffect(() => {
      if (!enableBackHandler) return;

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (isModalOpen) {
            ref.current?.dismiss();
            return true; // We've handled the back button press.
          }
          return false; // Allow default behavior if modal is not open.
        },
      );

      return () => {
        backHandler.remove(); // Clean up the listener on component unmount or update.
      };
    }, [isModalOpen, ref, enableBackHandler]);

    const handlePresent = () => {
      setIsModalOpen(true);
    };

    const handleDismiss = () => {
      setIsModalOpen(false);
      if (onDismiss) {
        onDismiss();
      }
    };

    return (
      <>
        <BottomSheetModal
          ref={ref}
          snapPoints={memoizedSnapPoints}
          onDismiss={handleDismiss}
          onChange={(index) => setIsModalOpen(index >= 0)}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={styles.handleIndicator}
          backgroundStyle={[
            styles.background,
            backgroundStyle,
            {
              backgroundColor:
                theme === THEME_COLOR ? colors.white : '#151414',
            },
          ]}
          style={[styles.modal, modalStyle]}
          enablePanDownToClose={enablePanDownToClose}
          contentContainerStyle={contentContainerStyleModal}      
          {...otherProps}
        >
          {/* FlatList for Comments or Other Data */}
          <BottomSheetFlatList
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={[
              contentContainerStyle,
              { minHeight: '20%', paddingBottom: enableFooter ? 100 : 0 },
            ]}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={ListEmptyComponent}
            stickyHeaderIndices={stickyHeaderIndicesFlatList}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            refreshControl={refreshControl}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            keyboardDismissMode={keyboardDismissMode}
            invertStickyHeaders={invertStickyHeaders}
            inverted={inverted}
            ListFooterComponent={ListFooterComponent}
            
          />
          {/* Fixed Footer Component */}
          {enableFooter && FooterComponent && (
            <View style={[styles.footerContainer, footerStyle]}>
              {FooterComponent}
            </View>
          )}
        </BottomSheetModal>
      </>
    );
  },
);

export default React.memo(CustomBottomSheetFlatList);

const styles = StyleSheet.create({
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  handleIndicator: {
    backgroundColor: colors.grey400,
  },
  background: {
    backgroundColor: colors.white,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
});
