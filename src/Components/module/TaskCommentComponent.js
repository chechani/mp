import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useApiURLs} from '../../Config/url';
import {apiGet, apiPost} from '../../Utils/apiCalls';
import colors from '../../Utils/colors';
import {CommonToastMessage, goBack} from '../../Utils/helperFunctions';
import {boxShadow} from '../../styles/Mixins';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import CommoneHeader from '../Common/CommoneHeader';
import RegularText from '../Common/RegularText';
import THEME_COLOR from '../../Utils/Constant';
import {useTheme} from '../hooks';

const TaskCommentComponent = ({route}) => {
  const {task_name} = route?.params;
  const {theme} = useTheme();

  const {GET_TASK_COMMENT, SEND_COMMENTS_TO_TASK} = useApiURLs();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [inputHeight, setInputHeight] = useState(40);

  // Fetch comments on component mount
  useEffect(() => {
    if (task_name) {
      fetchComments();
    }
  }, [task_name]);

  const fetchComments = async () => {
    try {
      const response = await apiGet(GET_TASK_COMMENT, {
        params: {task_name: task_name},
      });
      console.log('Comments response:', response?.status_code);

      if (response?.status_code === 200) {
        setComments(response.reponse);
      } else if (response?.status_code === 404) {
        CommonToastMessage('info', 'No comments found for this task.');
        setComments([]);
      } else {
        console.log('Failed to load comments:', response.message || response);
      }
    } catch (error) {
      console.log(
        'Error fetching comments:',
        error.message || JSON.stringify(error),
      );
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === '') {
      CommonToastMessage('info', 'Comment cannot be empty');
      return;
    }

    const newCommentObject = {
      comment: newComment,
      task_name: task_name,
    };

    try {
      const response = await apiPost(SEND_COMMENTS_TO_TASK, newCommentObject);
      console.log('send Comment response:', response?.status_code);

      if (response?.status_code === 200) {
        fetchComments();
        setNewComment('');
      } else {
        console.error('Failed to add comment:', response.message || response);
        CommonToastMessage('error', 'Failed to add comment. Please try again.');
      }
    } catch (error) {
      console.error(
        'Error sending comment:',
        error.message || JSON.stringify(error),
      );
      CommonToastMessage('error', 'An error occurred. Please try again.');
    }
  };

  const renderComment = ({item}) => (
    <View style={[styles.commentContainer]}>
      <View style={styles.commentHeader}>
        <RegularText style={styles.commentAuthor}>
          {item.created_by || 'Unknown'}
        </RegularText>
        <RegularText style={styles.commentDate}>
          {item.creation ? new Date(item.creation).toLocaleString() : 'N/A'}
        </RegularText>
      </View>
      <RegularText style={styles.commentContent}>
        {item.content || 'No content available.'}
      </RegularText>
    </View>
  );

  return (
    <>
      <CommoneHeader
        title={`Comments`}
        showLeftIcon={true}
        onLeftIconPress={() => goBack()}
      />
      <View
        style={{
          backgroundColor: theme === THEME_COLOR ? colors.white : colors.black,
          flex: 1,
        }}>
        <FlatList
          data={comments}
          keyExtractor={item => item.name || item.creation}
          renderItem={renderComment}
          contentContainerStyle={styles.commentsList}
          ListEmptyComponent={
            <RegularText style={styles.noCommentsText}>
              No comments found for "{task_name}".
            </RegularText>
          }
          inverted
        />
      </View>
      <View
        style={[
          styles.addCommentContainer,
          {
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          },
        ]}>
        <TextInput
          style={[
            styles.commentInput,
            {
              height: inputHeight,
              color: theme === THEME_COLOR ? colors.grey800 : colors.grey200,
            },
          ]}
          placeholder="Add a comment..."
          placeholderTextColor={
            theme === THEME_COLOR ? colors.grey800 : colors.grey200
          }
          value={newComment}
          onChangeText={setNewComment}
          multiline={true}
          onContentSizeChange={event =>
            setInputHeight(
              event.nativeEvent.contentSize.height > 40
                ? event.nativeEvent.contentSize.height
                : 40,
            )
          }
        />
        <TouchableOpacity
          onPress={handleAddComment}
          style={styles.addCommentButton}>
          <RegularText
            style={[
              styles.addCommentButtonText,
              {color: theme === THEME_COLOR ? colors.grey900 : colors.grey200},
            ]}>
            Add
          </RegularText>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default TaskCommentComponent;

const styles = StyleSheet.create({
  commentsList: {
    padding: spacing.PADDING_16,
  },
  commentContainer: {
    backgroundColor: colors.white,
    borderRadius: spacing.RADIUS_10,
    padding: spacing.PADDING_12,
    marginBottom: spacing.MARGIN_10,
    ...boxShadow(),
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.MARGIN_8,
  },
  commentAuthor: {
    fontSize: textScale(14),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    color: colors.black,
  },
  commentDate: {
    fontSize: textScale(12),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    color: colors.grey500,
  },
  commentContent: {
    fontSize: textScale(16),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    color: colors.black,
  },
  noCommentsText: {
    textAlign: 'center',
    marginTop: spacing.MARGIN_20,
    fontSize: textScale(16),
    color: colors.grey500,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.PADDING_16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.grey200,
  },
  commentInput: {
    flex: 1,
    borderColor: colors.grey400,
    borderWidth: 1,
    borderRadius: spacing.RADIUS_10,
    paddingHorizontal: spacing.PADDING_8,
    fontSize: textScale(14),
    color: colors.black,
    minHeight: 40,
    maxHeight: 120,
  },
  addCommentButton: {
    marginLeft: spacing.MARGIN_8,
    paddingVertical: spacing.PADDING_8,
    paddingHorizontal: spacing.PADDING_16,
    backgroundColor: colors.primary,
    borderRadius: spacing.RADIUS_10,
    alignSelf: 'flex-end',
  },
  addCommentButtonText: {
    color: colors.black,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    fontSize: textScale(14),
  },
});
